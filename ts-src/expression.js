import { LoggerAdapter, reverseEnumerationToSet } from '@franzzemen/app-utility';
import { EnhancedError, logErrorAndThrow } from '@franzzemen/app-utility/enhanced-error.js';
import { isPromise } from 'node:util/types';
import { ExpressionScope } from './scope/expression-scope.js';
export var StandardExpressionType;
(function (StandardExpressionType) {
    StandardExpressionType["Value"] = "Value";
    StandardExpressionType["Attribute"] = "Attribute";
    StandardExpressionType["Function"] = "Function";
    StandardExpressionType["Set"] = "Set";
    StandardExpressionType["Formula"] = "Formula";
})(StandardExpressionType || (StandardExpressionType = {}));
export function createExpressionType(type) {
    if (!expressionTypes.has(type)) {
        expressionTypes.add(type);
    }
}
export const expressionTypes = reverseEnumerationToSet(StandardExpressionType);
export function isExpressionType(expressionType) {
    return expressionType !== undefined && typeof expressionType === 'string' && expressionTypes.has(expressionType);
}
export function copyExpressionReference(ref) {
    return { type: ref.type, dataTypeRef: ref.dataTypeRef, dataTypeModule: ref.dataTypeModule };
}
export function isExpressionReference(ref) {
    return 'type' in ref && 'dataTypeRef' in ref;
}
export function isExpression(exp) {
    return isExpressionReference(exp) && 'init' in exp;
}
export class Expression {
    constructor(ref, scope, ec) {
        this.multivariate = false;
        this.customDataTypeRefLoadedAction = (successfulResolution, scope, ec) => {
            const log = new LoggerAdapter(ec, 're-expression', 'expression', 'customDataTypeRefLoadedAction');
            if (this.dataType) {
                log.warn(this, `Action to set data type "${this.dataTypeRef}" called, but its already set`);
                logErrorAndThrow(new EnhancedError(`Action to set data type "${this.dataTypeRef}" called, but its already set`), log, ec);
            }
            else {
                this.dataType = scope.getDataType(this.dataTypeRef, true, ec);
                if (!this.dataType) {
                    log.warn(this, `Action to set data type "${this.dataTypeRef}" called, but it still doesn't exist in the factory, this method should only be called when it is`);
                    logErrorAndThrow(new EnhancedError(`Action to set data type "${this.dataTypeRef}" called, but it still doesn't exist in the factory, this method should only be called when it is`), log, ec);
                }
                else {
                    return true;
                }
            }
        };
        const log = new LoggerAdapter(ec, 're-expression', 'expression', `${Expression.name}.constructor`);
        this.type = ref.type;
        this.dataTypeRef = ref.dataTypeRef;
        const dataTypeFactory = scope.get(ExpressionScope.DataTypeFactory);
        this.dataType = dataTypeFactory.getRegistered(this.dataTypeRef);
        this.dataTypeModule = ref.dataTypeModule;
        if (ref.multivariate !== undefined) {
            this.multivariate = ref.multivariate;
        }
        else {
            this.multivariate = false;
        }
    }
    toBase(ref, ec) {
        ref.type = this.type;
        ref.dataTypeRef = this.dataTypeRef;
        ref.dataTypeModule = this.dataTypeModule;
        if (this.multivariate) {
            ref.multivariate = this.multivariate;
        }
    }
    awaitEval(data, scope, ec) {
        if (!this.dataType) {
            const dataTypeFactory = scope.get(ExpressionScope.DataTypeFactory);
            this.dataType = dataTypeFactory.getRegistered(this.dataTypeRef);
        }
        if (isPromise(data)) {
            return data.then(_data => {
                return this.dataType.eval(_data);
            });
        }
        else {
            return this.dataType.eval(data);
        }
    }
}
//# sourceMappingURL=expression.js.map