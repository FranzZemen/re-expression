import { ExecutionContextI, Hints } from '@franzzemen/app-utility';
import { ParserMessages } from '@franzzemen/re-common';
import { ValueExpressionReference } from '../expression/value-expression.js';
import { ExpressionScope } from '../scope/expression-scope.js';
import { ExpressionParser } from './expression-parser.js';
export declare type ValueExpressionParserResult = [string, ValueExpressionReference, ParserMessages];
export declare class ValueExpressionParser extends ExpressionParser {
    constructor();
    parse(remaining: string, scope: ExpressionScope, hints: Hints, ec?: ExecutionContextI): ValueExpressionParserResult;
}
