import { isPromise } from 'util/types';
import { Expression, StandardExpressionType } from '../expression.js';
import { ExpressionScope } from '../scope/expression-scope.js';
export function isSetExpressionReference(ref) {
    return 'set' in ref && Array.isArray(ref.set) && !('awaitEvaluation' in ref) && ref['type'] === StandardExpressionType.Set;
}
export function isSetExpression(ref) {
    return 'set' in ref && Array.isArray(ref.set) && ref['type'] === StandardExpressionType.Set && 'awaitEvaluation' in ref;
}
export class SetExpression extends Expression {
    constructor(ref, scope, ec) {
        super(ref, scope, ec);
        this.set = [];
        this.multivariate = true;
        const factory = scope.get(ExpressionScope.ExpressionFactory);
        ref.set.forEach(expressionReference => {
            const expression = factory.createExpression(expressionReference, scope, ec);
            this.set.push(expression);
        });
    }
    awaitEvaluation(dataDomain, scope, ec) {
        let hasPromises = false;
        let results = [];
        this.set.forEach(element => {
            const evaluation = element.awaitEvaluation(dataDomain, scope, ec);
            if (isPromise(evaluation)) {
                hasPromises = true;
            }
            results.push(evaluation);
        });
        if (hasPromises) {
            return Promise.all(results);
        }
        else {
            return results;
        }
    }
    to(ec) {
        const setExpressionReference = {
            set: []
        };
        super.toBase(setExpressionReference, ec);
        this.set.forEach(expression => {
            setExpressionReference.set.push(expression.to(ec));
        });
        return setExpressionReference;
    }
}
//# sourceMappingURL=set-expression.js.map