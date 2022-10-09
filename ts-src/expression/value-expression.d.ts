import { ExecutionContextI } from '@franzzemen/app-utility';
import { Expression, ExpressionReference } from '../expression.js';
import { ExpressionScope } from '../scope/expression-scope.js';
export interface ValueExpressionReference extends ExpressionReference {
    value: any;
}
export declare function isValueExpressionReference(val: ValueExpressionReference | any): val is ValueExpressionReference;
export declare function isValueExpression(expression: ValueExpression | any): expression is ValueExpression;
export declare class ValueExpression extends Expression {
    value: any;
    constructor(expressionRef: ValueExpressionReference, scope: ExpressionScope, ec?: ExecutionContextI);
    to(ec?: ExecutionContextI): ValueExpressionReference;
    awaitEvaluation(dataDomain: any, scope: ExpressionScope, ec?: ExecutionContextI): any | Promise<any>;
}
