import { StandardExpressionType } from '../expression.js';
import { MultivariateParser } from './multivariate-parser.js';
export class SetExpressionParser extends MultivariateParser {
    constructor() {
        super(StandardExpressionType.Set);
    }
    parse(remaining, scope, hints, ec) {
        let expRef, set, parserMessages;
        const multivariateResult = this.parseMultivariate(remaining, scope, hints, ec);
        [remaining, expRef, set, parserMessages] = [...multivariateResult];
        if (expRef) {
            return [remaining, { type: expRef.type, dataTypeRef: expRef.dataTypeRef, set, multivariate: true }, undefined];
        }
        else {
            return [remaining, undefined, undefined];
        }
    }
}
//# sourceMappingURL=set-expression-parser.js.map