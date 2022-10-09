import { ExecutionContextI } from '@franzzemen/app-utility';
import { ExpressionReference } from '../expression.js';
import { StringifyExpressionOptions } from './stringify-expression-options.js';
export declare class ExpressionStringifier {
    constructor();
    stringify(expressionRef: ExpressionReference, scope: Map<string, any>, options?: StringifyExpressionOptions, dataTypeInferableOnParsing?: boolean, ec?: ExecutionContextI): string;
}
