import { RuleElementFactory } from '@franzzemen/re-common';
import { FormulaExpressionReference } from '../expression/formula-expression.js';
export declare class FormulaExpressionFactory extends RuleElementFactory<FormulaExpressionReference> {
    constructor();
    protected isC(obj: any): obj is FormulaExpressionReference;
}
