import {ExecutionContextI, Hints} from '@franzzemen/app-utility';
import {ExpressionReference, ExpressionType} from '../expression.js';
import {SetExpressionReference} from '../expression/set-expression.js';
import {ExpressionScope} from '../scope/expression-scope.js';
import {ExpressionHintKey} from '../util/expression-hint-key.js';
import {MultivariateDataTypeHandling, MultivariateParser, MultivariateParserResult} from './multivariate-parser.js';

export type SetExpressionParserResult = [remaining: string, reference: SetExpressionReference];

export class SetExpressionParser extends MultivariateParser {

  constructor() {
    super(ExpressionType.Set);
  }

  parse(remaining: string, scope: ExpressionScope, hints: Hints, ec?: ExecutionContextI): SetExpressionParserResult {
    let expRef: ExpressionReference, set: ExpressionReference[];
    // Default to consistent data type if not otherwise set
    if(hints) {
      let dataTypeHandling = hints.get(ExpressionHintKey.MultivariateDataTypeHandling);
      if(!dataTypeHandling) {
        hints.set(ExpressionHintKey.MultivariateDataTypeHandling, MultivariateDataTypeHandling.Consistent);
      }
    }
    const multivariateResult: MultivariateParserResult = this.parseMultivariate(remaining, scope, hints, ec);
    [remaining, expRef, set] = [...multivariateResult];
    if (expRef) {
      return [remaining, {type: expRef.type, dataTypeRef: expRef.dataTypeRef, set, multivariate: true}];
    } else {
      return [remaining, undefined];
    }
  }
}
