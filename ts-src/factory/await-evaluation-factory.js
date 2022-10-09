import { RuleElementFactory } from '@franzzemen/re-common';
export class AwaitEvaluationFactory extends RuleElementFactory {
    isC(obj) {
        return typeof obj === 'function';
    }
}
//# sourceMappingURL=await-evaluation-factory.js.map