import {ExecutionContextI, Hints, LoggerAdapter, ModuleDefinition} from '@franzzemen/app-utility';

import {InferenceStackParser, loadModuleDefinitionFromHints} from '@franzzemen/re-common';
import {isStandardDataType} from '@franzzemen/re-data-type';
import {ExpressionReference, isExpressionType} from '../expression';
import {ExpressionScope} from '../scope/expression-scope';
import {ExpressionHintKey} from '../util/expression-hint-key';
import {ExpressionParser} from './expression-parser';


export interface ExpressionStackParserContext {
  inferredDataType?: string;
  allowUndefinedDataType?: boolean;
}


/**
 * The ExpressionStackParser is a parser that controls the ladder of inference on specific expression parsers and
 * leverages those for further parsing.
 */
export class ExpressionStackParser extends InferenceStackParser<ExpressionParser> {
  constructor() {
    super()
  }
  parse(remaining: string, scope: ExpressionScope, context: ExpressionStackParserContext = undefined, ec?: ExecutionContextI): [string, ExpressionReference] {
    const log = new LoggerAdapter(ec, 'rules-engine', 'expression-stack-parser', 'parse');
    const near = remaining;
    // Get and/or process hints (passed in by caller or parsed in processHints
    let expressionHints: Hints;
    let expressionReference: ExpressionReference;
    [remaining, expressionHints] = ExpressionStackParser.processHints(remaining, scope, context?.inferredDataType, ec);
    const typeStr = expressionHints?.get(ExpressionHintKey.ExpressionType) as string;
    if(typeStr) {
      // If expression type is provided, go directly to the parser in the stack and parse
      const expressionParser = this.parserMap.get(typeStr);
      [remaining, expressionReference] = expressionParser.instanceRef.instance.parse(remaining,scope, expressionHints, context?.allowUndefinedDataType, ec);
    } else {
      // Otherwise, iterate through the stack to the first positive inference parse
      for(let i = 0; i < this.parserInferenceStack.length; i++) {
        const inference = this.parserInferenceStack[i];
        const expressionParser = this.parserMap.get(inference);
        try {
          [remaining, expressionReference] = expressionParser.instanceRef.instance.parse(remaining, scope, expressionHints, context?.allowUndefinedDataType, ec);
        } catch (err) {
          log.warn(`Pre-error data:  remaining: ${remaining}`);
          log.error(err);
          throw err;
        }
        if(expressionReference !== undefined) {
          break;
        }
      }
      if(expressionReference === undefined) {
        // If you reached this point, there is no valid parser for the expression
        const err = new Error(`No valid parser near ${near}`);
        log.error(err);
        throw err;
      }
    }
    // If a data type was declared inline, add it to the reference
    const module: ModuleDefinition = loadModuleDefinitionFromHints(expressionHints, ec, ExpressionHintKey.DataTypeModule, ExpressionHintKey.DataTypeModuleName, ExpressionHintKey.DataTypeFunctionName, ExpressionHintKey.DataTypeConstructorName);
    if(module) {
      expressionReference.dataTypeModule = module;
    }
    return [remaining, expressionReference];
  }

  /**
   *
   * @param remaining
   * @param scope
   * @param dataTypeHint If defined, this is a suggested data type based on context (such as RHS of a condition).  If
   * an actual data-type hint is provided and not equal to this, an error is thrown.
   * @param ec
   */
  static processHints(remaining: string, scope: ExpressionScope, dataTypeHint?: string, ec?: ExecutionContextI): [string, Hints] {
    const log = new LoggerAdapter(ec, 'rules-engine', 'expression-stack-parser', ExpressionStackParser.name + '.parseExpressionHints');
    const near = remaining;
    let typeStr: string, dataTypeRefName: string;
    let expressionHints: Hints;
    [remaining, expressionHints] = Hints.parseHints(remaining, 'ex');
    if(expressionHints) {
      log.debug(expressionHints, 'Found expression hints');
      typeStr = expressionHints.get('type') as string;
      if(typeStr) {
        if(!isExpressionType(typeStr)) {
          // TODO check if it has been loaded if not try to load inline
          // When loading inline, append it to the inference stack as well
          const err = new Error(`Expression type="${typeStr}" is not supported`);
          log.error(err);
          throw err;
        }
      }
      dataTypeRefName = expressionHints.get('data-type') as string;
      if(dataTypeHint && dataTypeRefName && dataTypeHint !== dataTypeRefName) {
        const err = new Error(`Inconsistent suggested data type ${dataTypeHint} and hinted data type ${dataTypeHint}`);
        log.error(err);
        throw err;
      }
      if(!dataTypeRefName && dataTypeHint) {
        log.debug(`No data type hint provided, but suggested data type passed in ${dataTypeHint}, so using that as hint`)
        dataTypeRefName = dataTypeHint;
        // Although no hints were formally provided in the hints clause itself, the fact that we have a dataTypeHint is
        // considered a hint and we are setting back into the hints map for later use by parsers.
        expressionHints.set('data-type', dataTypeHint);
      }
      if (dataTypeRefName) {
        if (!isStandardDataType(dataTypeRefName)) {
          // TODO...inline loading
          if(scope.hasDataType(dataTypeRefName, ec)) {
            // -----
            log.trace('Found and validated expression hint data-type=' + dataTypeRefName + ' (Custom data type)');
            // -----
          } else {
            // Check if data type is dynamically defined in-line
            const module: ModuleDefinition = loadModuleDefinitionFromHints(expressionHints, ec, ExpressionHintKey.DataTypeModule, ExpressionHintKey.DataTypeModuleName, ExpressionHintKey.DataTypeFunctionName, ExpressionHintKey.DataTypeConstructorName);
            if(module) {
              scope.addDataTypes([{refName: dataTypeRefName, module}]);
            } else {
              const error = new Error(`Custom data type ${dataTypeRefName} has no registered module and is not defined inline`);
            }
          }
        }
      }
    }
    return [remaining, expressionHints];
  }
}
