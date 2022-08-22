import {AwaitEvaluation, ExecutionContextI, LoggerAdapter, ModuleDefinition} from '@franzzemen/app-utility';
import {HasRefName, isPromise} from '@franzzemen/re-common';


import {Expression, ExpressionReference, ExpressionType} from '../expression';
import {ExpressionFactory} from './expression-factory';
import {ExpressionScope} from '../scope/expression-scope';



export interface FunctionExpressionReference extends ExpressionReference, HasRefName {
  // Gets refName from HasRefName
  module?: ModuleDefinition; // Optional
  params?: ExpressionReference[]
}

export function isFunctionExpressionReference(ref: any | FunctionExpressionReference): ref is FunctionExpressionReference {
  return 'type' in ref && ref['type'] === ExpressionType.Function && !('awaitEvaluation' in ref) ;
}

export function isFunctionExpression(ref: any | FunctionExpression): ref is FunctionExpression {
  return 'type' in ref && ref['type'] === ExpressionType.Function && 'awaitEvaluation' in ref;
}

export class FunctionExpression extends Expression implements HasRefName {
  refName: string;
  module: ModuleDefinition;
  awaitEvaluationFunction : AwaitEvaluation;
  params?: Expression[];

  constructor(ref: FunctionExpressionReference | FunctionExpression, scope?: ExpressionScope, ec?: ExecutionContextI) {
    super(ref, scope, ec);
    const log = new LoggerAdapter(ec, 'rules-engine', 'function-expression', `${FunctionExpression.name}.constructor`)
    this.refName = ref.refName;
    this.module = ref.module ? {moduleName: ref.module.moduleName, functionName: ref.module.functionName, constructorName: ref.module.functionName} : undefined;
    if(isFunctionExpression(ref)) {
      this.awaitEvaluationFunction = ref.awaitEvaluationFunction; // Copy the function...it should be stateless
      if (ref.params) {
        this.params = [];
        const expressionFactory = scope.get(ExpressionScope.ExpressionFactory) as ExpressionFactory;
        ref.params.forEach(param => {
          this.params.push(expressionFactory.createExpression(param, scope, ec));
        });
      }
    } else {
      this.awaitEvaluationFunction = scope.getAwaitEvaluationFunction(ref.refName, true, ec);
      if(!this.awaitEvaluationFunction) {
        if(ref.module) {
          scope.addAwaitEvaluationFunction([{refName: ref.refName, module: ref.module}], ec);
        } else {
          const err = new Error(`No valid AwaitEvaluation for ${ref.refName}`);
          log.error(err);
          throw err;
        }
      }
      this.awaitEvaluationFunction = scope.getAwaitEvaluationFunction(this.refName, true, ec);
      if (ref.params) {
        this.params = [];
        const expressionFactory = scope.get(ExpressionScope.ExpressionFactory) as ExpressionFactory;
        ref.params.forEach(param => {
          this.params.push(expressionFactory.createExpression(param, scope, ec));
        });
      }
    }
  }

  to(ec?: ExecutionContextI) : FunctionExpressionReference {
    const ref: Partial<FunctionExpressionReference> = {};
    super.toBase(ref, ec);
    ref.refName = this.refName;
    ref.module = this.module ? {moduleName: this.module.moduleName, functionName: this.module.functionName, constructorName: this.module.constructorName} : undefined;
    return ref as FunctionExpressionReference;
  }

  awaitEvaluation(dataDomain: any, scope: Map<string, any>, ec?: ExecutionContextI): any | Promise<any> {
    if(this.params && this.params.length) {
      const paramResults: any[] = [];
      let hasPromise = false;
      this.params.forEach(param => {
        const result = param.awaitEvaluation(dataDomain, scope, ec);
        if(isPromise(result)) {
          hasPromise = true;
        }
        paramResults.push(result);
      });
      if(hasPromise) {
        return Promise.all(paramResults)
          .then(resolvedResults => {
            return this.awaitEvaluationFunction(dataDomain, scope, ec, resolvedResults);
          });
      } else {
        return this.awaitEvaluationFunction(dataDomain, scope,ec, paramResults);
      }
    } else {
      return this.awaitEvaluationFunction(dataDomain, scope, ec);
    }
  }
}
