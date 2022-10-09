import { DataTypeScope } from '@franzzemen/re-data-type';
import { StandardExpressionType } from '../expression.js';
import { AttributeExpression } from '../expression/attribute-expression.js';
import { FormulaExpression } from '../expression/formula-expression.js';
import { FunctionExpression } from '../expression/function-expression.js';
import { SetExpression } from '../expression/set-expression.js';
import { ValueExpression } from '../expression/value-expression.js';
import { AwaitEvaluationFactory } from '../factory/await-evaluation-factory.js';
import { ExpressionFactory } from '../factory/expression-factory.js';
import { FormulaExpressionFactory } from '../factory/formula-expression-factory.js';
import { AttributeExpressionParser } from '../parser/attribute-expression-parser.js';
import { ExpressionStackParser } from '../parser/expression-stack-parser.js';
import { FormulaExpressionParser } from '../parser/formula-expression-parser.js';
import { FunctionExpressionParser } from '../parser/function-expression-parser.js';
import { SetExpressionParser } from '../parser/set-expression-parser.js';
import { ValueExpressionParser } from '../parser/value-expression-parser.js';
import { ExpressionStringifier } from '../stringifier/expression-stringifier.js';
export class ExpressionScope extends DataTypeScope {
    constructor(options, parentScope, ec) {
        super(options, parentScope, ec);
        this.set(ExpressionScope.AllowUnknownDataType, options?.allowUnknownDataType === true);
        const expressionFactory = new ExpressionFactory();
        expressionFactory.addConstructor(StandardExpressionType.Value, ValueExpression);
        expressionFactory.addConstructor(StandardExpressionType.Attribute, AttributeExpression);
        expressionFactory.addConstructor(StandardExpressionType.Function, FunctionExpression);
        expressionFactory.addConstructor(StandardExpressionType.Set, SetExpression);
        expressionFactory.addConstructor(StandardExpressionType.Formula, FormulaExpression);
        this.set(ExpressionScope.ExpressionFactory, expressionFactory);
        const expressionStackParser = new ExpressionStackParser();
        this.set(ExpressionScope.ExpressionStackParser, expressionStackParser);
        expressionStackParser.addParser(new ValueExpressionParser(), false, ec);
        expressionStackParser.addParser(new AttributeExpressionParser(), false, ec);
        expressionStackParser.addParser(new FunctionExpressionParser(), false, ec);
        expressionStackParser.addParser(new SetExpressionParser(), false, ec);
        expressionStackParser.addParser(new FormulaExpressionParser(), false, ec);
        this.set(ExpressionScope.ExpressionStringifier, new ExpressionStringifier());
        this.set(ExpressionScope.AwaitEvaluationFactory, new AwaitEvaluationFactory());
        this.set(ExpressionScope.FormulaExpressionFactory, new FormulaExpressionFactory());
    }
    addAwaitEvaluationFunction(awaitEvaluationRef, action, ec) {
        return this.addRuleElementReferenceItem(awaitEvaluationRef, ExpressionScope.AwaitEvaluationFactory, action, ec);
    }
    addAwaitEvaluationFunctions(awaitEvaluationRefs, actions, ec) {
        return this.addRuleElementReferenceItems(awaitEvaluationRefs, ExpressionScope.AwaitEvaluationFactory, actions, ec);
    }
    getAwaitEvaluationFunction(refName, searchParent = true, ec) {
        return this.getScopedFactoryItem(refName, ExpressionScope.AwaitEvaluationFactory, searchParent, ec);
    }
    hasAwaitEvaluationFactory(scope, refName, ec) {
        return this.hasScopedFactoryItem(refName, ExpressionScope.AwaitEvaluationFactory, ec);
    }
}
ExpressionScope.ExpressionFactory = 'ExpressionFactory';
ExpressionScope.ExpressionStackParser = 'ExpressionStackParser';
ExpressionScope.AwaitEvaluationFactory = 'AwaitEvaluationFactory';
ExpressionScope.DataTypeLiteralStackStringifier = 'DataTypeLiteralStackStringifier';
ExpressionScope.ExpressionStringifier = 'ExpressionStringifier';
ExpressionScope.FormulaExpressionFactory = 'FormulaExpressionFactory';
ExpressionScope.AllowUnknownDataType = 'AllowUnknownDataType';
//# sourceMappingURL=expression-scope.js.map