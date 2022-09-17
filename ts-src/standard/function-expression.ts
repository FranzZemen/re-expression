import {EnhancedError, logErrorAndReturn, logErrorAndThrow} from '@franzzemen/app-utility/enhanced-error.js';
import {isPromise} from 'util/types';
import {AwaitEvaluation, ExecutionContextI, LoggerAdapter, ModuleDefinition} from '@franzzemen/app-utility';
import {HasRefName} from '@franzzemen/re-common';


import {Expression, ExpressionReference, ExpressionType} from '../expression.js';
import {ExpressionScope} from '../scope/expression-scope.js';
import {ExpressionFactory} from './expression-factory.js';


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
  paramsOrPromises?: (Expression | Promise<Expression>)[];


  constructor(ref: FunctionExpressionReference, scope: ExpressionScope, ec?: ExecutionContextI) {
    super(ref, scope, ec);
    const log = new LoggerAdapter(ec, 're-expression', 'function-expression', `${FunctionExpression.name}.constructor`)
    this.refName = ref.refName;
    this.module = ref.module ? {
      moduleName: ref.module.moduleName,
      functionName: ref.module.functionName,
      constructorName: ref.module.constructorName,
      moduleResolution: ref.module.moduleResolution,
      loadSchema: ref.module.loadSchema
    } : undefined;
    /*
    Keep track of whether initialization creates Promises.  If it does, a call to initializeExpression will be needed
    by the caller.

    There are a several conditions under which a Promise might be generated.  As of writing this comment these include:
    - Loading the awaitEvaluationFunction from an ES module (no Promise from a CommonJS module)
    - Processing of a parameter expression reference into an expression that itself may create a Promise
    */

    let async = false;
    this.awaitEvaluationFunction = scope.getAwaitEvaluationFunction(ref.refName, true, ec);
    if(!this.awaitEvaluationFunction) {
      async = true;
    }
    if(ref.params) {
      this.paramsOrPromises = [];
      const expressionFactory = scope.get(ExpressionScope.ExpressionFactory) as ExpressionFactory;

      ref.params.forEach(expRef => {
        const expOrPromise = expressionFactory.createExpression(expRef, scope, ec);
        if(isPromise(expOrPromise)) {
          async = true;
        }
        this.paramsOrPromises.push(expOrPromise);
      });
    }
    if(async === false) {
      this.init = true;
      this.params = this.paramsOrPromises as Expression[];
      delete this.paramsOrPromises;
    }
    if(!this.awaitEvaluationFunction && !this.module) {
      const err = new Error('Function Expression cannot be created due to missing awaitEvaluationFunction and no module to load from');
      logErrorAndThrow(err, log, ec);
    }
  }


  private _initProcessing(results: any[], ec?: ExecutionContextI) : FunctionExpression {
    if (results[0] !== undefined) {
      if(!(Array.isArray(results[0]) && results[0].length === 1)) {
        const log = new LoggerAdapter(ec, 're-expression', 'function-expression', '_initProcessing');
        logErrorAndThrow(new EnhancedError('Expected Array of Length 1'));
      }
      const evaluations = results[0];
      this.awaitEvaluationFunction = evaluations[0];
    }
    results.splice(0, 1);
    if(results.length > 0) {
      this.params = results as Expression[];
      delete this.paramsOrPromises;
    }
    this.init = true;
    return this;
  }

  protected initializeExpression(scope:ExpressionScope, ec?:ExecutionContextI): FunctionExpression | Promise<FunctionExpression> {
    const log = new LoggerAdapter(ec, 're-expression', 'function-expression', `initializeExpression`);
    if (this.init) {
      return this;
    } else {
      let promises: any | Promise<any>[] = [];
      let async = false;
      if (!this.awaitEvaluationFunction) {
        if (this.module) {
          const awaitEvaluations: AwaitEvaluation[] | Promise<AwaitEvaluation[]> = scope.addAwaitEvaluationFunctions([{
            refName: this.refName,
            module: this.module
          }], false, false, undefined, undefined, ec);
          if (isPromise(awaitEvaluations)) {
            async = true;
          }
          promises.push(awaitEvaluations);
        } else {
          const err = new Error('Function Expression cannot be initialized due to missing module');
          logErrorAndThrow(err, log, ec);
        }
      } else {
        promises.push(undefined);
      }
      if (this.paramsOrPromises && this.paramsOrPromises.length > 0) {
        if(!async) {
          async = this.paramsOrPromises.some(paramOrPromise => isPromise(paramOrPromise));
        }
        promises = promises.concat(this.paramsOrPromises);
      }
      if (async) {
        return Promise.all(promises)
          .then(values => {
            return this._initProcessing(values, ec);
          }, err => {
            throw logErrorAndReturn(err, log, ec);
          })
      } else {
        return this._initProcessing(promises, ec);
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
      logErrorAndThrow(err, log, ec);
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
      logErrorAndThrow(err, log, ec);
    }
  }

}
