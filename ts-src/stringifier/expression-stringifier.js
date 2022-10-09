import { StandardExpressionType } from '../expression.js';
import { ExpressionScope } from '../scope/expression-scope.js';
import { isAttributeExpressionReference } from '../expression/attribute-expression.js';
import { isFunctionExpressionReference } from '../expression/function-expression.js';
import { isSetExpressionReference } from '../expression/set-expression.js';
import { isValueExpressionReference } from '../expression/value-expression.js';
import { ExpressionHintKey } from '../util/expression-hint-key.js';
function setDataTypeCanBeInferred(ref) {
    if (ref.set.length === 0) {
        return false;
    }
    for (let i = 0; i < ref.set.length; i++) {
        const expression = ref.set[i];
        switch (expression.type) {
            case StandardExpressionType.Value:
                return true;
            case StandardExpressionType.Set:
                if (setDataTypeCanBeInferred(expression)) {
                    return true;
                }
                else {
                    continue;
                }
            case StandardExpressionType.Attribute:
            case StandardExpressionType.Function:
            case StandardExpressionType.Formula:
                continue;
            default:
                throw new Error('Unimplemented');
        }
    }
    return false;
}
export class ExpressionStringifier {
    constructor() {
    }
    stringify(expressionRef, scope, options, dataTypeInferableOnParsing = false, ec) {
        let stringifyTypeHint = false;
        let stringifyDataTypeHint = false;
        switch (expressionRef.type) {
            case StandardExpressionType.Value:
                if (options?.expressionHints?.value?.forceTypeHint !== undefined) {
                    stringifyTypeHint = options.expressionHints.value.forceTypeHint;
                }
                if (options?.expressionHints?.value?.forceDataTypeHint !== undefined) {
                    stringifyDataTypeHint = options.expressionHints.value.forceDataTypeHint;
                }
                break;
            case StandardExpressionType.Attribute:
                if (options?.expressionHints?.attribute?.forceTypeHint !== undefined) {
                    stringifyTypeHint = options.expressionHints.attribute.forceTypeHint;
                }
                let alwaysStringifyAttributeDataType = false;
                if (options?.expressionHints?.attribute?.forceDataTypeHintEvenWhenInferrable !== undefined) {
                    alwaysStringifyAttributeDataType = options.expressionHints.attribute.forceDataTypeHintEvenWhenInferrable;
                }
                stringifyDataTypeHint = alwaysStringifyAttributeDataType || !dataTypeInferableOnParsing;
                break;
            case StandardExpressionType.Function:
                if (options?.expressionHints?.function?.forceTypeHint !== undefined) {
                    stringifyTypeHint = options.expressionHints.function.forceTypeHint;
                }
                let alwaysStringifyFunctionDataType = false;
                if (options?.expressionHints?.function?.forceDataTypeHintEvenWhenInferrable !== undefined) {
                    alwaysStringifyFunctionDataType = options.expressionHints.function.forceDataTypeHintEvenWhenInferrable;
                }
                stringifyDataTypeHint = alwaysStringifyFunctionDataType || !dataTypeInferableOnParsing;
                break;
            case StandardExpressionType.Set:
                if (options?.expressionHints?.set?.forceTypeHint !== undefined) {
                    stringifyTypeHint = options.expressionHints.set.forceTypeHint;
                }
                let alwaysStringifySetDataType = false;
                if (options?.expressionHints?.set?.forceDataTypeHintEvenWhenInferrable !== undefined) {
                    alwaysStringifySetDataType = options.expressionHints.set.forceDataTypeHintEvenWhenInferrable;
                }
                stringifyDataTypeHint = alwaysStringifySetDataType || !setDataTypeCanBeInferred(expressionRef);
                break;
            case StandardExpressionType.Formula:
                throw new Error('Unimplemented');
        }
        let stringified = '';
        if (stringifyTypeHint || stringifyDataTypeHint || expressionRef.dataTypeModule) {
            stringified = `<<${ExpressionHintKey.Expression}`;
            if (stringifyTypeHint) {
                stringified += ` type=${expressionRef.type}`;
            }
            if (stringifyDataTypeHint) {
                if (expressionRef.dataTypeRef.indexOf(' ') > -1) {
                    stringified += ` ${ExpressionHintKey.DataType}="${expressionRef.dataTypeRef}"`;
                }
                else {
                    stringified += ` ${ExpressionHintKey.DataType}=${expressionRef.dataTypeRef}`;
                }
            }
            if (expressionRef.dataTypeModule) {
                if (options?.moduleDefinitions.useFieldModuleDefinitions) {
                    stringified += ` ${ExpressionHintKey.DataTypeModuleName}=${expressionRef.dataTypeModule.moduleName} 
                           ${expressionRef.dataTypeModule.functionName ? ExpressionHintKey.DataTypeFunctionName + '=' + expressionRef.dataTypeModule.functionName : ''}
                           ${expressionRef.dataTypeModule.constructorName ? ExpressionHintKey.DataTypeConstructorName + '=' + expressionRef.dataTypeModule.constructorName : ''}`;
                }
                else {
                    stringified += ` ${ExpressionHintKey.DataTypeModule}=${JSON.stringify(expressionRef.dataTypeModule, undefined, 1)}`;
                }
            }
            const stringifyMultivariate = expressionRef.multivariate && (expressionRef.type !== StandardExpressionType.Set || options?.expressionHints?.set?.stringifyMultivariate);
            if (stringifyMultivariate) {
                if (expressionRef.multivariate === true) {
                    stringified += ` ${ExpressionHintKey.Multivariate}`;
                }
                else {
                    stringified += ` ${ExpressionHintKey.Multivariate}=false`;
                }
            }
            if (isFunctionExpressionReference(expressionRef) && expressionRef.module) {
                if (options?.moduleDefinitions?.useFieldModuleDefinitions) {
                    stringified += ` ${ExpressionHintKey.ModuleName}=${expressionRef.module.moduleName} ${ExpressionHintKey.FunctionName + '=' + expressionRef.module.functionName}`;
                }
                else {
                    stringified += ` ${ExpressionHintKey.Module}=${JSON.stringify(expressionRef.module)}`;
                }
            }
            stringified += '>> ';
        }
        if (isValueExpressionReference(expressionRef)) {
            const dataTypeLiteralStringifier = scope.get(ExpressionScope.DataTypeLiteralStackStringifier);
            stringified += `${dataTypeLiteralStringifier.stringify(expressionRef.value, expressionRef.dataTypeRef, scope, options, ec)}`;
        }
        else if (isAttributeExpressionReference(expressionRef)) {
            stringified += `${expressionRef.path}`;
        }
        else if (isFunctionExpressionReference(expressionRef)) {
            if (stringifyTypeHint) {
                stringified += `${expressionRef.refName}`;
            }
            else {
                stringified += `@${expressionRef.refName}`;
            }
            if (expressionRef.params) {
                stringified += '[';
                expressionRef.params.forEach((param, ndx) => {
                    if (ndx > 0) {
                        stringified += `, ${this.stringify(param, scope, options, false, ec)}`;
                    }
                    else {
                        stringified += this.stringify(param, scope, options, false, ec);
                    }
                });
                stringified += ']';
            }
        }
        else if (isSetExpressionReference(expressionRef)) {
            stringified += '[';
            expressionRef.set.forEach((setRef, ndx) => {
                if (ndx > 0) {
                    stringified += `, ${this.stringify(setRef, scope, options, true, ec)}`;
                }
                else {
                    stringified += `${this.stringify(setRef, scope, options, true, ec)}`;
                }
            });
            stringified += ']';
        }
        else {
            throw new Error('Unimplemented');
        }
        return stringified;
    }
}
//# sourceMappingURL=expression-stringifier.js.map