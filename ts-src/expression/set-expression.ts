import {ExecutionContextI} from '@franzzemen/app-utility';
import {isPromise} from 'util/types';
import {Expression, StandardExpressionType} from '../expression.js';
import {ExpressionFactory} from '../factory/expression-factory.js';
import {ExpressionScope} from '../scope/expression-scope.js';
import {MultivariateExpression} from './multivariate-expression.js';

export function isSetExpressionReference(ref: any | SetExpressionReference): ref is SetExpressionReference {
  return 'set' in ref && Array.isArray(ref.set) && !('awaitEvaluation' in ref) && ref['type'] === StandardExpressionType.Set;
}

export function isSetExpression(ref: any | SetExpression): ref is SetExpression {
  return 'set' in ref && Array.isArray(ref.set) && ref['type'] === StandardExpressionType.Set && 'awaitEvaluation' in ref;
}

export interface SetExpressionReference extends MultivariateExpression {
}


export class SetExpression extends Expression implements SetExpressionReference {
  set: Expression[] = [];

  constructor(ref: SetExpressionReference, scope: ExpressionScope, ec?: ExecutionContextI) {
    super(ref, scope, ec);
    this.multivariate = true;
    const factory = scope.get(ExpressionScope.ExpressionFactory) as ExpressionFactory;
    ref.set.forEach(expressionReference => {
      const expression = factory.createExpression(expressionReference, scope, ec);
      this.set.push(expression);
    });
  }

  awaitEvaluation(dataDomain: any, scope: Map<string, any>, ec?: ExecutionContextI): any | Promise<any> {
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
  }

  to(ec?: ExecutionContextI): SetExpressionReference {
    const setExpressionReference: Partial<SetExpressionReference> = {
      set: []
    };
    super.toBase(setExpressionReference, ec);
    this.set.forEach(expression => {
      setExpressionReference.set.push(expression.to(ec));
    });
    return setExpressionReference as SetExpressionReference;
  }

}
