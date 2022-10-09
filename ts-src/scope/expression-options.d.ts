import { DataTypeOptions } from '@franzzemen/re-data-type/scope/data-type-options';
export interface ExpressionOptions extends DataTypeOptions {
    allowUnknownDataType?: boolean;
}
export declare function _mergeExpressionOptions(target: ExpressionOptions, source: ExpressionOptions, mergeInto?: boolean): ExpressionOptions;
