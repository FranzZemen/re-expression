import { ExecutionContextI, Hints } from '@franzzemen/app-utility';
import { ParserMessages } from '@franzzemen/re-common';
import { ExpressionReference, StandardExpressionType } from '../expression.js';
import { ExpressionScope } from '../scope/expression-scope.js';
export declare type ExpressionParserResult = [string, ExpressionReference, ParserMessages];
export declare type ResolvedExpressionParserResult = [string, (ExpressionReference | Promise<ExpressionReference>), ParserMessages];
export declare abstract class ExpressionParser {
    refName: StandardExpressionType | string;
    constructor(refName: StandardExpressionType | string);
    abstract parse(remaining: string, scope: ExpressionScope, hints: Hints, ec?: ExecutionContextI): ExpressionParserResult;
    parseAndResolve(remaining: string, scope: ExpressionScope, hints: Hints, ec?: ExecutionContextI): ResolvedExpressionParserResult;
}
