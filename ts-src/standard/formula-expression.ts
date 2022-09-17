import {ExecutionContextI} from '@franzzemen/app-utility';
import {Expression, ExpressionReference} from '../expression.js';
import {ExpressionScope} from '../scope/expression-scope.js';



export enum Operator {
  Add = '+',
  Subtract = '-',
  Multiply = '*',
  Divide = '/',
  Modulus = '%',
  AbsoluteValue = '|'
}

export type UnaryOperator = Operator.Add | Operator.Subtract | Operator.AbsoluteValue;
export type BinaryOperator = Operator.Add | Operator.Subtract | Operator.Multiply | Operator.Divide;

export const unaryOperators = [Operator.Add, Operator.Subtract, Operator.AbsoluteValue];
export const binaryOperators = [Operator.Add, Operator.Subtract, Operator.Multiply, Operator.Divide];

export interface OperationFragment {
  unaryOperator?: UnaryOperator;
  binaryOperator?: BinaryOperator;
  expressionRef: ExpressionReference;
}

export interface FormulaExpressionReference extends ExpressionReference {
  operations: OperationFragment[];
}

export class FormulaExpression extends Expression {

  constructor(ref: FormulaExpressionReference, scope: ExpressionScope, ec?: ExecutionContextI) {
    super(ref, scope, ec);
  }

  awaitEvaluation(dataDomain: any, scope: Map<string, any>, ec?: ExecutionContextI): any {
  }

  to(ec?: ExecutionContextI): FormulaExpressionReference {
    return undefined;
  }

  protected initializeExpression(scope: ExpressionScope, ec?: ExecutionContextI): FormulaExpression | Promise<FormulaExpression> {
    return undefined;
  }

}
