import {ExecutionContextI, LoggerAdapter, ModuleResolutionAction} from '@franzzemen/app-utility';
import {DataTypeFactory, DataTypeScope} from '@franzzemen/re-data-type';
import {Expression, ExpressionReference, ExpressionType} from '../expression.js';
import {AttributeExpression, AttributeExpressionReference} from '../expression/attribute-expression.js';
import {FormulaExpression, FormulaExpressionReference} from '../expression/formula-expression.js';
import {FunctionExpression, FunctionExpressionReference} from '../expression/function-expression.js';
import {SetExpression, SetExpressionReference} from '../expression/set-expression.js';
import {ValueExpression, ValueExpressionReference} from '../expression/value-expression.js';
import {ExpressionScope} from '../scope/expression-scope.js';

export class ExpressionFactory {



  constructor(ec?: ExecutionContextI) {
  }

  createExpression(expressionRef: ExpressionReference, scope: ExpressionScope, ec?: ExecutionContextI): Expression {
    const log = new LoggerAdapter(ec, 're-expression-factory', 'expression-factory', 'createExpression');
    let expressionReference: ExpressionReference;
    let expression: Expression;


    switch (expressionRef.type) {
      case ExpressionType.Value:
        expression = new ValueExpression(expressionRef as ValueExpressionReference, scope, ec);
        break;
      case ExpressionType.Attribute:
        expression = new AttributeExpression(expressionRef as AttributeExpressionReference, scope, ec);
        break;
      case ExpressionType.Function:
        expression = new FunctionExpression(expressionRef as FunctionExpressionReference, scope, ec);
        break;
      case ExpressionType.Formula:
        expression = new FormulaExpression(expressionRef as FormulaExpressionReference, scope, ec);
        break;
      case ExpressionType.Set:
        expression = new SetExpression(expressionRef as SetExpressionReference, scope, ec);
        break;
    }
    this.loadDataType(expression, scope, ec);
    this.loadAwaitEvaluationFunctions(expression, scope, ec);
    return expression;
  }

  loadDataType(expression: Expression, scope: ExpressionScope, ec?: ExecutionContextI) {
    const log = new LoggerAdapter(ec, 're-expression-factory', 'expression-factory', 'loadDataType');
    if(expression.dataTypeRef && expression.dataType === undefined) {
      const dataTypeFactory = scope.get(DataTypeScope.DataTypeFactory) as DataTypeFactory;
      if (dataTypeFactory.hasRegistered(expression.dataTypeRef)) {
        expression.dataType = dataTypeFactory.getRegistered(expression.dataTypeRef, ec);
      } else {
        if (expression.dataTypeModule) {
          const action: ModuleResolutionAction = {
            ownerIsObject: true,
            objectRef: expression,
            actionFunction: 'customDataTypeRefLoadedAction',
            paramsArray: [scope, ec]
          }
          scope.addDataType({moduleRef: {refName: expression.dataTypeRef, module: expression.dataTypeModule}}, action, ec);
        } else {
          scope.addUnsatisfiedRuleElementReference(expression.dataTypeRef, DataTypeScope.DataTypeFactory, ec);
          log.warn(expression, `No registered dataTypeRef "${expression.dataTypeRef}" and no module provided.  2nd Pass will verify it's loaded elsewhere and fail if not found`);
        }
      }
    }
  }

  loadAwaitEvaluationFunctions(expression: Expression, scope: ExpressionScope, ec?: ExecutionContextI) {
    const log = new LoggerAdapter(ec, 're-expression-factory', 'expression-factory', 'loadAwaitEvaluationFunctions');
    switch (expression.type) {
      case ExpressionType.Function:
        const functionExpression: FunctionExpression = expression as FunctionExpression;
        if (functionExpression.awaitEvaluation) {
          const action: ModuleResolutionAction = {
            ownerIsObject: true,
            objectRef: functionExpression,
            actionFunction: 'awaitEvaluationFunctionLoadedAction',
            paramsArray: [scope, ec]
          }
          scope.addAwaitEvaluationFunction({moduleRef: { refName: functionExpression.refName, module: functionExpression.module}},action, ec);
        } else {
          if (functionExpression.module) {
          } else {
            scope.addUnsatisfiedRuleElementReference(expression.dataTypeRef, ExpressionScope.AwaitEvaluationFactory);
            log.warn(functionExpression, `No registered awaitEvaluation function "${functionExpression.refName}" and no module provided. 2nd Pass will verify it's loaded elsewhere and fail if not found`);}
        }
        break;
      default:
        break;
    }
  }
}
