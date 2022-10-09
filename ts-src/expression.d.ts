import { ExecutionContextI, ModuleDefinition, ModuleResolutionActionInvocation } from '@franzzemen/app-utility';
import { DataTypeI } from '@franzzemen/re-data-type';
import { ExpressionScope } from './scope/expression-scope.js';
export declare enum StandardExpressionType {
    Value = "Value",
    Attribute = "Attribute",
    Function = "Function",
    Set = "Set",
    Formula = "Formula"
}
export declare type ExpressionType = StandardExpressionType | string;
export declare function createExpressionType(type: string): void;
export declare const expressionTypes: Set<string>;
export declare function isExpressionType(expressionType: any | StandardExpressionType): expressionType is StandardExpressionType;
export interface ExpressionReference {
    type: ExpressionType;
    dataTypeRef: string;
    dataTypeModule?: ModuleDefinition;
    multivariate?: boolean;
}
export declare function copyExpressionReference(ref: ExpressionReference): ExpressionReference;
export declare function isExpressionReference(ref: any | ExpressionReference): ref is ExpressionReference;
export declare function isExpression(exp: any | Expression): exp is Expression;
export declare abstract class Expression implements ExpressionReference {
    type: ExpressionType;
    dataTypeRef: string;
    dataType: DataTypeI;
    dataTypeModule?: ModuleDefinition;
    multivariate: boolean;
    constructor(ref: ExpressionReference, scope: ExpressionScope, ec?: ExecutionContextI);
    customDataTypeRefLoadedAction: ModuleResolutionActionInvocation;
    abstract to(ec?: ExecutionContextI): ExpressionReference;
    abstract awaitEvaluation(dataDomain: any, scope: Map<string, any>, ec?: ExecutionContextI): any | Promise<any>;
    protected toBase(ref: Partial<ExpressionReference>, ec?: ExecutionContextI): void;
    protected awaitEval(data: any, scope: ExpressionScope, ec?: ExecutionContextI): any | Promise<any>;
}
