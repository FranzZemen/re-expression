import {AwaitEvaluation} from '@franzzemen/app-utility';
import {RuleElementFactory} from '@franzzemen/re-common';


export class AwaitEvaluationFactory extends RuleElementFactory<AwaitEvaluation> {
  protected isC(obj: any): obj is AwaitEvaluation {
    return typeof obj === 'function';
  }
}
