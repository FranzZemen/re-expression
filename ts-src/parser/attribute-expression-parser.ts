import {ExecutionContextI, Hints, LoggerAdapter, ModuleResolver} from '@franzzemen/app-utility';
import {EnhancedError, logErrorAndThrow} from '@franzzemen/app-utility/enhanced-error.js';
import {StandardDataType} from '@franzzemen/re-data-type';
import {ExpressionType} from '../expression.js';
import {ExpressionScope} from '../scope/expression-scope.js';
import {AttributeExpressionReference} from '../standard/attribute-expression.js';
import {ExpressionHintKey} from '../util/expression-hint-key.js';
import {ExpressionParser} from './expression-parser.js';

export type AttributeExpressionParserResult = [remaining: string, reference: AttributeExpressionReference];

export class AttributeExpressionParser extends ExpressionParser {
  constructor() {
    super(ExpressionType.Attribute);
  }

  parseAndResolve(remaining: string, scope: ExpressionScope, hints: Hints, allowUnknownDataType?: boolean, ec?: ExecutionContextI): AttributeExpressionParserResult {
    const moduleResolver = new ModuleResolver();
    const result = this.parse(moduleResolver,remaining,scope,hints, allowUnknownDataType,ec);
    if(moduleResolver.hasPendingResolutions()) {
      const log = new LoggerAdapter(ec, 're-expression', 'attribute-expression-parser', 'parseAndResolve');
      logErrorAndThrow(new EnhancedError('Value Expression parsing does not require resolutions'),log, ec);
    }
    return result;
  }



  parse(moduleResolver: ModuleResolver, remaining: string, scope: Map<string, any>, hints: Hints, allowUnknownDataType?:boolean, execContext?: ExecutionContextI): AttributeExpressionParserResult {
    // Formats:
    // someAttributeName.anotherAttributeName
    // [1].someAttributeName.anotherAttributeName[5].yetAnother[4]
    // [<<ex (optional) type=Attribute data-type>=Number or Text> someAttributeName.anotherAttribute][anotherAttributeName].yetAnother[4]
    // [<<ex (optional) type=Value data-type=Number or Text>>].attribute...
    // [function express]
    // [invocation expression]
    // function expression
    // invocation expression

    const log = new LoggerAdapter(execContext, 're-expression', 'attribute-expression-parser', 'parse');
    const typeHint = hints.get(ExpressionHintKey.Type);
    if(typeHint && typeHint !== ExpressionType.Attribute) {
      log.debug(`Type hint ${typeHint} conflicts with ${ExpressionType.Attribute}, not parsing`);
      return [remaining, undefined];
    }
    let dataTypeHint = hints.get(ExpressionHintKey.DataType);
    let dataTypeRef: string;
    if(dataTypeHint) {
      dataTypeRef = (typeof dataTypeHint === 'string') ? dataTypeHint : dataTypeHint['refName'];
    }
    if(!dataTypeRef) {
      if(!allowUnknownDataType) {
        return [remaining, undefined]; // No expression found
      } else {
        dataTypeRef = StandardDataType.Unknown;
      }
    }
    let multivariate: boolean;
    const multivariateRef = hints.get(ExpressionHintKey.Multivariate);
    if(multivariateRef) {
      multivariate = multivariateRef === 'true' || multivariateRef === ExpressionHintKey.Multivariate;
    }
    // Case 1, attribute is a list of identifiers separated by dots, with potential array referencing
    // someAttributeName.anotherAttributeName
    // [1].someAttributeName.anotherAttributeName[5].yetAnother[4]

    // Note - after the attribute we need a space, unless its end of input, thus the or condition in the non-capturing group
    const result = /^([a-zA-Z0-9.\[\]"']+)([\s\t\r\n\v\f\u2028\u2029)\],][^]*$|$)/.exec(remaining);
    if(result) {
      // Ensure that the square brackets are balanced
      // Note that if the closing square brackets are greater than the opening, we just want up to where they are equal.  There rest might be part of another expression etc.
      let path = result[1];
      const openingSquareBrackets = path.match(/\[/g)?.length;
      const closingSquareBrackets = path.match(/]/g)?.length;
      if (openingSquareBrackets) {
        if (closingSquareBrackets && closingSquareBrackets === openingSquareBrackets) {
          return [result[2].trim(), {type: ExpressionType.Attribute, dataTypeRef, path, multivariate}];
        } else if (closingSquareBrackets && closingSquareBrackets > openingSquareBrackets) {
          // This can happen if this is the last attribute in a set for example:  [1, 2, path, offset[5]]....where offset[5]] would be picked up by our result.
          // There is a more general case which may never happen...for now handle where the last ] is at the end of our result.
          if(path[path.length -1] === ']') {
            path = path.substring(0, path.length-1);
            return [`]${result[2].trim()}`, {type:ExpressionType.Attribute, dataTypeRef, path, multivariate}];
          } else {
            return [remaining, undefined];
          }
        }
        else {
          return [remaining, undefined];
        }
      } else if (closingSquareBrackets) {
        // Closing square brackets without opening...retry parsing without closing square bracket
        const result2= /^([a-zA-Z0-9.]+)([\s\t\r\n\v\f\u2028\u2029)\],][^]*$|$)/.exec(remaining);
        if(result2) {
          path = result2[1];
          return [result2[2].trim(), {type: ExpressionType.Attribute, dataTypeRef, path, multivariate}]
        } else {
          return [remaining, undefined];
        }
      } else {
        return [result[2].trim(), {type: ExpressionType.Attribute, dataTypeRef, path, multivariate}];
      }
    } else {
    return [remaining,undefined]}
  }
}
