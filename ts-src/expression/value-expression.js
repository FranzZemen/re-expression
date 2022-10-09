import { Expression, StandardExpressionType } from '../expression.js';
export function isValueExpressionReference(val) {
    return val !== undefined
        && val.type !== undefined
        && val.type === StandardExpressionType.Value
        && val.value !== undefined
        && val.dataTypeRef !== undefined;
}
export function isValueExpression(expression) {
    return expression instanceof ValueExpression;
}
export class ValueExpression extends Expression {
    constructor(expressionRef, scope, ec) {
        super(expressionRef, scope, ec);
        this.value = expressionRef.value;
    }
    to(ec) {
        const ref = {};
        super.toBase(ref, ec);
        ref.value = this.value;
        return ref;
    }
    awaitEvaluation(dataDomain, scope, ec) {
        return this.awaitEval(this.value, scope);
    }
}
//# sourceMappingURL=value-expression.js.map