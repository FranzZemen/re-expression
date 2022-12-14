import {Hints} from '@franzzemen/hints';
import {LogExecutionContext, LoggerAdapter} from '@franzzemen/logger-adapter';
import {ModuleDefinition} from '@franzzemen/module-factory';
import {loadModuleDefinitionFromHints, ParserMessages, ParserMessageType} from '@franzzemen/re-common';
import {StandardDataType} from '@franzzemen/re-data-type';
import {ExpressionReference, StandardExpressionType} from '../expression.js';
import {FunctionExpressionReference} from '../expression/function-expression.js';
import {ExpressionStandardParserMessages} from '../parser-messages/expression-standard-parser-messages.js';
import {ExpressionScope} from '../scope/expression-scope.js';
import {ExpressionHintKey} from '../util/expression-hint-key.js';
import {MultivariateDataTypeHandling, MultivariateParser, MultivariateParserResult} from './multivariate-parser.js';

export class FunctionExpressionParser extends MultivariateParser {


  constructor() {
    super(StandardExpressionType.Function);
  }
  parse(remaining: string, scope: ExpressionScope, hints: Hints, ec?: LogExecutionContext): [string, FunctionExpressionReference, ParserMessages] {
    const log = new LoggerAdapter(ec, 're-expression', 'function-expression-parser', 'parse');
    let refName: string;
    let module: ModuleDefinition;
    let parserMessages: ParserMessages = [];

    // Indicates the return time could be an array(multivariate)
    const multivariateRef = hints.get(ExpressionHintKey.Multivariate);
    let multivariate: boolean;
    let dataTypeHandling: MultivariateDataTypeHandling;
    if (multivariateRef) {
      multivariate = multivariateRef === 'true' || multivariateRef === ExpressionHintKey.Multivariate;
      // If the return type is a set, are the elements of a consistent data type or different?
      dataTypeHandling = hints.get(ExpressionHintKey.MultivariateDataTypeHandling) as MultivariateDataTypeHandling;
      if (!dataTypeHandling) {
        hints.set(ExpressionHintKey.MultivariateDataTypeHandling, MultivariateDataTypeHandling.Consistent);
      }
    }

    let dataTypeRef = hints.get('data-type') as string;
    if (!dataTypeRef) {
      if(multivariate) {
        dataTypeRef = StandardDataType.Multivariate;
      } else if (!scope.get(ExpressionScope.AllowUnknownDataType) as boolean) {
        return [remaining, undefined, undefined]; // No expression found
      } else {
        dataTypeRef = StandardDataType.Unknown;
      }
    }


    let type = hints.get(ExpressionHintKey.Type) as string;
    let result;
    if (type === StandardExpressionType.Function) {
      // Search for either the function ref name by itself, or preceded by the '@' symbol, which is reserved.
      result = /^@?([a-zA-Z]+[a-zA-Z0-9]*)([\[\s)\],][^]*$|$)/.exec(remaining); // Note the opening square bracket that might replace a following space...start of parameters
    } else {
      // The '@' symbol must precede since no type hint was provided
      result = /^@([a-zA-Z]+[a-zA-Z0-9]*)([\[\s)\],][^]*$|$)/.exec(remaining); // Note the opening square bracket that might replace a following space...start of parameters
    }
    if (result) {
      type = StandardExpressionType.Function;
      refName = result[1];
      remaining = result[2].trim();

      const refNameRegistered = scope.hasAwaitEvaluationFactory(scope, refName, ec);
      module = loadModuleDefinitionFromHints(hints, ec);

      const hintStr = `<<ex 
                            ${ExpressionHintKey.DataType}=${StandardDataType.Unknown} 
                            ${ExpressionHintKey.Multivariate} 
                            ${ExpressionHintKey.MultivariateDataTypeHandling}=Multivariate 
                            ${ExpressionHintKey.Type}=${StandardExpressionType.Function}
                       >>`;

      const [textRemaining, multivariateHints] = scope.parseHints(hintStr, 'ex',ec);
      if (module && !refNameRegistered) {
        scope.addAwaitEvaluationFunction({moduleRef: {refName, module}},undefined, ec);
      }
      let params: ExpressionReference[];
      parserMessages.push({message: ExpressionStandardParserMessages.FunctionExpressionParsed, type: ParserMessageType.Info});
      if (remaining.startsWith('[')) {
        // allowUnknownDataTypes is false because the parameter list for a function expression must be determinate on data type even if that data type is Unknown (runtime determination)
        const multivariateResult: MultivariateParserResult = this.parseMultivariate(remaining, scope, multivariateHints, ec);

        [remaining, , params] = [...multivariateResult];
        return [remaining, {type, dataTypeRef, refName, module, multivariate, params} as FunctionExpressionReference, parserMessages];
      } else {
        return [remaining, {type, dataTypeRef, refName, module, multivariate, params} as FunctionExpressionReference, parserMessages];
      }
    } else {
      return [remaining, undefined, undefined];
    }
  }
}
