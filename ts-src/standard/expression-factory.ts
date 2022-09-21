import {ExecutionContextI} from '@franzzemen/app-utility';
import {isPromise} from 'util/types';
import {Expression, ExpressionReference, ExpressionType, isExpression} from '../expression.js';
import {ExpressionScope} from '../scope/expression-scope.js';
import {AttributeExpression, AttributeExpressionReference} from './attribute-expression.js';
import {FunctionExpression, FunctionExpressionReference} from './function-expression.js';
import {SetExpression, SetExpressionReference} from './set-expression.js';
import {ValueExpression, ValueExpressionReference} from './value-expression.js';

export class ExpressionFactory {
  constructor(ec?: ExecutionContextI) {
  }

  createExpression(expressionRef: ExpressionReference | Expression, scope: ExpressionScope, ec?: ExecutionContextI): Expression {
    let expressionReference: ExpressionReference;
    if (isExpression(expressionRef)) {
      expressionReference = expressionRef.to(ec);
    } else {
      expressionReference = expressionRef;
    }
    let expression: Expression;
    switch (expressionRef.type) {
      case ExpressionType.Value:
        expression = new ValueExpression(expressionReference as ValueExpressionReference, scope, ec);
        break;
      case ExpressionType.Attribute:
        expression = new AttributeExpression(expressionReference as AttributeExpressionReference, scope, ec);
        break;
      case ExpressionType.Function:
        expression = new FunctionExpression(expressionReference as FunctionExpressionReference, scope, ec);
        break;
      case ExpressionType.Set:
        expression = new SetExpression(expressionReference as SetExpressionReference, scope, ec);
        break;
    };
    return expression;
  }
}
