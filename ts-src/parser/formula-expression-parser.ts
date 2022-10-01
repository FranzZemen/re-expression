import {ExecutionContextI, Hints, LoggerAdapter} from '@franzzemen/app-utility';
import {logErrorAndThrow} from '@franzzemen/app-utility/enhanced-error.js';
import {
  EndConditionType,
  FragmentOrGrouping,
  FragmentParser,
  isFragment, ParserMessages, PsMsgType,
  RecursiveGrouping,
  RecursiveGroupingParser
} from '@franzzemen/re-common';
import {StandardDataType} from '@franzzemen/re-data-type';
import {ExpressionReference, ExpressionType} from '../expression.js';
import {FormulaExpressionReference, FormulaOperator, formulaOperators} from '../expression/formula-expression.js';
import {FormulaExpressionFactory} from '../factory/formula-expression-factory.js';
import {ExPsStdMsg} from '../parser-messages/ex-ps-std-msg.js';
import {ExpressionScope} from '../scope/expression-scope.js';
import {ExpressionHintKey} from '../util/expression-hint-key.js';
import {ExpressionParser} from './expression-parser.js';
import {ExpressionStackParser} from './expression-stack-parser.js';


class FragmentParserAdapter implements FragmentParser<ExpressionReference> {
  parse(fragment: string, scope: ExpressionScope, ec?: ExecutionContextI): [string, ExpressionReference, ParserMessages] {
    const log = new LoggerAdapter(ec, 're-expression', 'formula-expression-parser', `${FragmentParserAdapter.name}.parse`);
    const parser = scope.get(ExpressionScope.ExpressionStackParser) as ExpressionStackParser;
    let [remaining, expression] = parser.parse(fragment, scope, {}, ec);
    // TODO:  Allow Unknown data types?
    if (expression.dataTypeRef && !(StandardDataType.Number || StandardDataType.Float)) {
      logErrorAndThrow(`A fragment expression in a Logical Expression needs to be of type Boolean, not ${expression.dataTypeRef}`, log, ec);
    }
    return [remaining, expression, undefined];
  }
}


export class FormulaExpressionParser extends ExpressionParser {
  constructor() {
    super(ExpressionType.Formula);
  }

  private static determineDataType(grouping: FragmentOrGrouping<FormulaOperator, ExpressionReference>, scope: ExpressionScope, ec?: ExecutionContextI): StandardDataType.Float | StandardDataType.Number | StandardDataType.Unknown {
    // let currDataTypeRef: StandardDataType.Number | StandardDataType.Float = StandardDataType.Number;
    if (isFragment(grouping)) {
      if (grouping.reference.dataTypeRef === StandardDataType.Float || grouping.reference.dataTypeRef === StandardDataType.Number) {
        return grouping.reference.dataTypeRef;
      } else if (grouping.reference.dataTypeRef === StandardDataType.Unknown && scope.get(ExpressionScope.AllowUnknownDataType) === true) {
        return grouping.reference.dataTypeRef;
      } else {
        const log = new LoggerAdapter(ec, 're-expression', 'formula-expression-parser', 'determineDataType');
        logErrorAndThrow(`Data type ${grouping.reference.dataTypeRef} is not ${StandardDataType.Float} or ${StandardDataType.Number}, nor is it both ${StandardDataType.Unknown} and allowUnknownDataType option set`);
      }
    } else {
      // Stop when you find an Unknown
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
      // No floats found
      return StandardDataType.Number;
    }
  }

