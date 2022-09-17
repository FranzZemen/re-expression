import {ExecutionContextI, LoggerAdapter, ModuleDefinition} from '@franzzemen/app-utility';
import {logErrorAndReturn, logErrorAndThrow} from '@franzzemen/app-utility/enhanced-error.js';
import {isPromise} from 'util/types';
import {Expression, ExpressionReference, ExpressionType} from '../expression.js';
import {ExpressionFactory} from './expression-factory.js';
import {MultivariateExpression} from './multivariate-expression.js';
import {ExpressionScope} from '../scope/expression-scope.js';

export function isSetExpressionReference(ref: any | SetExpressionReference): ref is SetExpressionReference {
  return 'set' in ref && Array.isArray(ref.set) && !('awaitEvaluation' in ref) && ref['type'] === ExpressionType.Set;
}

export function isSetExpression(ref: any | SetExpression): ref is SetExpression {
  return 'set' in ref && Array.isArray(ref.set) &&  ref['type'] === ExpressionType.Set && 'awaitEvaluation' in ref;
}

export interface SetExpressionReference extends MultivariateExpression  {
}


export class SetExpression extends Expression implements SetExpressionReference{
  set: Expression[] = [];
  private setReferences?: ExpressionReference []

  constructor(ref: SetExpressionReference, scope: ExpressionScope, ec?: ExecutionContextI) {
    super(ref, scope, ec);
    this.multivariate = true;
    this.setReferences = ref.set;
  }


  protected initializeExpression(scope:ExpressionScope, ec?:ExecutionContextI): SetExpression | Promise<SetExpression> {
    if(this.init) {
      return this;
    } else if(this.setReferences) {
      if (this.setReferences.length === 0) {
        this.init = true;
        delete this.setReferences;
        return this;
      } else {
        const factory = scope.get(ExpressionScope.ExpressionFactory) as ExpressionFactory;
        let isAsync = false;
        const expressionsOrPromises: (Expression | Promise<Expression>)[] = [];
        this.setReferences.forEach(expressionReference => {
          const expressionOrPromise = factory.createExpression(expressionReference, scope, ec);
          if (isPromise(expressionOrPromise)) {
            isAsync = true;
          }
          expressionsOrPromises.push(expressionOrPromise);
        });
        if(isAsync) {
          return Promise.all(expressionsOrPromises)
            .then(expressions => {
              this.set = expressions;
              this.init = true;
              delete this.setReferences;
              return this;
            }, err => {
              const log = new LoggerAdapter(ec, 're-expression', 'set-expression', 'initializeExpression');
              throw logErrorAndReturn(err, log, ec);
            })
        } else {
          this.set = expressionsOrPromises as Expression[];
          this.init = true;
          delete this.setReferences;
          return this;
        }
      }
    }
  }

  awaitEvaluation(dataDomain: any, scope: Map<string, any>, ec?: ExecutionContextI): any | Promise<any> {
    if(this.init) {
      let hasPromises = false;
      let results: any[] = [];
      this.set.forEach(element => {
        const evaluation = element.awaitEvaluation(dataDomain, scope, ec);
        if (isPromise(evaluation)) {
          hasPromises = true;
        }
        results.push(evaluation);
      });
      if (hasPromises) {
        return Promise.all(results);
      } else {
        return results;
      }
    } else {
      const log = new LoggerAdapter(ec, 're-expression', 'set-expression', 'awaitEvaluation');
      const err = new Error ('Expression not initialized');
      logErrorAndThrow(err, log, ec);
    }
  }


  to(ec?: ExecutionContextI): SetExpressionReference {
    if(this.init) {
      const setExpressionReference: Partial<SetExpressionReference> = {
        set: []
      }
      super.toBase(setExpressionReference, ec);
      this.set.forEach(expression => {
        setExpressionReference.set.push(expression.to(ec));
      })
      return setExpressionReference as SetExpressionReference;
    } else {
      const log = new LoggerAdapter(ec, 're-expression', 'set-expression', 'awaitEvaluation');
      const err = new Error ('Expression not initialized');
      logErrorAndThrow(err, log, ec);
    }
  }
}
