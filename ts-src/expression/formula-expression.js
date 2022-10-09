import { LoggerAdapter } from '@franzzemen/app-utility';
import { logErrorAndReturn, logErrorAndThrow } from '@franzzemen/app-utility/enhanced-error.js';
import { isFragment } from '@franzzemen/re-common';
import { isPromise } from 'util/types';
import { Expression, StandardExpressionType } from '../expression.js';
import { ExpressionScope } from '../scope/expression-scope.js';
export var FormulaOperator;
(function (FormulaOperator) {
    FormulaOperator["Add"] = "+";
    FormulaOperator["Subtract"] = "-";
    FormulaOperator["Multiply"] = "*";
    FormulaOperator["Divide"] = "/";
})(FormulaOperator || (FormulaOperator = {}));
const sanitizedOperators = ['+', '-', '*', '/'];
export const formulaOperators = [FormulaOperator.Add, FormulaOperator.Subtract, FormulaOperator.Multiply, FormulaOperator.Divide];
export function isFormulaExpressionReference(ref) {
    return ref['type'] === StandardExpressionType.Formula && 'operator' in ref && 'group' in ref;
}
export function isFormulaElement(element) {
    return element instanceof FormulaElement;
}
export function isFormula(formula) {
    return formula instanceof Formula;
}
export class FormulaElement {
    constructor() {
    }
}
export class Formula {
    constructor() {
        this.elements = [];
    }
}
export class FormulaExpression extends Expression {
    constructor(ref, scope, ec) {
        super(ref, scope, ec);
        this.formula = new Formula();
        this.refName = ref.refName;
        this.formula.operator = ref.operator;
        this.formula = new Formula();
        this.formula.operator = ref.operator;
        FormulaExpression.recurseFromFormulaReference(this.formula, ref.group, scope, ec);
    }
    static recurseFromFormulaReference(currentFormula, grouping, scope, ec) {
        grouping.forEach(groupItem => {
            if (isFragment(groupItem)) {
                const expressionFactory = scope.get(ExpressionScope.ExpressionFactory);
                let formulaElement = new FormulaElement();
                formulaElement.operator = groupItem.operator;
                formulaElement.expression = expressionFactory.createExpression(groupItem.reference, scope, ec);
                currentFormula.elements.push(formulaElement);
                return;
            }
            else {
                const formula = new Formula();
                formula.operator = groupItem.operator;
                FormulaExpression.recurseFromFormulaReference(formula, groupItem.group, scope, ec);
                currentFormula.elements.push(formula);
            }
        });
    }
    awaitEvaluation(dataDomain, scope, ec) {
        const stringsOrPromises = [];
        const hasAsync = this.recurseInnerEval(stringsOrPromises, this.formula.elements, dataDomain, scope, ec);
        if (!hasAsync) {
            let strings = stringsOrPromises;
            strings.splice(0, 0, `${this.sanitizeOperator(this.formula.operator, ec)} (`);
            return this.concatStringsAndReturn(strings, scope, ec);
        }
        else {
            return Promise.all(stringsOrPromises)
                .then(strings => {
                strings.splice(0, 0, `${this.sanitizeOperator(this.formula.operator, ec)} (`);
                return this.concatStringsAndReturn(strings, scope, ec);
            });
        }
    }
    concatStringsAndReturn(strings, scope, ec) {
        let evaluation = '';
        for (let fragment of strings) {
            evaluation += fragment;
        }
        let value = eval(evaluation);
        if (typeof value !== 'number') {
            const log = new LoggerAdapter(ec, 're-expression', 'formula-expression', 'concatStringsAndReturn');
            throw logErrorAndReturn(`Potential security violation: value "${value}" is not a number.`, log, ec);
        }
        return this.awaitEval(value, scope, ec);
    }
    recurseInnerEval(stringsOrPromises = [], elements, dataDomain, scope, ec) {
        const log = new LoggerAdapter(ec, 're-expression', 'formula-expression', 'recurseInnerEval');
        let hasAsync = false;
        elements.forEach(element => {
            if (isFormulaElement(element)) {
                const elementResultOrPromise = element.expression.awaitEvaluation(dataDomain, scope, ec);
                if (isPromise(elementResultOrPromise)) {
                    hasAsync = true;
                    stringsOrPromises.push(elementResultOrPromise
                        .then(value => {
                        if (typeof value === 'number') {
                            return ` ${this.sanitizeOperator(element.operator, ec)} ${this.sanitizeNumber(value)}`;
                        }
                        else {
                            throw logErrorAndReturn(`Potential security violation: value "${elementResultOrPromise}" is not a number.`, log, ec);
                        }
                    }, err => {
                        throw logErrorAndReturn(err, log, ec);
                    }));
                }
                else {
                    if (typeof elementResultOrPromise === 'number') {
                        stringsOrPromises.push(` ${this.sanitizeOperator(element.operator, ec)} ${this.sanitizeNumber(elementResultOrPromise)}`);
                    }
                    else {
                        logErrorAndThrow(`Potential security violation: value "${elementResultOrPromise}" is not a number.`, log, ec);
                    }
                }
            }
            else {
                stringsOrPromises.push(` ${this.sanitizeOperator(element.operator)} (`);
                if (this.recurseInnerEval(stringsOrPromises, element.elements, dataDomain, scope, ec) === true) {
                    hasAsync = true;
                }
            }
        });
        stringsOrPromises.push(')');
        return hasAsync;
    }
    sanitizeOperator(operator, ec) {
        if (sanitizedOperators.some(sanitizedOperator => sanitizedOperator === operator)) {
            return operator;
        }
        else {
            const log = new LoggerAdapter(ec, 're-expression', 'formula-expression', 'sanitizeOperator');
            log.warn(this, `FormulaExpression with refName ${this.refName} may contain script in one of its operators "${operator}"`);
            logErrorAndThrow(`FormulaExpression with refName ${this.refName} may contain script in one of its operators "${operator}"`);
        }
    }
    sanitizeNumber(_number, ec) {
        if (typeof _number === 'number') {
            return _number;
        }
        else {
            const log = new LoggerAdapter(ec, 're-expression', 'formula-expression', 'sanitizeNumber');
            log.warn(this, `FormulaExpression with refName ${this.refName} may contain script in one of its resulting formula expression values "${_number}"`);
            logErrorAndThrow(`FormulaExpression with refName ${this.refName} may contain script in one of its resulting formula expression values "${_number}"`);
        }
    }
    to(ec) {
        const ref = {
            refName: this.refName,
            operator: this.formula.operator,
            group: []
        };
        super.toBase(ref, ec);
        FormulaExpression.recurseToFormulaExpressionReference(ref, this.formula.elements, ec);
        return ref;
    }
    static recurseToFormulaExpressionReference(currentGrouping, elements, ec) {
        elements.forEach(element => {
            if (isFormulaElement(element)) {
                const fragment = {
                    operator: element.operator,
                    reference: element.expression.to(ec)
                };
                currentGrouping.group.push(fragment);
            }
            else {
                const grouping = {
                    operator: element.operator,
                    group: []
                };
                FormulaExpression.recurseToFormulaExpressionReference(grouping, element.elements, ec);
                currentGrouping.group.push(grouping);
            }
        });
    }
}
//# sourceMappingURL=formula-expression.js.map