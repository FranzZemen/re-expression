import { LoggerAdapter } from '@franzzemen/app-utility';
import { EnhancedError, logErrorAndThrow } from '@franzzemen/app-utility/enhanced-error.js';
import { isPromise } from 'util/types';
import { Expression, StandardExpressionType } from '../expression.js';
import { ExpressionScope } from '../scope/expression-scope.js';
export function isFunctionExpressionReference(ref) {
    return 'type' in ref && ref['type'] === StandardExpressionType.Function && !('awaitEvaluation' in ref);
}
export function isFunctionExpression(ref) {
    return 'type' in ref && ref['type'] === StandardExpressionType.Function && 'awaitEvaluation' in ref;
}
export class FunctionExpression extends Expression {
    constructor(ref, scope, ec) {
        super(ref, scope, ec);
        this.setAwaitEvaluationFunctionAction = (successfulResolution, awaitEvaluationFunction, ec) => {
            if (this.awaitEvaluationFunction === undefined) {
                this.awaitEvaluationFunction = awaitEvaluationFunction;
                return true;
            }
            else {
                logErrorAndThrow(new EnhancedError(`awaitEvaluationFunction was already populated for ${this.refName}`));
            }
        };
        this.awaitEvaluationFunctionLoadedAction = (successfulResolution, scope, ec) => {
            const log = new LoggerAdapter(ec, 're-expression', 'expression', 'awaitEvaluationFunctionLoadedAction');
            if (this.awaitEvaluationFunction) {
                log.warn(this, `Action to set awaitEvaluationFunction "${this.refName}" called, but its already set`);
                logErrorAndThrow(new EnhancedError(`Action to set awaitEvaluationFunction "${this.refName}" called, but its already set`), log, ec);
            }
            else {
                this.awaitEvaluationFunction = scope.getAwaitEvaluationFunction(this.refName, true, ec);
                if (!this.awaitEvaluationFunction) {
                    log.warn(this, `Action to set awaitEvaluationFunction "${this.awaitEvaluationFunction}" called, but it still doesn't exist in the factory, this method should only be called when it is`);
                    logErrorAndThrow(new EnhancedError(`Action to set awaitEvaluationFunction "${this.awaitEvaluationFunction}" called, but it still doesn't exist in the factory, this method should only be called when it is`), log, ec);
                }
                else {
                    return true;
                }
            }
        };
        const log = new LoggerAdapter(ec, 're-expression', 'function-expression', `${FunctionExpression.name}.constructor`);
        this.refName = ref.refName;
        this.module = ref.module;
        this.awaitEvaluationFunction = scope.getAwaitEvaluationFunction(ref.refName, true, ec);
        if (ref.params) {
            this.params = [];
            const expressionFactory = scope.get(ExpressionScope.ExpressionFactory);
            ref.params.forEach(expRef => {
                const expression = expressionFactory.createExpression(expRef, scope, ec);
                this.params.push(expression);
            });
        }
    }
    to(ec) {
        const ref = {};
        super.toBase(ref, ec);
        ref.refName = this.refName;
        ref.module = this.module;
        ref.params = [];
        if (this.params) {
            this.params.forEach(param => {
                ref.params.push(param.to(ec));
            });
        }
        return ref;
    }
    awaitEvaluation(dataDomain, scope, ec) {
        if (this.params && this.params.length) {
            const paramResults = [];
            let hasPromise = false;
            this.params.forEach(param => {
                const result = param.awaitEvaluation(dataDomain, scope, ec);
                if (isPromise(result)) {
                    hasPromise = true;
                }
                paramResults.push(result);
            });
            if (hasPromise) {
                return Promise.all(paramResults)
                    .then(resolvedResults => {
                    return this.awaitEvaluationFunction(dataDomain, scope, ec, resolvedResults);
                });
            }
            else {
                return this.awaitEvaluationFunction(dataDomain, scope, ec, paramResults);
            }
        }
        else {
            return this.awaitEval(this.awaitEvaluationFunction(dataDomain, scope, ec), scope, ec);
        }
    }
}
//# sourceMappingURL=function-expression.js.map