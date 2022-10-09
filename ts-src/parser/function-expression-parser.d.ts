import { ExecutionContextI, Hints } from '@franzzemen/app-utility';
import { ParserMessages } from '@franzzemen/re-common';
import { FunctionExpressionReference } from '../expression/function-expression.js';
import { ExpressionScope } from '../scope/expression-scope.js';
import { MultivariateParser } from './multivariate-parser.js';
export declare class FunctionExpressionParser extends MultivariateParser {
    constructor();
    parse(remaining: string, scope: ExpressionScope, hints: Hints, ec?: ExecutionContextI): [string, FunctionExpressionReference, ParserMessages];
}
