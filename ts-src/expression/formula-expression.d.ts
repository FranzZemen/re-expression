import { ExecutionContextI } from '@franzzemen/app-utility';
import { RecursiveGrouping } from '@franzzemen/re-common';
import { Expression, ExpressionReference } from '../expression.js';
import { ExpressionScope } from '../scope/expression-scope.js';
export declare enum FormulaOperator {
    Add = "+",
    Subtract = "-",
    Multiply = "*",
    Divide = "/"
}
export declare const formulaOperators: FormulaOperator[];
export declare function isFormulaExpressionReference(ref: any | FormulaExpressionReference): ref is FormulaExpressionReference;
export declare function isFormulaElement(element: any | FormulaElement): element is FormulaElement;
export declare function isFormula(formula: any | Formula): formula is Formula;
export declare class FormulaElement {
    operator: FormulaOperator;
    expression: Expression;
    constructor();
}
export declare class Formula {
    operator: FormulaOperator;
    elements: (Formula | FormulaElement)[];
    constructor();
}
export interface FormulaExpressionReference extends RecursiveGrouping<FormulaOperator, ExpressionReference>, ExpressionReference {
    refName?: string;
}
export declare class FormulaExpression extends Expression {
    refName?: string;
    formula: Formula;
    constructor(ref: FormulaExpressionReference, scope: ExpressionScope, ec?: ExecutionContextI);
    private static recurseFromFormulaReference;
    awaitEvaluation(dataDomain: any, scope: ExpressionScope, ec?: ExecutionContextI): number | Promise<number>;
    private concatStringsAndReturn;
    private recurseInnerEval;
    private sanitizeOperator;
    private sanitizeNumber;
    to(ec?: ExecutionContextI): FormulaExpressionReference;
    private static recurseToFormulaExpressionReference;
}
