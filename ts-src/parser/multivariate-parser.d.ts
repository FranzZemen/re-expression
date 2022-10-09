import { ExecutionContextI, Hints } from '@franzzemen/app-utility';
import { ParserMessages } from '@franzzemen/re-common';
import { ExpressionReference, StandardExpressionType } from '../expression';
import { ExpressionScope } from '../scope/expression-scope.js';
import { ExpressionParser } from './expression-parser.js';
export declare enum MultivariateDataTypeHandling {
    Consistent = "Consistent",
    Multivariate = "Multivariate"
}
export declare type MultivariateParserResult = [string, ExpressionReference, ExpressionReference[], ParserMessages?];
export declare abstract class MultivariateParser extends ExpressionParser {
    constructor(expressionType: StandardExpressionType);
    parseMultivariate(remaining: string, scope: ExpressionScope, hints: Hints, ec?: ExecutionContextI): MultivariateParserResult;
}
