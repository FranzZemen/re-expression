import { LoggerAdapter } from '@franzzemen/app-utility';
import { logErrorAndThrow } from '@franzzemen/app-utility/enhanced-error.js';
import { RuleElementFactory } from '@franzzemen/re-common';
import { DataTypeScope } from '@franzzemen/re-data-type';
import { Expression, StandardExpressionType } from '../expression.js';
import { ExpressionScope } from '../scope/expression-scope.js';
export function isExpressionConstructor(obj) {
    let prototype = obj;
    do {
        prototype = Object.getPrototypeOf(prototype);
        if (prototype?.name === Expression.name)
            return true;
    } while (prototype !== null && prototype.name !== '' && prototype.name !== undefined);
    return false;
}
export class ExpressionFactory extends RuleElementFactory {
    constructor(ec) {
        super();
    }
    addConstructor(refName, _constructor) {
        this.register({ instanceRef: { refName, instance: _constructor } });
    }
    createExpression(expressionRef, scope, ec) {
        const log = new LoggerAdapter(ec, 're-expression-factory', 'expression-factory', 'createExpression');
        let expression;
        const _constructor = this.getRegistered(expressionRef.type, ec);
        if (_constructor === undefined) {
            logErrorAndThrow(`Undefined constructor for ExpressionType: ${expressionRef.type}.  Possible factory was instantiated outside of scope and not registered with constructors`);
        }
        expression = new _constructor(expressionRef, scope, ec);
        this.loadDataType(expression, scope, ec);
        this.loadAwaitEvaluationFunctions(expression, scope, ec);
        return expression;
    }
    loadDataType(expression, scope, ec) {
        const log = new LoggerAdapter(ec, 're-expression-factory', 'expression-factory', 'loadDataType');
        if (expression.dataTypeRef && expression.dataType === undefined) {
            const dataTypeFactory = scope.get(DataTypeScope.DataTypeFactory);
            if (dataTypeFactory.hasRegistered(expression.dataTypeRef)) {
                expression.dataType = dataTypeFactory.getRegistered(expression.dataTypeRef, ec);
            }
            else {
                if (expression.dataTypeModule) {
                    const action = {
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
                }
                else {
                    scope.addUnsatisfiedRuleElementReference(expression.dataTypeRef, DataTypeScope.DataTypeFactory, ec);
                    log.warn(expression, `No registered dataTypeRef "${expression.dataTypeRef}" and no module provided.  2nd Pass will verify it's loaded elsewhere and fail if not found`);
                }
            }
        }
    }
    loadAwaitEvaluationFunctions(expression, scope, ec) {
        const log = new LoggerAdapter(ec, 're-expression-factory', 'expression-factory', 'loadAwaitEvaluationFunctions');
        switch (expression.type) {
            case StandardExpressionType.Function:
                const functionExpression = expression;
                if (functionExpression.awaitEvaluation) {
                    const action = {
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
                }
                else {
                    if (functionExpression.module) {
                    }
                    else {
                        scope.addUnsatisfiedRuleElementReference(expression.dataTypeRef, ExpressionScope.AwaitEvaluationFactory);
                        log.warn(functionExpression, `No registered awaitEvaluation function "${functionExpression.refName}" and no module provided. 2nd Pass will verify it's loaded elsewhere and fail if not found`);
                    }
                }
                break;
            default:
                break;
        }
    }
    isC(obj) {
        return isExpressionConstructor(obj);
    }
}
//# sourceMappingURL=expression-factory.js.map