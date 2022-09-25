import {ExecutionContextI, Hints, LoggerAdapter, ModuleDefinition, ModuleResolver} from '@franzzemen/app-utility';
import {logErrorAndThrow} from '@franzzemen/app-utility/enhanced-error.js';
import {loadModuleDefinitionFromHints, RuleElementModuleReference, Scope} from '@franzzemen/re-common';
import {StandardDataType} from '@franzzemen/re-data-type';
import {ExpressionReference, ExpressionType} from '../expression.js';
import {ExpressionScope} from '../scope/expression-scope.js';
import {FunctionExpressionReference} from '../standard/function-expression.js';
import {ExpressionHintKey} from '../util/expression-hint-key.js';
import {ResolvedExpressionParserResult} from './expression-parser.js';
import {MultivariateDataTypeHandling, MultivariateParser, MultivariateParserResult} from './multivariate-parser.js';

export class FunctionExpressionParser extends MultivariateParser {


  constructor() {
    super(ExpressionType.Function, MultivariateDataTypeHandling.Multivariate);
  }
  parse(remaining: string, scope: ExpressionScope, hints: Hints, allowUnknownDataType?: boolean, ec?: ExecutionContextI): [string, FunctionExpressionReference] {
    const log = new LoggerAdapter(ec, 're-expression', 'function-expression-parser', 'parse');
    let refName: string;
    let module: ModuleDefinition;
    let dataTypeRef = hints.get('data-type') as string;
    if (!dataTypeRef) {
      if (!allowUnknownDataType) {
        return [remaining, undefined]; // No expression found
      } else {
        dataTypeRef = StandardDataType.Unknown;
      }
    }

    const multivariateRef = hints.get(ExpressionHintKey.Multivariate);
    let multivariate: boolean;
    if (multivariateRef) {
      multivariate = multivariateRef === 'true' || multivariateRef === ExpressionHintKey.Multivariate;
    }
    let type = hints.get(ExpressionHintKey.Type) as string;
    let result;
    if (type === ExpressionType.Function) {
      // Search for either the function ref name by itself, or preceded by the '@' symbol, which is reserved.
      result = /^@?([a-zA-Z]+[a-zA-Z0-9]*)([\[\s\t\r\n\v\f\u2028\u2029)\],][^]*$|$)/.exec(remaining); // Note the opening square bracket that might replace a following space...start of parameters
    } else {
      // The '@' symbol must precede since no type hint was provided
      result = /^@([a-zA-Z]+[a-zA-Z0-9]*)([\[\s\t\r\n\v\f\u2028\u2029)\],][^]*$|$)/.exec(remaining); // Note the opening square bracket that might replace a following space...start of parameters
    }
    if (result) {
      type = ExpressionType.Function;
      refName = result[1];
      remaining = result[2].trim();

      const refNameRegistered = scope.hasAwaitEvaluationFactory(scope, refName, ec);
      module = loadModuleDefinitionFromHints(hints, ec);

      const hintStr = `<<ex ${ExpressionHintKey.DataType}=${StandardDataType.Unknown} ${ExpressionHintKey.Multivariate} ${ExpressionHintKey.Type}=${ExpressionType.Function}>>`;
      const [textRemaining, multivariateHints] = scope.parseHints(hintStr, 'ex',ec);
      if (module && !refNameRegistered) {
        scope.addAwaitEvaluationFunction({moduleRef: {refName, module}},undefined, ec);
      }
      let params: ExpressionReference[];
      if (remaining.startsWith('[')) {
        // allowUnknownDataTypes is false because the parameter list for a function expression must be determinate on data type even if that data type is Unknown (runtime determination)
        const multivariateResult: MultivariateParserResult = this.parseMultivariate(remaining, scope, multivariateHints, false, ec);

        [remaining, , params] = [...multivariateResult];
        return [remaining, {type, dataTypeRef, refName, module, multivariate, params} as FunctionExpressionReference];
      } else {
        return [remaining, {type, dataTypeRef, refName, module, multivariate, params} as FunctionExpressionReference];
      }
    } else {
      return [remaining, undefined];
    }
  }
}
