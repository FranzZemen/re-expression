import {EnhancedError, logErrorAndThrow} from '@franzzemen/enhanced-error';
import {LogExecutionContext, LoggerAdapter} from '@franzzemen/logger-adapter';
import {ModuleDefinition} from '@franzzemen/module-factory';
import {ModuleResolutionActionInvocation} from '@franzzemen/module-resolver';
import {reverseEnumerationToSet} from '@franzzemen/re-common';
import {DataTypeFactory, DataTypeI} from '@franzzemen/re-data-type';
import {isPromise} from 'node:util/types';
import {ExpressionScope} from './scope/expression-scope.js';


/**
 * Expression type identifying the type (and subclass) of Expression
 */


export enum StandardExpressionType {
  Value = 'Value',
  Attribute = 'Attribute',
  Function = 'Function',
  Set = 'Set',
  Formula = 'Formula'/*,
  Condition = 'Condition',
  Logical = 'Logical'
  */
}

export type ExpressionType = StandardExpressionType | string;


export function createExpressionType(type: string) {
  if (!expressionTypes.has(type)) {
    expressionTypes.add(type);
  }
}

export const expressionTypes: Set<string> = reverseEnumerationToSet(StandardExpressionType);

export function isExpressionType(expressionType: any | StandardExpressionType): expressionType is StandardExpressionType {
  return expressionType !== undefined && typeof expressionType === 'string' && expressionTypes.has(expressionType);
}

/**
 * The Reference Format shape for the base class
 */
export interface ExpressionReference {
  type: ExpressionType;
  dataTypeRef: string;
  dataTypeModule?: ModuleDefinition;
  multivariate?: boolean;
}

export function copyExpressionReference(ref: ExpressionReference): ExpressionReference {
  return {type: ref.type, dataTypeRef: ref.dataTypeRef, dataTypeModule: ref.dataTypeModule}; // TODO: copy Module Definition
}

export function isExpressionReference(ref: any | ExpressionReference): ref is ExpressionReference {
  return 'type' in ref && 'dataTypeRef' in ref;
}

export function isExpression(exp: any | Expression): exp is Expression {
  return isExpressionReference(exp) && 'init' in exp;
}

/**
 * Internal representation - should not be persisted or transmitted
 */
export abstract class Expression implements ExpressionReference {
  type: ExpressionType;
  dataTypeRef: string;
  dataType: DataTypeI;
  dataTypeModule?: ModuleDefinition;
  /**
   * If true, indicates that the ==> evaluated run time <== value could be multivariate (more than one element) (as of
   * this comment, an array)
   */
  multivariate: boolean = false;

  // TODO: ref, scope probably should not be optional????
  constructor(ref: ExpressionReference, scope: ExpressionScope, ec?: LogExecutionContext) {
    const log = new LoggerAdapter(ec, 're-expression', 'expression', `${Expression.name}.constructor`);
    this.type = ref.type;
    this.dataTypeRef = ref.dataTypeRef;
    const dataTypeFactory: DataTypeFactory = scope.get(ExpressionScope.DataTypeFactory);
    this.dataType = dataTypeFactory.getRegistered(this.dataTypeRef);
    this.dataTypeModule = ref.dataTypeModule;
    if (ref.multivariate !== undefined) {
      this.multivariate = ref.multivariate;
    } else {
      this.multivariate = false;
    }
  }

  customDataTypeRefLoadedAction: ModuleResolutionActionInvocation = (successfulResolution, scope: ExpressionScope, ec?: LogExecutionContext) => {
    const log = new LoggerAdapter(ec, 're-expression', 'expression', 'customDataTypeRefLoadedAction');
    if (this.dataType) {
      log.warn(this, `Action to set data type "${this.dataTypeRef}" called, but its already set`);
      logErrorAndThrow(new EnhancedError(`Action to set data type "${this.dataTypeRef}" called, but its already set`), log);
    } else {
      this.dataType = scope.getDataType(this.dataTypeRef, true, ec);
      if (!this.dataType) {
        log.warn(this, `Action to set data type "${this.dataTypeRef}" called, but it still doesn't exist in the factory, this method should only be called when it is`);
        logErrorAndThrow(new EnhancedError(`Action to set data type "${this.dataTypeRef}" called, but it still doesn't exist in the factory, this method should only be called when it is`), log);
      } else {
        return true;
      }
    }
  };


  /**
   * Contract to convert from internal representation to a reference
   * @param ec
   */
  abstract to(ec?: LogExecutionContext): ExpressionReference;

  /**
   * Evaluate the expression.  Note that Value and Attribute expressions will never return a Promise.  Other expressions
   * may return a promise.  If a promise is returned, the entire call stack of the rules engine converts to asynchronous.
   * Both options are provided as a large number, if not all, rules to be executed in many scenario are synchronous,
   * but some may not be.
   * @param dataDomain
   * @param scope
   * @param ec
   */
  abstract awaitEvaluation(dataDomain: any, scope: Map<string, any>, ec?: LogExecutionContext): any | Promise<any>;

  /**
   * Sync only version - returns undefined if a Promise is encountered
   * @param dataDomain
   * @param scope
   * @param ec
   */
  /*
  evaluate(dataDomain: any, scope: Map<string, any>, ec?: LogExecutionContext): any | Promise<any> {
    const result = this.awaitEvaluation(dataDomain, scope, ec);
    if (isPromise(result)) {
      return undefined;
    }
    return result;
  }

   */

  /**
   * Async version - always returns a Promise
   * @param dataDomain
   * @param scope
   * @param ec
   */

  /*
  evaluateAsync(dataDomain: any, scope: Map<string, any>, ec?: LogExecutionContext): Promise<any> {
    const result = this.awaitEvaluation(dataDomain, scope, ec);
    if (isPromise(result)) {
      return result;
    }
    return Promise.resolve(result);
  }
   */

  /**
   * Create an ExpressionReference from itself
   * @param ref
   * @param ec
   * @protected
   */
  protected toBase(ref: Partial<ExpressionReference>, ec?: LogExecutionContext) {

    ref.type = this.type;
    ref.dataTypeRef = this.dataTypeRef;
    ref.dataTypeModule = this.dataTypeModule; // TODO: copy Module Definition
    if (this.multivariate) {
      ref.multivariate = this.multivariate;
    }
  }

  /**
   * Protected 'default' implementation for awaitEvaluation where evaluation is governed by the data type (literals).
   * @param data
   * @param scope
   * @param ec
   * @protected
   */
  protected awaitEval(data: any, scope: ExpressionScope, ec?: LogExecutionContext): any | Promise<any> {
    if (!this.dataType) {
      const dataTypeFactory: DataTypeFactory = scope.get(ExpressionScope.DataTypeFactory);
      this.dataType = dataTypeFactory.getRegistered(this.dataTypeRef);
    }
    if (isPromise(data)) {
      return data.then(_data => {
        return this.dataType.eval(_data);
      });
    } else {
      return this.dataType.eval(data);
    }
  }
}




