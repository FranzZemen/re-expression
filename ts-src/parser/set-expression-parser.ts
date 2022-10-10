import {ExecutionContextI, Hints} from '@franzzemen/app-utility';
import {ParserMessages, ParserMessageType} from '@franzzemen/re-common';
import {ExpressionReference, StandardExpressionType} from '../expression.js';
import {SetExpressionReference} from '../expression/set-expression.js';
import {ExpressionStandardParserMessages} from '../parser-messages/expression-standard-parser-messages.js';
import {ExpressionScope} from '../scope/expression-scope.js';
import {MultivariateParser, MultivariateParserResult} from './multivariate-parser.js';


export type SetExpressionParserResult = [remaining: string, reference: SetExpressionReference, messages: ParserMessages];

/**
 * Used to parse expressions contained in the form [A, B C] either delimited with commas or not, bounded by square brackets
 * and resulting in a Set Expression.  Essentially a decorator around the Multivariate Parser
 *
 * It's a decorator of MultivariateParser, because MultivariateParser is also used anywhere we have a multivariate form [A, B C]
 * such as Function Expression Reference parameters.
 */
export class SetExpressionParser extends MultivariateParser {

  constructor() {
    super(StandardExpressionType.Set);
  }

  /**
   * Parses the set, if it exists.  The scope remains unresolved afterwards.
   * @param remaining
   * @param scope
   * @param hints
   * @param ec
   */
  parse(remaining: string, scope: ExpressionScope, hints: Hints, ec?: ExecutionContextI): SetExpressionParserResult {
    let expRef: ExpressionReference, set: ExpressionReference[], parserMessages: ParserMessages;
    // Simply delegates to the
    const multivariateResult: MultivariateParserResult = this.parseMultivariate(remaining, scope, hints, ec);
    // If it does not resolve to a Set, remaining should be unchanged.
    [remaining, expRef, set, parserMessages] = [...multivariateResult];
    if (expRef) {
      return [remaining, {type: expRef.type, dataTypeRef: expRef.dataTypeRef, set, multivariate: true}, [{message: ExpressionStandardParserMessages.SetExpressionParsed, type: ParserMessageType.Info}]];
    } else {
      return [remaining, undefined, undefined];
    }
  }
}
