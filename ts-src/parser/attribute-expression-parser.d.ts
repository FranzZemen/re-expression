import { ExecutionContextI, Hints } from '@franzzemen/app-utility';
import { ParserMessages } from '@franzzemen/re-common';
import { AttributeExpressionReference } from '../expression/attribute-expression.js';
import { ExpressionScope } from '../scope/expression-scope.js';
import { ExpressionParser } from './expression-parser.js';
export declare type AttributeExpressionParserResult = [remaining: string, reference: AttributeExpressionReference, messages: ParserMessages];
export declare class AttributeExpressionParser extends ExpressionParser {
    constructor();
    parse(remaining: string, scope: ExpressionScope, hints: Hints, execContext?: ExecutionContextI): AttributeExpressionParserResult;
}
