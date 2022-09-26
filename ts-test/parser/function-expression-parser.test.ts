import {Hints, ModuleResolution} from '@franzzemen/app-utility';
import {Scope} from '@franzzemen/re-common';
import {StandardDataType} from '@franzzemen/re-data-type';
import chai from 'chai';
import 'mocha';
import {isPromise} from 'util/types';
import {FunctionExpressionReference} from '../../build/index.js';
import {
  AwaitEvaluationFactory,
  ExpressionHintKey, ExpressionParserResult, ExpressionReference,
  ExpressionScope, ExpressionType,
  FunctionExpressionParser, isFunctionExpressionReference,
  ResolvedExpressionParserResult
} from '../../publish/index.js';


const expect = chai.expect;
const should = chai.should();

const unreachableCode = false;

describe('Rules Engine Tests', () => {
  describe('Function Expression Parser Tests', () => {
    describe('/core/expression/parser/function-expression-parser.test', () => {
      it('should return undefined ref for no data type', done => {
        const scope = new ExpressionScope();
        const parser = new FunctionExpressionParser();

        const hints = new Hints('');
        hints.loadAndResolve('');
        const [remaining, ref] = parser.parseAndResolve('@TestFunction', scope, hints);
        expect(ref).to.be.undefined;
        done();
      });
      it('should fail to parse for no registered AwaitEvaluation', () => {
        const scope = new ExpressionScope();
        const parser = new FunctionExpressionParser();

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
        const scope = new ExpressionScope();
        const parser = new FunctionExpressionParser();

        const factory: AwaitEvaluationFactory = scope.get(ExpressionScope.AwaitEvaluationFactory);
        scope.addAwaitEvaluationFunction({
          moduleRef: {
            refName: 'TestFunction',
            module: {
              moduleName: '../../../testing/parser/await-evaluation-factory-number-5.js',
              functionName: 'awaitEvaluationFactoryNumber5',
              moduleResolution: ModuleResolution.es
            }
          }
        });
        let [remaining, hints] = scope.parseHints(`<<ex ${ExpressionHintKey.DataType}=${StandardDataType.Number}>> @TestFunction`, 'ex');
        let [finalRemaining, functionExpressionRef] = parser.parse(remaining, scope, hints);
        const trueValOrPromise = Scope.resolve(scope);
        if (isPromise(trueValOrPromise)) {
          return trueValOrPromise
            .then(val => {
              functionExpressionRef.should.exist;
              functionExpressionRef.type.should.equal(ExpressionType.Function);
              functionExpressionRef.refName.should.equal('TestFunction');
              functionExpressionRef.dataTypeRef.should.equal(StandardDataType.Number);
              return;
            });
        } else {
          unreachableCode.should.be.true;
        }
      });
      it('should parse with inline AwaitEvaluation, property by property', () => {
        const scope = new ExpressionScope();
        const parser = new FunctionExpressionParser();

        const factory: AwaitEvaluationFactory = scope.get(ExpressionScope.AwaitEvaluationFactory);
        const remaining = `<<ex ${ExpressionHintKey.DataType}=${StandardDataType.Number} ${ExpressionHintKey.ModuleName}="../../../testing/parser/await-evaluation-factory-number-5.js" 
          ${ExpressionHintKey.FunctionName}=awaitEvaluationFactoryNumber5 ${ExpressionHintKey.ModuleResolution}= ${ModuleResolution.es}>> @TestFunction`;
        try {
          let [remainingAfterHints, hints] = scope.parseHints(remaining, 'ex');
          let [, refOrPromise] = parser.parseAndResolve(remainingAfterHints, scope, hints);
          if (isPromise(refOrPromise)) {
            return refOrPromise
              .then((ref: FunctionExpressionReference) => {
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
      });
      it('should parse with inline AwaitEvaluation as module', () => {
        const scope = new ExpressionScope();
        const parser = new FunctionExpressionParser();

        const factory: AwaitEvaluationFactory = scope.get(ExpressionScope.AwaitEvaluationFactory);
        const remaining = `<<ex ${ExpressionHintKey.DataType}=${StandardDataType.Number} ${ExpressionHintKey.ModuleName}="../../../testing/parser/await-evaluation-factory-number-5.js" 
          ${ExpressionHintKey.FunctionName}=awaitEvaluationFactoryNumber5 ${ExpressionHintKey.ModuleResolution}= ${ModuleResolution.es}>> @TestFunction`;
        try {
          let [remainingAfterHints, hints] = scope.parseHints(remaining, 'ex');
          let [, refOrPromise] = parser.parseAndResolve(remainingAfterHints, scope, hints);
          if (isPromise(refOrPromise)) {
            return refOrPromise
              .then((ref: FunctionExpressionReference) => {
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
      });

      it('should parse with inline AwaitEvaluation as module for a params function expression ParamsFunction', () => {
        const scope = new ExpressionScope();
        const parser = new FunctionExpressionParser();

        const factory: AwaitEvaluationFactory = scope.get(ExpressionScope.AwaitEvaluationFactory);
        const remaining = `<<ex ${ExpressionHintKey.DataType}=${StandardDataType.Number} ${ExpressionHintKey.ModuleName}="../../../testing/parser/await-evaluation-factory-number-5.js" 
          ${ExpressionHintKey.FunctionName}=awaitEvaluationFactoryNumber5 ${ExpressionHintKey.ModuleResolution}= ${ModuleResolution.es}>> @ParamsFunction`;
        try {
          let [remainingAfterHints, hints] = scope.parseHints(remaining, 'ex');
          let [, refOrPromise] = parser.parseAndResolve(remainingAfterHints, scope, hints);
          if (isPromise(refOrPromise)) {
            return refOrPromise
              .then((ref: FunctionExpressionReference) => {
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
          } else {
            unreachableCode.should.be.true;
          }
        } catch (err) {
          unreachableCode.should.be.true;
        }
      });
    });
  });
});

