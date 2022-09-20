import {ExecutionContextI, Hints, ModuleResolver} from '@franzzemen/app-utility';
import {ExpressionReference, ExpressionType} from '../expression.js';
import {ExpressionScope} from '../scope/expression-scope.js';


export type ExpressionParserResult = [string, ExpressionReference];
export type ResolvedExpressionParserResult = [string, (ExpressionReference | Promise<ExpressionReference>)];

export abstract class ExpressionParser {

  constructor(public refName: ExpressionType | string) {
  }


  abstract parseAndResolve(remaining: string, scope: ExpressionScope, hints: Hints, allowUnknownDataType?: boolean, ec?: ExecutionContextI): ResolvedExpressionParserResult;

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
}
