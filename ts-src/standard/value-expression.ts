import {ExecutionContextI, LoggerAdapter, ModuleResolver} from '@franzzemen/app-utility';
import {ExpressionScope} from '../scope/expression-scope.js';
import {Expression, ExpressionReference, ExpressionType} from '../expression.js';

export interface ValueExpressionReference extends ExpressionReference {
  value: any;
}


export function isValueExpressionReference(val: ValueExpressionReference | any): val is ValueExpressionReference {
  return val !== undefined
    && val.type !== undefined
    && val.type === ExpressionType.Value
    && (val as ValueExpressionReference).value !== undefined
    && (val as ValueExpressionReference).dataTypeRef !== undefined;
}

export function isValueExpression(expression: ValueExpression | any): expression is ValueExpression {
  return expression !== undefined
    && expression.type !== undefined
    && expression.type === ExpressionType.Value
    && (expression as ValueExpressionReference).value !== undefined
    && (expression as ValueExpressionReference).dataTypeRef !== undefined
    && 'evaluate' in expression;
}


export class ValueExpression extends Expression {
  value: any;


  constructor(expressionRef: ValueExpressionReference, scope: ExpressionScope, ec?: ExecutionContextI) {
    super(expressionRef, scope, ec);
    this.value = expressionRef.value;
  }


  to(ec?: ExecutionContextI): ValueExpressionReference {
    const ref: Partial<ValueExpressionReference> = {};
    super.toBase(ref, ec);
    ref.value = this.value;
    return ref as ValueExpressionReference;
  }

  awaitEvaluation(dataDomain: any, scope: Map<string, any>, ec?: ExecutionContextI): any | Promise<any> {
    return this.awaitEval(this.value, scope);
  }
}

