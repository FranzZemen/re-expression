import { LoggerAdapter } from '@franzzemen/app-utility';
import { logErrorAndThrow } from '@franzzemen/app-utility/enhanced-error.js';
import { EndConditionType, isFragment, PsMsgType, RecursiveGroupingParser } from '@franzzemen/re-common';
import { StandardDataType } from '@franzzemen/re-data-type';
import { StandardExpressionType } from '../expression.js';
import { FormulaOperator, formulaOperators } from '../expression/formula-expression.js';
import { ExPsStdMsg } from '../parser-messages/ex-ps-std-msg.js';
import { ExpressionScope } from '../scope/expression-scope.js';
import { ExpressionHintKey } from '../util/expression-hint-key.js';
import { ExpressionParser } from './expression-parser.js';
class FragmentParserAdapter {
    parse(fragment, scope, ec) {
        const log = new LoggerAdapter(ec, 're-expression', 'formula-expression-parser', `${FragmentParserAdapter.name}.parse`);
        const parser = scope.get(ExpressionScope.ExpressionStackParser);
        let [remaining, expression] = parser.parse(fragment, scope, {}, ec);
        if (expression.dataTypeRef && !(StandardDataType.Number || StandardDataType.Float)) {
            logErrorAndThrow(`A fragment expression in a Logical Expression needs to be of type Boolean, not ${expression.dataTypeRef}`, log, ec);
        }
        return [remaining, expression, undefined];
    }
}
export class FormulaExpressionParser extends ExpressionParser {
    constructor() {
        super(StandardExpressionType.Formula);
    }
    static determineDataType(grouping, scope, ec) {
        if (isFragment(grouping)) {
            if (grouping.reference.dataTypeRef === StandardDataType.Float || grouping.reference.dataTypeRef === StandardDataType.Number) {
                return grouping.reference.dataTypeRef;
            }
            else if (grouping.reference.dataTypeRef === StandardDataType.Unknown && scope.get(ExpressionScope.AllowUnknownDataType) === true) {
                return grouping.reference.dataTypeRef;
            }
            else {
                const log = new LoggerAdapter(ec, 're-expression', 'formula-expression-parser', 'determineDataType');
                logErrorAndThrow(`Data type ${grouping.reference.dataTypeRef} is not ${StandardDataType.Float} or ${StandardDataType.Number}, nor is it both ${StandardDataType.Unknown} and allowUnknownDataType option set`);
            }
        }
        else {
            const hasUnknownDataType = grouping.group.some(groupItem => isFragment(groupItem) && groupItem.reference.dataTypeRef === StandardDataType.Unknown);
            if (hasUnknownDataType) {
                return StandardDataType.Unknown;
            }
            const hasFloatDataType = grouping.group.some(groupItem => isFragment(groupItem) && groupItem.reference.dataTypeRef === StandardDataType.Float);
            if (hasFloatDataType) {
                return StandardDataType.Float;
            }
            for (let subGroup of grouping.group) {
                const subGroupDataType = this.determineDataType(subGroup, scope, ec);
                if (subGroupDataType === StandardDataType.Float) {
                    return subGroupDataType;
                }
            }
            return StandardDataType.Number;
        }
    }
    parse(remaining, scope, hints, ec) {
        const log = new LoggerAdapter(ec, 're-expression', 'formula-expression-parser', `${FormulaExpressionParser.name}.parse`);
        remaining = remaining.trim();
        let type = hints.get(ExpressionHintKey.Type);
        if (type && type !== StandardExpressionType.Formula) {
            return [remaining, undefined, undefined];
        }
        let dataTypeRef = hints.get(ExpressionHintKey.DataType);
        if (dataTypeRef) {
            if (dataTypeRef === StandardDataType.Unknown) {
                if (scope.get(ExpressionScope.AllowUnknownDataType) !== true) {
                    return [remaining, undefined, undefined];
                }
            }
            else if (dataTypeRef !== StandardDataType.Number && dataTypeRef !== StandardDataType.Float) {
                return [remaining, undefined, undefined];
            }
        }
        else {
            dataTypeRef = StandardDataType.Indeterminate;
        }
        let nameMayBePresent = false;
        let result;
        if (type) {
            result = /^#?([a-zA-Z]+[a-zA-Z0-9]*)(\[[^]+]([\s\t\r\n\v\f\u2028\u2029][^]*$|$))/.exec(remaining);
            if (result === null) {
                result = /^#?([a-zA-Z]+[a-zA-Z0-9]*)([\s\t\r\n\v\f\u2028\u2029]+[^]*$|$)/.exec(remaining);
            }
            if (result) {
                nameMayBePresent = true;
            }
            else {
                result = /^#?(\[[^]*])(([\s\t\r\n\v\f\u2028\u2029]+[^]*$)|$)/.exec(remaining);
            }
        }
        else {
            result = /^#([a-zA-Z]+[a-zA-Z0-9]*)(\[[^]+]([\s\t\r\n\v\f\u2028\u2029][^]*$|$))/.exec(remaining);
            if (result === null) {
                result = /^#([a-zA-Z]+[a-zA-Z0-9]*)([\s\t\r\n\v\f\u2028\u2029]+[^]*$|$)/.exec(remaining);
            }
            if (result) {
                nameMayBePresent = true;
            }
            else {
                result = /#(\[[^]*])(([\s\t\r\n\v\f\u2028\u2029]+[^]*$)|$)/.exec(remaining);
            }
        }
        let refName;
        let near = remaining;
        if (result !== null) {
            if (nameMayBePresent) {
                refName = result[1];
                remaining = result[2].trim();
            }
            else {
                remaining = (result[1] + result[2]).trim();
            }
        }
        else {
            return [remaining, undefined, undefined];
        }
        if (remaining.startsWith('[')) {
            remaining = remaining.substring(1);
        }
        else {
            return [remaining, undefined, undefined];
        }
        const recursiveParser = new RecursiveGroupingParser(new FragmentParserAdapter());
        let grouping;
        let endCondition;
        [remaining, grouping, endCondition] = recursiveParser.parse(remaining, scope, formulaOperators, FormulaOperator.Add, [/^][^]*$/], undefined, ec);
        if (endCondition === EndConditionType.GroupingEnd) {
            remaining = remaining.substring(1);
        }
        else {
            return [near, undefined, undefined];
        }
        if (!type) {
            type = StandardExpressionType.Formula;
        }
        if (dataTypeRef === StandardDataType.Indeterminate || dataTypeRef === StandardDataType.Unknown) {
            const determinedDataTypeRef = FormulaExpressionParser.determineDataType(grouping, scope, ec);
            if (determinedDataTypeRef === StandardDataType.Unknown) {
                if (scope.get(ExpressionScope.AllowUnknownDataType) === true) {
                    dataTypeRef = StandardDataType.Unknown;
                }
                else {
                    return [near, undefined, [{ message: ExPsStdMsg.ImproperUsageOfUnknown, type: PsMsgType.Error }]];
                }
            }
            else {
                dataTypeRef = determinedDataTypeRef;
            }
        }
        if (grouping) {
            const instance = {
                refName,
                dataTypeRef,
                type,
                multivariate: true,
                operator: grouping.operator,
                group: grouping.group
            };
            if (refName) {
                const factory = scope.get(ExpressionScope.FormulaExpressionFactory);
                factory.register({ instanceRef: { refName, instance } }, ec);
            }
            return [remaining, instance, undefined];
        }
        else {
            return [remaining, undefined, undefined];
        }
    }
}
//# sourceMappingURL=formula-expression-parser.js.map