import { ExpressionReference } from '../expression.js';
export interface MultivariateExpression extends ExpressionReference {
    set: ExpressionReference[];
}
