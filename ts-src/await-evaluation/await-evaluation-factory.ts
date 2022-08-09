import {ExecutionContextI} from '@franzzemen/app-utility';
import {RuleElementFactory} from '@franzzemen/re-common';

export type AwaitEvaluation = (dataDomain: any, scope: Map<string, any>, ec?: ExecutionContextI, ...params) => Promise<any> | any;

export class AwaitEvaluationFactory extends RuleElementFactory<AwaitEvaluation> {
  protected isC(obj: any): obj is AwaitEvaluation {
    return typeof obj === 'function';
  }
}
