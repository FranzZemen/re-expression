import {AwaitEvaluation, ExecutionContextI, ModuleResolutionAction} from '@franzzemen/app-utility';
import {RuleElementReference, Scope} from '@franzzemen/re-common';
import {DataTypeScope} from '@franzzemen/re-data-type';
import {ExpressionType} from '../expression.js';
import {AttributeExpression} from '../expression/attribute-expression.js';
import {FormulaExpression} from '../expression/formula-expression.js';
import {FunctionExpression} from '../expression/function-expression.js';
import {SetExpression} from '../expression/set-expression.js';
import {ValueExpression} from '../expression/value-expression.js';
import {AwaitEvaluationFactory} from '../factory/await-evaluation-factory.js';
import {ExpressionFactory} from '../factory/expression-factory.js';
import {FormulaExpressionFactory} from '../factory/formula-expression-factory.js';
import {AttributeExpressionParser} from '../parser/attribute-expression-parser.js';
import {ExpressionStackParser} from '../parser/expression-stack-parser.js';
import {FormulaExpressionParser} from '../parser/formula-expression-parser.js';
import {FunctionExpressionParser} from '../parser/function-expression-parser.js';
import {SetExpressionParser} from '../parser/set-expression-parser.js';
import {ValueExpressionParser} from '../parser/value-expression-parser.js';
import {ExpressionStringifier} from '../stringifier/expression-stringifier.js';
import {ExpressionOptions} from './expression-options.js';

export class ExpressionScope extends DataTypeScope {
  public static ExpressionFactory = 'ExpressionFactory';
  public static ExpressionStackParser = 'ExpressionStackParser';
  public static AwaitEvaluationFactory = 'AwaitEvaluationFactory';
  public static DataTypeLiteralStackStringifier = 'DataTypeLiteralStackStringifier';
  public static ExpressionStringifier = 'ExpressionStringifier';
  public static FormulaExpressionFactory = 'FormulaExpressionFactory';
  public static AllowUnknownDataType = 'AllowUnknownDataType';


  constructor(options?: ExpressionOptions, parentScope?: Scope, ec?: ExecutionContextI) {
    super(options, parentScope, ec);
    this.set(ExpressionScope.AllowUnknownDataType, options?.allowUnknownDataType === true);

    const expressionFactory = new ExpressionFactory();
    expressionFactory.addConstructor(ExpressionType.Value, ValueExpression);
    expressionFactory.addConstructor(ExpressionType.Attribute, AttributeExpression);
    expressionFactory.addConstructor(ExpressionType.Function, FunctionExpression);
    expressionFactory.addConstructor(ExpressionType.Set, SetExpression);
    expressionFactory.addConstructor(ExpressionType.Formula, FormulaExpression);
    this.set(ExpressionScope.ExpressionFactory, expressionFactory);

    const expressionStackParser = new ExpressionStackParser();
    this.set(ExpressionScope.ExpressionStackParser, expressionStackParser);

    // Condition parser should be at the top of the stack prior to individual expression parsers  once validated
    // expressionStackParser.addParser(new ConditionExpressionParser(), true, ec);
    expressionStackParser.addParser(new ValueExpressionParser(), false, ec);
    expressionStackParser.addParser(new AttributeExpressionParser(), false, ec);
    expressionStackParser.addParser(new FunctionExpressionParser(), false, ec);
    expressionStackParser.addParser(new SetExpressionParser(), false, ec);
    expressionStackParser.addParser(new FormulaExpressionParser(), false, ec);

    this.set(ExpressionScope.ExpressionStringifier, new ExpressionStringifier());
    this.set(ExpressionScope.AwaitEvaluationFactory, new AwaitEvaluationFactory());
    this.set(ExpressionScope.FormulaExpressionFactory, new FormulaExpressionFactory());

  }

  addAwaitEvaluationFunction(awaitEvaluationRef: RuleElementReference<AwaitEvaluation>, action?: ModuleResolutionAction, ec?: ExecutionContextI) {
    return this.addRuleElementReferenceItem(awaitEvaluationRef, ExpressionScope.AwaitEvaluationFactory, action, ec);
  }
  addAwaitEvaluationFunctions(awaitEvaluationRefs:RuleElementReference<AwaitEvaluation>[], actions?: ModuleResolutionAction[], ec?: ExecutionContextI) {
    return this.addRuleElementReferenceItems<AwaitEvaluation>(awaitEvaluationRefs, ExpressionScope.AwaitEvaluationFactory, actions,ec);
  }

  getAwaitEvaluationFunction(refName: string, searchParent = true, ec?: ExecutionContextI): AwaitEvaluation {
    return this.getScopedFactoryItem<AwaitEvaluation>(refName, ExpressionScope.AwaitEvaluationFactory, searchParent, ec);
  }

  hasAwaitEvaluationFactory(scope: Map<string, any>, refName: string, ec?: ExecutionContextI): boolean {
    return this.hasScopedFactoryItem<AwaitEvaluation>(refName, ExpressionScope.AwaitEvaluationFactory, ec);
  }
}

