import {ExecutionContextI, Hints, LoggerAdapter} from '@franzzemen/app-utility';
import {DataTypeInferenceStackParser} from '@franzzemen/re-data-type';
import {ExpressionType} from '../expression';
import {ExpressionScope} from '../scope/expression-scope';
import {ExpressionHintKey} from '../util/expression-hint-key';
import {ExpressionParser} from './expression-parser';
import {ValueExpressionReference} from '../standard/value-expression';

export class ValueExpressionParser extends ExpressionParser {
  constructor() {
    super(ExpressionType.Value);
  }

  parse(remaining: string, scope: Map<string, any>, hints: Hints, allowUndefinedDataType?: boolean, ec?: ExecutionContextI): [string, ValueExpressionReference] {
    const log = new LoggerAdapter(ec, 'rules-engine', 'value-expression-parser', 'parse');
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
      return [remaining, {
        type: ExpressionType.Value,
        dataTypeRef: dataTypeHint as string,
        value
      }];
    }
  }
}
