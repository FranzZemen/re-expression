import {_mergeDataTypeOptions, DataTypeOptions} from '@franzzemen/re-data-type';

export interface ExpressionOptions extends DataTypeOptions {
  allowUnknownDataType?: boolean;
}

export function  _mergeExpressionOptions(source: ExpressionOptions, target: ExpressionOptions, mergeInto = true) : ExpressionOptions {
  const _target: ExpressionOptions = _mergeDataTypeOptions(target, source, mergeInto);
  if(_target === target) {
    if (source.allowUnknownDataType !== undefined) {
      _target.allowUnknownDataType = source.allowUnknownDataType;
    }
  } else {
    _target.allowUnknownDataType = source.allowUnknownDataType !== undefined ? source.allowUnknownDataType : target.allowUnknownDataType;
  }
  return _target;
}
