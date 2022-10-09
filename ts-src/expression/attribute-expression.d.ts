import { ExecutionContextI } from '@franzzemen/app-utility';
import { ExpressionScope } from '../scope/expression-scope.js';
import { Expression, ExpressionReference } from '../expression.js';
import { Path } from 'object-path';
export declare function isAttributeExpressionReference(ref: any | AttributeExpressionReference): ref is AttributeExpressionReference;
export declare function isAttributeExpression(ref: any | AttributeExpression): ref is AttributeExpression;
export interface AttributeExpressionReference extends ExpressionReference {
    path: Path;
}
export declare class AttributeExpression extends Expression {
    private objectPath;
    private originalPath;
    constructor(ref: AttributeExpressionReference, scope: ExpressionScope, ec?: ExecutionContextI);
    get path(): Path;
    set path(path: Path);
    static stringToPath(path: string): Path;
    to(ec?: ExecutionContextI): AttributeExpressionReference;
    awaitEvaluation(dataDomain: any, scope: ExpressionScope, ec?: ExecutionContextI): any | Promise<any>;
}
