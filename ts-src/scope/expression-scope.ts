import {AwaitEvaluation, CheckFunction, ExecutionContextI} from '@franzzemen/app-utility';
import {RuleElementInstanceReference, RuleElementModuleReference, Scope} from '@franzzemen/re-common';
import {DataTypeScope} from '@franzzemen/re-data-type';
import {AttributeExpressionParser} from '../parser/attribute-expression-parser.js';
import {FunctionExpressionParser} from '../parser/function-expression-parser.js';
import {SetExpressionParser} from '../parser/set-expression-parser.js';
import {ValueExpressionParser} from '../parser/value-expression-parser.js';
import {ExpressionOptions} from './expression-options.js';
import {ExpressionFactory} from '../standard/expression-factory.js';
import {ExpressionStackParser} from '../parser/expression-stack-parser.js';
import {ExpressionStringifier} from '../stringifier/expression-stringifier.js';
import {AwaitEvaluationFactory} from '../await-evaluation/await-evaluation-factory.js';

export class ExpressionScope extends DataTypeScope {
  public static ExpressionFactory = 'ExpressionFactory';
  public static ExpressionStackParser = 'ExpressionStackParser';
  public static AwaitEvaluationFactory = 'AwaitEvaluationFactory';
  public static DataTypeLiteralStackStringifier = 'DataTypeLiteralStackStringifier';
  public static ExpressionStringifier = 'ExpressionStringifier';


  constructor(options?: ExpressionOptions, parentScope?: Scope, ec?: ExecutionContextI) {
    super(options, parentScope, ec);
    this.set(ExpressionScope.ExpressionFactory, new ExpressionFactory(ec));
    const expressionStackParser = new ExpressionStackParser();
    this.set(ExpressionScope.ExpressionStackParser, expressionStackParser);

    // Condition parser should be at the top of the stack prior to individual expression parsers  once validated
    // expressionStackParser.addParser(new ConditionExpressionParser(), true, ec);
    expressionStackParser.addParser(new ValueExpressionParser(), true, undefined, undefined, ec);
    expressionStackParser.addParser(new AttributeExpressionParser(), true, undefined, undefined, ec);
    expressionStackParser.addParser(new FunctionExpressionParser(), true, undefined, undefined, ec);
    expressionStackParser.addParser(new SetExpressionParser(), true, undefined, undefined, ec);

    this.set(ExpressionScope.ExpressionStringifier, new ExpressionStringifier());
    this.set(ExpressionScope.AwaitEvaluationFactory, new AwaitEvaluationFactory());

  }

  addAwaitEvaluationFunction(awaitEvaluationRefs: (RuleElementInstanceReference<AwaitEvaluation> | RuleElementModuleReference)[],  override: boolean, overrideDown: boolean, checks?: CheckFunction[], paramsArrays?: any[][], ec?: ExecutionContextI): void | Promise<void> {
    this.addScopedFactoryItems<AwaitEvaluation>(awaitEvaluationRefs, ExpressionScope.AwaitEvaluationFactory, override, overrideDown, checks, paramsArrays, ec);
  }

  getAwaitEvaluationFunction(refName: string, searchParent = true, ec?: ExecutionContextI): AwaitEvaluation {
    return this.getScopedFactoryItem<AwaitEvaluation>(refName, ExpressionScope.AwaitEvaluationFactory, searchParent, ec);
  }

  hasAwaitEvaluationFactory(scope: Map<string, any>, refName: string, ec?: ExecutionContextI): boolean {
    return this.hasScopedFactoryItem<AwaitEvaluation>(refName, ExpressionScope.AwaitEvaluationFactory, ec);
  }
}
