import {LogExecutionContext} from '@franzzemen/logger-adapter';
import {Expression, ExpressionReference, StandardExpressionType} from '../expression.js';
import {ExpressionScope} from '../scope/expression-scope.js';

export interface ValueExpressionReference extends ExpressionReference {
  value: any;
}


export function isValueExpressionReference(val: ValueExpressionReference | any): val is ValueExpressionReference {
  return val !== undefined
    && val.type !== undefined
    && val.type === StandardExpressionType.Value
    && (val as ValueExpressionReference).value !== undefined
    && (val as ValueExpressionReference).dataTypeRef !== undefined;
}

export function isValueExpression(expression: ValueExpression | any): expression is ValueExpression {
  return expression instanceof ValueExpression;
  /*
  return expression !== undefined
    && expression.type !== undefined
    && expression.type === ExpressionType.Value
    && (expression as ValueExpressionReference).value !== undefined
    && (expression as ValueExpressionReference).dataTypeRef !== undefined
    && 'evaluate' in expression;

   */
}


export class ValueExpression extends Expression {
  value: any;


  constructor(expressionRef: ValueExpressionReference, scope: ExpressionScope, ec?: LogExecutionContext) {
    super(expressionRef, scope, ec);
    this.value = expressionRef.value;
  }


  to(ec?: LogExecutionContext): ValueExpressionReference {
    const ref: Partial<ValueExpressionReference> = {};
    super.toBase(ref, ec);
    ref.value = this.value;
    return ref as ValueExpressionReference;
  }

  awaitEvaluation(dataDomain: any, scope: ExpressionScope, ec?: LogExecutionContext): any | Promise<any> {
    return this.awaitEval(this.value, scope);
  }
}

