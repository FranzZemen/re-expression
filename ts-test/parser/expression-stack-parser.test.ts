import {Hints} from '@franzzemen/app-utility';
import {DataTypeFactory, StandardDataType} from '@franzzemen/re-data-type';
import chai from 'chai';
import 'mocha';
import {
  AttributeExpressionReference,
  ExpressionScope,
  ExpressionStackParser, ExpressionType, isAttributeExpressionReference,
  isValueExpressionReference,
  ValueExpressionParser
} from '../../publish';

const should = chai.should();
const expect = chai.expect;
const unreachableCode = true;
const scope = new ExpressionScope();
const defaultExpressionStackParser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);

describe('Expression Stack Parser Tests', () => {
  describe('ExpressionParser Tests', () => {
    describe(`core/expression/parser/expression-stack-parser.test`, () => {
      const noHints = new Hints('');
      describe('ValueExpressionParser Tests', () => {
        it('Should parse Number through inference', done => {
          const parser = new ValueExpressionParser();
          const result = parser.parse('12345 = ', new ExpressionScope(), noHints);
          result[0].should.equal('=');
          result[1].value.should.equal(12345);
          result[1].dataTypeRef.should.equal('Number');
          done();
        });
        it('Should parse Float through inference', done => {
          const parser = new ValueExpressionParser();
          const result = parser.parse('12345.1 = ', new ExpressionScope(), noHints);
          result[0].should.equal('=');
          result[1].value.should.equal(12345.1);
          result[1].dataTypeRef.should.equal('Float');
          done();
        });
        it('Should parse Boolean through inference', done => {
          const parser = new ValueExpressionParser();
          const result = parser.parse('false = ', new ExpressionScope(), noHints);
          result[0].should.equal('=');
          result[1].value.should.equal(false);
          result[1].dataTypeRef.should.equal('Boolean');
          done();
        });
        it('Should parse Text through inference', done => {
          const parser = new ValueExpressionParser();
          const result = parser.parse('"false" = ', new ExpressionScope(), noHints);
          result[0].should.equal('=');
          result[1].value.should.equal("false");
          result[1].dataTypeRef.should.equal('Text');
          done();
        });
        it('Should parse Timestamp through inference', done => {
          const parser = new ValueExpressionParser();
          const result = parser.parse('"2021-12-31 23:59:00" m= ', new ExpressionScope(), noHints);
          result[0].should.equal('m=');
          (typeof result[1].value).should.equal("object");
          result[1].dataTypeRef.should.equal('Timestamp');
          done();
        });
        it('Should parse Date through inference', done => {
          const parser = new ValueExpressionParser();
          const result = parser.parse('"2021-12-31" = ', new ExpressionScope(), noHints);
          result[0].should.equal('=');
          (typeof result[1].value).should.equal("object");
          result[1].dataTypeRef.should.equal('Date');
          done();
        });
        it('Should parse Time through inference', done => {
          const parser = new ValueExpressionParser();
          const result = parser.parse('"23:59:00" m= ', new ExpressionScope(), noHints);
          result[0].should.equal('m=');
          (typeof result[1].value).should.equal("object");
          result[1].dataTypeRef.should.equal('Time');
          done();
        });
      });
      describe('Stack Tests', () => {
        it('Should parse a value expression (data type=Number) with no hints', done => {
          const result = defaultExpressionStackParser.parse('12345 =', scope, undefined);
          result[0].should.equal('=');
          result[1].dataTypeRef.should.equal('Number');
          result[1].type.should.equal('Value');
          if (isValueExpressionReference(result[1])) {
            result[1].value.should.equal(12345);
          } else {
            unreachableCode.should.be.true;
          }
          done();
        });
        it('Should parse a value expression (data type=Number) with full hints', done => {
          const result = defaultExpressionStackParser.parse('<<ex type=Value data-type=Number>> 12345 =', scope, undefined)
          result[0].should.equal('=');
          result[1].dataTypeRef.should.equal('Number');
          result[1].type.should.equal('Value');
          if (isValueExpressionReference(result[1])) {
            result[1].value.should.equal(12345);
          } else {
            unreachableCode.should.be.true;
          }
          done();
        });
        it('Should parse a text attribute expression with suggested data type (hello)', done => {
          const [remaining, expressionRef] = defaultExpressionStackParser.parse('hello', scope, {inferredDataType: StandardDataType.Text});
          remaining.length.should.equal(0);
          expressionRef.type.should.equal(ExpressionType.Attribute);
          (expressionRef as AttributeExpressionReference).path.should.equal('hello');
          done();
        });
        it('Should parse a text attribute expression with path "foo[other.lookup]"', done => {
          const [remaining, expressionRef] = defaultExpressionStackParser.parse('foo[other.lookup]', scope, {inferredDataType: StandardDataType.Text});
          (expressionRef as AttributeExpressionReference).path.should.equal('foo[other.lookup]');
          done();
        })
      });
      describe('Inline data type tests', () => {
        it('Should parse attribute with inline data type fields', done => {
          const [remaining, expressionRef] = defaultExpressionStackParser.parse(`<<ex 
          data-type="Contrived Data Type" 
          data-type-module-name=../../../testing/parser/contrived-data-type
          data-type-function-name=contrivedDataType>> myAttribute`, scope);
          expressionRef.type.should.equal(ExpressionType.Attribute);
          expressionRef.dataTypeRef.should.equal('Contrived Data Type');
          if(isAttributeExpressionReference(expressionRef)) {
            expressionRef.path.should.equal('myAttribute');
          }
          const dataTypeFactory: DataTypeFactory = scope.get(ExpressionScope.DataTypeFactory);
          const dataType = dataTypeFactory.getRegistered('Contrived Data Type');
          dataType.refName.should.equal('Contrived Data Type');
          expressionRef.dataTypeModule.moduleName.should.equal('../../../testing/parser/contrived-data-type');
          expressionRef.dataTypeModule.functionName.should.equal('contrivedDataType');
          done();
        });

        it('Should parse attribute with inline data type module', done => {
          const [remaining, expressionRef] = defaultExpressionStackParser.parse(`<<ex 
          data-type="Contrived Data Type" 
          data-type-module={"moduleName": "../../../testing/parser/contrived-data-type", "functionName": "contrivedDataType"}>> myAttribute`, scope);
          expressionRef.type.should.equal(ExpressionType.Attribute);
          expressionRef.dataTypeRef.should.equal('Contrived Data Type');
          if(isAttributeExpressionReference(expressionRef)) {
            expressionRef.path.should.equal('myAttribute');
          }
          const dataTypeFactory: DataTypeFactory = scope.get(ExpressionScope.DataTypeFactory);
          const dataType = dataTypeFactory.getRegistered('Contrived Data Type');
          dataType.refName.should.equal('Contrived Data Type');
          expressionRef.dataTypeModule.moduleName.should.equal('../../../testing/parser/contrived-data-type');
          expressionRef.dataTypeModule.functionName.should.equal('contrivedDataType');
          done();
        });
      });
    });
  });
});