  parse(remaining: string, scope: ExpressionScope, hints: Hints, ec?: ExecutionContextI): [string, FormulaExpressionReference, ParserMessages] {
    const log = new LoggerAdapter(ec, 're-expression', 'formula-expression-parser', `${FormulaExpressionParser.name}.parse`);
    remaining = remaining.trim();
    let type = hints.get(ExpressionHintKey.Type) as string;
    if (type && type !== ExpressionType.Formula) {
      return [remaining, undefined, undefined];
    }
    let dataTypeRef = hints.get(ExpressionHintKey.DataType) as string;
    if(dataTypeRef) {
      if (dataTypeRef === StandardDataType.Unknown) {
        if (scope.get(ExpressionScope.AllowUnknownDataType) !== true) {
          return [remaining, undefined, undefined];
        }
      } else if (dataTypeRef !== StandardDataType.Number && dataTypeRef !== StandardDataType.Float) {
        return [remaining, undefined, undefined];
      }
    } else {
      dataTypeRef = StandardDataType.Indeterminate;
    }

    let nameMayBePresent = false;

    let result;
    if (type) {
      // # optional due to type, name present, spaces optional, opening bracket, body (anything) and closing square bracket (which is not guaranteed to be part of it.
      result = /^#?([a-zA-Z]+[a-zA-Z0-9]*)(\[[^]+]([\s\t\r\n\v\f\u2028\u2029][^]*$|$))/.exec(remaining);
      if (result === null) {
        // # optional due to type, name present, at least one space, anything but an opening bracket
        result = /^#?([a-zA-Z]+[a-zA-Z0-9]*)([\s\t\r\n\v\f\u2028\u2029]+[^]*$|$)/.exec(remaining);
      }
      if (result) {
        nameMayBePresent = true;
      } else {
        // # optional due to type, no name, spaces optional, opening and closing brackets (closing is not guaranteed)
        result = /^#?(\[[^]*])(([\s\t\r\n\v\f\u2028\u2029]+[^]*$)|$)/.exec(remaining);
      }
    } else {
      // # required, name present, spaces optional, opening bracket, body and maybe a closing bracket
      result = /^#([a-zA-Z]+[a-zA-Z0-9]*)(\[[^]+]([\s\t\r\n\v\f\u2028\u2029][^]*$|$))/.exec(remaining);
      if (result === null) {
        // #require, name present, at least one space, anything but an opening bracket.
        result = /^#([a-zA-Z]+[a-zA-Z0-9]*)([\s\t\r\n\v\f\u2028\u2029]+[^]*$|$)/.exec(remaining);
      }
      if (result) {
        nameMayBePresent = true;
      } else {
        // #required, spaces optional, opening and maybe closing bracket
        result = /#(\[[^]*])(([\s\t\r\n\v\f\u2028\u2029]+[^]*$)|$)/.exec(remaining);
      }
    }

    let refName;
    let near = remaining;
    if (result !== null) {
      if (nameMayBePresent) {
        refName = result[1];
        remaining = result[2].trim();
      } else {
        remaining = (result[1] + result[2]).trim();
      }
    } else {
      return [remaining, undefined, undefined];
    }
    if (remaining.startsWith('[')) {
      remaining = remaining.substring(1);
    } else {
      return [remaining, undefined, undefined];
    }
    // const module: ModuleDefinition = loadModuleDefinitionFromHints(hints, ec, ExpressionHintKey.Module, ExpressionHintKey.ModuleName, ExpressionHintKey.FunctionName, ExpressionHintKey.ConstructorName, ExpressionHintKey.ModuleResolution, ExpressionHintKey.LoadSchema);
    const recursiveParser = new RecursiveGroupingParser<FormulaOperator, ExpressionReference>(new FragmentParserAdapter());
    let grouping: RecursiveGrouping<FormulaOperator, ExpressionReference>;
    let endCondition: EndConditionType;
    [remaining, grouping, endCondition] = recursiveParser.parse(remaining, scope, formulaOperators, FormulaOperator.Add, [/^][^]*$/], undefined, ec);
    if (endCondition === EndConditionType.GroupingEnd) {
      remaining = remaining.substring(1);
    } else {
      return [near, undefined, undefined];
    }
    if (!type) {
      type = ExpressionType.Formula;
    }
    // Even though Unknown was set, inner expressions might be determined for data type and we'll take those
    if(dataTypeRef === StandardDataType.Indeterminate || dataTypeRef === StandardDataType.Unknown) {
      const determinedDataTypeRef = FormulaExpressionParser.determineDataType(grouping, scope, ec);
      if (determinedDataTypeRef === StandardDataType.Unknown) {
        if(scope.get(ExpressionScope.AllowUnknownDataType) === true) {
          dataTypeRef = StandardDataType.Unknown;
        } else {
          return [near, undefined, [{message: ExPsStdMsg.ImproperUsageOfUnknown, type: PsMsgType.Error}]];
        }
      } else {
        dataTypeRef = determinedDataTypeRef;
      }
    }
    if (grouping) {
      const instance: FormulaExpressionReference = {
        refName,
        dataTypeRef,
        type,
        multivariate: true,
        operator: grouping.operator,
        group: grouping.group
      };
      if (refName) {
        const factory: FormulaExpressionFactory = scope.get(ExpressionScope.FormulaExpressionFactory);
        factory.register({instanceRef: {refName, instance}}, ec);
      }
      return [remaining, instance, undefined];
    } else {
      return [remaining, undefined, undefined];
    }
  }
}
