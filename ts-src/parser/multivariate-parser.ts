import {ExecutionContextI, Hints, LoggerAdapter} from '@franzzemen/app-utility';
import {logErrorAndThrow} from '@franzzemen/app-utility/enhanced-error.js';
import {DataType, StandardDataType} from '@franzzemen/re-data-type';
import {isPromise} from 'util/types';

import {ExpressionReference, ExpressionType, isExpressionReference} from '../expression';
import {ExpressionScope} from '../scope/expression-scope.js';
import {ExpressionHintKey} from '../util/expression-hint-key.js';
import {ExpressionParser} from './expression-parser.js';
import {ExpressionStackParser} from './expression-stack-parser.js';

export enum MultivariateDataTypeHandling {
  Consistent = 'Consistent',
  Multivariate = 'Multivariate'
}


export abstract class MultivariateParser extends ExpressionParser {
  constructor(expressionType: ExpressionType, private dataTypeHandling: MultivariateDataTypeHandling) {
    super(expressionType);
  }


  private _parseMultivariatePostProcessing(remaining: string, innerRemaining: string, multivariateDataTypeRef: string, candidates: {near: string, parseResult: [string, ExpressionReference]}[], ec?: ExecutionContextI): [string, ExpressionReference, ExpressionReference[]] {
    const log = new LoggerAdapter(ec, 're-expression', 'multivariate-parser', '_parseMultivariatePostProcessing');
    let innerExpressions: ExpressionReference [] = [];
    candidates.forEach(candidate => {
      const innerExpression = candidate.parseResult[1];
      if(!innerExpression) {
        const err = new Error(`Unable to parse inner expression: ${candidate.near} around ${remaining}`);
        logErrorAndThrow(err, log, ec);
      } else {
        if(this.dataTypeHandling === MultivariateDataTypeHandling.Multivariate) {
          if(innerExpression.dataTypeRef === StandardDataType.Unknown) {
            const err = new Error(`Inner expression data type must be determinable multivariate expressions with data type handling set to ${this.dataTypeHandling} near ${candidate.near}`);
            logErrorAndThrow(err, log, ec);
          }
        } else if (this.dataTypeHandling === MultivariateDataTypeHandling.Consistent) {
          if(multivariateDataTypeRef === StandardDataType.Unknown) {
            if(innerExpression.dataTypeRef !== StandardDataType.Unknown) {
              multivariateDataTypeRef = innerExpression.dataTypeRef;
            }
          } else {
            if(innerExpression.dataTypeRef === StandardDataType.Unknown) {
              innerExpression.dataTypeRef = multivariateDataTypeRef;
            } else if(innerExpression.dataTypeRef !== multivariateDataTypeRef) {
              const err = new Error(`Determined inner expression data type ${innerExpression.dataTypeRef} must match determined multivariate data type ${multivariateDataTypeRef} near ${candidate.near}`);
              logErrorAndThrow(err, log, ec);
            }
          }
        }
      }
      innerExpressions.push(innerExpression);
    })
    if(this.dataTypeHandling === MultivariateDataTypeHandling.Consistent) {
      // By now, the multivariate data type was either known or determined
      if (multivariateDataTypeRef === StandardDataType.Unknown) {
        const err = new Error(`Indeterminate data type for multivariate expression near ${remaining}`);
        logErrorAndThrow(err, log, ec);
      }
      innerExpressions.every(expression => expression.dataTypeRef = multivariateDataTypeRef);
    }
    return [innerRemaining.trim(), {type: this.refName, dataTypeRef: multivariateDataTypeRef, multivariate: true}, innerExpressions];
  }

