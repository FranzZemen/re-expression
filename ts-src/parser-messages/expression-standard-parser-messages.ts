import {DataTypeStandardParserMessages} from '@franzzemen/re-data-type';

export class ExpressionStandardParserMessages extends DataTypeStandardParserMessages {
  static ImproperUsageOfUnknown = 'Unknown data type is not allowed when option allowUnknownDataType is false or not set';
  static IndeterminateDataType = 'Cannot determine datatype';
  static MultivariateInconsistentDataType = 'Multivariate data type not consistent with "Multivariate Data Type Handling = Multivariate".  Overriding data type to Multivariate';
  static MultivariateInconsistentHandling = 'Multivariate data type "Multivariate" is not consistent with "Multivariate Data Type Handling = Multivariate". Overriding data type to Indeterminate';
  static MultivariateInconsistentInnerDataType = 'Multivariate inner expression data type is inconsistent with multivariate data type under Consistent data type handling';
  static NoEndOfMultivariateDetected = 'Expected "]" to end multivariate, but none detected till end of input';
  static ValueExpressionsAlwaysResolveToDataType = 'Undefined Data Type.  Value expressions must always resolve a data type';
}
