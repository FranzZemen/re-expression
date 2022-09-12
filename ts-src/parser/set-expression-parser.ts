import {ExecutionContextI, Hints} from '@franzzemen/app-utility';
import {isPromise} from 'util/types';
import {ExpressionReference, ExpressionType} from '../expression.js';
import {ExpressionScope} from '../scope/expression-scope.js';
import {SetExpressionReference} from '../standard/set-expression.js';
import {MultivariateDataTypeHandling, MultivariateParser} from './multivariate-parser.js';

export class SetExpressionParser extends MultivariateParser {

  constructor() {
    super(ExpressionType.Set, MultivariateDataTypeHandling.Consistent);
  }

  parse(remaining: string, scope: ExpressionScope, hints: Hints, allowUndefinedDataType?: boolean, ec?: ExecutionContextI): [string, SetExpressionReference] | Promise<[string, SetExpressionReference]> {
    let expRef: ExpressionReference, set: ExpressionReference[];
    const resultOrPromise = this.parseMultivariate(remaining, scope, hints, true, ec);
    if(isPromise(resultOrPromise)) {
      return resultOrPromise
        .then(result => {
          const [remaining, expRef, set] = result;
          if(expRef) {
            return [remaining, {type: expRef.type, dataTypeRef: expRef.dataTypeRef, set, multivariate: true}];
          } else {
            return [remaining, undefined];
          }
      })
    } else {
      remaining = resultOrPromise[0];
      const expRef = resultOrPromise[1];
      const set = resultOrPromise[2];
      if(expRef) {
        return [remaining, {type: expRef.type, dataTypeRef: expRef.dataTypeRef, set, multivariate: true}];
      } else {
        return [remaining, undefined];
      }
    }
  }
}
