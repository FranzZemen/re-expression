import {ModuleResolution} from '@franzzemen/app-utility';
import {Scope} from '@franzzemen/re-common';
import {StandardDataType} from '@franzzemen/re-data-type';
import chai from 'chai';
import 'mocha';
import {isPromise} from 'util/types';
import {
  ExpressionFactory,
  ExpressionHintKey,
  ExpressionScope, ExpressionStackParser,
  ExpressionType,
  FunctionExpression,
  FunctionExpressionReference
} from '../publish/index.js';


const expect = chai.expect;
const should = chai.should();


const unreachableCode = false;

describe('re-expression tests', () => {
  describe('function expression tests', () => {
    describe('function-expression.test', () => {
      it('should evaluate to 5', () => {
        const ref: FunctionExpressionReference = {
          refName: 'EvaluatesTo5',
          type: ExpressionType.Function,
          dataTypeRef: StandardDataType.Number,
          module: {
            moduleName: '../../../testing/parser/await-evaluation-factory-number-5.js',
            functionName: 'awaitEvaluationFactoryNumber5',
            moduleResolution: ModuleResolution.es
          }
        };

        const scope: ExpressionScope = new ExpressionScope();
        const expression: FunctionExpression = new FunctionExpression(ref, scope);
        (scope.get(ExpressionScope.ExpressionFactory) as ExpressionFactory).loadAwaitEvaluationFunctions(expression, scope);
        const resultOrPromise = Scope.resolve(scope);

        if (isPromise(resultOrPromise)) {
          return resultOrPromise.then(trueVal => {
            // We already know this custom function doesn't return a promise.
            expression.awaitEvaluationFunction.should.exist;
            const result = expression.awaitEvaluation({}, scope);
            if(isPromise(result)) {
              unreachableCode.should.be.true;
            } else {
              result.should.equal(5);
            }
          });
        } else {
          unreachableCode.should.be.true;
        }
      });

      it('should evaluate to 5 using Text Format with parsing doing the dynamic loading', () => {
        const scope: ExpressionScope = new ExpressionScope();
        const parser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
        const [remaining, ref] = parser.parse(`<<ex
                  data-type=Number
                  module= {
                            "moduleName": "../../../testing/parser/await-evaluation-factory-number-5.js",
                            "functionName":"awaitEvaluationFactoryNumber5",
                            "moduleResolution":"es"
                          }>> @ReturnsNumber5`, scope);
        const functionExpression = new FunctionExpression(ref as FunctionExpressionReference, scope);
        (scope.get(ExpressionScope.ExpressionFactory) as ExpressionFactory).loadAwaitEvaluationFunctions(functionExpression, scope);
        const trueValOrPromise = Scope.resolve(scope);
        // ES 5 module, parsing will return a promise
        if (isPromise(trueValOrPromise)) {
          return trueValOrPromise
            .then(truVal => {
              functionExpression.awaitEvaluationFunction.should.exist;
            }, err => {
              console.log(err);
              unreachableCode.should.be.true;
            });
        } else {
          unreachableCode.should.be.true;
        }
      });
      it('should evaluate to [1, 2, 3] using Text Format', () => {
        const scope: ExpressionScope = new ExpressionScope();
        const parser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
        const [, ref] = parser.parse(`
                  <<ex
                    data-type=Number
                    module= {
                              "moduleName": "../../../testing/parser/await-evaluation-factory-params.js",
                              "functionName":"awaitEvaluationFactoryParams",
                              "moduleResolution":"es"
                            }>> @ReturnsInput[1, 2, 3]`, scope);
        const functionExpression = new FunctionExpression(ref as FunctionExpressionReference, scope);
        (scope.get(ExpressionScope.ExpressionFactory) as ExpressionFactory).loadAwaitEvaluationFunctions(functionExpression, scope);
        const trueValOrPromise = Scope.resolve(scope);
        // ES 5 module, parsing will return a promise
        if (isPromise(trueValOrPromise)) {
          return trueValOrPromise
            .then(truVal => {
              functionExpression.awaitEvaluationFunction.should.exist;
              const resultOrPromise = functionExpression.awaitEvaluation({}, scope);
              if (isPromise(resultOrPromise)) {
                // Function doesn't return a promise
                unreachableCode.should.be.true;
              } else {
                Array.isArray(resultOrPromise).should.be.true;
                if (Array.isArray(resultOrPromise)) {
                  resultOrPromise.length.should.equal(3);
                  resultOrPromise[0].should.equal(1);
                  resultOrPromise[1].should.equal(2);
                  resultOrPromise[2].should.equal(3);
                } else {
                  unreachableCode.should.be.true;
                }
              }
            }, err => {
              console.log(err);
              unreachableCode.should.be.true;
            });
        } else {
          unreachableCode.should.be.true;
        }
      });
    });
  });
});
