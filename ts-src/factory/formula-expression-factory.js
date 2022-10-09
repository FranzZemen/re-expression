import { RuleElementFactory } from '@franzzemen/re-common';
import { isFormulaExpressionReference } from '../expression/formula-expression.js';
export class FormulaExpressionFactory extends RuleElementFactory {
    constructor() {
        super();
    }
    isC(obj) {
        return isFormulaExpressionReference(obj);
    }
}
//# sourceMappingURL=formula-expression-factory.js.map