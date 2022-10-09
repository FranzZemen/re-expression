import { _mergeDataTypeOptions } from '@franzzemen/re-data-type/scope/data-type-options';
export function _mergeExpressionOptions(target, source, mergeInto = true) {
    const _target = _mergeDataTypeOptions(target, source, mergeInto);
    if (_target === target) {
        if (source.allowUnknownDataType !== undefined) {
            _target.allowUnknownDataType = source.allowUnknownDataType;
        }
    }
    else {
        _target.allowUnknownDataType = source.allowUnknownDataType !== undefined ? source.allowUnknownDataType : target.allowUnknownDataType;
    }
    return _target;
}
//# sourceMappingURL=expression-options.js.map