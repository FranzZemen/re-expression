import {ExecutionContextI, Hints, LoggerAdapter, ModuleDefinition, ModuleResolver} from '@franzzemen/app-utility';
import {EnhancedError, logErrorAndReturn, logErrorAndThrow} from '@franzzemen/app-utility/enhanced-error.js';

import {InferenceStackParser, loadModuleDefinitionFromHints, Scope} from '@franzzemen/re-common';
import {DataTypeHintKey, isStandardDataType, StandardDataType} from '@franzzemen/re-data-type';
import {isPromise} from 'util/types';
import {ExpressionReference, isExpressionType} from '../expression.js';
import {ExpressionScope} from '../scope/expression-scope.js';
import {ExpressionHintKey} from '../util/expression-hint-key.js';
import {ExpressionParser, ExpressionParserResult, ResolvedExpressionParserResult} from './expression-parser.js';


export interface ExpressionStackParserContext {
  inferredDataType?: string;
}


/**
 * The ExpressionStackParser is a parser that controls the ladder of inference on specific expression parsers and
 * leverages those for further parsing.
 */
export class ExpressionStackParser extends InferenceStackParser<ExpressionParser> {
  constructor() {
    super();
  }

  /**
   *
   * @param moduleResolver
   * @param remaining
   * @param scope
   * @param dataTypeHint If defined, this is a suggested data type based on context (such as RHS of a condition).  If
   * an actual data-type hint is provided and not equal to this, an error is thrown.
   * @param ec
   */
  static processHints(remaining: string, scope: ExpressionScope, dataTypeHint?: string, ec?: ExecutionContextI): [string, Hints] {
    const log = new LoggerAdapter(ec, 're-expression', 'expression-stack-parser', ExpressionStackParser.name + '.processHints');

    let expressionHints: Hints;
    [remaining, expressionHints] = scope.parseHints(remaining, 'ex', ec);

    let typeStr: string, dataTypeRefName: string;

    if (expressionHints) {
      log.debug(expressionHints, 'Found expression hints');
      typeStr = expressionHints.get(ExpressionHintKey.Type) as string;
      if (typeStr) {
        if (!isExpressionType(typeStr)) {
          // TODO check if it has been loaded if not try to load inline
          // When loading inline, append it to the inference stack as well
          const err = new Error(`Expression type="${typeStr}" is not supported`);
          logErrorAndThrow(err, log, ec);
        }
      }
      dataTypeRefName = expressionHints.get(ExpressionHintKey.DataType) as string;
      if (dataTypeHint && dataTypeRefName && dataTypeHint !== dataTypeRefName) {
        const err = new Error(`Inconsistent suggested data type ${dataTypeHint} and hinted data type ${dataTypeHint}`);
        logErrorAndThrow(err, log, ec);
      }
      if (!dataTypeRefName && dataTypeHint) {
        log.debug(`No data type hint provided, but suggested data type passed in ${dataTypeHint}, so using that as hint`);
        dataTypeRefName = dataTypeHint;
        // Although no hints were formally provided in the hints clause itself, the fact that we have a dataTypeHint is
        // considered a hint and we are setting back into the hints map for later use by parsers.
        expressionHints.set(ExpressionHintKey.DataType, dataTypeHint);
      }
      if (!dataTypeRefName) {
        // TODO Create this data type and how to handle it
        dataTypeRefName = StandardDataType.Unknown;
      }
      if (isStandardDataType(dataTypeRefName)) {
        return [remaining, expressionHints];
      } else {
        // TODO...inline loading
        if (scope.hasDataType(dataTypeRefName, ec)) {
          // -----
          log.trace('Found and validated expression hint data-type=' + dataTypeRefName + ' (Custom data type)');
          return [remaining, expressionHints];
          // -----
        } else {
          // Check if data type is dynamically defined in-line
          const module: ModuleDefinition = loadModuleDefinitionFromHints(expressionHints, ec, ExpressionHintKey.DataTypeModule, ExpressionHintKey.DataTypeModuleName, ExpressionHintKey.DataTypeFunctionName, ExpressionHintKey.DataTypeConstructorName, ExpressionHintKey.DataTypeModuleResolution, ExpressionHintKey.DataTypeLoadSchema);
          if (module) {
            //const override: boolean = expressionHints.has(DataTypeHintKey.DataTypeModuleOverride);
            //const overrideDown: boolean = expressionHints.has(DataTypeHintKey.DataTypeModuleOverrideDown);
            scope.addDataType({moduleRef: {refName: dataTypeRefName, module}});
          } else {
            logErrorAndThrow(new EnhancedError( `No module for `))
          }
          return [remaining, expressionHints];
        }
      }
    }
  }


