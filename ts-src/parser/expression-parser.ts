import {ExecutionContextI, Hints} from '@franzzemen/app-utility';
import {ParserMessages, Scope} from '@franzzemen/re-common';
import {isPromise} from 'util/types';
import {ExpressionReference, StandardExpressionType} from '../expression.js';
import {ExpressionScope} from '../scope/expression-scope.js';


export type ExpressionParserResult = [string, ExpressionReference, ParserMessages];
export type ResolvedExpressionParserResult = [string, (ExpressionReference | Promise<ExpressionReference>), ParserMessages];

export abstract class ExpressionParser {

  constructor(public refName: StandardExpressionType | string) {
  }



  /**
   * Attempt to parse the remaining text for the expression reference given the hints and any inference logic for type
   * and data type.  Return an undefined reference if it cannot be parsed.  If it cannot be parsed, returned remaining should be
   * the original passed in remaining and reference should be undefined.
   *
   * It is possible for the operation to have asynchronous behavior loading es 5 modules dynamically (and potentially for
   * other reasons), therefore unless there is positivity that it is not necessary, scope should be resolved sometime
   * after calling this method.  Usually part of a broader sequence of parsing.
   *
   * @param remaining
   * @param scope
   * @param hints
   * @param ec
   * @return remaining after parsing as well as the reference parsed
   */
  abstract parse(remaining: string, scope: ExpressionScope, hints: Hints, ec?: ExecutionContextI): ExpressionParserResult;

  /**
   * Parse and invoke module resolver.  Convenient if the parser is used on its own.  Normally the stacked parser would
   * be leveraged in a wider context, and scope would be resolved when it made sense.
   * @param remaining
   * @param scope
   * @param hints
   * @param ec
   */
  parseAndResolve(remaining: string, scope: ExpressionScope, hints: Hints, ec?: ExecutionContextI) : ResolvedExpressionParserResult {
    let expressionRef: ExpressionReference, parserMessages: ParserMessages;
    // First parse
    [remaining, expressionRef, parserMessages] = this.parse(remaining, scope, hints, ec);
    // Then invoke module resolver
    let resultOrPromise = Scope.resolve(scope,ec);
    if(isPromise(resultOrPromise)) {
      const promise = resultOrPromise
        .then(truVal=> {
          return expressionRef;
        });
      return [remaining, promise, parserMessages];
    } else {
      return [remaining, expressionRef, parserMessages];
    }
  }
}
