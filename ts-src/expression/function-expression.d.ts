import { AwaitEvaluation, ExecutionContextI, ModuleDefinition, ModuleResolutionActionInvocation } from '@franzzemen/app-utility';
import { HasRefName } from '@franzzemen/re-common';
import { Expression, ExpressionReference } from '../expression.js';
import { ExpressionScope } from '../scope/expression-scope.js';
export interface FunctionExpressionReference extends ExpressionReference, HasRefName {
    module?: ModuleDefinition;
    params?: ExpressionReference[];
}
export declare function isFunctionExpressionReference(ref: any | FunctionExpressionReference): ref is FunctionExpressionReference;
export declare function isFunctionExpression(ref: any | FunctionExpression): ref is FunctionExpression;
export declare class FunctionExpression extends Expression implements HasRefName {
    refName: string;
    module: ModuleDefinition;
    awaitEvaluationFunction: AwaitEvaluation;
    params?: Expression[];
    setAwaitEvaluationFunctionAction: ModuleResolutionActionInvocation;
    constructor(ref: FunctionExpressionReference, scope: ExpressionScope, ec?: ExecutionContextI);
    awaitEvaluationFunctionLoadedAction: ModuleResolutionActionInvocation;
    to(ec?: ExecutionContextI): FunctionExpressionReference;
    awaitEvaluation(dataDomain: any, scope: ExpressionScope, ec?: ExecutionContextI): any | Promise<any>;
}
