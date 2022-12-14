import {LogExecutionContext, LoggerAdapter} from '@franzzemen/logger-adapter';
import {AwaitEvaluation} from '@franzzemen/re-common/util/await-evaluation.js';

const awaitEvaluation: AwaitEvaluation = (dataDomain: any, scope: Map<string, any>, ec?: LogExecutionContext, ...params) : any | Promise<any> => {
  const log = new LoggerAdapter(ec, 'rules-engine-base', 'await-evaluate-factory-params', 'anonymous');
  if(params && params.length === 1 && Array.isArray(params[0])) {
    params[0].forEach(param => log.info(`Await evaluation test with params, param ${param}`));
    return params[0];
  } else {
    log.error('params should be an array of length 1, and its contents should be the passed in parameters');
  }
}

export function awaitEvaluationFactoryParams(): AwaitEvaluation {
  return awaitEvaluation;
}
