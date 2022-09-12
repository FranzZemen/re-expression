import {ExecutionContextI, Hints, LoggerAdapter, ModuleDefinition} from '@franzzemen/app-utility';
import {loadModuleDefinitionFromHints, RuleElementModuleReference} from '@franzzemen/re-common';
import {StandardDataType} from '@franzzemen/re-data-type';
import {isPromise} from 'util/types';
import {ExpressionReference, ExpressionType} from '../expression.js';
import {ExpressionScope} from '../scope/expression-scope.js';
import {FunctionExpressionReference} from '../standard/function-expression.js';
import {ExpressionHintKey} from '../util/expression-hint-key.js';
import {MultivariateDataTypeHandling, MultivariateParser} from './multivariate-parser.js';

export class FunctionExpressionParser extends MultivariateParser {

  constructor() {
    super(ExpressionType.Function, MultivariateDataTypeHandling.Multivariate);
  }

  parse(remaining: string, scope:ExpressionScope, hints: Hints, allowUnknownDataType?: boolean, ec?: ExecutionContextI): [string, FunctionExpressionReference] | Promise<[string, FunctionExpressionReference]>{
    const log = new LoggerAdapter(ec, 're-expression', 'function-expression-parser', 'parse');
    let refName: string;
    let module: ModuleDefinition;
    let dataTypeRef = hints.get('data-type') as string
    if(!dataTypeRef) {
      if(!allowUnknownDataType) {
        return [remaining, undefined]; // No expression found
      } else {
        dataTypeRef = StandardDataType.Unknown;
      }
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
        const result = scope.addAwaitEvaluationFunction([ruleElementModuleReference], false, false, undefined, undefined, ec);
        if(isPromise(result)) {
          return result
            .then(() => {
              let params: ExpressionReference[];
              if(remaining.startsWith('[')) {
                const multivariateResultOrPromise = this.parseMultivariate(remaining, scope, hints, false, ec);
                if(isPromise(multivariateResultOrPromise)) {
                  return multivariateResultOrPromise
                    .then(multivariateResult => {
                      [remaining, , params] = multivariateResult;
                      return [remaining, {type, dataTypeRef, refName, module, multivariate, params}];
                    })
                } else {
                  [remaining, , params] = multivariateResultOrPromise;
                  return [remaining, {type, dataTypeRef, refName, module, multivariate, params}];
                }
              }
            }, err => {
              log.error(err);
              throw err;
            })
        } else {
          let params: ExpressionReference[];
          if(remaining.startsWith('[')) {
            const multivariateResultOrPromise = this.parseMultivariate(remaining, scope, hints, false, ec);
            if(isPromise(multivariateResultOrPromise)) {
              return multivariateResultOrPromise
                .then(multivariateResult => {
                  [remaining, , params] = multivariateResult;
                  return [remaining, {type, dataTypeRef, refName, module, multivariate, params}];
                })
            } else {
              [remaining, , params] = multivariateResultOrPromise;
              return [remaining, {type, dataTypeRef, refName, module, multivariate, params}];
            }
          }
        }
      } else if (!refNameRegistered) {
        const err = new Error(`No AwaitEvaluation registered for refName ${refName}`);
        log.error(err);
        throw err;
      } else {
        let params: ExpressionReference[];
        if(remaining.startsWith('[')) {
          const multivariateResultOrPromise = this.parseMultivariate(remaining, scope, hints, false, ec);
          if(isPromise(multivariateResultOrPromise)) {
            return multivariateResultOrPromise
              .then(multivariateResult => {
                [remaining, , params] = multivariateResult;
                return [remaining, {type, dataTypeRef, refName, module, multivariate, params}];
              })
          } else {
            [remaining, , params] = multivariateResultOrPromise;
            return [remaining, {type, dataTypeRef, refName, module, multivariate, params}];
          }
        }
        return [remaining, {type, dataTypeRef, refName, module, multivariate, params}];
      }
    }  else {
      return [remaining, undefined];
    }
  }
}
