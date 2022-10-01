import {ExecutionContextI, Hints, LoggerAdapter} from '@franzzemen/app-utility';
import {logErrorAndThrow} from '@franzzemen/app-utility/enhanced-error.js';
import {ParserMessages, PsMsgType, pushMessages} from '@franzzemen/re-common';
import {StandardDataType} from '@franzzemen/re-data-type';

import {ExpressionReference, ExpressionType} from '../expression';
import {ExPsStdMsg} from '../parser-messages/ex-ps-std-msg.js';
import {ExpressionScope} from '../scope/expression-scope.js';
import {ExpressionHintKey} from '../util/expression-hint-key.js';
import {ExpressionParser} from './expression-parser.js';
import {ExpressionStackParser} from './expression-stack-parser.js';

/**
 * How do we handle the data types in the multivariate expression?  If Consistent, all the expressions need to be of
 * the same data type.  If Multivariate, no guarantee is made.
 *
 * Consistent data type handling supports inference - if either the expression or any of its inner expressions are bound
 * to a data type, they will all have the same data type.  On the other hand, if any specified data type does not match
 * any other (outside of Indeterminate and Unknown), it is assumed to not be a Multivariate Expression.
 */
export enum MultivariateDataTypeHandling {
  Consistent = 'Consistent',
  Multivariate = 'Multivariate'
}

export type MultivariateParserResult = [string, ExpressionReference, ExpressionReference[], ParserMessages?];


export abstract class MultivariateParser extends ExpressionParser {
  constructor(expressionType: ExpressionType) {
    super(expressionType);
  }

