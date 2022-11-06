import {logErrorAndReturn, logErrorAndThrow} from '@franzzemen/enhanced-error';
import {LogExecutionContext, LoggerAdapter} from '@franzzemen/logger-adapter';
import {Fragment, FragmentOrGrouping, isFragment, RecursiveGrouping} from '@franzzemen/re-common';
import {isPromise} from 'util/types';
import {Expression, ExpressionReference, StandardExpressionType} from '../expression.js';
import {ExpressionFactory} from '../factory/expression-factory.js';
import {ExpressionScope} from '../scope/expression-scope.js';


export enum FormulaOperator {
  Add = '+',
  Subtract = '-',
  Multiply = '*',
  Divide = '/'
}

// Non exported version for security sanitization
const sanitizedOperators: string[] = ['+', '-', '*', '/'];
export const formulaOperators: FormulaOperator[] = [FormulaOperator.Add, FormulaOperator.Subtract, FormulaOperator.Multiply, FormulaOperator.Divide];


export function isFormulaExpressionReference(ref: any | FormulaExpressionReference): ref is FormulaExpressionReference {
  return ref['type'] === StandardExpressionType.Formula && 'operator' in ref && 'group' in ref;
}

export function isFormulaElement(element: any | FormulaElement): element is FormulaElement {
  return element instanceof FormulaElement;
}

export function isFormula(formula: any | Formula): formula is Formula {
  return formula instanceof Formula;
}


export class FormulaElement {
  operator: FormulaOperator;
  expression: Expression;

  constructor() {
  }
}

export class Formula {
  operator: FormulaOperator;
  elements: (Formula | FormulaElement) [] = [];

  constructor() {
  }
}


export interface FormulaExpressionReference extends RecursiveGrouping<FormulaOperator, ExpressionReference>, ExpressionReference {
  refName?: string;
  // module?: ModuleDefinition;
}


export class FormulaExpression extends Expression {
  refName?: string;
  formula: Formula = new Formula();

  constructor(ref: FormulaExpressionReference, scope: ExpressionScope, ec?: LogExecutionContext) {
    super(ref, scope, ec);
    this.refName = ref.refName;
    this.formula.operator = ref.operator;
    this.formula = new Formula();
    this.formula.operator = ref.operator;
    FormulaExpression.recurseFromFormulaReference(this.formula, ref.group, scope, ec);
  }

  private static recurseFromFormulaReference(currentFormula: Formula, grouping: FragmentOrGrouping<FormulaOperator, ExpressionReference>[], scope: ExpressionScope, ec?: LogExecutionContext) {
    grouping.forEach(groupItem => {
      if (isFragment(groupItem)) {
        const expressionFactory: ExpressionFactory = scope.get(ExpressionScope.ExpressionFactory);
        let formulaElement = new FormulaElement();
        formulaElement.operator = groupItem.operator;
        formulaElement.expression = expressionFactory.createExpression(groupItem.reference, scope, ec);
        currentFormula.elements.push(formulaElement);
        return;
      } else {
        const formula = new Formula();
        formula.operator = groupItem.operator;
        FormulaExpression.recurseFromFormulaReference(formula, groupItem.group, scope, ec);
        currentFormula.elements.push(formula);
      }
    });
  }


  /**
   * Important security note!!!:
   * This implementation leverages eval(), which has potential security flaws through injection.  The method converts
   * each of the contained formula expressions to a number through the expression's awaitEvaluation method.  Since
   * Formula Expressions should only contain Float or Number Expressions, all Standard Expressions convert their values
   * to the specific type.  This leaves four holes.  1) Text Expressions getting 'snuck in' 2) The Unknown Data Type
   * 3) Function Expressions which by definition return values at run time are controlled by the implementer and 4) Custom
   * DataTypes since the datatype ultimately controls value evaluation.  To protect against all three cases, this method
   * verifies that the returned value is indeed a number, closing the opportunity for script injection.
   *
   * An alternative contrived value by value framework to evaluate math would be much slower, and complex.  In essense,
   * the above provides the same protection.
   * @param dataDomain
   * @param scope
   * @param ec
   */
  awaitEvaluation(dataDomain: any, scope: ExpressionScope, ec?: LogExecutionContext): number | Promise<number> {
    const stringsOrPromises: (string | Promise<string>)[] = [];
    const hasAsync = this.recurseInnerEval(stringsOrPromises, this.formula.elements, dataDomain, scope, ec);
    if(!hasAsync) {
      let strings: string[] = stringsOrPromises as string[];
      strings.splice(0,0, `${this.sanitizeOperator(this.formula.operator, ec)} (`);
      return this.concatStringsAndReturn(strings, scope, ec);
    } else {
      return Promise.all(stringsOrPromises)
        .then(strings => {
          strings.splice(0,0, `${this.sanitizeOperator(this.formula.operator, ec)} (`);
          return this.concatStringsAndReturn(strings, scope, ec);
        })
    }
  }

