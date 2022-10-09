import { LoggerAdapter } from '@franzzemen/app-utility';
import { logErrorAndThrow } from '@franzzemen/app-utility/enhanced-error.js';
import { PsMsgType, pushMessages } from '@franzzemen/re-common';
import { StandardDataType } from '@franzzemen/re-data-type';
import { ExPsStdMsg } from '../parser-messages/ex-ps-std-msg.js';
import { ExpressionScope } from '../scope/expression-scope.js';
import { ExpressionHintKey } from '../util/expression-hint-key.js';
import { ExpressionParser } from './expression-parser.js';
export var MultivariateDataTypeHandling;
(function (MultivariateDataTypeHandling) {
    MultivariateDataTypeHandling["Consistent"] = "Consistent";
    MultivariateDataTypeHandling["Multivariate"] = "Multivariate";
})(MultivariateDataTypeHandling || (MultivariateDataTypeHandling = {}));
export class MultivariateParser extends ExpressionParser {
    constructor(expressionType) {
        super(expressionType);
    }
    parseMultivariate(remaining, scope, hints, ec) {
        const log = new LoggerAdapter(ec, 're-expression', 'multivariate-parser', 'parse');
        const original = remaining;
        let parseMessages = [];
        const type = hints.get(ExpressionHintKey.Type);
        if (type && this.refName !== type) {
            return [original, undefined, undefined, parseMessages];
        }
        let dataTypeHandling = hints.get(ExpressionHintKey.MultivariateDataTypeHandling);
        if (!dataTypeHandling) {
            dataTypeHandling = MultivariateDataTypeHandling.Consistent;
        }
        let innerRemaining = remaining;
        if (innerRemaining.startsWith('[')) {
            innerRemaining = innerRemaining.substring(1).trim();
            let multivariateDataTypeRef = hints.get(ExpressionHintKey.DataType);
            if (multivariateDataTypeRef) {
                if (dataTypeHandling === MultivariateDataTypeHandling.Multivariate) {
                    if (multivariateDataTypeRef !== StandardDataType.Multivariate) {
                        parseMessages.push({
                            message: `${ExPsStdMsg.MultivariateInconsistentDataType} near "${original}"`,
                            contextObject: { multivariateDataTypeRef, dataTypeHandling },
                            type: PsMsgType.Warn
                        });
                        multivariateDataTypeRef = StandardDataType.Multivariate;
                    }
                }
                else {
                    if (multivariateDataTypeRef === StandardDataType.Multivariate) {
                        parseMessages.push({
                            message: `${ExPsStdMsg.MultivariateInconsistentHandling} near "${original}"`,
                            contextObject: { multivariateDataTypeRef, dataTypeHandling },
                            type: PsMsgType.Warn
                        });
                        multivariateDataTypeRef = StandardDataType.Indeterminate;
                    }
                    else if (multivariateDataTypeRef === StandardDataType.Unknown && scope.get(ExpressionScope.AllowUnknownDataType) !== true) {
                        return [original, undefined, undefined, pushMessages(parseMessages, {
                                message: `${ExPsStdMsg.ImproperUsageOfUnknown} near "${original}"`,
                                type: PsMsgType.Error
                            })];
                    }
                }
            }
            else if (dataTypeHandling === MultivariateDataTypeHandling.Multivariate) {
                multivariateDataTypeRef = StandardDataType.Multivariate;
            }
            else {
                multivariateDataTypeRef = StandardDataType.Indeterminate;
            }
            let innerExpressionReference;
            let endOfSet = false;
            const stackParser = scope.get(ExpressionScope.ExpressionStackParser);
            const candidates = [];
            do {
                if (innerRemaining.indexOf(']') < 0) {
                    return [original, undefined, undefined, pushMessages(parseMessages, {
                            message: `${ExPsStdMsg.NoEndOfMultivariateDetected} near "${innerRemaining}"`,
                            type: PsMsgType.Error
                        })];
                }
                innerExpressionReference = undefined;
                const removeCommaResult = /^([\s\t\r\n\v\f\u2028\u2029),]*)([^]*)$/.exec(innerRemaining);
                if (removeCommaResult) {
                    innerRemaining = removeCommaResult[2].trim();
                }
                if (innerRemaining.startsWith(']')) {
                    endOfSet = true;
                    innerRemaining = innerRemaining.substring(1).trim();
                }
                else {
                    let context;
                    if (dataTypeHandling == MultivariateDataTypeHandling.Consistent) {
                        context = { inferredDataType: multivariateDataTypeRef };
                    }
                    const candidate = {
                        near: innerRemaining,
                        parseResult: stackParser.parse(innerRemaining, scope, context, ec)
                    };
                    candidates.push(candidate);
                    innerRemaining = candidate.parseResult[0];
                }
            } while (!endOfSet);
            if (candidates.length === 0) {
                if (multivariateDataTypeRef === StandardDataType.Indeterminate) {
                    return [original, undefined, undefined, pushMessages(parseMessages, {
                            message: `${ExPsStdMsg.IndeterminateDataType} for empty multivariate`,
                            type: PsMsgType.Error
                        })];
                }
                else if (multivariateDataTypeRef === StandardDataType.Unknown && scope.get(ExpressionScope.AllowUnknownDataType) !== true) {
                    return [original, undefined, undefined, pushMessages(parseMessages, {
                            message: `${ExPsStdMsg.ImproperUsageOfUnknown} near "${original}"`,
                            type: PsMsgType.Error
                        })];
                }
                else {
                    return [innerRemaining.trim(), {
                            type: this.refName,
                            dataTypeRef: multivariateDataTypeRef,
                            multivariate: true
                        }, []];
                }
            }
            else {
                let innerExpressions = [];
                candidates.forEach(candidate => {
                    const innerExpression = candidate.parseResult[1];
                    if (!innerExpression) {
                        parseMessages.push({
                            message: `Unable to parse inner expression near ${candidate.near}`,
                            type: PsMsgType.Error
                        });
                        const inner = candidate.parseResult[2];
                        if (inner) {
                            parseMessages = parseMessages.concat(inner);
                            return [original, undefined, undefined, parseMessages];
                        }
                    }
                    else {
                        innerExpressions.push(innerExpression);
                    }
                });
                if (dataTypeHandling === MultivariateDataTypeHandling.Consistent) {
                    if (multivariateDataTypeRef !== StandardDataType.Unknown && multivariateDataTypeRef !== StandardDataType.Indeterminate) {
                        innerExpressions.forEach(innerExpression => {
                            if (innerExpression.dataTypeRef === StandardDataType.Unknown || innerExpression.dataTypeRef === StandardDataType.Indeterminate) {
                                innerExpression.dataTypeRef === multivariateDataTypeRef;
                            }
                        });
                    }
                    let innerDataType;
                    const same = innerExpressions.every(innerExpression => {
                        if (innerExpression.dataTypeRef !== StandardDataType.Unknown && innerExpression.dataTypeRef !== StandardDataType.Indeterminate) {
                            if (innerDataType && innerDataType !== innerExpression.dataTypeRef) {
                                log.warn({
                                    innerExpression,
                                    innerDataType
                                }, 'Inconsistent inner expression data types for consistent data type handling');
                                logErrorAndThrow('Inconsistent inner expression data types for consistent data type handling', log, ec);
                            }
                            else {
                                innerDataType = innerExpression.dataTypeRef;
                                return true;
                            }
                        }
                        else {
                            return true;
                        }
                    });
                    if (same) {
                        if (innerDataType && multivariateDataTypeRef === StandardDataType.Unknown || multivariateDataTypeRef === StandardDataType.Indeterminate) {
                            multivariateDataTypeRef = innerDataType;
                        }
                        else if (innerDataType && innerDataType !== multivariateDataTypeRef) {
                            return [original, undefined, undefined, pushMessages(parseMessages, {
                                    message: `${ExPsStdMsg.MultivariateInconsistentInnerDataType} near "${original}"`,
                                    type: PsMsgType.Error
                                })];
                        }
                        innerExpressions.filter(innerExpression => innerExpression.dataTypeRef === StandardDataType.Indeterminate || innerExpression.dataTypeRef === StandardDataType.Unknown)
                            .forEach(inner => inner.dataTypeRef = innerDataType);
                    }
                }
                else {
                    innerExpressions.every(innerExpression => {
                        if (innerExpression.dataTypeRef === StandardDataType.Indeterminate) {
                            return [original, undefined, undefined, pushMessages(parseMessages, {
                                    message: `${ExPsStdMsg.IndeterminateDataType} for inner expression data type near ${original}`,
                                    type: PsMsgType.Error
                                })];
                        }
                        else if (innerExpression.dataTypeRef === StandardDataType.Unknown && scope.get(ExpressionScope.AllowUnknownDataType) !== true) {
                            return [original, undefined, undefined, pushMessages(parseMessages, {
                                    message: `${ExPsStdMsg.ImproperUsageOfUnknown} for inner expressoin data type near ${original}`,
                                    type: PsMsgType.Error
                                })];
                        }
                    });
                }
                return [innerRemaining.trim(), {
                        type: this.refName,
                        dataTypeRef: multivariateDataTypeRef,
                        multivariate: true
                    }, innerExpressions, parseMessages];
            }
        }
        else {
            return [original, undefined, undefined, parseMessages];
        }
    }
}
//# sourceMappingURL=multivariate-parser.js.map