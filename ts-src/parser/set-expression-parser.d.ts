import { ExecutionContextI, Hints } from '@franzzemen/app-utility';
import { ParserMessages } from '@franzzemen/re-common';
import { SetExpressionReference } from '../expression/set-expression.js';
import { ExpressionScope } from '../scope/expression-scope.js';
import { MultivariateParser } from './multivariate-parser.js';
export declare type SetExpressionParserResult = [remaining: string, reference: SetExpressionReference, messages: ParserMessages];
export declare class SetExpressionParser extends MultivariateParser {
    constructor();
    parse(remaining: string, scope: ExpressionScope, hints: Hints, ec?: ExecutionContextI): SetExpressionParserResult;
}
