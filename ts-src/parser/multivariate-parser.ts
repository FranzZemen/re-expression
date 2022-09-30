import {ExecutionContextI, Hints, LoggerAdapter, ModuleResolver} from '@franzzemen/app-utility';
import {logErrorAndThrow} from '@franzzemen/app-utility/enhanced-error.js';
import {DataType, StandardDataType} from '@franzzemen/re-data-type';

import {ExpressionReference, ExpressionType} from '../expression';
import {ExpressionScope} from '../scope/expression-scope.js';
import {ExpressionHintKey} from '../util/expression-hint-key.js';
import {ExpressionParser} from './expression-parser.js';
import {ExpressionStackParser} from './expression-stack-parser.js';

export enum MultivariateDataTypeHandling {
  Consistent = 'Consistent',
  Multivariate = 'Multivariate'
}

export type MultivariateParserResult = [string, ExpressionReference, ExpressionReference[]];


export abstract class MultivariateParser extends ExpressionParser {
  constructor(expressionType: ExpressionType) {
    super(expressionType);
  }

  parseMultivariate(remaining: string, scope: ExpressionScope, hints: Hints, ec?: ExecutionContextI): MultivariateParserResult {
    const log = new LoggerAdapter(ec, 're-expression', 'multivariate-parser', 'parse');
    // Exclude a misaligned expression type:
    const type = hints.get(ExpressionHintKey.Type) as string;
    if (type && this.refName !== type) {
      return [remaining, undefined, undefined];
    }
    let dataTypeHandling = hints.get(ExpressionHintKey.MultivariateDataTypeHandling);
    if (!dataTypeHandling) {
      dataTypeHandling = MultivariateDataTypeHandling.Consistent;
    }


    // The challenge to parsing a multi variate is that although it is bounded by  brackets, it can contain virtually any character including
    // other  brackets...therefore the terminating  bracket may be mis-interpreted early.
    //
    // We're going to leverage the fact that a multi variate contains expressions, and attempt to parse expressions one at a time, separated
    // by spaces or a comma (or spaces and a comma) until we encounter the closing bracket or an error.

    // It's potentially a multivariate if it starts with an opening bracket
    let innerRemaining = remaining;
    if (innerRemaining.startsWith('[')) {
      innerRemaining = innerRemaining.substring(1).trim();


      /*
      Data type:
          If dataTypeHandling is Multivariate, then any hinted data type must Multivariate or Unknown, with Unknown
          automatically replaced by Multivariate. If no data type is hinted, then the data type will be set to Multivariate.

          If dataTypeHandling is Consistent, then any hinted data type must match any hinted data type of inner expressions.
          If it is missing, at least one of the inner expressions must have a determinable data type.  All inner expressions
          with determinable data types must have the same data type, and then all the other expressions including the multivariate
          data type itself will be set to that.
      */
      let multivariateDataTypeRef = hints.get(ExpressionHintKey.DataType) as string;
      if (multivariateDataTypeRef) {
        if (dataTypeHandling === MultivariateDataTypeHandling.Multivariate) {
          // Override and data type based on the handling
          if (multivariateDataTypeRef !== StandardDataType.Multivariate) {
            log.warn({
              multivariateDataTypeRef,
              dataTypeHandling
            }, 'Overriding data type to Multivariate because data type  handling is Multivariate');
            multivariateDataTypeRef = StandardDataType.Multivariate;
          }
        } else { // Consistent
          if (multivariateDataTypeRef === StandardDataType.Multivariate) {
            log.warn({
              multivariateDataTypeRef,
              dataTypeHandling
            }, 'Overriding data type to Indeterminate because data type handling is Consistent');
            multivariateDataTypeRef = StandardDataType.Indeterminate;
          } else if (multivariateDataTypeRef === StandardDataType.Unknown && scope.get(ExpressionScope.AllowUnknownDataType) !== true) {
            logErrorAndThrow(`Multivariate expression with declared ${multivariateDataTypeRef} data type option to allow unknown data type is not set`, log, ec);
          }
        }
      } else if (dataTypeHandling === MultivariateDataTypeHandling.Multivariate) {
        multivariateDataTypeRef = StandardDataType.Multivariate;
      } else {
        multivariateDataTypeRef = StandardDataType.Indeterminate;
      }
      // Keep track of the current expression
      let innerExpressionReference: ExpressionReference;
      // Remember that we've reached the end of the set.
      let endOfSet = false;

      // Iterate till we find the end of the set.
      const stackParser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
      const candidates: { near: string, parseResult: [string, ExpressionReference] }[] = [];
      do {
        // Verify that a possible end of set exits.  Simply look for a closing bracket.  While this may be part of another expression
        // it wil  avoid an infinite loop to always look for that.
        if (innerRemaining.indexOf(']') < 0) {
          const err = new Error('No end of set detected');
          logErrorAndThrow(err, log, ec);
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
          if (dataTypeHandling == MultivariateDataTypeHandling.Consistent && multivariateDataTypeRef !== StandardDataType.Unknown && multivariateDataTypeRef !== StandardDataType.Indeterminate) {
            context = {inferredDataType: multivariateDataTypeRef};
          }
          const candidate: { near: string, parseResult: [string, ExpressionReference] } = {
            near: innerRemaining,
            parseResult: stackParser.parse(innerRemaining, scope, context, ec)
          };
          candidates.push(candidate);
          // Move to next part of the text
          innerRemaining = candidate.parseResult[0];
        }
      } while (!endOfSet);
      if(candidates.length === 0) {
        if(multivariateDataTypeRef === StandardDataType.Indeterminate) {
          logErrorAndThrow('Empty multivariate with indeterminate data type', log, ec);
        } else if(multivariateDataTypeRef === StandardDataType.Unknown && scope.get(ExpressionScope.AllowUnknownDataType) !== true) {
          logErrorAndThrow('Empty multivariate with unknown data type and allow unknown data type option false', log, ec);
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
            const err = new Error(`Unable to parse inner expression: ${candidate.near} around ${remaining}`);
            logErrorAndThrow(err, log, ec);
          }
          innerExpressions.push(innerExpression);
        });
        if (dataTypeHandling === MultivariateDataTypeHandling.Consistent) {
          // If we know the multivariate data type, set it on any unknown  ro indeterminate data types
          if (multivariateDataTypeRef !== StandardDataType.Unknown && multivariateDataTypeRef !== StandardDataType.Indeterminate) {
            innerExpressions.forEach(innerExpression => {
              if (innerExpression.dataTypeRef === StandardDataType.Unknown || innerExpression.dataTypeRef === StandardDataType.Indeterminate) {
                innerExpression.dataTypeRef === multivariateDataTypeRef;
              }
            })
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
              logErrorAndThrow('Unexpected condition where innerDataType is not equal to multivariateDataType', log, ec);
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
              log.warn(innerExpression, 'Indeterminate innerExpression data type for multivariate data type handling')
              logErrorAndThrow('Indeterminate innerExpression data type for multivariate data type handling', log, ec);
            } else if (innerExpression.dataTypeRef === StandardDataType.Unknown && scope.get(ExpressionScope.AllowUnknownDataType) !== true) {
              log.warn(innerExpression, 'Unknown innerExpression data type for multivariate data type handling with allow unknown data type option set to false')
              logErrorAndThrow('Unknown innerExpression data type for multivariate data type handling with allow unknown data type option set to false', log, ec);
            }
          });
        }
        return [innerRemaining.trim(), {
          type: this.refName,
          dataTypeRef: multivariateDataTypeRef,
          multivariate: true
        }, innerExpressions];
      }
    } else {
      // Help the inference engine by indicating it is not a set
      return [remaining, undefined, undefined];
    }
  }
}
