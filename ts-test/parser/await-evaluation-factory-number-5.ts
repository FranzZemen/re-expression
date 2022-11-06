import {LogExecutionContext} from '@franzzemen/logger-adapter';
import {AwaitEvaluation} from '@franzzemen/re-common/util/await-evaluation.js';

const awaitEvaluation: AwaitEvaluation = (dataDomain: any, scope: Map<string, any>, ec?: LogExecutionContext) : any | Promise<any> => {
  return 5;
}

export function awaitEvaluationFactoryNumber5(): AwaitEvaluation {
  return awaitEvaluation;
}
