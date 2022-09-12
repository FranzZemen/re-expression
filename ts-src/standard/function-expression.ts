import {isPromise} from 'util/types';
import {AwaitEvaluation, ExecutionContextI, LoggerAdapter, ModuleDefinition} from '@franzzemen/app-utility';
import {HasRefName} from '@franzzemen/re-common';


import {Expression, ExpressionReference, ExpressionType} from '../expression.js';
import {ExpressionScope} from '../scope/expression-scope.js';


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

  constructor(ref: FunctionExpressionReference, scope?: ExpressionScope, ec?: ExecutionContextI) {
    super(ref, scope, ec);
    const log = new LoggerAdapter(ec, 're-expression', 'function-expression', `${FunctionExpression.name}.constructor`)
    this.refName = ref.refName;
    this.module = ref.module ? {moduleName: ref.module.moduleName, functionName: ref.module.functionName, constructorName: ref.module.functionName} : undefined;
    this.awaitEvaluationFunction = scope.getAwaitEvaluationFunction(ref.refName, true, ec);
    if(this.awaitEvaluationFunction) {
      this.init = true;
    }
    if(!this.awaitEvaluationFunction && !this.module) {
      const err = new Error('Function Expression cannot be created due to missing awaitEvaluationFunction and no module to load from');
      log.error(err);
      throw(err);
    }
  }


  protected initializeExpression(scope:ExpressionScope, ec?:ExecutionContextI): true | Promise<true> {
    if(this.init) {
      return true;
    } else if(this.awaitEvaluationFunction) {
      return true;
    } else {
      if(this.module) {
        const addedOrPromise = scope.addAwaitEvaluationFunction([{refName: this.refName, module: this.module}],  false, false, undefined, undefined, ec);

        if(isPromise(addedOrPromise)) {
          return addedOrPromise
            .then(() => {
              this.init = true;
              return true;
            }, err => {
              const log = new LoggerAdapter(ec, 're-expression', 'function-expression', `initializeExpression`);
              log.error(err);
              throw err;
            })
        } else {
          return true;
        }
      } else {
        const log = new LoggerAdapter(ec, 're-expression', 'function-expression', `initializeExpression`);
        const err = new Error('Function Expression cannot be initialized due to missing module');
        log.error(err);
        throw err;
      }
    }
  }



  to(ec?: ExecutionContextI) : FunctionExpressionReference {
    if (this.init) {
      const ref: Partial<FunctionExpressionReference> = {};
      super.toBase(ref, ec);
      ref.refName = this.refName;
      ref.module = this.module ? {
        moduleName: this.module.moduleName,
        functionName: this.module.functionName,
        constructorName: this.module.constructorName
      } : undefined;
      return ref as FunctionExpressionReference;
    } else {
      const log = new LoggerAdapter(ec, 're-expression', 'function-expression', 'to');
      const err = new Error ('Expression not initialized');
      log.error(err);
      throw err;
    }
  }

  awaitEvaluation(dataDomain: any, scope: Map<string, any>, ec?: ExecutionContextI): any | Promise<any> {
    if (this.init) {
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
    } else {
      const log = new LoggerAdapter(ec, 're-expression', 'function-expression', 'awaitEvaluation');
      const err = new Error ('Expression not initialized');
      log.error(err);
      throw err;
    }
  }

}
