
import {RuleElementFactory} from '@franzzemen/re-common';
import {AwaitEvaluation} from '@franzzemen/re-common/util/await-evaluation.js';


export class AwaitEvaluationFactory extends RuleElementFactory<AwaitEvaluation> {
  protected isC(obj: any): obj is AwaitEvaluation {
    return typeof obj === 'function';
  }
}
