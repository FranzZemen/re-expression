import { AwaitEvaluation, ExecutionContextI, ModuleResolutionAction } from '@franzzemen/app-utility';
import { RuleElementReference, Scope } from '@franzzemen/re-common';
import { DataTypeScope } from '@franzzemen/re-data-type';
import { ExpressionOptions } from './expression-options.js';
export declare class ExpressionScope extends DataTypeScope {
    static ExpressionFactory: string;
    static ExpressionStackParser: string;
    static AwaitEvaluationFactory: string;
    static DataTypeLiteralStackStringifier: string;
    static ExpressionStringifier: string;
    static FormulaExpressionFactory: string;
    static AllowUnknownDataType: string;
    constructor(options?: ExpressionOptions, parentScope?: Scope, ec?: ExecutionContextI);
    addAwaitEvaluationFunction(awaitEvaluationRef: RuleElementReference<AwaitEvaluation>, action?: ModuleResolutionAction, ec?: ExecutionContextI): AwaitEvaluation;
    addAwaitEvaluationFunctions(awaitEvaluationRefs: RuleElementReference<AwaitEvaluation>[], actions?: ModuleResolutionAction[], ec?: ExecutionContextI): AwaitEvaluation[];
    getAwaitEvaluationFunction(refName: string, searchParent?: boolean, ec?: ExecutionContextI): AwaitEvaluation;
    hasAwaitEvaluationFactory(scope: Map<string, any>, refName: string, ec?: ExecutionContextI): boolean;
}
