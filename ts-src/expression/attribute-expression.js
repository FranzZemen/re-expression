import { LoggerAdapter } from '@franzzemen/app-utility';
import { logErrorAndThrow } from '@franzzemen/app-utility/enhanced-error.js';
import { Expression } from '../expression.js';
import pkg from 'object-path';
const getFromPath = pkg.get;
export function isAttributeExpressionReference(ref) {
    return 'path' in ref;
}
export function isAttributeExpression(ref) {
    return ref instanceof AttributeExpression;
}
export class AttributeExpression extends Expression {
    constructor(ref, scope, ec) {
        super(ref, scope, ec);
        this.path = ref.path;
    }
    get path() {
        return this.originalPath;
    }
    set path(path) {
        this.originalPath = path;
        if (typeof path === 'string') {
            this.objectPath = AttributeExpression.stringToPath(path);
        }
        else {
            this.objectPath = path;
        }
    }
    static stringToPath(path) {
        const search = /\[([0-9]+)]/g;
        let result;
        let replaced = '';
        let lastIndex = 0;
        while ((result = search.exec(path)) !== null) {
            if (result.index > 0) {
                replaced += path.substring(lastIndex, result.index) + '.' + result[1];
            }
            else {
                replaced = result[1];
            }
            lastIndex = search.lastIndex;
        }
        replaced += path.substring(lastIndex);
        return replaced;
    }
    to(ec) {
        const ref = {};
        super.toBase(ref, ec);
        ref.path = this.originalPath;
        return ref;
    }
    awaitEvaluation(dataDomain, scope, ec) {
        const log = new LoggerAdapter(ec, 're-expression', 'attribute-expression', 'awaitEvaluation');
        if (!dataDomain) {
            return undefined;
        }
        const propertyValue = getFromPath(dataDomain, this.objectPath);
        const isMultivariateValue = Array.isArray(propertyValue);
        if (this.multivariate) {
            if (isMultivariateValue) {
                const evaluation = [];
                propertyValue.forEach(value => evaluation.push(propertyValue === undefined ? undefined : this.awaitEval(propertyValue, scope)));
            }
            else {
                return propertyValue === undefined ? undefined : this.awaitEval(propertyValue, scope);
            }
        }
        else if (isMultivariateValue) {
            const err = new Error('Attribute Expression marked as not multivariate, but domain value is an array');
            logErrorAndThrow(err, log, ec);
        }
        return propertyValue === undefined ? undefined : this.awaitEval(propertyValue, scope);
    }
}
//# sourceMappingURL=attribute-expression.js.map