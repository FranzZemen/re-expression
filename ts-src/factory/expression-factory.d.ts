import { ExecutionContextI } from '@franzzemen/app-utility';
import { RuleElementFactory } from '@franzzemen/re-common';
import { Expression, ExpressionReference } from '../expression.js';
import { ExpressionScope } from '../scope/expression-scope.js';
export declare type ExpressionConstructor = new (ExpressionReference: any, Scope: any, ExecutionContext?: any) => Expression;
export declare function isExpressionConstructor(obj: any | ExpressionConstructor): obj is ExpressionConstructor;
export declare class ExpressionFactory extends RuleElementFactory<ExpressionConstructor> {
    constructor(ec?: ExecutionContextI);
    addConstructor(refName: string, _constructor: ExpressionConstructor): void;
    createExpression(expressionRef: ExpressionReference, scope: ExpressionScope, ec?: ExecutionContextI): Expression;
    loadDataType(expression: Expression, scope: ExpressionScope, ec?: ExecutionContextI): void;
    loadAwaitEvaluationFunctions(expression: Expression, scope: ExpressionScope, ec?: ExecutionContextI): void;
    protected isC(obj: any): obj is ExpressionConstructor;
}
