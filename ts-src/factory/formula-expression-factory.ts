import {RuleElementFactory} from '@franzzemen/re-common';
import {FormulaExpressionReference, isFormulaExpressionReference} from '../expression/formula-expression.js';

export class FormulaExpressionFactory extends RuleElementFactory<FormulaExpressionReference> {
  constructor() {
    super();
  }

  protected isC(obj: any): obj is FormulaExpressionReference {
    return isFormulaExpressionReference(obj);
  }
}