  private concatStringsAndReturn(strings: string[], scope: ExpressionScope, ec?: LogExecutionContext): number | Promise<number> {
    let evaluation: string = '';
    for(let fragment of strings) {
      evaluation += fragment;
    }
    let value = eval(evaluation); // All of evaluation has been sanitized and ensures only numbers present.
    if(typeof value !== 'number') {
      const log = new LoggerAdapter(ec, 're-expression', 'formula-expression', 'concatStringsAndReturn');
      throw logErrorAndReturn(`Potential security violation: value "${value}" is not a number.`, log);
    }
    return this.awaitEval(value, scope, ec);
  }

  private recurseInnerEval(stringsOrPromises: (string | Promise<string>)[] = [], elements: (Formula | FormulaElement)[], dataDomain: any, scope: ExpressionScope, ec?: LogExecutionContext) : boolean {
    const log = new LoggerAdapter(ec, 're-expression', 'formula-expression', 'recurseInnerEval');
    let hasAsync = false;
    elements.forEach(element => {
      if(isFormulaElement(element)) {
        const elementResultOrPromise = element.expression.awaitEvaluation(dataDomain, scope, ec);
        if(isPromise(elementResultOrPromise)) {
          hasAsync = true;
          stringsOrPromises.push(
            elementResultOrPromise
              .then(value => {
                if (typeof value === 'number') {
                  return ` ${this.sanitizeOperator(element.operator, ec)} ${this.sanitizeNumber(value)}`
                } else {
                  throw logErrorAndReturn(`Potential security violation: value "${elementResultOrPromise}" is not a number.`, log);
                }
              }, err => {
                throw logErrorAndReturn(err, log);
              }));
        } else {
          if(typeof elementResultOrPromise === 'number') {
            stringsOrPromises.push(` ${this.sanitizeOperator(element.operator, ec)} ${this.sanitizeNumber(elementResultOrPromise)}`);
          } else {
            logErrorAndThrow(`Potential security violation: value "${elementResultOrPromise}" is not a number.`, log);
          }
        }
      } else {
        stringsOrPromises.push(` ${this.sanitizeOperator(element.operator)} (`);
        if(this.recurseInnerEval(stringsOrPromises, element.elements, dataDomain,scope, ec) === true) {
          hasAsync = true;
        }
      }
    });
    stringsOrPromises.push(')');
    return hasAsync;
  }

  private sanitizeOperator(operator: string, ec?: LogExecutionContext): string | Promise<string> {
    if(sanitizedOperators.some(sanitizedOperator => sanitizedOperator === operator)) {
      return operator;
    } else {
      const log = new LoggerAdapter(ec, 're-expression', 'formula-expression', 'sanitizeOperator');
      log.warn(this, `FormulaExpression with refName ${this.refName} may contain script in one of its operators "${operator}"`)
      logErrorAndThrow(`FormulaExpression with refName ${this.refName} may contain script in one of its operators "${operator}"`);
    }
  }

  private sanitizeNumber(_number: number, ec?: LogExecutionContext): number {
    if(typeof _number === 'number') {
      return _number;
    } else {
      const log = new LoggerAdapter(ec, 're-expression', 'formula-expression', 'sanitizeNumber');
      log.warn(this, `FormulaExpression with refName ${this.refName} may contain script in one of its resulting formula expression values "${_number}"`)
      logErrorAndThrow(`FormulaExpression with refName ${this.refName} may contain script in one of its resulting formula expression values "${_number}"`);
    }
  }

  to(ec?: LogExecutionContext): FormulaExpressionReference {
    const ref: Partial<FormulaExpressionReference> = {
      refName: this.refName,
      operator: this.formula.operator,
      group: []
    };
    super.toBase(ref, ec);
    FormulaExpression.recurseToFormulaExpressionReference(ref as FormulaExpressionReference, this.formula.elements, ec);
    return ref as FormulaExpressionReference;
  }

  private static recurseToFormulaExpressionReference(currentGrouping: RecursiveGrouping<FormulaOperator, ExpressionReference>, elements: (Formula | FormulaElement)[], ec?: LogExecutionContext) {
    elements.forEach(element => {
      if(isFormulaElement(element)) {
        const fragment: Fragment<FormulaOperator, ExpressionReference> = {
          operator: element.operator,
          reference: element.expression.to(ec)
        }
        currentGrouping.group.push(fragment);
      } else {
        const grouping: RecursiveGrouping<FormulaOperator, ExpressionReference> = {
          operator: element.operator,
          group: []
        };
        FormulaExpression.recurseToFormulaExpressionReference(grouping, element.elements, ec);
        currentGrouping.group.push(grouping);
      }
    });
  }
}
