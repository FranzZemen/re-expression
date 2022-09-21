import {ExecutionContextI, Hints, ModuleResolver} from '@franzzemen/app-utility';
import {ExpressionReference, ExpressionType} from '../expression.js';
import {ExpressionScope} from '../scope/expression-scope.js';
import {SetExpressionReference} from '../standard/set-expression.js';
import {ResolvedExpressionParserResult} from './expression-parser.js';
import {MultivariateDataTypeHandling, MultivariateParser, MultivariateParserResult} from './multivariate-parser.js';

export type SetExpressionParserResult = [remaining: string, reference: SetExpressionReference];

export class SetExpressionParser extends MultivariateParser {

  constructor() {
    super(ExpressionType.Set, MultivariateDataTypeHandling.Consistent);
  }

  parseAndResolve(remaining: string, scope: ExpressionScope, hints: Hints, allowUnknownDataType?: boolean, ec?: ExecutionContextI): ResolvedExpressionParserResult {
    return super.parseAndResolveBase(this, remaining, scope, hints, allowUnknownDataType, ec);
  }

  parse(moduleResolver: ModuleResolver, remaining: string, scope: ExpressionScope, hints: Hints, allowUndefinedDataType?: boolean, ec?: ExecutionContextI): SetExpressionParserResult {
    let expRef: ExpressionReference, set: ExpressionReference[];
    const multivariateResult: MultivariateParserResult = this.parseMultivariate(moduleResolver, remaining, scope, hints, true, ec);
    [remaining, expRef, set] = [...multivariateResult];
    if (expRef) {
      return [remaining, {type: expRef.type, dataTypeRef: expRef.dataTypeRef, set, multivariate: true}];
    } else {
      return [remaining, undefined];
    }
  }
}
