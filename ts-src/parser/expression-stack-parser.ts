import {ExecutionContextI, Hints, LoggerAdapter, ModuleDefinition} from '@franzzemen/app-utility';
import {logErrorAndThrow} from '@franzzemen/app-utility/enhanced-error.js';

import {InferenceStackParser, loadModuleDefinitionFromHints} from '@franzzemen/re-common';
import {isStandardDataType} from '@franzzemen/re-data-type';
import {isPromise} from 'util/types';
import {ExpressionReference, isExpressionType} from '../expression.js';
import {ExpressionScope} from '../scope/expression-scope.js';
import {ExpressionHintKey} from '../util/expression-hint-key.js';
import {ExpressionParser} from './expression-parser.js';


export type ExpressionParseResult = [string, ExpressionReference];


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
    super();
  }

  /**
   *
   * @param remaining
   * @param scope
   * @param dataTypeHint If defined, this is a suggested data type based on context (such as RHS of a condition).  If
   * an actual data-type hint is provided and not equal to this, an error is thrown.
   * @param ec
   */
  static processHints(remaining: string, scope: ExpressionScope, dataTypeHint?: string, ec?: ExecutionContextI): [string, Hints] | Promise<[string, Hints]> {
    const log = new LoggerAdapter(ec, 're-expression', 'expression-stack-parser', ExpressionStackParser.name + '.processHints');
    let typeStr: string, dataTypeRefName: string;
    let expressionHints: Hints;

    const parsed: [string, Hints] | Promise<[string, Hints]> = Hints.parseHints(remaining, 'ex');
    if (isPromise(parsed)) {
      return parsed
        .then(result => {
          remaining = result[0];
          const expressionHints = result[1];
          return this._processHintsBody(expressionHints, remaining, scope, dataTypeHint, ec);
        });
    } else {
      // Note that although we are processing synchronously here, the return value can still be a promise (for example
      // If its loading a data type that is defined in an es module.
      return this._processHintsBody(parsed[1], parsed[0], scope, dataTypeHint, ec);
    }
  }

  private static _processHintsBody(expressionHints: Hints, remaining: string, scope: ExpressionScope, dataTypeHint?: string, ec?: ExecutionContextI): [string, Hints] | Promise<[string, Hints]> {
    const log = new LoggerAdapter(ec, 're-expression', 'expression-stack-parser', ExpressionStackParser.name + '._processHintsBody');
    let typeStr: string, dataTypeRefName: string;

    if (expressionHints) {
      log.debug(expressionHints, 'Found expression hints');
      typeStr = expressionHints.get('type') as string;
      if (typeStr) {
        if (!isExpressionType(typeStr)) {
          // TODO check if it has been loaded if not try to load inline
          // When loading inline, append it to the inference stack as well
          const err = new Error(`Expression type="${typeStr}" is not supported`);
          logErrorAndThrow(err, log, ec);
        }
      }
      dataTypeRefName = expressionHints.get('data-type') as string;
      if (dataTypeHint && dataTypeRefName && dataTypeHint !== dataTypeRefName) {
        const err = new Error(`Inconsistent suggested data type ${dataTypeHint} and hinted data type ${dataTypeHint}`);
        logErrorAndThrow(err, log, ec);
      }
      if (!dataTypeRefName && dataTypeHint) {
        log.debug(`No data type hint provided, but suggested data type passed in ${dataTypeHint}, so using that as hint`);
        dataTypeRefName = dataTypeHint;
        // Although no hints were formally provided in the hints clause itself, the fact that we have a dataTypeHint is
        // considered a hint and we are setting back into the hints map for later use by parsers.
        expressionHints.set('data-type', dataTypeHint);
      }
      if (dataTypeRefName) {
        if (!isStandardDataType(dataTypeRefName)) {
          // TODO...inline loading
          if (scope.hasDataType(dataTypeRefName, ec)) {
            // -----
            log.trace('Found and validated expression hint data-type=' + dataTypeRefName + ' (Custom data type)');
            // -----
          } else {
            // Check if data type is dynamically defined in-line
            const module: ModuleDefinition = loadModuleDefinitionFromHints(expressionHints, ec, ExpressionHintKey.DataTypeModule, ExpressionHintKey.DataTypeModuleName, ExpressionHintKey.DataTypeFunctionName, ExpressionHintKey.DataTypeConstructorName);
            if (module) {
              const result = scope.addDataTypes([{refName: dataTypeRefName, module}]);
              if (isPromise(result)) {
                return result
                  .then(() => {
                    return [remaining, expressionHints];
                  });
              } else {
                return [remaining, expressionHints];
              }
            } else {
              const error = new Error(`Custom data type ${dataTypeRefName} has no registered module and is not defined inline`);
            }
          }
        } else {
          return [remaining, expressionHints];
        }
      } else {
        return [remaining, expressionHints];
      }
    } else {
      return [remaining, expressionHints];
    }
  }

  parse(remaining: string, scope: ExpressionScope, context: ExpressionStackParserContext = undefined, ec?: ExecutionContextI): [string, ExpressionReference] | Promise<[string, ExpressionReference]> {
    const log = new LoggerAdapter(ec, 're-expression', 'expression-stack-parser', 'parse');
    const near = remaining;
    // Get and/or process hints (passed in by caller or parsed in processHints
    let expressionHints: Hints;
    let expressionReference: ExpressionReference;
    const result = ExpressionStackParser.processHints(remaining, scope, context?.inferredDataType, ec);
    if (isPromise(result)) {
      return result
        .then((tuple: [string, Hints]) => {
          return this._parseBody(tuple[0], tuple[1], near, scope, context, ec);
        });
    } else {
      return this._parseBody(result[0], result[1], near, scope, context, ec);
    }
  }

  private _parseBody(remaining: string, expressionHints: Hints, near: string, scope: ExpressionScope, context: ExpressionStackParserContext = undefined, ec?: ExecutionContextI): [string, ExpressionReference] | Promise<[string, ExpressionReference]> {
    const log = new LoggerAdapter(ec, 're-expression', 'expression-stack-parser', '_parseBody');
    let expressionReference: ExpressionReference;
    const typeStr = expressionHints?.get(ExpressionHintKey.ExpressionType) as string;
    if (typeStr) {
      // If expression type is provided, go directly to the parser in the stack and parse
      const expressionParser = this.parserMap.get(typeStr);
      const resultOrPromise = expressionParser.instanceRef.instance.parse(remaining, scope, expressionHints, context?.allowUndefinedDataType, ec);
      if (isPromise(resultOrPromise)) {
        return resultOrPromise
          .then(result => {
            [remaining, expressionReference] = result;
            // If a data type was declared inline, add it to the reference
            const module: ModuleDefinition = loadModuleDefinitionFromHints(expressionHints, ec, ExpressionHintKey.DataTypeModule, ExpressionHintKey.DataTypeModuleName, ExpressionHintKey.DataTypeFunctionName, ExpressionHintKey.DataTypeConstructorName);
            if (module) {
              expressionReference.dataTypeModule = module;
            }
            return [remaining, expressionReference];
          });
      } else {
        [remaining, expressionReference] = resultOrPromise;
        // If a data type was declared inline, add it to the reference
        const module: ModuleDefinition = loadModuleDefinitionFromHints(expressionHints, ec, ExpressionHintKey.DataTypeModule, ExpressionHintKey.DataTypeModuleName, ExpressionHintKey.DataTypeFunctionName, ExpressionHintKey.DataTypeConstructorName);
        if (module) {
          expressionReference.dataTypeModule = module;
        }
        return [remaining, expressionReference];
      }
    } else {
      // Otherwise, iterate through the stack to the first positive inference parse
      const resultsOrPromises: ([string, ExpressionReference] | Promise<[string, ExpressionReference]>)[] = [];
      let asyncProcessing = false;
      for (let i = 0; i < this.parserInferenceStack.length; i++) {
        const inference = this.parserInferenceStack[i];
        const expressionParser = this.parserMap.get(inference);
        const resultOrPromise = expressionParser.instanceRef.instance.parse(remaining, scope, expressionHints, context?.allowUndefinedDataType, ec);
        if (isPromise(resultOrPromise)) {
          asyncProcessing = true;
        }
        resultsOrPromises.push(resultOrPromise);
      }
      if (asyncProcessing) {
        return Promise.all(resultsOrPromises)
          .then(results => {
            const found = results.find(result => result[1]);
            if (found) {
              expressionReference = found[1] as unknown as ExpressionReference;
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
          });
      } else {
        // The first expression is the result.
        const found = resultsOrPromises.find(result => {
          // Guaranteed not async
          const syncResult = result as unknown as [string, ExpressionReference];
          if (syncResult[1]) {
            return true;
          }
        });
        if (found) {
          expressionReference = found[1] as unknown as ExpressionReference;
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
}
