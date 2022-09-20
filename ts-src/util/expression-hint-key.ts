import {DataTypeHintKey} from '@franzzemen/re-data-type';

export class ExpressionHintKey extends DataTypeHintKey {
  public static Expression = 'ex';
  public static Type = 'type';
  public static Multivariate = 'multivariate';

  // This is a unary hint - presence means true
  public static AwaitEvaluationModuleOverride = 'await-evaluation-module-override';
  // This is a unary hint - presence means true
  public static AwaitEvaluationModuleOverrideDown = 'await-evaluation-module-override-down';
}
