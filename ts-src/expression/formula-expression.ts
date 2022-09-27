import {ExecutionContextI, ModuleDefinition} from '@franzzemen/app-utility';
import {isRecursiveGrouping, RecursiveGrouping} from '@franzzemen/re-common';
import {Expression} from '../../publish/index.js';
import {ExpressionReference, ExpressionType} from '../expression.js';
import {ExpressionScope} from '../scope/expression-scope.js';


export enum FormulaOperator {
  Add = '+',
  Subtract = '-',
  Multiply = '*',
  Divide = '/'
}

export function isFormulaExpressionReference(ref: any | FormulaExpressionReference): ref is FormulaExpressionReference {
  return ref['type'] === ExpressionType.Formula && 'operator' in ref && 'group' in ref;
}


export class FormulaElement {
  constructor() {
  }
  operator: FormulaOperator;
  expression:  Expression;
}

export class Formula {
  operator: FormulaOperator;
  elements: (FormulaOperator | FormulaElement) [] = [];

  constructor() {
  }
}





export interface FormulaExpressionReference extends RecursiveGrouping<FormulaOperator, ExpressionReference>, ExpressionReference {
  refName?: string;
  // module?: ModuleDefinition;
}


class FormulaExpression extends Expression {
  refName?: string;
  formula: Formula = new Formula();

  constructor(ref: FormulaExpressionReference, scope?: ExpressionScope, ec?: ExecutionContextI) {
    super(ref, scope, ec);
    this.refName = ref. refName
    this.formula.operator = ref.operator;
    ref.group.forEach(item => {
      if(isRecursiveGrouping(item)) {
        const formula = new Formula();
        formula.operator = item.operator;
        this.formula no..need to recurse!!!
      }
    })
  }


  awaitEvaluation(dataDomain: any, scope: Map<string, any>, ec?: ExecutionContextI): any {
  }

  to(ec?: ExecutionContextI): FormulaExpression {
    return undefined;
  }

}
