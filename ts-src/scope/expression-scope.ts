import {ExecutionContextI} from '@franzzemen/app-utility';
import {RuleElementModuleReference, Scope} from '@franzzemen/re-common';
import {DataTypeScope} from '@franzzemen/re-data-type';
import {AwaitEvaluation} from '../await-evaluation/await-evaluation-factory';
import {AttributeExpressionParser} from '../parser/attribute-expression-parser';
import {FunctionExpressionParser} from '../parser/function-expression-parser';
import {SetExpressionParser} from '../parser/set-expression-parser';
import {ValueExpressionParser} from '../parser/value-expression-parser';
import {ExpressionOptions} from './expression-options';
import {ExpressionFactory} from '../standard/expression-factory';
import {ExpressionStackParser} from '../parser/expression-stack-parser';
import {ExpressionStringifier} from '../stringifier/expression-stringifier';
import {AwaitEvaluationFactory} from '../await-evaluation/await-evaluation-factory';

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
    expressionStackParser.addParser(new ValueExpressionParser(), true, ec);
    expressionStackParser.addParser(new AttributeExpressionParser(), true, ec);
    expressionStackParser.addParser(new FunctionExpressionParser(), true, ec);
    expressionStackParser.addParser(new SetExpressionParser(), true, ec);

    this.set(ExpressionScope.ExpressionStringifier, new ExpressionStringifier());
    this.set(ExpressionScope.AwaitEvaluationFactory, new AwaitEvaluationFactory());

  }

  addAwaitEvaluationFunction(awaitEvaluationRefs: RuleElementModuleReference[], ec?: ExecutionContextI) {
    this.add<AwaitEvaluation>(awaitEvaluationRefs, ExpressionScope.AwaitEvaluationFactory, false, false, ec);
  }

  getAwaitEvaluationFunction(refName: string, searchParent = true, ec?: ExecutionContextI): AwaitEvaluation {
    return this.getScopedFactory<AwaitEvaluation>(refName, ExpressionScope.AwaitEvaluationFactory, searchParent, ec);
  }

  hasAwaitEvaluationFactory(scope: Map<string, any>, refName: string, ec?: ExecutionContextI): boolean {
    return this.hasFactory<AwaitEvaluation>(refName, ExpressionScope.AwaitEvaluationFactory, ec);
  }
}
