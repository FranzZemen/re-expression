//import {ExecutionContextI, LoggerAdapter, ModuleResolver} from '@franzzemen/app-utility';
import {logErrorAndReturn} from '@franzzemen/app-utility/enhanced-error.js';
import {FragmentParser} from '@franzzemen/re-common';
import {isPromise} from 'util/types';
import {ExpressionScope} from '../scope/expression-scope.js';
import {ExpressionStackParser} from './expression-stack-parser.js';

//export class FormulaFragmentParserAdapter implements FragmentParser<FormulaFragmentReference> {
//  constructor() {
//  }

//  private parseNext(candidateFragment: string, scope: ExpressionScope, ec?: ExecutionContextI): [string, OperationFragment | Promise<OperationFragment>]  {
  //  const candidateRegex = /^([*/+-])([\s\t\r\n\v\f\u2028\u2029]?[^]*$|$)/;
    //const result = candidateRegex.exec(candidateFragment);
  /*
  if (result === null) {
      return [candidateFragment, undefined];
    } else {
      const operator = result[1] as ArithmeticOperator;
      const candidateExpressionFragment = result[2];
      const expressionStackParser = scope.get(ExpressionScope.ExpressionStackParser) as ExpressionStackParser;
      let valueOrPromise = expressionStackParser.parse(candidateExpressionFragment, scope, {allowUndefinedDataType: false}, ec);
      if (isPromise(valueOrPromise)) {
        valueOrPromise
          .then(([remaining, ref]) => {

        })
        return [remaining, valueOrPromise[1]];
      } else {
        let [remaining, expressionRef] = valueOrPromise;
        if (expressionRef === undefined) {
          return [remaining, undefined];
        } else {
          return [remaining, {operator, expressionRef}];
        }
      }
    }
  }

  parse(fragment: string, scope: ExpressionScope, ec?: ExecutionContextI): [string, FormulaFragmentReference] {
    // A fragment can start with arithmetic operator + or -.  If it doesn't, then + is assigned.
    // A fragment consists of a series of un-nested, i.e. not bracketed, Expressions that resolve to type Number or type Float separated arithmetic operators
    // A fragment is operated on by resolving multiplication and division first as with regular math.  This is immaterial to parsing though.


    // 2. Consume next expression including operator, which must exist
    // 3. Iterate until end condition is met (no valid operators)

    // 1. Check if it leads with a valid operator (+ or - but not * or /).  If not, assign +
    let remaining = fragment.trim();
    let candidateFragment = remaining;
    const candidateRegex = /^([+-])([\s\t\r\n\v\f\u2028\u2029]?[^]*$|$)/;
    const result = candidateRegex.exec(candidateFragment);
    if (result === null) {
      candidateFragment = ArithmeticOperator.Add + candidateRegex;
    }
    const operationFragmentResults: ([string, OperationFragment] | Promise<[string, OperationFragment]>)[] = [];
    let operationFragmentResult: [string, OperationFragment] | Promise<[string, OperationFragment]>;
    let endCondition = false;
    let async = false;
    do {
      operationFragmentResult = this.parseNext(candidateFragment, scope, ec);
      if (isPromise(operationFragmentResult)) {
        // Can't be an end condition
        operationFragmentResults.push(operationFragmentResult);
        async = true;
      } else {
        if (operationFragmentResult[1] === undefined) {
          endCondition = true;
          if(operationFragmentResults.length >= 1) {
            // If there were no results at all, then the return value might include an injected "+". In that case
            // remaining is the original string.  Otherwise, remaining is the return string from this last parse.
            remaining = operationFragmentResult[0];
          }
          } else {
            operationFragmentResults.push(operationFragmentResult);
          }
        }
      } while (!endCondition);
      if(operationFragmentResults.length > 0) {
        if (async) {
          return Promise.all(operationFragmentResults)
            .then(values => {
              const operations: OperationFragment[] = [];
              values.forEach(value => {
                operations.push(value[1]);
              });
              return [remaining, {operations}]
            }, err => {
              const log = new LoggerAdapter(ec, 're-expression', 'formula-fragment-parser-adapter', 'parse');
              throw logErrorAndReturn(err, log, ec);
            })

        } else {
          const operations: OperationFragment[] = [];
          operationFragmentResults.forEach(fragmentResult => {
            operations.push(fragmentResult[1]);
          });
          return [remaining, {operations}]
        }
      } else {
        return [remaining, undefined];
      }
    } else {
      return [remaining, undefined];
    }
  }

}
*/
