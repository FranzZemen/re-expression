import {LogExecutionContext} from '@franzzemen/logger-adapter';
import {ModuleResolutionAction} from '@franzzemen/module-resolver';
import {RuleElementReference, Scope} from '@franzzemen/re-common';
import {AwaitEvaluation} from '@franzzemen/re-common/util/await-evaluation.js';
import {DataTypeScope} from '@franzzemen/re-data-type';
import {StandardExpressionType} from '../expression.js';
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
import {ReExpression} from './re-expression-execution-context.js';


export class ExpressionScope extends DataTypeScope {
  public static ExpressionFactory = 'ExpressionFactory';
  public static ExpressionStackParser = 'ExpressionStackParser';
  public static AwaitEvaluationFactory = 'AwaitEvaluationFactory';
  public static DataTypeLiteralStackStringifier = 'DataTypeLiteralStackStringifier';
  public static ExpressionStringifier = 'ExpressionStringifier';
  public static FormulaExpressionFactory = 'FormulaExpressionFactory';
  public static AllowUnknownDataType = 'AllowUnknownDataType';


  constructor(options?: ReExpression, parentScope?: Scope, ec?: LogExecutionContext) {
    super(options, parentScope, ec);
    this.set(ExpressionScope.AllowUnknownDataType, this.options.expression?.allowUnknownDataType === true);

    const expressionFactory = new ExpressionFactory();
    expressionFactory.addConstructor(StandardExpressionType.Value, ValueExpression);
    expressionFactory.addConstructor(StandardExpressionType.Attribute, AttributeExpression);
    expressionFactory.addConstructor(StandardExpressionType.Function, FunctionExpression);
    expressionFactory.addConstructor(StandardExpressionType.Set, SetExpression);
    expressionFactory.addConstructor(StandardExpressionType.Formula, FormulaExpression);
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

  get options(): ReExpression {
    return this.options;
  }

  addAwaitEvaluationFunction(awaitEvaluationRef: RuleElementReference<AwaitEvaluation>, action?: ModuleResolutionAction, ec?: LogExecutionContext) {
    return this.addRuleElementReferenceItem(awaitEvaluationRef, ExpressionScope.AwaitEvaluationFactory, action, ec);
  }

  addAwaitEvaluationFunctions(awaitEvaluationRefs: RuleElementReference<AwaitEvaluation>[], actions?: ModuleResolutionAction[], ec?: LogExecutionContext) {
    return this.addRuleElementReferenceItems<AwaitEvaluation>(awaitEvaluationRefs, ExpressionScope.AwaitEvaluationFactory, actions, ec);
  }

  getAwaitEvaluationFunction(refName: string, searchParent = true, ec?: LogExecutionContext): AwaitEvaluation {
    return this.getScopedFactoryItem<AwaitEvaluation>(refName, ExpressionScope.AwaitEvaluationFactory, searchParent, ec);
  }

  hasAwaitEvaluationFactory(scope: Map<string, any>, refName: string, ec?: LogExecutionContext): boolean {
    return this.hasScopedFactoryItem<AwaitEvaluation>(refName, ExpressionScope.AwaitEvaluationFactory, ec);
  }
}

