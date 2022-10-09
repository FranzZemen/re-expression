import { LoggerAdapter } from '@franzzemen/app-utility';
import { PsMsgType } from '@franzzemen/re-common';
import { StandardExpressionType } from '../expression.js';
import { ExPsStdMsg } from '../parser-messages/ex-ps-std-msg.js';
import { ExpressionScope } from '../scope/expression-scope.js';
import { ExpressionHintKey } from '../util/expression-hint-key.js';
import { ExpressionParser } from './expression-parser.js';
export class ValueExpressionParser extends ExpressionParser {
    constructor() {
        super(StandardExpressionType.Value);
    }
    parse(remaining, scope, hints, ec) {
        const log = new LoggerAdapter(ec, 're-expression', 'value-expression-parser', 'parse');
        const near = remaining;
        const typeHint = hints.get(ExpressionHintKey.Type);
        if (typeHint && typeHint !== StandardExpressionType.Value) {
            return [remaining, undefined, undefined];
        }
        let dataTypeHint = hints.get(ExpressionHintKey.DataType);
        let dataTypeRef;
        if (dataTypeHint) {
            dataTypeRef = (typeof dataTypeHint === 'string') ? dataTypeHint : dataTypeHint['refName'];
        }
        let value;
        [remaining, [value, dataTypeHint]] = scope.get(ExpressionScope.DataTypeInferenceStackParser).parse(remaining, scope, dataTypeRef, ec);
        if (value === undefined) {
            return [near, undefined, undefined];
        }
        else {
            if (!dataTypeHint) {
                return [near, undefined, [{ message: `${ExPsStdMsg.ValueExpressionsAlwaysResolveToDataType} near ${near}`, type: PsMsgType.Error }]];
            }
            return [remaining, {
                    type: StandardExpressionType.Value,
                    dataTypeRef: dataTypeHint,
                    value
                }, undefined];
        }
    }
}
//# sourceMappingURL=value-expression-parser.js.map