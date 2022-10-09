import { DtPsStdMsg } from '@franzzemen/re-data-type';
export class ExPsStdMsg extends DtPsStdMsg {
}
ExPsStdMsg.ImproperUsageOfUnknown = 'Unknown data type is not allowed when option allowUnknownDataType is false or not set';
ExPsStdMsg.IndeterminateDataType = 'Cannot determine datatype';
ExPsStdMsg.MultivariateInconsistentDataType = 'Multivariate data type not consistent with "Multivariate Data Type Handling = Multivariate".  Overriding data type to Multivariate';
ExPsStdMsg.MultivariateInconsistentHandling = 'Multivariate data type "Multivariate" is not consistent with "Multivariate Data Type Handling = Multivariate". Overriding data type to Indeterminate';
ExPsStdMsg.MultivariateInconsistentInnerDataType = 'Multivariate inner expression data type is inconsistent with multivariate data type under Consistent data type handling';
ExPsStdMsg.NoEndOfMultivariateDetected = 'Expected "]" to end multivariate, but none detected till end of input';
ExPsStdMsg.ValueExpressionsAlwaysResolveToDataType = 'Undefined Data Type.  Value expressions must always resolve a data type';
//# sourceMappingURL=ex-ps-std-msg.js.map