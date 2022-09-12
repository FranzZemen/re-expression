import {ExecutionContextI, Hints, LoggerAdapter} from '@franzzemen/app-utility';
import {DataTypeInferenceStackParser} from '@franzzemen/re-data-type';
import {ExpressionType} from '../expression.js';
import {ExpressionScope} from '../scope/expression-scope.js';
import {ExpressionHintKey} from '../util/expression-hint-key.js';
import {ExpressionParser} from './expression-parser.js';
import {ValueExpressionReference} from '../standard/value-expression.js';

export class ValueExpressionParser extends ExpressionParser {
  constructor() {
    super(ExpressionType.Value);
  }

  parse(remaining: string, scope: ExpressionScope, hints: Hints, allowUndefinedDataType?: boolean, ec?: ExecutionContextI): [string, ValueExpressionReference] {
    const log = new LoggerAdapter(ec, 're-expression', 'value-expression-parser', 'parse');
    const near = remaining;
    const typeHint = hints.get(ExpressionHintKey.ExpressionType);
    if(typeHint && typeHint !== ExpressionType.Value) {
      log.debug(`Type hint ${typeHint} conflicts with ${ExpressionType.Value}, not parsing`);
      return [remaining, undefined];
    }
    let dataTypeHint = hints.get(ExpressionHintKey.DataType);
    let dataTypeRef: string;
    if(dataTypeHint) {
      dataTypeRef = (typeof dataTypeHint === 'string') ? dataTypeHint : dataTypeHint['refName'];
    }
    let value: any;
    [remaining, [value, dataTypeHint]] = (scope.get(ExpressionScope.DataTypeInferenceStackParser) as DataTypeInferenceStackParser).parse(remaining, scope, dataTypeRef, ec);
    if(value === undefined) {
      return [remaining, undefined];
    } else {
      if(!dataTypeHint) {
        const err = new Error(`Undefined data type for Value Expression.  Value Expressions must always have a data type defined by their value; near: ${near}`);
        log.error(err);
        throw err;
      }
      return [remaining, {
        type: ExpressionType.Value,
        dataTypeRef: dataTypeHint as string,
        value
      }];
    }
  }
}
