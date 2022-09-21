import {ExecutionContextI, Hints, LoggerAdapter, ModuleResolver} from '@franzzemen/app-utility';
import {EnhancedError, logErrorAndReturn} from '@franzzemen/app-utility/enhanced-error.js';
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
  abstract parse(moduleResolver: ModuleResolver, remaining: string, scope: ExpressionScope, hints: Hints, allowUnknownDataType?: boolean, ec?: ExecutionContextI): ExpressionParserResult;

  parseAndResolve(remaining: string, scope: ExpressionScope, hints: Hints, allowUnknownDataType?: boolean, ec?: ExecutionContextI) : ResolvedExpressionParserResult {
    const moduleResolver = new ModuleResolver();
    let expressionRef: ExpressionReference;
    [remaining, expressionRef] = this.parse(moduleResolver, remaining, scope, hints, allowUnknownDataType, ec);
    if (moduleResolver.hasPendingResolutions()) {
      const resultsOrPromises = moduleResolver.resolve(ec);
      if (isPromise(resultsOrPromises)) {
        const expressionRefPromise = resultsOrPromises
          .then(resolutions => {
            const someErrors = ModuleResolver.resolutionsHaveErrors(resolutions);
            if (someErrors) {
              const log = new LoggerAdapter(ec, 're-expression', 'expression-parser', 'parseAndResolve');
              log.warn(resolutions, 'Errors resolving modules');
              throw logErrorAndReturn(new EnhancedError('Errors resolving modules'));
            } else {
              moduleResolver.clear();
              return expressionRef;
            }
          });
        return [remaining, expressionRefPromise];
      } else {
        return [remaining, expressionRef];
      }
    } else {
      return [remaining, expressionRef];
    }
  }
}
