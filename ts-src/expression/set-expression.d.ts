import { ExecutionContextI } from '@franzzemen/app-utility';
import { Expression } from '../expression.js';
import { ExpressionScope } from '../scope/expression-scope.js';
import { MultivariateExpression } from './multivariate-expression.js';
export declare function isSetExpressionReference(ref: any | SetExpressionReference): ref is SetExpressionReference;
export declare function isSetExpression(ref: any | SetExpression): ref is SetExpression;
export interface SetExpressionReference extends MultivariateExpression {
}
export declare class SetExpression extends Expression implements SetExpressionReference {
    set: Expression[];
    constructor(ref: SetExpressionReference, scope: ExpressionScope, ec?: ExecutionContextI);
    awaitEvaluation(dataDomain: any, scope: Map<string, any>, ec?: ExecutionContextI): any | Promise<any>;
    to(ec?: ExecutionContextI): SetExpressionReference;
}
