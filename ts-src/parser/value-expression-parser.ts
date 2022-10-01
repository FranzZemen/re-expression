import {ExecutionContextI, Hints, LoggerAdapter} from '@franzzemen/app-utility';
import {logErrorAndThrow} from '@franzzemen/app-utility/enhanced-error.js';
import {DataTypeInferenceStackParser} from '@franzzemen/re-data-type';
import {ExpressionType} from '../expression.js';
import {ValueExpressionReference} from '../expression/value-expression.js';
import {ExpressionScope} from '../scope/expression-scope.js';
import {ExpressionHintKey} from '../util/expression-hint-key.js';
import {ExpressionParser} from './expression-parser.js';
import {ParserMessages, ParserMessageType, StandardParserMessages} from './parser-messages.js';

export type ValueExpressionParserResult = [string, ValueExpressionReference, ParserMessages];

export class ValueExpressionParser extends ExpressionParser {
  constructor() {
    super(ExpressionType.Value);
  }

  parse (remaining: string, scope: ExpressionScope, hints: Hints, ec?: ExecutionContextI): ValueExpressionParserResult {
    const log = new LoggerAdapter(ec, 're-expression', 'value-expression-parser', 'parse');
    const near = remaining;
    const typeHint = hints.get(ExpressionHintKey.Type);
    if(typeHint && typeHint !== ExpressionType.Value) {
      return [remaining, undefined, undefined];
    }
    let dataTypeHint = hints.get(ExpressionHintKey.DataType);
    let dataTypeRef: string;
    if(dataTypeHint) {
      dataTypeRef = (typeof dataTypeHint === 'string') ? dataTypeHint : dataTypeHint['refName'];
    }
    let value: any;
    [remaining, [value, dataTypeHint]] = (scope.get(ExpressionScope.DataTypeInferenceStackParser) as DataTypeInferenceStackParser).parse(remaining, scope, dataTypeRef, ec);
    if(value === undefined) {
      return [near, undefined, undefined];
    } else {
      if(!dataTypeHint) {
        return [near, undefined, [{message: `${StandardParserMessages.ValueExpressionsAlwaysResolveToDataType} near ${near}`, type: ParserMessageType.Error}]]
      }
      return [remaining, {
        type: ExpressionType.Value,
        dataTypeRef: dataTypeHint as string,
        value
      }, undefined];
    }
  }
}
