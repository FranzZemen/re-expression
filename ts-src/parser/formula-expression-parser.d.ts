import { ExecutionContextI, Hints } from '@franzzemen/app-utility';
import { ParserMessages } from '@franzzemen/re-common';
import { FormulaExpressionReference } from '../expression/formula-expression.js';
import { ExpressionScope } from '../scope/expression-scope.js';
import { ExpressionParser } from './expression-parser.js';
export declare class FormulaExpressionParser extends ExpressionParser {
    constructor();
    private static determineDataType;
    parse(remaining: string, scope: ExpressionScope, hints: Hints, ec?: ExecutionContextI): [string, FormulaExpressionReference, ParserMessages];
}
