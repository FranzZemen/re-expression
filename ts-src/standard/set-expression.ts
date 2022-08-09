import {ExecutionContextI} from '@franzzemen/app-utility';
import {isPromise} from '@franzzemen/re-common';
import {Expression, ExpressionType} from '../expression';
import {ExpressionFactory} from './expression-factory';
import {MultivariateExpression} from './multivariate-expression';
import {ExpressionScope} from '../scope/expression-scope';

export function isSetExpressionReference(ref: any | SetExpressionReference): ref is SetExpressionReference {
  return 'set' in ref && Array.isArray(ref.set) && !('awaitEvaluation' in ref) && ref['type'] === ExpressionType.Set;
}

export function isSetExpression(ref: any | SetExpression): ref is SetExpression {
  return 'set' in ref && Array.isArray(ref.set) &&  ref['type'] === ExpressionType.Set && 'awaitEvaluation' in ref;
}

export interface SetExpressionReference extends MultivariateExpression {
}


export class SetExpression extends  Expression {
  set: Expression[] = [];

  constructor(ref: SetExpressionReference | SetExpression, scope: ExpressionScope, ec?: ExecutionContextI) {
    super(ref, scope, ec);
    this.multivariate = true;
    const factory = scope.get(ExpressionScope.ExpressionFactory) as ExpressionFactory;
    ref.set.forEach(expressionRef => {
      this.set.push(factory.createExpression(expressionRef, scope, ec));
    })
  }

  awaitEvaluation(dataDomain: any, scope: Map<string, any>, ec?: ExecutionContextI): any | Promise<any> {
    let hasPromises = false;
    let results: any[] = [];
    this.set.forEach(element => {
      const evaluation = element.awaitEvaluation(dataDomain, scope, ec);
      if(isPromise(evaluation)) {
        hasPromises = true;
      }
      results.push(evaluation);
    });
    if(hasPromises) {
      return Promise.all(results);
    } else {
      return results;
    }
  }


  to(ec?: ExecutionContextI): SetExpressionReference {
    return undefined;
  }

}
