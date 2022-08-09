import {ExecutionContextI, Hints, LoggerAdapter} from '@franzzemen/app-utility';

import {ExpressionReference, ExpressionType, isExpressionReference} from '../expression';
import {ExpressionScope} from '../scope/expression-scope';
import {ExpressionHintKey} from '../util/expression-hint-key';
import {ExpressionParser} from './expression-parser';
import {ExpressionStackParser} from './expression-stack-parser';


export abstract class MultivariateParser extends ExpressionParser {
  constructor(expressionType: ExpressionType, private consistentDataType = true) {
    super(expressionType);
  }


  parseMultivariate(remaining: string, scope:ExpressionScope, hints: Hints, allowUndefinedDataType?: boolean, ec?: ExecutionContextI): [string, ExpressionReference, ExpressionReference[]] {
    const log = new LoggerAdapter(ec, 'rules-engine', 'multivariate-parser', 'parse');
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
      // See if we have already defined the dataTypeRef in the hints
      let dataTypeRef = hints.get('data-type') as string;
      // Keep track of the current expression
      let innerExpressionReference: ExpressionReference;
      // Remember that we've reached the end of the set.
      let endOfSet = false;
      // Remember parsed expressions, or if they can't be parsed because data type has not yet been found, remember what
      // could have been parsed next
      let candidateExpressions: (ExpressionReference | string)[] = [];
      // Iterate till we find the end of the set.
      const stackParser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
      do {
        // Verify that a possible end of set exits.  Simply look for a closing bracket.  While this may be part of another expression
        // it wil  avoid an infinite loop to always look for that.
        if (innerRemaining.indexOf(']') < 0) {
          const err = new Error('No end of set detected');
          log.error(err);
          throw err;
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
          // Parse next expression.
          [innerRemaining, innerExpressionReference] = stackParser.parse(innerRemaining, scope, {inferredDataType: this.consistentDataType ? dataTypeRef: undefined, allowUndefinedDataType: true}, ec);
          if (innerExpressionReference) {
            // Assign data type if not yet assigned, or throw an error if there's a mismatch
            if (!dataTypeRef && this.consistentDataType) {
              dataTypeRef = innerExpressionReference.dataTypeRef;
            } else if (this.consistentDataType && innerExpressionReference.dataTypeRef !== dataTypeRef) {
              const err = new Error(`Data Type mismatch when processing Set.  Set Data Type = ${dataTypeRef}, next Expression Data Type = ${innerExpressionReference.dataTypeRef}`);
              log.error(err);
              throw err;
            }
            candidateExpressions.push(innerExpressionReference);
          } else {
            if(this.consistentDataType) {
              // No expression found.  Could be because no data type was yet determined.  If that's the case, remember would "could" have been parsed.
              if (!dataTypeRef) {
                candidateExpressions.push(innerRemaining);
              } else {
                // There's a data type mismatch.  That should have been caught in the parsing, but we'll throw an error here as well
                const err = new Error(`Data Type mismatch when processing Set.  Set Data Type = ${dataTypeRef} produced an undefined expression`);
                log.error(err);
                throw err;
              }
            } else {
              // If no consistent data type is expected, each inner expression must stand on its own for data type
              const err = new Error(`Inner expression has no data type`);
              log.error(err);
              throw err;
            }
          }
        }
      } while (!endOfSet)
      // Now that we've reached the end of the set, resolve any expressions that could not be resolved due to data type missing
      if (this.consistentDataType && !dataTypeRef) {
        const err = new Error('Indeterminate data type for set expression');
        log.error(err);
        throw err;
      }

      const set: ExpressionReference[] = [];
      candidateExpressions.forEach(candidate => {
        if(this.consistentDataType) {
          // Process undefined expressions if possible
          if (isExpressionReference(candidate)) {
            // All ok
          } else {
            if (typeof candidate === 'string') {
              const [junkRemaining, candidateRef] = stackParser.parse(candidate, scope, {inferredDataType: dataTypeRef, allowUndefinedDataType: false}, ec);
              if (candidateRef) {
                candidate = candidateRef;
              } else {
                // Not a Set expression as we can't solve for inner expressions
                return [remaining, undefined];
              }
            }
          }
        }
        // Transfer to result
        if(isExpressionReference(candidate)) {
          set.push(candidate);
        }
      });
      return [innerRemaining.trim(), {type: this.refName, dataTypeRef, multivariate: true}, set];
    } else {
      // Help the inference engine by indicating it is not a set
      return [remaining, undefined, undefined];
    }
  }
}
