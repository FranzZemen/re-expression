import {ExpressionReference} from '../expression';

export interface MultivariateExpression extends ExpressionReference {
  set: ExpressionReference[]
}
