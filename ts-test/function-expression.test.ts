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
            moduleName: '../../../testing/parser/await-evaluation-factory-number-5.js',
            functionName: 'awaitEvaluationFactoryNumber5',
            moduleResolution: ModuleResolution.es
          }
        };
        const expression: FunctionExpression = new FunctionExpression(ref, scope);
        // ES module, we already know we're getting a promise
        const promise = expression.initialize(scope);
        if (isPromise(promise)) {
          return promise.then(trueVal => {
            // We already know this custom function doesn't return a promise.
            const result = expression.evaluate({}, scope);
            result.should.equal(5);
          });
        } else {
          unreachableCode.should.be.true;
        }
      });
      it('should evaluate to 5 using Text Format with parsing doing the dynamic loading', () => {
        const parser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
        const refOrPromise = parser.parse(`<<ex
                  data-type=Number
                  module= {
                            "moduleName": "../../../testing/parser/await-evaluation-factory-number-5.js",
                            "functionName":"awaitEvaluationFactoryNumber5",
                            "moduleResolution":"es"
                          }>> @ReturnsNumber5`, scope);
        // ES 5 module, parsing will return a promise
        if (isPromise(refOrPromise)) {
          return refOrPromise
            .then(ref => {
              const expression: FunctionExpression = new FunctionExpression(ref[1] as FunctionExpressionReference, scope);
              const promise = expression.initialize(scope);
              if (isPromise(promise)) {
                // Parser has already loaded the expression
                unreachableCode.should.be.true;
              } else {
                expression.evaluate({}, scope).should.equal(5);
              }
            }, err => {
              console.log(err);
              unreachableCode.should.be.true;
            });
        } else {
          unreachableCode.should.be.true;
        }
      });
      it('should evaluate to [1, 2, 3] using Text Format', () => {
        const parser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
        const refOrPromise = parser.parse(`
                  <<ex
                    data-type=Number
                    multivariate
                    module= {
                              "moduleName": "../../../testing/parser/await-evaluation-factory-params.js",
                              "functionName":"awaitEvaluationFactoryParams",
                              "moduleResolution":"es"
                            }>> @ReturnsInput[1, 2, 3]`, scope);
        if (isPromise(refOrPromise)) {
          return refOrPromise
            .then(ref => {
              const expression: FunctionExpression = new FunctionExpression(ref[1] as FunctionExpressionReference, scope);
              const promise = expression.initialize(scope);
              if (isPromise(promise)) {
                // Parser has already loaded ES
                unreachableCode.should.be.true;
              } else {
                const resultOrPromise = expression.evaluate({}, scope);
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
              }
            }, err => {
              console.error(err);
            });
        } else {
          unreachableCode.should.be.true; // Loading ES file
        }
      });
    });
  });
});
