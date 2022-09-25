import {ExecutionContextI, Hints, ModuleResolver} from '@franzzemen/app-utility';
import {ExpressionReference, ExpressionType} from '../expression.js';
import {ExpressionScope} from '../scope/expression-scope.js';
import {SetExpressionReference} from '../expression/set-expression.js';
import {ResolvedExpressionParserResult} from './expression-parser.js';
import {MultivariateDataTypeHandling, MultivariateParser, MultivariateParserResult} from './multivariate-parser.js';

export type SetExpressionParserResult = [remaining: string, reference: SetExpressionReference];

export class SetExpressionParser extends MultivariateParser {

  constructor() {
    super(ExpressionType.Set, MultivariateDataTypeHandling.Consistent);
  }

  parse(remaining: string, scope: ExpressionScope, hints: Hints, allowUndefinedDataType?: boolean, ec?: ExecutionContextI): SetExpressionParserResult {
    let expRef: ExpressionReference, set: ExpressionReference[];
    const multivariateResult: MultivariateParserResult = this.parseMultivariate(remaining, scope, hints, true, ec);
    [remaining, expRef, set] = [...multivariateResult];
    if (expRef) {
      return [remaining, {type: expRef.type, dataTypeRef: expRef.dataTypeRef, set, multivariate: true}];
    } else {
      return [remaining, undefined];
    }
  }
}
