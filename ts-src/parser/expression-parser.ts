import {ExecutionContextI, Hints, LoggerAdapter, ModuleResolver} from '@franzzemen/app-utility';
import {EnhancedError, logErrorAndReturn} from '@franzzemen/app-utility/enhanced-error.js';
import {Scope} from '@franzzemen/re-common';
import {isPromise} from 'util/types';
import {ExpressionReference, ExpressionType} from '../expression.js';
import {ExpressionScope} from '../scope/expression-scope.js';


export type ExpressionParserResult = [string, ExpressionReference];
export type ResolvedExpressionParserResult = [string, (ExpressionReference | Promise<ExpressionReference>)];

export abstract class ExpressionParser {

  constructor(public refName: ExpressionType | string) {
  }



  /**
   * Attempt to parse the remaining text for the expression reference given the hints and any inference logic for type
   * and data type.  Return an undefined reference if it cannot be parsed.  If it cannot be parsed, returned remaining should be
   * the original passed in remaining and reference should be undefined
   * @param moduleResolver
   * @param remaining
   * @param scope
   * @param hints
   * @param allowUnknownDataType
   * @param ec
   * @return remaining after parsing as well as the reference parsed
   */
  abstract parse(remaining: string, scope: ExpressionScope, hints: Hints, ec?: ExecutionContextI): ExpressionParserResult;

  parseAndResolve(remaining: string, scope: ExpressionScope, hints: Hints, ec?: ExecutionContextI) : ResolvedExpressionParserResult {
    let expressionRef: ExpressionReference;
    [remaining, expressionRef] = this.parse(remaining, scope, hints, ec);
    let resultOrPromise = Scope.resolve(scope,ec);
    if(isPromise(resultOrPromise)) {
      const promise = resultOrPromise
        .then(truVal=> {
          return expressionRef;
        });
      return [remaining, promise];
    } else {
      return [remaining, expressionRef];
    }
  }
}
