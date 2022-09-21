import {Hints, ModuleResolution} from '@franzzemen/app-utility';
import {StandardDataType} from '@franzzemen/re-data-type';
import chai from 'chai';
import 'mocha';
import {isPromise} from 'util/types';
import {FunctionExpressionReference} from '../../build/index.js';
import {
  AwaitEvaluationFactory,
  ExpressionHintKey,
  ExpressionScope, ExpressionType,
  FunctionExpressionParser, isFunctionExpressionReference,
  ResolvedExpressionParserResult
} from '../../publish/index.js';


const expect = chai.expect;
const should = chai.should();

const scope = new ExpressionScope();
const parser = new FunctionExpressionParser();
const unreachableCode = false;

describe('Rules Engine Tests', () => {
  describe('Function Expression Parser Tests', () => {
    describe('/core/expression/parser/function-expression-parser.test', () => {
      it('should return undefined ref for no data type', done => {
        const hints = new Hints('');
        hints.loadAndResolve('') as Hints;
        const [remaining, ref] = parser.parseAndResolve('@TestFunction', scope, hints);
        expect(ref).to.be.undefined;
        done();
      });
      it('should fail to parse for no registered AwaitEvaluation', () => {
        const hints = new Hints('');
        hints.loadAndResolve('');
        hints.set(ExpressionHintKey.DataType, StandardDataType.Number);
        try {
          const [remaining, ref] = parser.parseAndResolve('@TestFunction', scope, hints) as ResolvedExpressionParserResult;
        } catch (err) {
          expect(err.message.startsWith('No AwaitEvaluation')).to.be.true;
        }
      });

      it('should parse with registered AwaitEvaluation', () => {
        const factory: AwaitEvaluationFactory = scope.get(ExpressionScope.AwaitEvaluationFactory);
        const valOrPromise = factory.register({
          refName: 'TestFunction',
          module: {
            moduleName: '../../../testing/parser/await-evaluation-factory-number-5.js',
            functionName: 'awaitEvaluationFactoryNumber5',
            moduleResolution: ModuleResolution.es
          }
        });
        if (isPromise(valOrPromise)) {
          return valOrPromise
            .then(val => {

              const hints = new Hints('');
              hints.loadAndResolve();
              hints.set(ExpressionHintKey.DataType, StandardDataType.Number);
              try {
                const value = parser.parseAndResolve('@TestFunction', scope, hints);
                if(isPromise(value)) {
                  unreachableCode.should.be.true; // Test function was loaded above, so parsing doesn't go async.
                } else {
                  const [remaining, ref] = value as [string, FunctionExpressionReference];
                    if (isFunctionExpressionReference(ref)) {
                      ref.should.exist;
                      ref.type.should.equal(ExpressionType.Function);
                      ref.refName.should.equal('TestFunction');
                      ref.dataTypeRef.should.equal(StandardDataType.Number);
                    } else {
                      unreachableCode.should.be.true;
                    }
                }
              } catch (err) {
                unreachableCode.should.be.true;
              }
            }, err => {
              console.log(err);
              unreachableCode.should.be.true;
            });
        } else {
          unreachableCode.should.be.true;
        }
      });
      it('should parse with inline AwaitEvaluation, property by property', () => {
        const factory: AwaitEvaluationFactory = scope.get(ExpressionScope.AwaitEvaluationFactory);
        //factory.register({refName:'TestFunction', module: {moduleName:'../../../testing/core/expression/parser/test.factory.function', functionName: 'testFactoryFunction'}});
        const hints = new Hints('');
        hints.loadAndResolve();
        hints.set(ExpressionHintKey.DataType, StandardDataType.Number);
        hints.set(ExpressionHintKey.ModuleName, '../../../testing/parser/await-evaluation-factory-number-5.js');
        hints.set(ExpressionHintKey.FunctionName, 'awaitEvaluationFactoryNumber5');
        hints.set(ExpressionHintKey.ModuleResolutionName, ModuleResolution.es);
        try {
          const value = parser.parseAndResolve('@TestFunction', scope, hints);
          if(isPromise(value)) {
            unreachableCode.should.be.true; // Test function was loaded above, so parsing doesn't go async.
          } else {
            const [remaining, ref] = value;
            if (isFunctionExpressionReference(ref)) {
              ref.should.exist;
              ref.type.should.equal(ExpressionType.Function);
              ref.refName.should.equal('TestFunction');
              ref.dataTypeRef.should.equal(StandardDataType.Number);
              (typeof factory.getRegistered('TestFunction')).should.equal('function');
            } else {
              unreachableCode.should.be.true;
            }
          }
        } catch (err) {
          unreachableCode.should.be.true;
        }
      });
      it('should parse with inline AwaitEvaluation as module', done => {
        const factory: AwaitEvaluationFactory = scope.get(ExpressionScope.AwaitEvaluationFactory);
        factory.unregister('TestFunction');
        const hints = new Hints('');
        hints.loadAndResolve();
        hints.set(ExpressionHintKey.DataType, StandardDataType.Number);
        hints.set(ExpressionHintKey.Module, `{
                "moduleName": "../../../testing/parser/await-evaluation-factory-number-5.js", 
                "functionName":"awaitEvaluationFactoryNumber5",
                "moduleResolution": "es"}`);
        try {
          const result = parser.parseAndResolve('@TestFunction', scope, hints);''
          if(isPromise(result[1])) {
            result[1].then(ref => {
              if (isFunctionExpressionReference(ref)) {
                ref.should.exist;
                ref.type.should.equal(ExpressionType.Function);
                ref.refName.should.equal('TestFunction');
                ref.dataTypeRef.should.equal(StandardDataType.Number);
                (typeof factory.getRegistered('TestFunction')).should.equal('function');
              } else {
                unreachableCode.should.be.true;
              }
            });
          } else {
            unreachableCode.should.be.true;
          }
        } catch (err) {
          unreachableCode.should.be.true;
        }
        done();
      });
      /*
      it('should parse with inline AwaitEvaluation as module for a params function expression ParamsFunction', done => {
        const factory: AwaitEvaluationFactory = scope.get(ExpressionScope.AwaitEvaluationFactory);
        factory.unregister('ParamsFunction');
        const hints = new Hints('');
        hints.loadAndInitialize();
        hints.set(ExpressionHintKey.DataType, StandardDataType.Number);
        hints.set(ExpressionHintKey.Module, `{
                "moduleName": "../../../testing/parser/await-evaluation-factory-number-5.js", 
                "functionName":"awaitEvaluationFactoryNumber5",
                "moduleResolution": "es"}`);
        try {
          const promise = parser.parse('@ParamsFunction', scope, hints) as Promise<ExpressionParseResult>;
          promise.then(([remaining, ref]) => {
            if (isFunctionExpressionReference(ref)) {
              ref.should.exist;
              ref.type.should.equal(ExpressionType.Function);
              ref.refName.should.equal('ParamsFunction');
              ref.dataTypeRef.should.equal(StandardDataType.Number);
              (typeof factory.getRegistered('ParamsFunction')).should.equal('function');
            } else {
              unreachableCode.should.be.true;
            }
          });
        } catch (err) {
          unreachableCode.should.be.true;
        }
        done();
      });
      */
    });
  });
});

