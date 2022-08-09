import {ExecutionContextI, Hints} from '@franzzemen/app-utility';
import {ExpressionReference, ExpressionType} from '../expression';

export abstract class ExpressionParser {

  constructor(public refName: ExpressionType | string) {
  }
  /**
   * Attempt to parse the remaining text for the expression reference given the hints and any inference logic for type
   * and data type.  Return an undefined reference if it cannot be parsed.  If it cannot be parsed, returned remaining should be
   * the original passed in remaining and reference should be undefined
   * @param remaining
   * @param scope
   * @param hints
   * @param allowUndefinedDataType
   * @param ec
   * @return remaining after parsing as well as the reference parsed
   */
  abstract parse(remaining: string, scope: Map<string, any>, hints: Hints, allowUndefinedDataType?: boolean, ec?: ExecutionContextI): [string, ExpressionReference];
}
