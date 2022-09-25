import {RecursiveGrouping} from '@franzzemen/re-common';
import {ExpressionReference, ExpressionType} from '../expression.js';


export enum Operator {
  Add = '+',
  Subtract = '-',
  Multiply = '*',
  Divide = '/'
}

export function isFormulaExpressionReference(ref: any | FormulaExpressionReference): ref is FormulaExpressionReference {
  return ref['type'] === ExpressionType.Logical && 'operator' in ref && 'group' in ref;
}

export interface FormulaExpressionReference extends RecursiveGrouping<Operator, ExpressionReference>, ExpressionReference {
}




/*



export type BinaryOperator = Operator.Add | Operator.Subtract | Operator.Multiply | Operator.Divide;

export const binaryOperators = [Operator.Add, Operator.Subtract, Operator.Multiply, Operator.Divide];

export interface OperationFragment {
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
*/
