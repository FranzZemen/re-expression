import {StandardDataType} from '@franzzemen/re-data-type';
import chai from 'chai';
import 'mocha';
import {
  ExpressionScope,
  ExpressionStackParser,
  ExpressionType,
  FunctionExpression,
  FunctionExpressionReference
} from '../publish';



const expect = chai.expect;
const should = chai.should();

const scope: ExpressionScope = new ExpressionScope();

describe('Rules Engine Tests', () => {
  describe('Function Expression Testes', () => {
    describe('/function-expression.test', () => {
      it('should evaluate to 5', done => {
        const ref: FunctionExpressionReference = {
          refName: 'EvaluatesTo5',
          type: ExpressionType.Function,
          dataTypeRef: StandardDataType.Number,
          module: {
            moduleName: '.+./../../testing/parser/await-evaluation-factory-number-5',
            functionName: 'awaitEvaluationFactoryNumber5'
          }
        }
        const expression: FunctionExpression = new FunctionExpression(ref, scope);
        const result = expression.evaluate({}, scope);
        result.should.equal(5);
        done();
      })
      it('should evaluate to 5 using Text Format', done => {
        const parser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
        const [remaining, ref] = parser.parse('<<ex data-type=Number module={"moduleName": "../../../testing/parser/await-evaluation-factory-number-5", "functionName":"awaitEvaluationFactoryNumber5" }>> @ReturnsNumber5', scope);
        const expression: FunctionExpression = new FunctionExpression(ref as FunctionExpressionReference, scope);
        const result = expression.evaluate({}, scope);
        result.should.equal(5);
        done();
      })
      it('should evaluate to [1, 2, 3] using Text Format', done => {
        const parser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
        const [remaining, ref] = parser.parse('<<ex data-type=Number multivariate module={"moduleName": "../../../testing/parser/await-evaluation-factory-params", "functionName":"awaitEvaluationFactoryParams" }>> @ReturnsInput[1, 2, 3]', scope);
        const expression: FunctionExpression = new FunctionExpression(ref as FunctionExpressionReference, scope);
        const result = expression.evaluate({}, scope);
        Array.isArray(result).should.be.true;
        result.length.should.equal(3);
        result[0].should.equal(1);
        result[1].should.equal(2);
        result[2].should.equal(3);
        done();
      })
    })
  })
})
