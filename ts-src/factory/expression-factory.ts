import {logErrorAndThrow} from '@franzzemen/enhanced-error';
import {LogExecutionContext, LoggerAdapter} from '@franzzemen/logger-adapter';
import {ModuleResolutionAction} from '@franzzemen/module-resolver';
import {RuleElementFactory} from '@franzzemen/re-common';
import {DataTypeFactory, DataTypeScope} from '@franzzemen/re-data-type';
import {Expression, ExpressionReference, StandardExpressionType} from '../expression.js';
import {FunctionExpression} from '../expression/function-expression.js';
import {ExpressionScope} from '../scope/expression-scope.js';

export type ExpressionConstructor = new (ExpressionReference, Scope, ExecutionContext?) => Expression;

export function isExpressionConstructor(obj: any | ExpressionConstructor): obj is ExpressionConstructor {
  let prototype = obj;
  do {
    prototype = Object.getPrototypeOf(prototype);
    if(prototype?.name === Expression.name) return true;
  } while(prototype !== null && prototype.name !== '' && prototype.name !== undefined);
  return false;
}


export class ExpressionFactory extends RuleElementFactory<ExpressionConstructor> {
  constructor(ec?: LogExecutionContext) {
    super();
  }

  addConstructor (refName: string, _constructor: ExpressionConstructor) {
    this.register({instanceRef: {refName, instance: _constructor}});
  }

  createExpression(expressionRef: ExpressionReference, scope: ExpressionScope, ec?: LogExecutionContext): Expression {
    let log: LoggerAdapter;
    log = new LoggerAdapter(ec, 're-expression-factory', 'expression-factory', 'createExpression');
    // let expressionReference: ExpressionReference;
    let expression: Expression;

    const _constructor: ExpressionConstructor = this.getRegistered(expressionRef.type, ec);
    if(_constructor === undefined) {
      logErrorAndThrow(`Undefined constructor for ExpressionType: ${expressionRef.type}.  Possible factory was instantiated outside of scope and not registered with constructors`) ;
    }
    expression = new _constructor(expressionRef, scope, ec);
    /*
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
     */
    this.loadDataType(expression, scope, ec);
    this.loadAwaitEvaluationFunctions(expression, scope, ec);
    return expression;
  }

  loadDataType(expression: Expression, scope: ExpressionScope, ec?: LogExecutionContext) {
    const log = new LoggerAdapter(ec, 're-expression-factory', 'expression-factory', 'loadDataType');
    if (expression.dataTypeRef && expression.dataType === undefined) {
      const dataTypeFactory = scope.get(DataTypeScope.DataTypeFactory) as DataTypeFactory;
      if (dataTypeFactory.hasRegistered(expression.dataTypeRef)) {
        expression.dataType = dataTypeFactory.getRegistered(expression.dataTypeRef, ec);
      } else {
        if (expression.dataTypeModule) {
          const action: ModuleResolutionAction = {
            ownerIsObject: true,
            objectRef: expression,
            _function: 'customDataTypeRefLoadedAction',
            paramsArray: [scope, ec]
          };
          scope.addDataType({
            moduleRef: {
              refName: expression.dataTypeRef,
              module: expression.dataTypeModule
            }
          }, action, ec);
        } else {
          scope.addUnsatisfiedRuleElementReference(expression.dataTypeRef, DataTypeScope.DataTypeFactory, ec);
          log.warn(expression, `No registered dataTypeRef "${expression.dataTypeRef}" and no module provided.  2nd Pass will verify it's loaded elsewhere and fail if not found`);
        }
      }
    }
  }

  loadAwaitEvaluationFunctions(expression: Expression, scope: ExpressionScope, ec?: LogExecutionContext) {
    const log = new LoggerAdapter(ec, 're-expression-factory', 'expression-factory', 'loadAwaitEvaluationFunctions');
    switch (expression.type) {
      case StandardExpressionType.Function:
        const functionExpression: FunctionExpression = expression as FunctionExpression;
        if (functionExpression.awaitEvaluation) {
          const action: ModuleResolutionAction = {
            ownerIsObject: true,
            objectRef: functionExpression,
            _function: 'awaitEvaluationFunctionLoadedAction',
            paramsArray: [scope, ec]
          };
          scope.addAwaitEvaluationFunction({
            moduleRef: {
              refName: functionExpression.refName,
              module: functionExpression.module
            }
          }, action, ec);
        } else {
          if (functionExpression.module) {
          } else {
            scope.addUnsatisfiedRuleElementReference(expression.dataTypeRef, ExpressionScope.AwaitEvaluationFactory);
            log.warn(functionExpression, `No registered awaitEvaluation function "${functionExpression.refName}" and no module provided. 2nd Pass will verify it's loaded elsewhere and fail if not found`);
          }
        }
        break;
      default:
        break;
    }
  }

  protected isC(obj: any): obj is ExpressionConstructor {
    return isExpressionConstructor(obj);
  }
}
