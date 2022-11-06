import {EnhancedError, logErrorAndThrow} from '@franzzemen/enhanced-error';
import {LogExecutionContext, LoggerAdapter} from '@franzzemen/logger-adapter';
import {ModuleDefinition} from '@franzzemen/module-factory';
import {ModuleResolutionActionInvocation} from '@franzzemen/module-resolver';
import {HasRefName} from '@franzzemen/re-common';
import {AwaitEvaluation} from '@franzzemen/re-common/util/await-evaluation.js';
import {isPromise} from 'util/types';


import {Expression, ExpressionReference, StandardExpressionType} from '../expression.js';
import {ExpressionScope} from '../scope/expression-scope.js';
import {ExpressionFactory} from '../factory/expression-factory.js';


export interface FunctionExpressionReference extends ExpressionReference, HasRefName {
  // Gets refName from HasRefName
  module?: ModuleDefinition; // Optional
  params?: ExpressionReference[];
}

export function isFunctionExpressionReference(ref: any | FunctionExpressionReference): ref is FunctionExpressionReference {
  return 'type' in ref && ref['type'] === StandardExpressionType.Function && !('awaitEvaluation' in ref);
}

export function isFunctionExpression(ref: any | FunctionExpression): ref is FunctionExpression {
  return 'type' in ref && ref['type'] === StandardExpressionType.Function && 'awaitEvaluation' in ref;
}

export class FunctionExpression extends Expression implements HasRefName {
  refName: string;
  module: ModuleDefinition;
  awaitEvaluationFunction: AwaitEvaluation;
  params?: Expression[];

  setAwaitEvaluationFunctionAction: ModuleResolutionActionInvocation = (successfulResolution, awaitEvaluationFunction: AwaitEvaluation, ec?: LogExecutionContext) => {
    if(this.awaitEvaluationFunction === undefined) {
      this.awaitEvaluationFunction = awaitEvaluationFunction;
      return true;
    } else {
      logErrorAndThrow(new EnhancedError(`awaitEvaluationFunction was already populated for ${this.refName}`))
    }
  }


  constructor(ref: FunctionExpressionReference, scope: ExpressionScope, ec?: LogExecutionContext) {
    super(ref, scope, ec);
    const log = new LoggerAdapter(ec, 're-expression', 'function-expression', `${FunctionExpression.name}.constructor`);
    this.refName = ref.refName;
    this.module = ref.module;
    this.awaitEvaluationFunction = scope.getAwaitEvaluationFunction(ref.refName, true, ec);
    if (ref.params) {
      this.params = [];
      const expressionFactory = scope.get(ExpressionScope.ExpressionFactory) as ExpressionFactory;
      ref.params.forEach(expRef => {
        const expression: Expression = expressionFactory.createExpression(expRef, scope, ec);
        this.params.push(expression);
      });
    }
  }

  awaitEvaluationFunctionLoadedAction: ModuleResolutionActionInvocation = (successfulResolution, scope: ExpressionScope, ec?: LogExecutionContext) => {
    const log = new LoggerAdapter(ec, 're-expression', 'expression', 'awaitEvaluationFunctionLoadedAction');
    if(this.awaitEvaluationFunction) {
      log.warn(this, `Action to set awaitEvaluationFunction "${this.refName}" called, but its already set`);
      logErrorAndThrow(new EnhancedError(`Action to set awaitEvaluationFunction "${this.refName}" called, but its already set`), log);
    } else {
      this.awaitEvaluationFunction = scope.getAwaitEvaluationFunction(this.refName, true, ec);
      if(!this.awaitEvaluationFunction) {
        log.warn(this, `Action to set awaitEvaluationFunction "${this.awaitEvaluationFunction}" called, but it still doesn't exist in the factory, this method should only be called when it is`);
        logErrorAndThrow(new EnhancedError(`Action to set awaitEvaluationFunction "${this.awaitEvaluationFunction}" called, but it still doesn't exist in the factory, this method should only be called when it is`), log);
      } else {
        return true;
      }
    }
  }

  to(ec?: LogExecutionContext): FunctionExpressionReference {
    const ref: Partial<FunctionExpressionReference> = {};
    super.toBase(ref, ec);
    ref.refName = this.refName;
    ref.module = this.module;
    ref.params = [];
    if(this.params) {
      this.params.forEach(param => {
        ref.params.push(param.to(ec));
      })
    }
    return ref as FunctionExpressionReference;
  }

  awaitEvaluation(dataDomain: any, scope: ExpressionScope, ec?: LogExecutionContext): any | Promise<any> {
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
      return this.awaitEval(this.awaitEvaluationFunction(dataDomain, scope, ec), scope, ec);
    }
  }
}
