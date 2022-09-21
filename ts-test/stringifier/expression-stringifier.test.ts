import chai from 'chai';
import 'mocha';
import {ExpressionScope, ExpressionStackParser, ExpressionStringifier} from '../../publish/index.js';

const expect = chai.expect;
const should = chai.should();

const scope = new ExpressionScope();
const parser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
const stringifier: ExpressionStringifier = scope.get(ExpressionScope.ExpressionStringifier);

const unreachableCode = false;
/*
describe('Rules Engine Tests - expression-stringifier.test', () => {
  describe('Expression Stringifier Tests', () => {
    /*
    it('should stringify a Text Value Expression "Hello"', done => {
      const result = parser.parse('"Hello"', scope);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('"Hello"');
      done();
    });
    it('should stringify a Text Value with type hint "<<ex type=Value>> Hello"', done => {
      const result = parser.parse('<<ex type=Value>> "Hello"', scope);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('"Hello"');
      done();
    });
    it('should stringify a Text Value with data type hint "<<ex data-type="Text">> Hello"', done => {
      const result = parser.parse('<<ex data-type="Text">> "Hello"', scope);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('"Hello"');
      done();
    });
    it('should stringify a Text Value with full hint "<<ex type=Value data-type="Text">> Hello"', done => {
      const result = parser.parse('<<ex type=Value data-type="Text">> "Hello"', scope);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('"Hello"');
      done();
    });
    it('should stringify a Number Value Expression "1"', done => {
      const result = parser.parse('1', scope);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('1');
      done();
    });
    it('should stringify a Float Value Expression "1.0"', done => {
      const result = parser.parse('1.0', scope);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('1.0');
      done();
    });
    it('should stringify a Float Value Expression "1.1"', done => {
      const result = parser.parse('1.1', scope);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('1.1');
      done();
    });
    it('should stringify a Boolean Value Expression "true"', done => {
      const result = parser.parse('true', scope);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('true');
      done();
    });
    it('should stringify a Boolean Value Expression "false"', done => {
      const result = parser.parse('false', scope);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('false');
      done();
    });
    it('should stringify a Time Value Expression "23:00:59"', done => {
      const result = parser.parse('23:00:59', scope);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('23:00:59');
      done();
    });
    it('should stringify a Date Value Expression "1999-01-01"', done => {
      const result = parser.parse('1999-01-01', scope);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('1999-01-01');
      done();
    });
    it('should stringify a Timestamp Value Expression "1999-01-01 15:53:01"', done => {
      const result = parser.parse('1999-01-01 15:53:01', scope);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('1999-01-01T15:53:01');
      done();
    });
    it('should stringify a Timestamp Value Expression leveraging timestamp separator option as space "1999-01-01 15:53:01"', done => {
      const result = parser.parse('1999-01-01 15:53:01', scope);
      const stringified = stringifier.stringify(result[1], scope, {literals: {timestampSeparator: ' '}});
      stringified.should.equal('1999-01-01 15:53:01');
      done();
    });
    it('should stringify with option on type hint "1999-01-01 15:53:01"', done => {
      const result = parser.parse('1999-01-01 15:53:01', scope);
      const stringified = stringifier.stringify(result[1], scope, {
        expressionHints: {value: {forceTypeHint: true}},
        literals: {timestampSeparator: ' '}
      });
      stringified.should.equal('<<ex type=Value>> 1999-01-01 15:53:01');
      done();
    });
    it('should stringify with option on data-type hint "1999-01-01 15:53:01"', done => {
      const result = parser.parse('1999-01-01 15:53:01', scope);
      const stringified = stringifier.stringify(result[1], scope, {
        expressionHints: {value: {forceDataTypeHint: true}},
        literals: {timestampSeparator: ' '}
      });
      stringified.should.equal('<<ex data-type=Timestamp>> 1999-01-01 15:53:01');
      done();
    });
    it('should stringify with option on data-type and type hint "1999-01-01 15:53:01"', done => {
      const result = parser.parse('1999-01-01 15:53:01', scope);
      const stringified = stringifier.stringify(result[1], scope, {
        expressionHints: {
          value: {
            forceTypeHint: true,
            forceDataTypeHint: true
          }
        }, literals: {timestampSeparator: ' '}
      });
      stringified.should.equal('<<ex type=Value data-type=Timestamp>> 1999-01-01 15:53:01');
      done();
    });
    it('should stringify an attribute expression <<ex data-type=Text>> path.to.text[5]', done => {
      const result = parser.parse('<<ex data-type=Text>> path.to.text[5]', scope);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('<<ex data-type=Text>> path.to.text[5]');
      done();
    });
    it('should stringify a function expression <<ex data-type=Number module={"moduleName": "../../../testing/parser/await-evaluation-factory-number-5", "functionName":"../../../testing/parser/awaitEvaluationFactoryNumber5" }>> ReturnsNumber5', done => {
      const result = parser.parse('<<ex data-type=Number module={"moduleName": "../../../testing/parser/await-evaluation-factory-number-5", "functionName":"awaitEvaluationFactoryNumber5" }>> @ReturnsNumber5', scope);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('<<ex data-type=Number module={"moduleName":"../../../testing/parser/await-evaluation-factory-number-5","functionName":"awaitEvaluationFactoryNumber5"}>> @ReturnsNumber5');
      done();
    });
    it('should stringify a Number Value set expression <<ex data-type=Number>> [1, 2,3 , 4 ]', done => {
      const result = parser.parse('<<ex data-type=Number>> [1, 2 , 3 , 4]', scope);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('[1, 2, 3, 4]');
      done();
    });
    it('should stringify a Number, mixed expression type set expression', done => {
      const result = parser.parse('[1, count , 3 , element[0]]', scope);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('[1, count, 3, element[0]]');
      done();
    });
    it('should stringify a non inferrable data type  set expression', done => {
      const result = parser.parse('<<ex data-type=Number>> [count element[0]]', scope);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('<<ex data-type=Number>> [count, element[0]]');
      done();
    });
    it('should stringify Function expression with parameters', () => {
      const factory: AwaitEvaluationFactory = scope.get(ExpressionScope.AwaitEvaluationFactory);
      factory.unregister('ParamsFunction');

      const promise = parser.parse(`<<ex data-type=Number
                  module-name="../../../testing/parser/await-evaluation-factory-params" 
                  function-name="awaitEvaluationFactoryParams">> 
                  @ParamsFunction[<<ex data-type=Text>> my.name, 5]`, scope) as Promise<ExpressionParseResult>;
      promise.then(([remaining, ref]) => {
        ref.should.exist;
        if (isFunctionExpressionReference(ref)) {
          ref.refName.should.equal('ParamsFunction');
          ref.dataTypeRef.should.equal(StandardDataType.Number);
          (typeof factory.getRegistered('ParamsFunction')).should.equal('function');
          ref.params.length.should.equal(2);
          if (isAttributeExpressionReference(ref.params[0])) {
            ref.params[0].path.should.equal('my.name');
          } else {
            unreachableCode.should.be.true;
          }
          if (isValueExpressionReference(ref.params[1])) {
            ref.params[1].value.should.equal(5);
          } else {
            unreachableCode.should.be.true;
          }
        } else {
          unreachableCode.should.be.true;
        }
        const stringified = stringifier.stringify(ref, scope);
        stringified.should.equal('<<ex data-type=Number module={"moduleName":"../../../testing/parser/await-evaluation-factory-params","functionName":"awaitEvaluationFactoryParams"}>> @ParamsFunction[<<ex data-type=Text>> my.name, 5]');
      });

    });

     */
  //});
//});