  parseMultivariate(remaining: string, scope:ExpressionScope, hints: Hints, allowUnknownDataType?: boolean, ec?: ExecutionContextI): [string, ExpressionReference, ExpressionReference[]] | Promise<[string, ExpressionReference, ExpressionReference[]]> {
    const log = new LoggerAdapter(ec, 're-expression', 'multivariate-parser', 'parse');
    // Exclude a misaligned expression type:
    const type = hints.get(ExpressionHintKey.ExpressionType) as string;
    if (type && this.refName !== type) {
      return [remaining, undefined, undefined];
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
      let multivariateDataTypeRef = hints.get('data-type') as string;
      if(multivariateDataTypeRef) {
        if (this.dataTypeHandling === MultivariateDataTypeHandling.Multivariate) {
          // Any declared data type must be Multivariate
          if (multivariateDataTypeRef === StandardDataType.Unknown) {
            multivariateDataTypeRef = StandardDataType.Multivariate;
          } else if (multivariateDataTypeRef !== StandardDataType.Multivariate) {
            const err = new Error(`Multivariate expression with declared ${multivariateDataTypeRef} data type 
                  and ${this.dataTypeHandling} data type handling must have a ${StandardDataType.Multivariate} or 
                  ${StandardDataType.Unknown} data type`);
            logErrorAndThrow(err, log, ec);
          }
        }
      } else if (this.dataTypeHandling === MultivariateDataTypeHandling.Multivariate) {
        multivariateDataTypeRef = StandardDataType.Multivariate;
      } else if (this.dataTypeHandling === MultivariateDataTypeHandling.Consistent) {
        multivariateDataTypeRef = StandardDataType.Unknown;
      }
      // Keep track of the current expression
      let innerExpressionReference: ExpressionReference;
      // Remember that we've reached the end of the set.
      let endOfSet = false;

      // Iterate till we find the end of the set.
      const stackParser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
      const candidates: {near: string, parseResult: [string, ExpressionReference] | Promise<[string, ExpressionReference]>}[] = [];
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
          if (this.dataTypeHandling == MultivariateDataTypeHandling.Consistent && multivariateDataTypeRef !== StandardDataType.Unknown) {
            context = {inferredDataType: multivariateDataTypeRef, allowUndefinedDataType: true};
          } else {
            context = {allowUndefinedDataType: true};
          }
          const candidate: { near: string, parseResult: [string, ExpressionReference] | Promise<[string, ExpressionReference]> } = {
            near: innerRemaining,
            parseResult: stackParser.parse(innerRemaining, scope, context, ec)
          };
          candidates.push(candidate);
        }
      } while (!endOfSet)
      // Check there are async values
      let asyncResults = false;
      const promises: Promise<[string, ExpressionReference]>[] = [];
      candidates.forEach(candidate => {
        if(isPromise(candidate.parseResult)) {
          asyncResults = true;
          promises.push(candidate.parseResult);
        } else {
          promises.push(Promise.resolve(candidate.parseResult));
        }
        // Ok even if not a promise, ultimately as long as there is one promise.
       // promises.push(candidate.parseResult);
      })
      // Post process using promises
      if (asyncResults) {
        return Promise.allSettled(promises)
          .then(parseResults => {
            const syncCandidates: { near: string, parseResult: [string, ExpressionReference] }[] = [];
            let failures = false;
            parseResults.forEach((result, ndx) => {
              if(result.status === 'fulfilled') {
                syncCandidates.push({near: candidates[ndx].near, parseResult: result.value});
              } else {
                failures = true;
                log.warn(`Could not parse expression within multivariate expression near ${candidates[ndx].near}:  ${result.reason}`);
              }
            });
            if(failures) {
              const err = new Error(`Failures processing inner expressions near ${remaining}`);
              logErrorAndThrow(err, log, ec);
            }
            return this._parseMultivariatePostProcessing(remaining, innerRemaining, multivariateDataTypeRef, syncCandidates, ec);
          })
      } else {
        // Sync guaranteed.
        const syncCandidates: { near: string, parseResult: [string, ExpressionReference] }[] = candidates as unknown as { near: string, parseResult: [string, ExpressionReference]}[];
        return this._parseMultivariatePostProcessing(remaining, innerRemaining, multivariateDataTypeRef, syncCandidates, ec);
      }
    } else {
      // Help the inference engine by indicating it is not a set
      return [remaining, undefined, undefined];
    }
  }
}
