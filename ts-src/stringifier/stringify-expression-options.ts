import {StringifyDataTypeOptions} from '@franzzemen/re-data-type';

export interface StringifyExpressionOptions extends StringifyDataTypeOptions {
  expressionHints?: {
    attribute?: {
      forceTypeHint?: boolean,
      forceDataTypeHintEvenWhenInferrable?: boolean,
    };
    value?: {
      forceTypeHint?: boolean,
      forceDataTypeHint?: boolean
    };
    function?: {
      forceTypeHint?: boolean,
      forceDataTypeHintEvenWhenInferrable?: boolean,
    },
    set?: {
      forceTypeHint?: boolean,
      forceDataTypeHintEvenWhenInferrable?: boolean,
      stringifyMultivariate?: boolean
    }
  };
  moduleDefinitions?: {
    useFieldModuleDefinitions?: boolean; // Default is json format
  }
}
