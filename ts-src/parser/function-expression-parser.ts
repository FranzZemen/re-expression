import {ExecutionContextI, Hints, LoggerAdapter, ModuleDefinition} from '@franzzemen/app-utility';
import {loadModuleDefinitionFromHints, RuleElementModuleReference} from '@franzzemen/re-common';
import {ExpressionReference, ExpressionType} from '../expression';
import {FunctionExpressionReference} from '../standard/function-expression';
import {ExpressionScope} from '../scope/expression-scope';
import {ExpressionHintKey} from '../util/expression-hint-key';
import {MultivariateParser} from './multivariate-parser';

export class FunctionExpressionParser extends MultivariateParser {

  constructor() {
    super(ExpressionType.Function, false);
  }

  parse(remaining: string, scope:ExpressionScope, hints: Hints, allowUndefinedDataType?: boolean, ec?: ExecutionContextI): [string, FunctionExpressionReference] {
    const log = new LoggerAdapter(ec, 'rules-engine', 'function-expression-parser', 'parse');
    let refName: string;
    let module: ModuleDefinition;
    const dataTypeRef = hints.get('data-type') as string
    if(!dataTypeRef && !allowUndefinedDataType) {
      // A function expression always requires a data-type, directly or indirectly hinted.  Since no data type hint exists
      // it must not be a Function Expression (or could be an error...to be handled outside this inference)
      return [remaining, undefined];
    }
    const multivariateRef = hints.get(ExpressionHintKey.Multivariate);
    let multivariate: boolean;
    if(multivariateRef) {
      multivariate = multivariateRef === 'true' || multivariateRef === ExpressionHintKey.Multivariate;
    }
    let type = hints.get('type') as string;
    let result;
    if(type === ExpressionType.Function) {
      // Search for either the function ref name by itself, or preceded by the '@' symbol, which is reserved.
      result = /^@?([a-zA-Z]+[a-zA-Z0-9]*)([\[\s\t\r\n\v\f\u2028\u2029)\],][^]*$|$)/.exec(remaining); // Note the opening square bracket that might replace a following space...start of parameters
    } else {
      // The '@' symbol must precede since no type hint was provided
      result =  /^@([a-zA-Z]+[a-zA-Z0-9]*)([\[\s\t\r\n\v\f\u2028\u2029)\],][^]*$|$)/.exec(remaining); // Note the opening square bracket that might replace a following space...start of parameters
    }
    if(result) {
      type = ExpressionType.Function;
      refName = result[1];
      remaining = result[2].trim();
      const refNameRegistered = scope.hasAwaitEvaluationFactory(scope, refName, ec);
      module = loadModuleDefinitionFromHints(hints, ec);
      if(module && !refNameRegistered) {
        // Load the awaitEvaluation
        const ruleElementModuleReference: RuleElementModuleReference = {refName, module};
        scope.addAwaitEvaluationFunction([ruleElementModuleReference], ec);
      } else if (!refNameRegistered) {
        const err = new Error(`No AwaitEvaluation registered for refName ${refName}`);
        log.error(err);
        throw err;
      }

      // Check to see if it has parameters
      let params: ExpressionReference[];
      if(remaining.startsWith('[')) {
        // Parse the parameters
        [remaining, , params] = this.parseMultivariate(remaining, scope, hints, false, ec);
      }
      return [remaining, {type, dataTypeRef, refName, module, multivariate, params}];
    }  else {
      return [remaining, undefined];
    }
  }
}
