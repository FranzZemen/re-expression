import {
  AwaitEvaluation,
  ExecutionContextI,
  Hints,
  LoggerAdapter,
  ModuleDefinition,
  ModuleResolver
} from '@franzzemen/app-utility';
import {EnhancedError, logErrorAndThrow} from '@franzzemen/app-utility/enhanced-error.js';
import {loadModuleDefinitionFromHints, RuleElementModuleReference} from '@franzzemen/re-common';
import {StandardDataType} from '@franzzemen/re-data-type';
import {isPromise} from 'util/types';
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

  parseAndResolve(remaining: string, scope: ExpressionScope, hints: Hints, allowUnknownDataType?: boolean, ec?: ExecutionContextI): ResolvedExpressionParserResult {
    throw new Error('Method not implemented.');
  }

  parse(moduleResolver: ModuleResolver, remaining: string, scope: ExpressionScope, hints: Hints, allowUnknownDataType?: boolean, ec?: ExecutionContextI): [string, FunctionExpressionReference] {
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

      const multivariateHints = new Hints(`'${ExpressionHintKey.DataType}=${StandardDataType.Unknown} ${ExpressionHintKey.Multivariate} type=${ExpressionType.Function}`);
      multivariateHints.load(moduleResolver, '', ec); // Nothing in the hints would cause a module resolver add, fyi
      if (module && !refNameRegistered) {
        // Load the awaitEvaluation
        const ruleElementModuleReference: RuleElementModuleReference = {refName, module};
        scope.addAwaitEvaluationFunctionsResolver(moduleResolver, [ruleElementModuleReference], false, false, ec);
      } else if (!refNameRegistered) {
        const err = new Error(`No AwaitEvaluation registered for refName ${refName}`);
        logErrorAndThrow(err, log, ec);
      }
      let params: ExpressionReference[];
      if (remaining.startsWith('[')) {
        // allowUnknownDataTypes is false because the parameter list for a function expression must be determinate on data type even if that data type is Unknown (runtime determination)
        const multivariateResult: MultivariateParserResult = this.parseMultivariate(moduleResolver, remaining, scope, multivariateHints, false, ec);

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
