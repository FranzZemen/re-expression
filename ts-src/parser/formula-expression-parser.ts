import {ExecutionContextI, Hints, LoggerAdapter} from '@franzzemen/app-utility';
import {logErrorAndThrow} from '@franzzemen/app-utility/enhanced-error.js';
import {
  EndConditionType,
  FragmentOrGrouping,
  FragmentParser,
  isFragment,
  isRecursiveGrouping,
  RecursiveGrouping,
  RecursiveGroupingParser
} from '@franzzemen/re-common';
import {StandardDataType} from '@franzzemen/re-data-type';
import {ExpressionReference, ExpressionType} from '../expression.js';
import {FormulaExpressionReference, FormulaOperator} from '../expression/formula-expression.js';
import {FormulaExpressionFactory} from '../factory/formula-expression-factory.js';
import {ExpressionScope} from '../scope/expression-scope.js';
import {ExpressionHintKey} from '../util/expression-hint-key.js';
import {ExpressionParser} from './expression-parser.js';
import {ExpressionStackParser} from './expression-stack-parser.js';


const formulaOperators: FormulaOperator[] = [FormulaOperator.Add, FormulaOperator.Subtract, FormulaOperator.Multiply, FormulaOperator.Divide];

class FragmentParserAdapter implements FragmentParser<ExpressionReference> {
  parse(fragment: string, scope: ExpressionScope, ec?: ExecutionContextI): [string, ExpressionReference] {
    const log = new LoggerAdapter(ec, 're-expression', 'formula-expression-parser', `${FragmentParserAdapter.name}.parse`);
    const parser = scope.get(ExpressionScope.ExpressionStackParser) as ExpressionStackParser;
    let [remaining, expression] = parser.parse(fragment, scope, {allowUndefinedDataType: true}, ec);
    // TODO:  Allow Unknown data types?
    if (expression.dataTypeRef && !(StandardDataType.Number || StandardDataType.Float)) {
      logErrorAndThrow(`A fragment expression in a Logical Expression needs to be of type Boolean, not ${expression.dataTypeRef}`, log, ec);
    }
    return [remaining, expression];
  }
}


export class FormulaExpressionParser extends ExpressionParser {
  constructor() {
    super(ExpressionType.Formula);
  }

  private static determineDataType(grouping: FragmentOrGrouping<FormulaOperator, ExpressionReference>, ec?: ExecutionContextI): StandardDataType.Float | StandardDataType.Number {
    // let currDataTypeRef: StandardDataType.Number | StandardDataType.Float = StandardDataType.Number;
    if (isFragment(grouping)) {
      if (grouping.reference.dataTypeRef === StandardDataType.Float || grouping.reference.dataTypeRef === StandardDataType.Number) {
        return grouping.reference.dataTypeRef;
      } else {
        const log = new LoggerAdapter(ec, 're-expression', 'formula-expression-parser', 'determineDataType');
        logErrorAndThrow(`Data type ${grouping.reference.dataTypeRef} is not ${StandardDataType.Float} or ${StandardDataType.Number}`);
      }
    } else {
      // Stop when you find a float
      const hasFloatDataType = grouping.group.some(groupItem => isFragment(groupItem) && groupItem.reference.dataTypeRef === StandardDataType.Float);
      if (hasFloatDataType) {
        return StandardDataType.Float;
      } else {
        for (let subGroup of grouping.group) {
          const subGroupDataType = this.determineDataType(subGroup, ec);
          if (subGroupDataType === StandardDataType.Float) {
            return subGroupDataType;
          }
        }
        // No floats found
        return StandardDataType.Number;
      }
    }
  }

  parse(remaining: string, scope: ExpressionScope, hints: Hints, allowUndefinedDataType?: boolean, ec?: ExecutionContextI): [string, FormulaExpressionReference] {
    const log = new LoggerAdapter(ec, 're-expression', 'formula-expression-parser', `${FormulaExpressionParser.name}.parse`);
    remaining = remaining.trim();
    let type = hints.get(ExpressionHintKey.Type) as string;
    if (type && type !== ExpressionType.Formula) {
      return [remaining, undefined];
    }
    let dataTypeRef = hints.get(ExpressionHintKey.DataType) as string;
    if (dataTypeRef && !(dataTypeRef === StandardDataType.Number || dataTypeRef === StandardDataType.Float)) {
      // Can't be a Formula Expression as the Data Type resulting must be a number
      // TODO:  Allow other data types like TIME, DATE, TIMESTAMP or even custom?
      return [remaining, undefined];
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
      if(result) {
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
      if(result) {
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
      return [remaining, undefined];
    }
    if(remaining.startsWith('[')) {
      remaining = remaining.substring(1);
    } else {
      return [remaining, undefined];
    }
    // const module: ModuleDefinition = loadModuleDefinitionFromHints(hints, ec, ExpressionHintKey.Module, ExpressionHintKey.ModuleName, ExpressionHintKey.FunctionName, ExpressionHintKey.ConstructorName, ExpressionHintKey.ModuleResolution, ExpressionHintKey.LoadSchema);
    const recursiveParser = new RecursiveGroupingParser<FormulaOperator, ExpressionReference>(new FragmentParserAdapter());
    let grouping: RecursiveGrouping<FormulaOperator, ExpressionReference>;
    let endCondition: EndConditionType;
    [remaining, grouping, endCondition] = recursiveParser.parse(remaining, scope, formulaOperators, FormulaOperator.Add, [/^][^]*$/], undefined, ec);
    if (endCondition === EndConditionType.GroupingEnd) {
      remaining = remaining.substring(1);
    } else {
      return [near, undefined];
    }
    if (!type) {
      type = ExpressionType.Formula;
    }
    if (!dataTypeRef) {
      dataTypeRef = FormulaExpressionParser.determineDataType(grouping, ec);
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
      if(refName) {
        const factory: FormulaExpressionFactory = scope.get(ExpressionScope.FormulaExpressionFactory);
        factory.register({instanceRef: {refName, instance}}, ec);
      }
      return [remaining, instance];
    } else {
      return [remaining, undefined];
    }
  }
}
