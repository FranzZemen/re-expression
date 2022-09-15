import {ModuleResolution} from '@franzzemen/app-utility';
import {logErrorAndThrow} from '@franzzemen/app-utility/enhanced-error.js';
import {StandardDataType} from '@franzzemen/re-data-type';
import chai from 'chai';
import 'mocha';
import {isPromise} from 'util/types';
import {
  ExpressionScope,
  ExpressionStackParser,
  ExpressionType,
  FunctionExpression,
  FunctionExpressionReference
} from '../publish/index.js';


const expect = chai.expect;
const should = chai.should();

const scope: ExpressionScope = new ExpressionScope();
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
            moduleName: '.+./../../testing/parser/await-evaluation-factory-number-5',
            functionName: 'awaitEvaluationFactoryNumber5',
            moduleResolution: ModuleResolution.es
          }
        }
        const expression: FunctionExpression = new FunctionExpression(ref, scope);
        // ES module, we already know we're getting a promise
        const promise = expression.initialize(scope);
        if(isPromise(promise)) {
          return promise.then(trueVal => {
            // We already know this custom function doesn't return a promise.
            const result = expression.evaluate({}, scope);
            result.should.equal(5);
          })
        } else {
          unreachableCode.should.be.true;
        }
      })
      /*
      it('should evaluate to 5 using Text Format', () => {
        const parser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
        const refOrPromise = parser.parse(`<<ex
                  data-type=Number
                  module= {
                            "moduleName": "../../../testing/parser/await-evaluation-factory-number-5",
                            "functionName":"awaitEvaluationFactoryNumber5",
                            "moduleResolution":"es"
                          }>> @ReturnsNumber5`, scope);
        if(isPromise(refOrPromise)) {
          return refOrPromise
            .then(ref => {
              const expression: FunctionExpression = new FunctionExpression(ref[1] as FunctionExpressionReference, scope);
              const promise = expression.initialize(scope);
              if (isPromise(promise)) {
                promise.then(trueVal => {
                  expression.evaluate({}, scope).should.equal(5);
                })
              }
            });
        }

              if(isPromise(resultOrPromise)) {
                return resultOrPromise
                  .then(result => {
                    result.should.equal(5);
                  })
              } else {
                unreachableCode.should.be.true;
              }
            })
        } else {
          unreachableCode.should.be.true;
        }


      })
      it('should evaluate to [1, 2, 3] using Text Format', () => {
        const parser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
        const refOrPromise = parser.parse(`
                  <<ex
                    data-type=Number
                    multivariate
                    module= {
                              "moduleName": "../../../testing/parser/await-evaluation-factory-params",
                              "functionName":"awaitEvaluationFactoryParams",
                              "moduleResolution":"es"
                            }>> @ReturnsInput[1, 2, 3]`, scope);
        if(isPromise(refOrPromise)) {
          return refOrPromise
            .then(ref => {
              const expression: FunctionExpression = new FunctionExpression(ref[1] as FunctionExpressionReference, scope);
              const promise = expression.initialize(scope);
              if(isPromise(promise)) {
                return promise.then(truVal => {
                  const resultOrPromise = expression.evaluate({}, scope);
                })
              }
              const resultOrPromise = expression.evaluate({}, scope);
              if(isPromise(resultOrPromise)) {
                return resultOrPromise
                  .then((result) => {
                    Array.isArray(result).should.be.true;
                    if(Array.isArray(result)) {
                      result.length.should.equal(3);
                      result[0].should.equal(1);
                      result[1].should.equal(2);
                      result[2].should.equal(3);
                    }
                  })
              } else {
                unreachableCode.should.be.true;
              }
            })
        } else {
          unreachableCode.should.be.true;
        }
      })
    */
    })
  });
})
