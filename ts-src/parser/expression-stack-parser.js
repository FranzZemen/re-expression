import { LoggerAdapter } from '@franzzemen/app-utility';
import { EnhancedError, logErrorAndThrow } from '@franzzemen/app-utility/enhanced-error.js';
import { InferenceStackParser, loadModuleDefinitionFromHints, PsMsgType, Scope } from '@franzzemen/re-common';
import { isStandardDataType, StandardDataType } from '@franzzemen/re-data-type';
import { isPromise } from 'util/types';
import { isExpressionType } from '../expression.js';
import { ExpressionHintKey } from '../util/expression-hint-key.js';
export class ExpressionStackParser extends InferenceStackParser {
    constructor() {
        super();
    }
    static processHints(remaining, scope, dataTypeHint, ec) {
        const log = new LoggerAdapter(ec, 're-expression', 'expression-stack-parser', ExpressionStackParser.name + '.processHints');
        if (dataTypeHint === StandardDataType.Unknown || dataTypeHint === StandardDataType.Indeterminate) {
            dataTypeHint = undefined;
        }
        let expressionHints;
        [remaining, expressionHints] = scope.parseHints(remaining, 'ex', ec);
        let typeStr, dataTypeRefName;
        if (expressionHints) {
            log.debug(expressionHints, 'Found expression hints');
            typeStr = expressionHints.get(ExpressionHintKey.Type);
            if (typeStr) {
                if (!isExpressionType(typeStr)) {
                    const err = new Error(`Expression type="${typeStr}" is not supported`);
                    logErrorAndThrow(err, log, ec);
                }
            }
            dataTypeRefName = expressionHints.get(ExpressionHintKey.DataType);
            if (dataTypeRefName) {
                if (dataTypeHint && dataTypeHint !== dataTypeRefName) {
                    const err = new Error(`Inconsistent suggested data type ${dataTypeHint} and hinted data type ${dataTypeHint}`);
                    logErrorAndThrow(err, log, ec);
                }
            }
            else if (dataTypeHint) {
                dataTypeRefName = dataTypeHint;
                expressionHints.set(ExpressionHintKey.DataType, dataTypeHint);
            }
            else {
                dataTypeRefName = StandardDataType.Indeterminate;
            }
            if (isStandardDataType(dataTypeRefName)) {
                return [remaining, expressionHints];
            }
            else {
                if (scope.hasDataType(dataTypeRefName, ec)) {
                    return [remaining, expressionHints];
                }
                else {
                    const module = loadModuleDefinitionFromHints(expressionHints, ec, ExpressionHintKey.DataTypeModule, ExpressionHintKey.DataTypeModuleName, ExpressionHintKey.DataTypeFunctionName, ExpressionHintKey.DataTypeConstructorName, ExpressionHintKey.DataTypeModuleResolution, ExpressionHintKey.DataTypeLoadSchema);
                    if (module) {
                        scope.addDataType({ moduleRef: { refName: dataTypeRefName, module } });
                    }
                    else {
                        logErrorAndThrow(new EnhancedError(`No module for ${dataTypeRefName}`));
                    }
                    return [remaining, expressionHints];
                }
            }
        }
    }
    parseAndResolve(remaining, scope, context, ec) {
        let expressionRef;
        [remaining, expressionRef] = this.parse(remaining, scope, context, ec);
        const resultOrPromise = Scope.resolve(scope, ec);
        if (isPromise(resultOrPromise)) {
            const promise = resultOrPromise
                .then(truVal => {
                return expressionRef;
            });
            return [remaining, promise, undefined];
        }
        else {
            return [remaining, expressionRef, undefined];
        }
    }
    parse(remaining, scope, context = undefined, ec) {
        const log = new LoggerAdapter(ec, 're-expression', 'expression-stack-parser', 'parse');
        remaining = remaining.trim();
        const near = remaining;
        let expressionHints;
        [remaining, expressionHints] = ExpressionStackParser.processHints(remaining, scope, context?.inferredDataType, ec);
        const typeStr = expressionHints?.get(ExpressionHintKey.Type);
        let expressionReference;
        if (typeStr) {
            const expressionParser = this.parserMap.get(typeStr);
            const parserResult = expressionParser.instanceRef.instance.parse(remaining, scope, expressionHints, ec);
            [remaining, expressionReference] = [...parserResult];
            const module = loadModuleDefinitionFromHints(expressionHints, ec, ExpressionHintKey.DataTypeModule, ExpressionHintKey.DataTypeModuleName, ExpressionHintKey.DataTypeFunctionName, ExpressionHintKey.DataTypeConstructorName);
            if (module) {
                expressionReference.dataTypeModule = module;
            }
            return [remaining, expressionReference, undefined];
        }
        else {
            const parseResults = [];
            let asyncProcessing = false;
            for (let i = 0; i < this.parserInferenceStack.length; i++) {
                const inference = this.parserInferenceStack[i];
                const expressionParser = this.parserMap.get(inference);
                const parseResult = expressionParser.instanceRef.instance.parse(remaining, scope, expressionHints, ec);
                parseResults.push(parseResult);
            }
            const found = parseResults.find(result => result[1] !== undefined);
            if (found) {
                [remaining, expressionReference] = [...found];
                const module = loadModuleDefinitionFromHints(expressionHints, ec, ExpressionHintKey.DataTypeModule, ExpressionHintKey.DataTypeModuleName, ExpressionHintKey.DataTypeFunctionName, ExpressionHintKey.DataTypeConstructorName);
                if (module) {
                    expressionReference.dataTypeModule = module;
                }
                return [remaining, expressionReference, undefined];
            }
            else {
                return [undefined, undefined, [{ message: `No valid parser near ${near}`, type: PsMsgType.Error }]];
            }
        }
    }
}
//# sourceMappingURL=expression-stack-parser.js.map