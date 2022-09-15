import {StandardDataType} from '@franzzemen/re-data-type';
import chai from 'chai';
import 'mocha';


import moment, {Moment} from 'moment';
import {
  AttributeExpression,
  AttributeExpressionReference,
  ExpressionScope,
  ExpressionStackParser,
  ExpressionType
} from '../publish/index.js';

const isMoment = moment.isMoment;

let should = chai.should();
let expect = chai.expect;

const scope = new ExpressionScope();
const defaultExpressionStackParser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);

describe('Rules Engine Tests', () => {
  describe('Attribute Expression Tests', () => {
    describe('/core/expression/attribute-expression.test', () => {
      it('should evaluate an Attribute ExpressionBase simple object text property', done => {
        let item: any = {id: '12'};
        const attribExpressionShape: AttributeExpressionReference = {
          type: ExpressionType.Attribute,
          dataTypeRef: StandardDataType.Text,
          path: ['id']
        }
        let attributeExpression = new AttributeExpression(attribExpressionShape, scope);
        const result = attributeExpression.awaitEvaluation(item, scope);
        expect(result).to.exist;
        (typeof (result)).should.equal('string');
        result.should.equal('12');
        done();
      });

      it('should evaluate an Attribute ExpressionBase simple object number property as string', done => {
        let item: any = {id: '12'};
        const attribExpressionShape: AttributeExpressionReference = {
          type: ExpressionType.Attribute,
          dataTypeRef: StandardDataType.Number,
          path: ['id']
        }
        let attributeExpression = new AttributeExpression(attribExpressionShape, scope);
        const result = attributeExpression.awaitEvaluation(item, scope);
        expect(result).to.exist;
        (typeof result).should.equal('number');
        result.should.equal(12);
        done();
      });

      it('should evaluate an attribute ExpressionBase two items deep for date value', done => {
        let item: any = {foo: {bar: '2020-10-24T04:00:00.000Z'}};
        const attribExpressionShape: AttributeExpressionReference = {
          type: ExpressionType.Attribute,
          dataTypeRef: StandardDataType.Date,
          path: ['foo', 'bar']
        }
        let attributeExpression = new AttributeExpression(attribExpressionShape, scope);
        const result = attributeExpression.awaitEvaluation(item, scope);
        expect(result).to.exist;
        (typeof result).should.equal('object');
        isMoment(result).should.be.true;
        (result as Moment).isSame(moment('2020-10-24T04:00:00.000Z')).should.be.true;
        done();
      });

      it('should evaluate an Attribute ExpressionBase path to undefined', done => {
        let item: any = {foo: {bar: '2020-10-24T04:00:00.000Z'}};
        const attribExpressionShape: AttributeExpressionReference = {
          type: ExpressionType.Attribute,
          dataTypeRef: StandardDataType.Date,
          path: 'foo.notExist'
        }
        let attributeExpression = new AttributeExpression(attribExpressionShape, scope);
        const result = attributeExpression.awaitEvaluation(item, scope);
        expect(result).to.not.exist;
        done();
      })
      it('should evaluate an Attribute ExpressionBase path foo.bar.car', done => {
        let item: any = {
          foo: {
            bar: {
              car: '2020-10-24T04:00:00.000Z'
            }
          }
        };
        const attribExpressionShape: AttributeExpressionReference = {
          type: ExpressionType.Attribute,
          dataTypeRef: StandardDataType.Date,
          path: 'foo.bar.car'
        }
        let attributeExpression = new AttributeExpression(attribExpressionShape, scope);
        const result = attributeExpression.awaitEvaluation(item, scope);
        (result as Moment).isSame(moment('2020-10-24T04:00:00.000Z')).should.be.true;
        done();
      })
      it('should evaluate an Attribute Expression located at an array index foo.bar[1]', done => {
        let item: any = {
          foo: {
            bar: ['hello', 'world', 'there']
          }
        }
        const attribExpressionRef: AttributeExpressionReference = {
          type: ExpressionType.Attribute,
          dataTypeRef: StandardDataType.Text,
          path: 'foo.bar.1'
        }
        const attribExpression = new AttributeExpression(attribExpressionRef, scope);
        const result: string = attribExpression.awaitEvaluation(item, scope);
        result.should.equal('world');
        done();
      });
      it('should convert string path foo[1] to foo.1', done => {
        const converted = AttributeExpression.stringToPath('foo[1]');
        converted.should.equal('foo.1');
        done();
      })
      it('should convert string path foo[1][2] to foo.1.2', done => {
        const converted = AttributeExpression.stringToPath('foo[1][2]');
        converted.should.equal('foo.1.2');
        done();
      })
      it('should convert string path [1][2] to 1.2', done => {
        const converted = AttributeExpression.stringToPath('[1][2]');
        converted.should.equal('1.2');
        done();
      })
      it('should convert string path [1][2].bar[1] to 1.2.bar.1', done => {
        const converted = AttributeExpression.stringToPath('[1][2].bar[1]');
        converted.should.equal('1.2.bar.1');
        done();
      })
      it('should evaluate foo[1]', done => {
        const dataDomain = {foo: ['hello', 'world']};
        const ref = defaultExpressionStackParser.parse('<<ex type=Attribute data-type=Text>> foo[1]', scope);
        const expression = new AttributeExpression(ref[1] as AttributeExpressionReference, scope);
        const result = expression.evaluate(dataDomain, scope);
        result.should.equal('world');
        done();
      });
      it('should evaluate [1][2]', done => {
        const dataDomain = [[0,1], [2,3,4]];
        const ref = defaultExpressionStackParser.parse('<<ex type=Attribute data-type=Number>> [1][2]', scope);
        const expression = new AttributeExpression(ref[1] as AttributeExpressionReference, scope);
        const result = expression.evaluate(dataDomain, scope);
        result.should.equal(4);
        done();
      })
    });
  });
});
