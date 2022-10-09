import { ExecutionContextI, Hints } from '@franzzemen/app-utility';
import { InferenceStackParser } from '@franzzemen/re-common';
import { ExpressionScope } from '../scope/expression-scope.js';
import { ExpressionParser, ExpressionParserResult, ResolvedExpressionParserResult } from './expression-parser.js';
export interface ExpressionStackParserContext {
    inferredDataType?: string;
}
export declare class ExpressionStackParser extends InferenceStackParser<ExpressionParser> {
    constructor();
    static processHints(remaining: string, scope: ExpressionScope, dataTypeHint?: string, ec?: ExecutionContextI): [string, Hints];
    parseAndResolve(remaining: string, scope: ExpressionScope, context?: ExpressionStackParserContext, ec?: ExecutionContextI): ResolvedExpressionParserResult;
    parse(remaining: string, scope: ExpressionScope, context?: ExpressionStackParserContext, ec?: ExecutionContextI): ExpressionParserResult;
}
