import {StandardDataType} from '@franzzemen/re-data-type';
import chai from 'chai';
import 'mocha';


import moment, {Moment} from 'moment';
import {isPromise} from 'util/types';
import {
  AttributeExpression,
  AttributeExpressionReference,
  ExpressionScope,
  ExpressionStackParser,
  ExpressionType, ResolvedExpressionParserResult
} from '../publish/index.js';

const isMoment = moment.isMoment;

let should = chai.should();
let expect = chai.expect;

const scope = new ExpressionScope();
const defaultExpressionStackParser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);

const unreachableCode = false;

describe('re-expression tests', () => {
  describe('attribute expression tests', () => {
    describe('attribute-expression.test', () => {
      it('should evaluate an Attribute ExpressionBase simple object text property', () => {
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
      });
      it('should evaluate an Attribute ExpressionBase simple object number property as string', () => {
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
      });
      it('should evaluate an attribute ExpressionBase two items deep for date value', () => {
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
      });
      it('should evaluate an Attribute ExpressionBase path to undefined', () => {
        let item: any = {foo: {bar: '2020-10-24T04:00:00.000Z'}};
        const attribExpressionShape: AttributeExpressionReference = {
          type: ExpressionType.Attribute,
          dataTypeRef: StandardDataType.Date,
          path: 'foo.notExist'
        }
        let attributeExpression = new AttributeExpression(attribExpressionShape, scope);
        const result = attributeExpression.awaitEvaluation(item, scope);
        expect(result).to.not.exist;
      })
      it('should evaluate an Attribute ExpressionBase path foo.bar.car', () => {
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
      })
      it('should evaluate an Attribute Expression located at an array index foo.bar[1]', () => {
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
      });
      it('should convert string path foo[1] to foo.1', () => {
        const converted = AttributeExpression.stringToPath('foo[1]');
        converted.should.equal('foo.1');
      })
      it('should convert string path foo[1][2] to foo.1.2', () => {
        const converted = AttributeExpression.stringToPath('foo[1][2]');
        converted.should.equal('foo.1.2');
        })
      it('should convert string path [1][2] to 1.2', () => {
        const converted = AttributeExpression.stringToPath('[1][2]');
        converted.should.equal('1.2');
        })
      it('should convert string path [1][2].bar[1] to 1.2.bar.1', () => {
        const converted = AttributeExpression.stringToPath('[1][2].bar[1]');
        converted.should.equal('1.2.bar.1');
      })
      it('should evaluate foo[1]', () => {
        const dataDomain = {foo: ['hello', 'world']};
        const parseResult: ResolvedExpressionParserResult = defaultExpressionStackParser.parseAndResolve('<<ex type=Attribute data-type=Text>> foo[1]', scope);
        if(isPromise(parseResult)) {
          unreachableCode.should.be.true;
        } else {
          const [remaining, expressionRef] = [...parseResult];
          const expression = new AttributeExpression(expressionRef as AttributeExpressionReference, scope);
          const result = expression.evaluate(dataDomain, scope);
          result.should.equal('world');
        }
      });

      it('should evaluate [1][2]', () => {
        const dataDomain = [[0,1], [2,3,4]];
        const ref = defaultExpressionStackParser.parseAndResolve('<<ex type=Attribute data-type=Number>> [1][2]', scope);
        const expression = new AttributeExpression(ref[1] as AttributeExpressionReference, scope);
        const result = expression.evaluate(dataDomain, scope);result.should.equal(4);
      })
    });
  });
});

