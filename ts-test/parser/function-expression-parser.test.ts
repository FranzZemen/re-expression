import {Hints} from '@franzzemen/app-utility';
import {StandardDataType} from '@franzzemen/re-data-type';
import chai from 'chai';
import 'mocha';
import {
  AwaitEvaluationFactory,
  ExpressionHintKey, ExpressionParseResult,
  ExpressionScope,
  ExpressionType,
  FunctionExpressionParser, isFunctionExpressionReference
} from '../../publish/index.js';


const expect = chai.expect;
const should = chai.should();

const scope = new ExpressionScope();
const parser = new FunctionExpressionParser();
const unreachableCode = false;

describe('Rules Engine Tests', () => {
  describe('Function Expression Parser Tests', () => {
    describe('/core/expression/parser/function-expression-parser.test', () => {
      /*
      it('should return undefined ref for no data type', done => {
        const [remaining, ref] = parser.parse('@TestFunction', scope, new Hints('')) as ExpressionParseResult;
        expect(ref).to.be.undefined;
        done();
      });
      it('should fail to parse for no registered AwaitEvaluation', done => {
        const hints = new Hints('');
        hints.set(ExpressionHintKey.DataType, StandardDataType.Number);
        try {
          const [remaining, ref] = parser.parse('@TestFunction', scope, hints) as ExpressionParseResult;
        } catch (err) {
          expect(err.message.startsWith('No AwaitEvaluation')).to.be.true;
        }
        done();
      });
      it('should parse with registered AwaitEvaluation', () => {
        const factory: AwaitEvaluationFactory = scope.get(ExpressionScope.AwaitEvaluationFactory);
        factory.register({refName: 'TestFunction',
          module: {
            moduleName: '../../../testing/parser/await-evaluation-factory-number-5',
            functionName: 'awaitEvaluationFactoryNumber5'
          }
        });
        const hints = new Hints('');
        hints.set(ExpressionHintKey.DataType, StandardDataType.Number);
        try {
          const promise = parser.parse('@TestFunction', scope, hints) as Promise<ExpressionParseResult>;
          return promise.then(([remaining, ref]) => {
            if(isFunctionExpressionReference(ref)) {
              ref.should.exist;
              ref.type.should.equal(ExpressionType.Function);
              ref.refName.should.equal('TestFunction');
              ref.dataTypeRef.should.equal(StandardDataType.Number);
            } else {
              unreachableCode.should.be.true;
            }
          });
        } catch (err) {
          unreachableCode.should.be.true;
        }
      });
      it('should parse with inline AwaitEvaluation, property by property', done => {
        const factory: AwaitEvaluationFactory = scope.get(ExpressionScope.AwaitEvaluationFactory);
        //factory.register({refName:'TestFunction', module: {moduleName:'../../../testing/core/expression/parser/test.factory.function', functionName: 'testFactoryFunction'}});
        const hints = new Hints('');
        hints.set(ExpressionHintKey.DataType, StandardDataType.Number);
        hints.set(ExpressionHintKey.ModuleName, '../../../testing/parser/await-evaluation-factory-number-5');
        hints.set(ExpressionHintKey.FunctionName, 'awaitEvaluationFactoryNumber5');
        try {
          const promise = parser.parse('@TestFunction', scope, hints) as Promise<ExpressionParseResult>;
          promise.then(([remaining, ref]) => {
            if(isFunctionExpressionReference(ref)) {
              ref.should.exist;
              ref.type.should.equal(ExpressionType.Function);
              ref.refName.should.equal('TestFunction');
              ref.dataTypeRef.should.equal(StandardDataType.Number);
              (typeof factory.getRegistered('TestFunction')).should.equal('function');
            } else {
              unreachableCode.should.be.true;
            }
          });
        } catch (err) {
          unreachableCode.should.be.true;
        }
        done();
      });
      it('should parse with inline AwaitEvaluation as module', done => {
        const factory: AwaitEvaluationFactory = scope.get(ExpressionScope.AwaitEvaluationFactory);
        factory.unregister('TestFunction');
        const hints = new Hints('');
        hints.set(ExpressionHintKey.DataType, StandardDataType.Number);
        hints.set(ExpressionHintKey.Module, '{"moduleName": "../../../testing/parser/await-evaluation-factory-number-5", "functionName":"awaitEvaluationFactoryNumber5"}');
        try {
          const promise = parser.parse('@TestFunction', scope, hints) as Promise<ExpressionParseResult>;
          promise.then(([remaining, ref]) => {
            if(isFunctionExpressionReference(ref)) {
              ref.should.exist;
              ref.type.should.equal(ExpressionType.Function);
              ref.refName.should.equal('TestFunction');
              ref.dataTypeRef.should.equal(StandardDataType.Number);
              (typeof factory.getRegistered('TestFunction')).should.equal('function');
            } else {
              unreachableCode.should.be.true;
            }
          });
        } catch (err) {
          unreachableCode.should.be.true;
        }
        done();
      });
      it('should parse with inline AwaitEvaluation as module for a params function expression ParamsFunction', done => {
        const factory: AwaitEvaluationFactory = scope.get(ExpressionScope.AwaitEvaluationFactory);
        factory.unregister('ParamsFunction');
        const hints = new Hints('');
        hints.set(ExpressionHintKey.DataType, StandardDataType.Number);
        hints.set(ExpressionHintKey.Module, '{"moduleName": "../../../testing/parser/await-evaluation-factory-params", "functionName":"awaitEvaluationFactoryParams"}');
        try {
          const promise = parser.parse('@ParamsFunction', scope, hints) as Promise<ExpressionParseResult>;
          promise.then(([remaining, ref]) => {
            if(isFunctionExpressionReference(ref)) {
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