  parseAndResolve(remaining: string, scope: ExpressionScope, context?: ExpressionStackParserContext, ec?: ExecutionContextI): ResolvedExpressionParserResult {
    let expressionRef: ExpressionReference;
    [remaining, expressionRef] = this.parse(remaining, scope, context, ec);
    const resultOrPromise = Scope.resolve(scope, ec);
    if(isPromise(resultOrPromise)) {
      const promise =  resultOrPromise
        .then(truVal => {
          return expressionRef;
        })
      return [remaining, promise];
    } else {
      return [remaining, expressionRef];
    }
  }

  parse(remaining: string, scope: ExpressionScope, context: ExpressionStackParserContext = undefined, ec?: ExecutionContextI): ExpressionParserResult {
    const log = new LoggerAdapter(ec, 're-expression', 'expression-stack-parser', 'parse');
    remaining = remaining.trim();
    const near = remaining;
    // Get and/or process hints (passed in by caller or parsed in processHints
    let expressionHints: Hints;
    [remaining, expressionHints] = ExpressionStackParser.processHints(remaining, scope, context?.inferredDataType, ec);

    const typeStr = expressionHints?.get(ExpressionHintKey.Type) as string;
    let expressionReference: ExpressionReference;
    if (typeStr) {
      // If expression type is provided, go directly to the parser in the stack and parse
      const expressionParser = this.parserMap.get(typeStr);
      const parserResult: ExpressionParserResult = expressionParser.instanceRef.instance.parse(remaining, scope, expressionHints, ec);


      [remaining, expressionReference] = [...parserResult];
      // If a data type was declared inline, add it to the reference (in hints processing it was already aded to resolver
      const module: ModuleDefinition = loadModuleDefinitionFromHints(expressionHints, ec, ExpressionHintKey.DataTypeModule, ExpressionHintKey.DataTypeModuleName, ExpressionHintKey.DataTypeFunctionName, ExpressionHintKey.DataTypeConstructorName);
      if (module) {
        expressionReference.dataTypeModule = module;
      }
      return [remaining, expressionReference];
    } else {
      // Otherwise, iterate through the stack to the first positive inference parse
      const parseResults: ExpressionParserResult[] = [];
      let asyncProcessing = false;
      for (let i = 0; i < this.parserInferenceStack.length; i++) {
        const inference = this.parserInferenceStack[i];
        const expressionParser = this.parserMap.get(inference);
        const parseResult: ExpressionParserResult = expressionParser.instanceRef.instance.parse(remaining, scope, expressionHints, ec);
        parseResults.push(parseResult);
      }
      // The first expression is the result.
      const found = parseResults.find(result => result[1] !== undefined);
      if (found) {
        [remaining, expressionReference] = [...found];
        // If a data type was declared inline, add it to the reference
        const module: ModuleDefinition = loadModuleDefinitionFromHints(expressionHints, ec, ExpressionHintKey.DataTypeModule, ExpressionHintKey.DataTypeModuleName, ExpressionHintKey.DataTypeFunctionName, ExpressionHintKey.DataTypeConstructorName);
        if (module) {
          expressionReference.dataTypeModule = module;
        }
        return [remaining, expressionReference];
      } else {
        // If you reached this point, there is no valid parser for the expression
        const err = new Error(`No valid parser near ${near}`);
        logErrorAndThrow(err, log, ec);
      }
    }
  }
}
