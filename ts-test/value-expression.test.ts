import {StandardDataType} from '@franzzemen/re-data-type';
import chai from 'chai';
import 'mocha';
import moment, {Moment} from 'moment';
import {ExpressionScope, StandardExpressionType, ValueExpression, ValueExpressionReference} from '../publish/index.js';

const isMoment = moment.isMoment;

let should = chai.should();
let expect = chai.expect;

const scope = new ExpressionScope();

describe('Rules Engine Tests', () => {
  describe('Value Expression Tests', () => {
    describe('/core/expression/value-expression.test', () => {
      it('should evaluate Value ExpressionBase to Text \'12345\' from the same', done => {
        const data: ValueExpressionReference = {
          type: StandardExpressionType.Value,
          dataTypeRef: StandardDataType.Text,
          value: '12345'
        };
        let expression = new ValueExpression(data, scope);
        const result = expression.awaitEvaluation({}, scope);
        expect(result).to.exist;
        (typeof result).should.equal('string');
        result.should.equal('12345');
        done();
      });
      it('should evaluate the Value ExpressionBase to the Number 12345 from textual representation', done => {
        const data: ValueExpressionReference = {
          type: StandardExpressionType.Value,
          dataTypeRef: StandardDataType.Number,
          value: '12345'
        };
        let expression = new ValueExpression(data, scope);
        const result = expression.awaitEvaluation({}, scope);
        expect(result).to.exist;
        (typeof result).should.equal('number');
        result.should.equal(12345);
        done();
      });

      it('should evaluate the Value ExpressionBase to the Float 12345.50 from textual representation', done => {
        const data: ValueExpressionReference = {
          type: StandardExpressionType.Value,
          dataTypeRef: StandardDataType.Float,
          value: '12345.50'
        };
        let expression = new ValueExpression(data, scope);
        const result = expression.awaitEvaluation({}, scope);
        expect(result).to.exist;
        (typeof result).should.equal('number');
        result.should.equal(12345.50);
        done();
      });
      it('should evaluate the Value ExpressionBase to a Date (from number string "12345")', done => {
        const data: ValueExpressionReference = {
          type: StandardExpressionType.Value,
          dataTypeRef: StandardDataType.Date,
          value: '12345'
        };
        let expression = new ValueExpression(data, scope);
        const result = expression.awaitEvaluation({}, scope);
        expect(result).to.exist;
        (typeof result).should.equal('object');
        expect((result as Moment).format).to.exist;
        (typeof (result as Moment).format).should.equal('function');
        (result as Moment).format().should.equal('1969-12-31T19:00:12-05:00');
        done();
      });

      it('should evaluate the Value ExpressionBase to a Date moment (from ISO string "2020-10-24T00:00:00-04:00") ', done => {
        const data: ValueExpressionReference = {
          type: StandardExpressionType.Value,
          dataTypeRef: StandardDataType.Date,
          value: '2020-10-24T00:00:00-04:00'
        };
        let expression = new ValueExpression(data, scope);
        const result = expression.awaitEvaluation({}, scope);
        expect(result).to.exist;
        (typeof result).should.equal('object');
        expect((result as Moment).format).to.exist;
        (typeof (result as Moment).format).should.equal('function');
        (result as Moment).format().should.equal('2020-10-24T00:00:00-04:00');
        done();
      });

      it('should evaluate the Value ExpressionBase to Boolean false from a text value', done => {
        const data: ValueExpressionReference = {
          type: StandardExpressionType.Value,
          dataTypeRef: StandardDataType.Boolean,
          value: '12345'
        };
        let expression = new ValueExpression(data, scope);
        const result = expression.awaitEvaluation({}, scope);
        expect(result).to.exist;
        (typeof result).should.equal('boolean');
        (result as boolean).should.be.false;
        done();
      });

      it('should evaluate the Value ExpressionBase to Boolean true from the text value', done => {
        const data: ValueExpressionReference = {
          type: StandardExpressionType.Value,
          dataTypeRef: StandardDataType.Boolean,
          value: 'true'
        };
        let expression = new ValueExpression(data, scope);
        const result = expression.awaitEvaluation('true', scope);
        expect(result).to.exist;
        (typeof result).should.equal('boolean');
        (result as boolean).should.be.true;
        done();
      });
      it('should evaluate the Value ExpressionBase to Text \'12345\' from the number value', done => {
        const data: ValueExpressionReference = {
          type: StandardExpressionType.Value,
          dataTypeRef: StandardDataType.Text,
          value: 12345
        };
        let expression = new ValueExpression(data, scope);
        const result = expression.awaitEvaluation({}, scope);
        expect(result).to.exist;
        (typeof result).should.equal('string');
        result.should.equal('12345');
        done();
      });
      it('should evaluate the Value ExpressionBase to the Number 12345 from the number value', done => {
        const data: ValueExpressionReference = {
          type: StandardExpressionType.Value,
          dataTypeRef: StandardDataType.Number,
          value: 12345
        };
        let expression = new ValueExpression(data, scope);
        const result = expression.awaitEvaluation(12345, scope);
        expect(result).to.exist;
        (typeof result).should.equal('number');
        result.should.equal(12345);
        done();
      });
      it('should evaluate the Value ExpressionBase to the Float 12345.50 from the number value', done => {
        const data: ValueExpressionReference = {
          type: StandardExpressionType.Value,
          dataTypeRef: StandardDataType.Float,
          value: 12345.50
        };
        let expression = new ValueExpression(data, scope);
        const result = expression.awaitEvaluation({}, scope);
        expect(result).to.exist;
        (typeof result).should.equal('number');
        result.should.equal(12345.50);
        done();
      });
      it('should evaluate the Value ExpressionBase to a moment Date (from number)', done => {
        const data: ValueExpressionReference = {
          type: StandardExpressionType.Value,
          dataTypeRef: StandardDataType.Date,
          value: 12345
        };
        let expression = new ValueExpression(data, scope);
        const result = expression.awaitEvaluation({}, scope);
        expect(result).to.exist;
        (typeof result).should.equal('object');
        expect((result as Moment).format).to.exist;
        (typeof (result as Moment).format).should.equal('function');
        (result as Moment).format().should.equal('1969-12-31T19:00:12-05:00');
        done();
      });

      it('should evaluate the Value ExpressionBase to Boolean true from a number', done => {
        const data: ValueExpressionReference = {
          type: StandardExpressionType.Value,
          dataTypeRef: StandardDataType.Boolean,
          value: 12345
        };
        let expression = new ValueExpression(data, scope);
        const result = expression.awaitEvaluation({}, scope);
        expect(result).to.exist;
        (typeof result).should.equal('boolean');
        (result as boolean).should.be.true;
        done();
      });

      it('should evaluate the Value ExpressionBase to Boolean false from the number 0', done => {
        const data: ValueExpressionReference = {
          type: StandardExpressionType.Value,
          dataTypeRef: StandardDataType.Boolean,
          value: 0
        };
        let expression = new ValueExpression(data, scope);
        const result = expression.awaitEvaluation({}, scope);
        expect(result).to.exist;
        (typeof result).should.equal('boolean');
        (result as boolean).should.be.false;
        done();
      });

      it('should evaluate the Value ExpressionBase to \'true\' from the boolean true', done => {
        const data: ValueExpressionReference = {
          type: StandardExpressionType.Value,
          dataTypeRef: StandardDataType.Boolean,
          value: true
        };
        let expression = new ValueExpression(data, scope);
        const result = expression.awaitEvaluation({}, scope);
        expect(result).to.exist;
        (typeof result).should.equal('boolean');
        result.should.be.true;
        done();
      });
      it('should evaluate the Value ExpressionBase to an undefined number from boolean true', done => {
        const data: ValueExpressionReference = {
          type: StandardExpressionType.Value,
          dataTypeRef: StandardDataType.Number,
          value: true
        };
        let expression = new ValueExpression(data, scope);
        const result = expression.awaitEvaluation({}, scope);
        expect(result).to.not.exist;
        done();
      });

      it('should evaluate the Value ExpressionBase to an undefined number float from boolean true', done => {
        const data: ValueExpressionReference = {
          type: StandardExpressionType.Value,
          dataTypeRef: StandardDataType.Float,
          value: true
        };
        let expression = new ValueExpression(data, scope);
        const result = expression.awaitEvaluation({}, scope);
        expect(result).to.not.exist;
        done();
      });


      it('should evaluate the Value ExpressionBase to an undefined date from boolean true', done => {
        const data: ValueExpressionReference = {
          type: StandardExpressionType.Value,
          dataTypeRef: StandardDataType.Date,
          value: true
        };
        let expression = new ValueExpression(data, scope);
        const result = expression.awaitEvaluation({}, scope);
        expect(result).to.not.exist;
        done();
      });
      it('should evaluate the Value ExpressionBase to an ISO date string from an moment', done => {
        const data: ValueExpressionReference = {
          type: StandardExpressionType.Value,
          dataTypeRef: StandardDataType.Text,
          value: moment('2020-10-24T00:00:00-04:00')
        };
        let expression = new ValueExpression(data, scope);
        const result = expression.awaitEvaluation({}, scope);
        expect(result).to.exist;
        (typeof result).should.equal('string');
        result.should.equal('2020-10-24T04:00:00.000Z');
        done();
      });
      it('should evaluate the Value ExpressionBase to a moment from a moment', done => {
        const data: ValueExpressionReference = {
          type: StandardExpressionType.Value,
          dataTypeRef: StandardDataType.Date,
          value: moment('2020-10-24T00:00:00-04:00')
        };
        let expression = new ValueExpression(data, scope);
        const result = expression.awaitEvaluation({}, scope);
        expect(result).to.exist;
        (typeof result).should.equal('object');
        isMoment(result).should.be.true;
        moment('2020-10-24T00:00:00-04:00').isSame(result as Moment).should.be.true;
        done();
      });
      it('should evaluate the Value Object to a number from a moment', done => {
        const data: ValueExpressionReference = {
          type: StandardExpressionType.Value,
          dataTypeRef: StandardDataType.Number,
          value: moment(12345)
        };
        let expression = new ValueExpression(data, scope);
        const result = expression.awaitEvaluation({}, scope);
        expect(result).to.exist;
        (typeof result).should.equal('number');
        (result).should.equal(12345);
        done();
      });
    });
  });
});
