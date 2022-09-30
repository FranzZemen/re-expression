import {DataTypeHintKey} from '@franzzemen/re-data-type';

export class ExpressionHintKey extends DataTypeHintKey {
  public static Expression = 'ex';
  public static Type = 'type';
  public static Multivariate = 'multivariate';

  // This is a unary hint - presence means true
  public static AwaitEvaluationModuleOverride = 'await-evaluation-module-override';
  // This is a unary hint - presence means true
  public static AwaitEvaluationModuleOverrideDown = 'await-evaluation-module-override-down';
  //   // Where there is a set (function params or set expression for instance, should all members be the same data type or not
  public static MultivariateDataTypeHandling = 'multivariate-data-type-handling';
}
