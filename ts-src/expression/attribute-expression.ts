import {ExecutionContextI, LoggerAdapter} from '@franzzemen/app-utility';
import {logErrorAndThrow} from '@franzzemen/app-utility/enhanced-error.js';
import {ExpressionScope} from '../scope/expression-scope.js';
import {Expression, ExpressionReference} from '../expression.js';
import pkg from 'object-path';
import {Path} from 'object-path';
const getFromPath = pkg.get;

export function isAttributeExpressionReference(ref: any | AttributeExpressionReference): ref is AttributeExpressionReference {
  return 'path' in ref;
}

export function isAttributeExpression(ref: any | AttributeExpression): ref is AttributeExpression {
  return ref instanceof AttributeExpression;
 // return 'path' in ref;
}


export interface AttributeExpressionReference extends ExpressionReference {
  path: Path;
}


export class AttributeExpression extends Expression {

  // The internal representation of path as expected by package 'object-path'
  private objectPath: Path;
  // The original set path which may match internal
  private originalPath: Path;

  constructor(ref: AttributeExpressionReference, scope: ExpressionScope, ec?: ExecutionContextI) {
    super(ref, scope, ec);
    this.path = ref.path;
  }

  get path(): Path {
    return this.originalPath;
  }

  set path(path: Path) {
    this.originalPath = path;
    if (typeof path === 'string') {
      // Note: This is always the case if path is obtained from the Text Format.  Only through the Reference Format can any
      // other of the Path types be passed in.  However, the Reference Format can leverage all the variations in the Text Format,
      // so common processing for both is used.
      this.objectPath = AttributeExpression.stringToPath(path);
    } else {
      this.objectPath = path;
    }
  }

  static stringToPath(path: string): Path {
    // Format rules engine attribute path to object-path

    // Replace bracket numeric array index with .number to match object-path
    const search = /\[([0-9]+)]/g;
    let result;
    let replaced = '';
    let lastIndex = 0;
    while ((result = search.exec(path)) !== null) {
      // If the first match is right at the start of path, we just output the matched index, otherwise we prefix with a '.' and append
      if (result.index > 0) {
        replaced += path.substring(lastIndex, result.index) + '.' + result[1];
      } else {
        replaced = result[1];
      }
      lastIndex = search.lastIndex;
    }
    // Add the rest of the path
    replaced += path.substring(lastIndex);
    return replaced;
  }

  to(ec?:ExecutionContextI): AttributeExpressionReference {
    const ref: Partial<AttributeExpressionReference> = {};
    super.toBase(ref, ec);
    ref.path = this.originalPath;
    return ref as AttributeExpressionReference;
  }

  awaitEvaluation(dataDomain: any, scope: ExpressionScope, ec?: ExecutionContextI): any | Promise<any> {
    const log = new LoggerAdapter(ec, 're-expression', 'attribute-expression', 'awaitEvaluation');
    if (!dataDomain) {
      return undefined;
    }
    // Convert path to something object path understands
    //let propertyValue: any;
    //const noArrayRegex = new RegExp('^[a-zA-Z0-9]');
    const propertyValue = getFromPath(dataDomain, this.objectPath);
    const isMultivariateValue = Array.isArray(propertyValue);
    if (this.multivariate) {
      if(isMultivariateValue) {
        const evaluation = [];
        propertyValue.forEach(value => evaluation.push(propertyValue === undefined ? undefined : this.awaitEval(propertyValue, scope)));
      } else {
        return propertyValue === undefined ? undefined : this.awaitEval(propertyValue, scope);
      }
    } else if (isMultivariateValue) {
      const err = new Error('Attribute Expression marked as not multivariate, but domain value is an array');
      logErrorAndThrow(err, log, ec);
    }
    return propertyValue === undefined ? undefined : this.awaitEval(propertyValue, scope);
  }

}
