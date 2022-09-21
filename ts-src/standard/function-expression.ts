import {AwaitEvaluation, ExecutionContextI, LoggerAdapter, ModuleDefinition} from '@franzzemen/app-utility';
import {EnhancedError, logErrorAndThrow} from '@franzzemen/app-utility/enhanced-error.js';
import {HasRefName} from '@franzzemen/re-common';
import {isPromise} from 'util/types';


import {Expression, ExpressionReference, ExpressionType} from '../expression.js';
import {ExpressionScope} from '../scope/expression-scope.js';
import {ExpressionFactory} from './expression-factory.js';


export interface FunctionExpressionReference extends ExpressionReference, HasRefName {
  // Gets refName from HasRefName
  module?: ModuleDefinition; // Optional
  params?: ExpressionReference[];
}

export function isFunctionExpressionReference(ref: any | FunctionExpressionReference): ref is FunctionExpressionReference {
  return 'type' in ref && ref['type'] === ExpressionType.Function && !('awaitEvaluation' in ref);
}

export function isFunctionExpression(ref: any | FunctionExpression): ref is FunctionExpression {
  return 'type' in ref && ref['type'] === ExpressionType.Function && 'awaitEvaluation' in ref;
}

export class FunctionExpression extends Expression implements HasRefName {
  refName: string;
  module: ModuleDefinition;
  awaitEvaluationFunction: AwaitEvaluation;
  params?: Expression[];


  constructor(ref: FunctionExpressionReference, scope: ExpressionScope, ec?: ExecutionContextI) {
    super(ref, scope, ec);
    const log = new LoggerAdapter(ec, 're-expression', 'function-expression', `${FunctionExpression.name}.constructor`);
    this.refName = ref.refName;
    this.module = ref.module;
    this.awaitEvaluationFunction = scope.getAwaitEvaluationFunction(ref.refName, true, ec);
    if (!this.awaitEvaluationFunction) {
      logErrorAndThrow(new EnhancedError(`Attempt to create Function Expression when awaitEvaluationFunction ${ref.refName} has not been loaded`), log, ec);
    }
    if (ref.params) {
      this.params = [];
      const expressionFactory = scope.get(ExpressionScope.ExpressionFactory) as ExpressionFactory;

      ref.params.forEach(expRef => {
        const expression: Expression = expressionFactory.createExpression(expRef, scope, ec);
        this.params.push(expression);
      });
    }
  }


  to(ec?: ExecutionContextI): FunctionExpressionReference {
    const ref: Partial<FunctionExpressionReference> = {};
    super.toBase(ref, ec);
    ref.refName = this.refName;
    ref.module = this.module;
    return ref as FunctionExpressionReference;
  }

  awaitEvaluation(dataDomain: any, scope: Map<string, any>, ec?: ExecutionContextI): any | Promise<any> {
    if (this.params && this.params.length) {
      const paramResults: any[] = [];
      let hasPromise = false;
      this.params.forEach(param => {
        const result = param.awaitEvaluation(dataDomain, scope, ec);
        if (isPromise(result)) {
          hasPromise = true;
        }
        paramResults.push(result);
      });
      if (hasPromise) {
        return Promise.all(paramResults)
          .then(resolvedResults => {
            return this.awaitEvaluationFunction(dataDomain, scope, ec, resolvedResults);
          });
      } else {
        return this.awaitEvaluationFunction(dataDomain, scope, ec, paramResults);
      }
    } else {
      return this.awaitEvaluationFunction(dataDomain, scope, ec);
    }
  }
}
