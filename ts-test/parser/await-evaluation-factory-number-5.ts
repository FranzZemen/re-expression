import {AwaitEvaluation, ExecutionContextI} from '@franzzemen/app-utility';

const awaitEvaluation: AwaitEvaluation = (dataDomain: any, scope: Map<string, any>, ec?: ExecutionContextI) : any | Promise<any> => {
  return 5;
}

export function awaitEvaluationFactoryNumber5(): AwaitEvaluation {
  return awaitEvaluation;
}