  /**
   * Although this is an ExpressionParser, it implements its own parsing.  The decorator (SetExpressionParser) or other areas using
   * this parser (FunctionExpressionParser) will implement the required parse method.
   * @param remaining
   * @param scope
   * @param hints
   * @param ec
   */
  parseMultivariate(remaining: string, scope: ExpressionScope, hints: Hints, ec?: ExecutionContextI): MultivariateParserResult {
    const log = new LoggerAdapter(ec, 're-expression', 'multivariate-parser', 'parse');
    const original = remaining;
    let parseMessages: ParserMessages = [];
    // If type is set, and this parser does not handle that type, then stop;
    const type = hints.get(ExpressionHintKey.Type) as string;
    if (type && this.refName !== type) {
      return [original, undefined, undefined, parseMessages];
    }
    // Default to Consistent Data Type Handling
    let dataTypeHandling = hints.get(ExpressionHintKey.MultivariateDataTypeHandling);
    if (!dataTypeHandling) {
      dataTypeHandling = MultivariateDataTypeHandling.Consistent;
    }

    // Starting to parse, removing the opening bracket.  If it doesn't exist, it's not Multivariate.
    let innerRemaining = remaining;
    if (innerRemaining.startsWith('[')) {
      innerRemaining = innerRemaining.substring(1).trim();

      // This is the whole multivariate data type
      let multivariateDataTypeRef = hints.get(ExpressionHintKey.DataType) as string;
      if (multivariateDataTypeRef) {
        if (dataTypeHandling === MultivariateDataTypeHandling.Multivariate) {
          // Multivariate processing overrides any set data type
          // Override and data type based on the handling
          if (multivariateDataTypeRef !== StandardDataType.Multivariate) {
            parseMessages.push({
              message: `${ExPsStdMsg.MultivariateInconsistentDataType} near "${original}"`,
              contextObject: {multivariateDataTypeRef, dataTypeHandling},
              type: PsMsgType.Warn
            });
            multivariateDataTypeRef = StandardDataType.Multivariate;
          }
        } else { // Consistent
          if (multivariateDataTypeRef === StandardDataType.Multivariate) {
            parseMessages.push({
              message: `${ExPsStdMsg.MultivariateInconsistentHandling} near "${original}"`,
              contextObject: {multivariateDataTypeRef, dataTypeHandling},
              type: PsMsgType.Warn
            });
            multivariateDataTypeRef = StandardDataType.Indeterminate;
          } else if (multivariateDataTypeRef === StandardDataType.Unknown && scope.get(ExpressionScope.AllowUnknownDataType) !== true) {
            // Always consider usage of Unknown when option not set an error
            return [original, undefined, undefined, pushMessages(parseMessages, {
              message: `${ExPsStdMsg.ImproperUsageOfUnknown} near "${original}"`,
              type: PsMsgType.Error
            })];
          }
        }
      } else if (dataTypeHandling === MultivariateDataTypeHandling.Multivariate) {
        multivariateDataTypeRef = StandardDataType.Multivariate;
      } else { // Consistent
        // We'll try and figure it out after processing the inner references for Consistent
        multivariateDataTypeRef = StandardDataType.Indeterminate;
      }
      // Keep track of the current expression
      let innerExpressionReference: ExpressionReference;
      // Remember that we've reached the end of the set.
      let endOfSet = false;

      // Iterate till we find the end of the set.  We'll leverage the stack parser to parse any inner expression.
      const stackParser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
      // Consider inner expressions parsed as candidates..an interim container
      const candidates: { near: string, parseResult: [string, ExpressionReference, ParserMessages?] }[] = [];
      do {
        // Verify that a possible end of set exits.  Simply look for a closing bracket.  This is not guaranteed
        // to be "this" multivariate end, as this may contain inner multivariates with [], but it does guarantee
        // end of loop and eventually will be "this" mulitvariate's ]
        if (innerRemaining.indexOf(']') < 0) {
          // This is a true error condition.
          return [original, undefined, undefined, pushMessages(parseMessages, {
            message: `${ExPsStdMsg.NoEndOfMultivariateDetected} near "${innerRemaining}"`,
            type: PsMsgType.Error
          })];
        }
        // Next expression
        innerExpressionReference = undefined;
        // Remove commas
        const removeCommaResult = /^([\s\t\r\n\v\f\u2028\u2029),]*)([^]*)$/.exec(innerRemaining);
        if (removeCommaResult) {
          innerRemaining = removeCommaResult[2].trim();
        }
        // Check for immediate end of set
        if (innerRemaining.startsWith(']')) {
          endOfSet = true;
          innerRemaining = innerRemaining.substring(1).trim();
        } else {
          let context;
          if (dataTypeHandling == MultivariateDataTypeHandling.Consistent) {
            context = {inferredDataType: multivariateDataTypeRef};
          }
          const candidate: { near: string, parseResult: [string, ExpressionReference, ParserMessages?] } = {
            near: innerRemaining,
            parseResult: stackParser.parse(innerRemaining, scope, context, ec)
          };
          candidates.push(candidate);
          // Move to next part of the text
          innerRemaining = candidate.parseResult[0];
        }
      } while (!endOfSet);
      if (candidates.length === 0) {
        if (multivariateDataTypeRef === StandardDataType.Indeterminate) {
          return [original, undefined, undefined, pushMessages(parseMessages, {
            message: `${ExPsStdMsg.IndeterminateDataType} for empty multivariate`,
            type: PsMsgType.Error
          })];
        } else if (multivariateDataTypeRef === StandardDataType.Unknown && scope.get(ExpressionScope.AllowUnknownDataType) !== true) {
          return [original, undefined, undefined, pushMessages(parseMessages, {
            message: `${ExPsStdMsg.ImproperUsageOfUnknown} near "${original}"`,
            type: PsMsgType.Error
          })];
        } else {
          return [innerRemaining.trim(), {
            type: this.refName,
            dataTypeRef: multivariateDataTypeRef,
            multivariate: true
          }, []];
        }
      } else {
        let innerExpressions: ExpressionReference [] = [];

        candidates.forEach(candidate => {
          const innerExpression = candidate.parseResult[1];
          if (!innerExpression) {
            parseMessages.push({
              message: `Unable to parse inner expression near ${candidate.near}`,
              type: PsMsgType.Error
            });
            const inner: ParserMessages = candidate.parseResult[2];
            if (inner) {
              parseMessages = parseMessages.concat(inner);
              return [original, undefined, undefined, parseMessages];
            }
          } else {
            innerExpressions.push(innerExpression);
          }
        });
        if (dataTypeHandling === MultivariateDataTypeHandling.Consistent) {
          // If we know the multivariate data type, set it on any unknown  ro indeterminate data types
          if (multivariateDataTypeRef !== StandardDataType.Unknown && multivariateDataTypeRef !== StandardDataType.Indeterminate) {
            innerExpressions.forEach(innerExpression => {
              if (innerExpression.dataTypeRef === StandardDataType.Unknown || innerExpression.dataTypeRef === StandardDataType.Indeterminate) {
                innerExpression.dataTypeRef === multivariateDataTypeRef;
              }
            });
          }
          // Verify if all inner data types are the same and not unknown or indeterminate
          // This code block will ONLY return true because we ignore the Unknowns and Indeterminates
          // If those data types that are not u or i don't match, an exception is thrown
          let innerDataType: StandardDataType | string;
          const same = innerExpressions.every(innerExpression => {
            if (innerExpression.dataTypeRef !== StandardDataType.Unknown && innerExpression.dataTypeRef !== StandardDataType.Indeterminate) {
              if (innerDataType && innerDataType !== innerExpression.dataTypeRef) {
                log.warn({
                  innerExpression,
                  innerDataType
                }, 'Inconsistent inner expression data types for consistent data type handling');
                logErrorAndThrow('Inconsistent inner expression data types for consistent data type handling', log, ec);
              } else {
                innerDataType = innerExpression.dataTypeRef;
                return true;
              }
            } else {
              return true;
            }
          });
          if (same) {
            // At this point there could be inner data types that are u or i, but if innerDataTYpe existsi, it is the consistent multivariateDataTypeRef
            if (innerDataType && multivariateDataTypeRef === StandardDataType.Unknown || multivariateDataTypeRef === StandardDataType.Indeterminate) {
              multivariateDataTypeRef = innerDataType;
            } else if (innerDataType && innerDataType !== multivariateDataTypeRef) {
              return [original, undefined, undefined, pushMessages(parseMessages, {
                message: `${ExPsStdMsg.MultivariateInconsistentInnerDataType} near "${original}"`,
                type: PsMsgType.Error
              })];
            }
            // Set those inner data type that are u or i
            innerExpressions.filter(innerExpression =>
              innerExpression.dataTypeRef === StandardDataType.Indeterminate || innerExpression.dataTypeRef === StandardDataType.Unknown
            )
              .forEach(inner => inner.dataTypeRef = innerDataType);
          }
          /*
          At this point, for Consistent data type handling we have:
            1) Set a known multivariate data type on inner expressions that were indeterminate or unknown
            2) Verified that all inner expressions that were not i or u were consistent with each other
            3) Use that fact to set an i or u multivariate data type
            4) Use that fact to set other i or u inner data types
           */
        } else {
          // From above processing we know we are in multivariate data handling and multivariate data type = multivariate
          // At this point, we need every inner expression to be resolved on it's own, or only allow unknown if option is set
          innerExpressions.every(innerExpression => {
            if (innerExpression.dataTypeRef === StandardDataType.Indeterminate) {
              return [original, undefined, undefined, pushMessages(parseMessages, {
                message: `${ExPsStdMsg.IndeterminateDataType} for inner expression data type near ${original}`,
                type: PsMsgType.Error
              })];
            } else if (innerExpression.dataTypeRef === StandardDataType.Unknown && scope.get(ExpressionScope.AllowUnknownDataType) !== true) {
              return [original, undefined, undefined, pushMessages(parseMessages, {
                message: `${ExPsStdMsg.ImproperUsageOfUnknown} for inner expressoin data type near ${original}`,
                type: PsMsgType.Error
              })];
            }
          });
        }
        return [innerRemaining.trim(), {
          type: this.refName,
          dataTypeRef: multivariateDataTypeRef,
          multivariate: true
        }, innerExpressions, parseMessages];
      }
    } else {
      // Help the inference engine by indicating it is not a set
      return [original, undefined, undefined, parseMessages];
    }
  }
}
