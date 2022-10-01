export enum ParserMessageType {
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
  Note = 'log',
  Trivial = 'trace'
}
export type ParserMessage = {type: ParserMessageType, message: string, contextObject?:any, err?: Error};
export type ParserMessages = ParserMessage[];

export enum StandardParserMessages {
  ImproperUsageOfUnknown = 'Unknown data type is not allowed when option allowUnknownDataType is false or not set',
  IndeterminateDataType = 'Cannot determine datatype',
  MultivariateInconsistentDataType = 'Multivariate data type not consistent with "Multivariate Data Type Handling = Multivariate".  Overriding data type to Multivariate',
  MultivariateInconsistentHandling = 'Multivariate data type "Multivariate" is not consistent with "Multivariate Data Type Handling = Multivariate". Overriding data type to Indeterminate',
  MultivariateInconsistentInnerDataType = 'Multivariate inner expression data type is inconsistent with multivariate data type under Consistent data type handling',
  NoEndOfMultivariateDetected = 'Expected "]" to end multivariate, but none detected till end of input',
  ValueExpressionsAlwaysResolveToDataType = 'Undefined Data Type.  Value expressions must always resolve a data type',
}

export function pushMessages(messages: ParserMessages, message: ParserMessage): ParserMessages {
  messages.push(message);
  return messages;
}
