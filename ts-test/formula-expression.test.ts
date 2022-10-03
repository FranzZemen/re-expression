import {AwaitEvaluation, Hints} from '@franzzemen/app-utility';
import {StandardDataType} from '@franzzemen/re-data-type';
import chai from 'chai';
import 'mocha';
import {isPromise} from 'util/types';
import {
  ExpressionScope,
  StandardExpressionType,
  FormulaExpression,
  FormulaExpressionParser, FormulaExpressionReference,
  FunctionExpressionReference
} from '../publish/index.js';

const expect = chai.expect;
const should = chai.should();

const unreachableCode = false;
describe('re-expression tests', () => {
  describe('formula expression tests', () => {
    describe('formula-expression.test', () => {
      describe('evaluation tests', () => {
        it('should evaluate to 1 from +1', () => {
          const scope = new ExpressionScope();
          let hints = new Hints('');
          hints = hints.loadAndResolve('') as Hints; // We know it is not a promise.
          const parser = new FormulaExpressionParser();
          let [remaining, ref] = parser.parse('#[+ 1]', scope, hints);
          if(isPromise(ref)) {
            unreachableCode.should.be.true;
          } else {
            const formulaExpression: FormulaExpression = new FormulaExpression(ref, scope);
            // Don't need to resolve scope as we know there aren't any promises.
            const result = formulaExpression.awaitEvaluation({}, scope);
            expect(result).to.exist;
            expect(typeof result).to.equal('number');
            result.should.equal(1);
          }
        })
        it('should evaluate to 1 from (1)', () => {
          const scope = new ExpressionScope();
          let hints = new Hints('');
          hints = hints.loadAndResolve('') as Hints; // We know it is not a promise.
          const parser = new FormulaExpressionParser();
          let [remaining, ref] = parser.parse('#[(1)]', scope, hints);
          if(isPromise(ref)) {
            unreachableCode.should.be.true;
          } else {
            const formulaExpression: FormulaExpression = new FormulaExpression(ref, scope);
            // Don't need to resolve scope as we know there aren't any promises.
            const result = formulaExpression.awaitEvaluation({}, scope);
            expect(result).to.exist;
            expect(typeof result).to.equal('number');
            result.should.equal(1);
          }
        })
        it('should evaluate to 2 from 1 + 1', () => {
          const scope = new ExpressionScope();
          let hints = new Hints('');
          hints = hints.loadAndResolve('') as Hints; // We know it is not a promise.
          const parser = new FormulaExpressionParser();
          let [remaining, ref] = parser.parse('#[1 + 1]', scope, hints);
          if(isPromise(ref)) {
            unreachableCode.should.be.true;
          } else {
            const formulaExpression: FormulaExpression = new FormulaExpression(ref, scope);
            // Don't need to resolve scope as we know there aren't any promises.
            const result = formulaExpression.awaitEvaluation({}, scope);
            expect(result).to.exist;
            expect(typeof result).to.equal('number');
            result.should.equal(2);
          }
        })
        it('should evaluate to 2 from (1 + 1)', () => {
          const scope = new ExpressionScope();
          let hints = new Hints('');
          hints = hints.loadAndResolve('') as Hints; // We know it is not a promise.
          const parser = new FormulaExpressionParser();
          let [remaining, ref] = parser.parse('#[(1 + 1)]', scope, hints);
          if(isPromise(ref)) {
            unreachableCode.should.be.true;
          } else {
            const formulaExpression: FormulaExpression = new FormulaExpression(ref, scope);
            // Don't need to resolve scope as we know there aren't any promises.
            const result = formulaExpression.awaitEvaluation({}, scope);
            expect(result).to.exist;
            expect(typeof result).to.equal('number');
            result.should.equal(2);
          }
        })
        it('should evaluate formula containing formula #[(1 + #[1 + 1])]', () => {
          const scope = new ExpressionScope();
          let hints = new Hints('');
          hints = hints.loadAndResolve('') as Hints; // We know it is not a promise.
          const parser = new FormulaExpressionParser();
          let [remaining, ref] = parser.parse('#[(1 + #[1 + 1])]', scope, hints);
          if(isPromise(ref)) {
            unreachableCode.should.be.true;
          } else {
            const formulaExpression: FormulaExpression = new FormulaExpression(ref, scope);
            // Don't need to resolve scope as we know there aren't any promises.
            const result = formulaExpression.awaitEvaluation({}, scope);
            expect(result).to.exist;
            expect(typeof result).to.equal('number');
            result.should.equal(3);
          }
        })
        it('should evaluate to -1 from 1 - (1 + 1)', () => {
          const scope = new ExpressionScope();
          let hints = new Hints('');
          hints = hints.loadAndResolve('') as Hints; // We know it is not a promise.
          const parser = new FormulaExpressionParser();
          let [remaining, ref] = parser.parse('#[1 - (1 + 1)]', scope, hints);
          if(isPromise(ref)) {
            unreachableCode.should.be.true;
          } else {
            const formulaExpression: FormulaExpression = new FormulaExpression(ref, scope);
            // Don't need to resolve scope as we know there aren't any promises.
            const result = formulaExpression.awaitEvaluation({}, scope);
            expect(result).to.exist;
            expect(typeof result).to.equal('number');
            result.should.equal(-1);
          }
        })
        it('should evaluate to -3 from 1 * (1 + 1) - 5', () => {
          const scope = new ExpressionScope();
          let hints = new Hints('');
          hints = hints.loadAndResolve('') as Hints; // We know it is not a promise.
          const parser = new FormulaExpressionParser();
          let [remaining, ref] = parser.parse('#[1 * (1 + 1) - 5]', scope, hints);
          if(isPromise(ref)) {
            unreachableCode.should.be.true;
          } else {
            const formulaExpression: FormulaExpression = new FormulaExpression(ref, scope);
            // Don't need to resolve scope as we know there aren't any promises.
            const result = formulaExpression.awaitEvaluation({}, scope);
            expect(result).to.exist;
            expect(typeof result).to.equal('number');
            result.should.equal(-3);
          }
        })
        it('should evaluate to -3 from 1 * (1 + 1) - 5', () => {
          const scope = new ExpressionScope();
          let hints = new Hints('');
          hints = hints.loadAndResolve('') as Hints; // We know it is not a promise.
          const parser = new FormulaExpressionParser();
          let [remaining, ref] = parser.parse('#[1 * (1 + 1) - 5 + (8 / (1 * 2))]', scope, hints);
          if(isPromise(ref)) {
            unreachableCode.should.be.true;
          } else {
            const formulaExpression: FormulaExpression = new FormulaExpression(ref, scope);
            // Don't need to resolve scope as we know there aren't any promises.
            const result = formulaExpression.awaitEvaluation({}, scope);
            expect(result).to.exist;
            expect(typeof result).to.equal('number');
            result.should.equal(1);
          }
        })
        it('should should fail to evaluate  1 * (console.log("1") + 1) - 5', () => {
          const scope = new ExpressionScope();
          let hints = new Hints('');
          hints = hints.loadAndResolve('') as Hints; // We know it is not a promise.

          const awaitFunction: AwaitEvaluation = function(dataDomain, scope, ec) {
            return 'console.log("5")';
          }
          const factory = scope.addAwaitEvaluationFunction({instanceRef: {refName: 'Trick', instance: awaitFunction}});
          const ref: FunctionExpressionReference = {
            type: StandardExpressionType.Function,
            dataTypeRef: StandardDataType.Number,
            refName: 'Trick',
          }

          const parser = new FormulaExpressionParser();
          let remaining: string, result: FormulaExpressionReference;
          try {
            // TODO - need to infer data type for funciton expressions, also allow Unknown
            [remaining, result] = parser.parse('#[1 * (<<ex data-type=Number>> @Trick + 1) - 5]', scope, hints);
            const formulaExpression: FormulaExpression = new FormulaExpression(result, scope);
            // Don't need to resolve scope as we know there aren't any promises.
            const shouldNotResult = formulaExpression.awaitEvaluation({}, scope);
          } catch (err) {
            expect(err.message.startsWith('Potential security violation')).to.be.true;
            return;
          }
          unreachableCode.should.be.true;
        })
      })
    })
  })
})
