import {ExecutionContextI} from '@franzzemen/app-utility';
import {AttributeExpression, isAttributeExpression, isAttributeExpressionReference} from './attribute-expression';
import {Expression, ExpressionReference, ExpressionType, isExpressionType} from '../expression';
import {FunctionExpression, isFunctionExpression, isFunctionExpressionReference} from './function-expression';
import {ExpressionScope} from '../scope/expression-scope';
import {isSetExpression, isSetExpressionReference, SetExpression} from './set-expression';
import {isValueExpression, isValueExpressionReference, ValueExpression} from './value-expression';


/**
 * Understands how to create an expression from a reference
 */
export class ExpressionFactory  {
  // protected functionExpressionReferences: FunctionExpressionReference[] = [];
  // protected functionExpressions = new Map<string,FunctionExpression>();


  createExpression (expressionRef: ExpressionReference | Expression, scope: ExpressionScope, ec?:ExecutionContextI) : Expression | ValueExpression | AttributeExpression {
    if(isExpressionType(expressionRef.type)) {
      switch(expressionRef.type) {
        case ExpressionType.Value:
          if(isValueExpression(expressionRef) || isValueExpressionReference(expressionRef)) {
            return new ValueExpression(expressionRef, scope, ec);
          } else {
            throw new Error('Inconsistent expression reference for ValueExpression');
          }
        case ExpressionType.Attribute:
          if(isAttributeExpression(expressionRef) || isAttributeExpressionReference(expressionRef)) {
            return new AttributeExpression(expressionRef, scope, ec);
          }else {
            throw new Error('Inconsistent expression reference for AttributeExpression');
          }
        case ExpressionType.Function:
          if(isFunctionExpression(expressionRef) || isFunctionExpressionReference(expressionRef)) {
            return new FunctionExpression(expressionRef, scope, ec);
          } else {
            throw new Error('Inconsistent expression reference for Function Expression');
          }
        case ExpressionType.Set:
          if(isSetExpression(expressionRef) || isSetExpressionReference(expressionRef)) {
            return new SetExpression(expressionRef, scope, ec);
          } else {
            throw new Error('Inconsistent expression reference for Set Expression');
          }
      }
    }
    // TODO: Create custom expression from a module load
  }



  constructor(execContext?: ExecutionContextI) {
  }
/*
  addFunctionExpressions(ref: FunctionExpressionReference[], execContext?:ExecutionContextI) {
    ref.forEach(functionExpressionRef => {
      if(fu)
    });
    //this.functionExpressionReferences = this.functionExpressionReferences.concat(ref);
  }
*/

}
// TODO: MOved this to scope, delete it
// export const expressionFactory = new ExpressionFactory();


// TODO: write tests for expression factory
