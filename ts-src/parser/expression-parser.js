import { Scope } from '@franzzemen/re-common';
import { isPromise } from 'util/types';
export class ExpressionParser {
    constructor(refName) {
        this.refName = refName;
    }
    parseAndResolve(remaining, scope, hints, ec) {
        let expressionRef, parserMessages;
        [remaining, expressionRef, parserMessages] = this.parse(remaining, scope, hints, ec);
        let resultOrPromise = Scope.resolve(scope, ec);
        if (isPromise(resultOrPromise)) {
            const promise = resultOrPromise
                .then(truVal => {
                return expressionRef;
            });
            return [remaining, promise, parserMessages];
        }
        else {
            return [remaining, expressionRef, parserMessages];
        }
    }
}
//# sourceMappingURL=expression-parser.js.map