import { LoggerAdapter } from '@franzzemen/app-utility';
import { loadModuleDefinitionFromHints } from '@franzzemen/re-common';
import { StandardDataType } from '@franzzemen/re-data-type';
import { StandardExpressionType } from '../expression.js';
import { ExpressionScope } from '../scope/expression-scope.js';
import { ExpressionHintKey } from '../util/expression-hint-key.js';
import { MultivariateDataTypeHandling, MultivariateParser } from './multivariate-parser.js';
export class FunctionExpressionParser extends MultivariateParser {
    constructor() {
        super(StandardExpressionType.Function);
    }
    parse(remaining, scope, hints, ec) {
        const log = new LoggerAdapter(ec, 're-expression', 'function-expression-parser', 'parse');
        let refName;
        let module;
        const multivariateRef = hints.get(ExpressionHintKey.Multivariate);
        let multivariate;
        let dataTypeHandling;
        if (multivariateRef) {
            multivariate = multivariateRef === 'true' || multivariateRef === ExpressionHintKey.Multivariate;
            dataTypeHandling = hints.get(ExpressionHintKey.MultivariateDataTypeHandling);
            if (!dataTypeHandling) {
                hints.set(ExpressionHintKey.MultivariateDataTypeHandling, MultivariateDataTypeHandling.Consistent);
            }
        }
        let dataTypeRef = hints.get('data-type');
        if (!dataTypeRef) {
            if (multivariate) {
                dataTypeRef = StandardDataType.Multivariate;
            }
            else if (!scope.get(ExpressionScope.AllowUnknownDataType)) {
                return [remaining, undefined, undefined];
            }
            else {
                dataTypeRef = StandardDataType.Unknown;
            }
        }
        let type = hints.get(ExpressionHintKey.Type);
        let result;
        if (type === StandardExpressionType.Function) {
            result = /^@?([a-zA-Z]+[a-zA-Z0-9]*)([\[\s\t\r\n\v\f\u2028\u2029)\],][^]*$|$)/.exec(remaining);
        }
        else {
            result = /^@([a-zA-Z]+[a-zA-Z0-9]*)([\[\s\t\r\n\v\f\u2028\u2029)\],][^]*$|$)/.exec(remaining);
        }
        if (result) {
            type = StandardExpressionType.Function;
            refName = result[1];
            remaining = result[2].trim();
            const refNameRegistered = scope.hasAwaitEvaluationFactory(scope, refName, ec);
            module = loadModuleDefinitionFromHints(hints, ec);
            const hintStr = `<<ex 
                            ${ExpressionHintKey.DataType}=${StandardDataType.Unknown} 
                            ${ExpressionHintKey.Multivariate} 
                            ${ExpressionHintKey.MultivariateDataTypeHandling}=Multivariate 
                            ${ExpressionHintKey.Type}=${StandardExpressionType.Function}
                       >>`;
            const [textRemaining, multivariateHints] = scope.parseHints(hintStr, 'ex', ec);
            if (module && !refNameRegistered) {
                scope.addAwaitEvaluationFunction({ moduleRef: { refName, module } }, undefined, ec);
            }
            let params;
            if (remaining.startsWith('[')) {
                const multivariateResult = this.parseMultivariate(remaining, scope, multivariateHints, ec);
                [remaining, , params] = [...multivariateResult];
                return [remaining, { type, dataTypeRef, refName, module, multivariate, params }, undefined];
            }
            else {
                return [remaining, { type, dataTypeRef, refName, module, multivariate, params }, undefined];
            }
        }
        else {
            return [remaining, undefined, undefined];
        }
    }
}
//# sourceMappingURL=function-expression-parser.js.map