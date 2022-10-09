import { LoggerAdapter } from '@franzzemen/app-utility';
import { PsMsgType } from '@franzzemen/re-common';
import { StandardDataType } from '@franzzemen/re-data-type';
import { StandardExpressionType } from '../expression.js';
import { ExPsStdMsg } from '../parser-messages/ex-ps-std-msg.js';
import { ExpressionScope } from '../scope/expression-scope.js';
import { ExpressionHintKey } from '../util/expression-hint-key.js';
import { ExpressionParser } from './expression-parser.js';
export class AttributeExpressionParser extends ExpressionParser {
    constructor() {
        super(StandardExpressionType.Attribute);
    }
    parse(remaining, scope, hints, execContext) {
        const log = new LoggerAdapter(execContext, 're-expression', 'attribute-expression-parser', 'parse');
        const typeHint = hints.get(ExpressionHintKey.Type);
        if (typeHint && typeHint !== StandardExpressionType.Attribute) {
            return [remaining, undefined, undefined];
        }
        let dataTypeHint = hints.get(ExpressionHintKey.DataType);
        let dataTypeRef;
        if (dataTypeHint) {
            dataTypeRef = (typeof dataTypeHint === 'string') ? dataTypeHint : dataTypeHint['refName'];
            if (dataTypeRef === StandardDataType.Unknown && scope.get(ExpressionScope.AllowUnknownDataType) !== true) {
                return [remaining, undefined, [{ message: ExPsStdMsg.ImproperUsageOfUnknown, type: PsMsgType.Error }]];
            }
        }
        else if (scope.get(ExpressionScope.AllowUnknownDataType) === true) {
            dataTypeRef = StandardDataType.Unknown;
        }
        else {
            dataTypeRef = StandardDataType.Indeterminate;
        }
        let multivariate;
        const multivariateRef = hints.get(ExpressionHintKey.Multivariate);
        if (multivariateRef) {
            multivariate = multivariateRef === 'true' || multivariateRef === ExpressionHintKey.Multivariate;
        }
        const result = /^([a-zA-Z0-9.\[\]"']+)([\s\t\r\n\v\f\u2028\u2029)\],][^]*$|$)/.exec(remaining);
        if (result) {
            let path = result[1];
            const openingSquareBrackets = path.match(/\[/g)?.length;
            const closingSquareBrackets = path.match(/]/g)?.length;
            if (openingSquareBrackets) {
                if (closingSquareBrackets && closingSquareBrackets === openingSquareBrackets) {
                    return [result[2].trim(), { type: StandardExpressionType.Attribute, dataTypeRef, path, multivariate }, undefined];
                }
                else if (closingSquareBrackets && closingSquareBrackets > openingSquareBrackets) {
                    if (path[path.length - 1] === ']') {
                        path = path.substring(0, path.length - 1);
                        return [`]${result[2].trim()}`, { type: StandardExpressionType.Attribute, dataTypeRef, path, multivariate }, undefined];
                    }
                    else {
                        return [remaining, undefined, undefined];
                    }
                }
                else {
                    return [remaining, undefined, undefined];
                }
            }
            else if (closingSquareBrackets) {
                const result2 = /^([a-zA-Z0-9.]+)([\s\t\r\n\v\f\u2028\u2029)\],][^]*$|$)/.exec(remaining);
                if (result2) {
                    path = result2[1];
                    return [result2[2].trim(), { type: StandardExpressionType.Attribute, dataTypeRef, path, multivariate }, undefined];
                }
                else {
                    return [remaining, undefined, undefined];
                }
            }
            else {
                return [result[2].trim(), { type: StandardExpressionType.Attribute, dataTypeRef, path, multivariate }, undefined];
            }
        }
        else {
            return [remaining, undefined, undefined];
        }
    }
}
//# sourceMappingURL=attribute-expression-parser.js.map