/*
Created by Franz Zemen 11/06/2022
License Type: 
*/
import {AppExecutionContextDefaults, appSchemaWrapper} from '@franzzemen/app-execution-context';
import {ExecutionContextDefaults, executionSchemaWrapper} from '@franzzemen/execution-context';
import {LogExecutionContextDefaults, logSchemaWrapper} from '@franzzemen/logger-adapter';
import {reCommonSchemaWrapper} from '@franzzemen/re-common';
import {
  DataTypeExecutionContext,
  DataTypeExecutionContextDefaults,
  ReDataType,
  reDataTypeSchemaWrapper
} from '@franzzemen/re-data-type';
import Validator, {ValidationError} from 'fastest-validator';
import {isPromise} from 'util/types';

export interface ExpressionOptions {
  allowUnknownDataType?: boolean;
}

export interface ReExpression extends ReDataType {
  expression?: ExpressionOptions;
}

export interface ExpressionExecutionContext extends DataTypeExecutionContext {
  re?: ReDataType;
}

export class ExpressionExecutionContextDefaults {
  static AllowUnknownDataType = false;
  static ExpressionOptions: ExpressionOptions = {
    allowUnknownDataType: ExpressionExecutionContextDefaults.AllowUnknownDataType
  }
  static ReExpression: ReExpression = {
    expression: ExpressionExecutionContextDefaults.ExpressionOptions
  }
  static ExpressionExecutionContext: ExpressionExecutionContext = {
    execution: ExecutionContextDefaults.Execution(),
    app: AppExecutionContextDefaults.App,
    log: LogExecutionContextDefaults.Log,
    re: DataTypeExecutionContextDefaults.ReDataType
  };
}

export const expressionOptionsSchema = {
  allowUnknownDataType: {
    type: 'boolean',
    optional: true,
    default: ExpressionExecutionContextDefaults.AllowUnknownDataType
  }
};

export const expressionOptionsSchemaWrapper = {
  type: 'object',
  optional: true,
  default: ExpressionExecutionContextDefaults.ExpressionOptions,
  props: expressionOptionsSchema
};

const reExpressionSchema = {
  common: reCommonSchemaWrapper,
  data: reDataTypeSchemaWrapper,
  expression: expressionOptionsSchemaWrapper
};

export const reExpressionSchemaWrapper = {
  type: 'object',
  optional: true,
  default: ExpressionExecutionContextDefaults.ReExpression,
  props: reExpressionSchema
};


export const expressionExecutionContextSchema = {
  execution: executionSchemaWrapper,
  app: appSchemaWrapper,
  log: logSchemaWrapper,
  re: reExpressionSchemaWrapper
};

export const expressionExecutionContextSchemaWrapper = {
  type: 'object',
  optional: true,
  default: ExpressionExecutionContextDefaults.ExpressionExecutionContext,
  props: expressionExecutionContextSchema
};


export function isExpressionExecutionContext(options: any | ExpressionExecutionContext): options is ExpressionExecutionContext {
  return options && 're' in options; // Faster than validate
}

const check = (new Validator({useNewCustomCheckerFunction: true})).compile(expressionExecutionContextSchema);

export function validate(context: ExpressionExecutionContext): true | ValidationError[] {
  const result = check(context);
  if (isPromise(result)) {
    throw new Error('Unexpected asynchronous on ExpressionExecutionContext validation');
  } else {
    if (result === true) {
      context.validated = true;
    }
    return result;
  }
}


