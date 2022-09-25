import {Hints} from '@franzzemen/app-utility';
import {DataTypeFactory, StandardDataType} from '@franzzemen/re-data-type';
import chai from 'chai';
import 'mocha';
import {isPromise} from 'util/types';
import {
  AttributeExpressionReference,
  ExpressionScope,
  ExpressionStackParser, ExpressionType, isAttributeExpressionReference,
  isValueExpressionReference,
  ValueExpressionParser, ValueExpressionReference
} from '../../publish/index.js';

const should = chai.should();
const expect = chai.expect;
const unreachableCode = true;



describe('re-expression tests', () => {
  describe('expression stack parser tests', () => {
    describe(`parser/expression-stack-parser.test`, () => {
      const noHints = new Hints('');
      noHints.loadAndResolve();
      describe('ValueExpressionParser Tests', () => {
        it('Should parse Number through inference', () => {
          const parser = new ValueExpressionParser();
          const result = parser.parseAndResolve('12345 = ', new ExpressionScope(), noHints);
          if (isPromise(result[1])) {
            unreachableCode.should.be.true;
          } else {
            result[0].should.equal('=');
            (result[1] as ValueExpressionReference).value.should.equal(12345);
            result[1].dataTypeRef.should.equal('Number');
          }
        });
        it('Should parse Float through inference', () => {
          const parser = new ValueExpressionParser();
          const result = parser.parseAndResolve('12345.1 = ', new ExpressionScope(), noHints);
          if (isPromise(result[1])) {
            unreachableCode.should.be.true;
          } else {
            result[0].should.equal('=');
            (result[1] as ValueExpressionReference).value.should.equal(12345.1);
            result[1].dataTypeRef.should.equal('Float');
          }
        });
        it('Should parse Boolean through inference', () => {
          const parser = new ValueExpressionParser();
          const result = parser.parseAndResolve('false = ', new ExpressionScope(), noHints);
          if (isPromise(result[1])) {
            unreachableCode.should.be.true;
          } else {
            result[0].should.equal('=');
            (result[1] as ValueExpressionReference).value.should.equal(false);
            result[1].dataTypeRef.should.equal('Boolean');
          }
        });
        it('Should parse Text through inference', () => {
          const parser = new ValueExpressionParser();
          const result = parser.parseAndResolve('"false" = ', new ExpressionScope(), noHints);
          if (isPromise(result[1])) {
            unreachableCode.should.be.true;
          } else {
            result[0].should.equal('=');
            (result[1] as ValueExpressionReference).value.should.equal('false');
            result[1].dataTypeRef.should.equal('Text');
          }
        });
        it('Should parse Timestamp through inference', () => {
          const parser = new ValueExpressionParser();
          const result = parser.parseAndResolve('"2021-12-31 23:59:00" m= ', new ExpressionScope(), noHints);
          if (isPromise(result[1])) {
            unreachableCode.should.be.true;
          } else {
            result[0].should.equal('m=');
            (typeof (result[1] as ValueExpressionReference).value).should.equal('object');
            result[1].dataTypeRef.should.equal('Timestamp');
          }
        });
        it('Should parse Date through inference', () => {
          const parser = new ValueExpressionParser();
          const result = parser.parseAndResolve('"2021-12-31" = ', new ExpressionScope(), noHints);
          if (isPromise(result[1])) {
            unreachableCode.should.be.true;
          } else {
            result[0].should.equal('=');
            (typeof (result[1] as ValueExpressionReference).value).should.equal('object');
            result[1].dataTypeRef.should.equal('Date');
          }
        });
        it('Should parse Time through inference', () => {
          const parser = new ValueExpressionParser();
          const result = parser.parseAndResolve('"23:59:00" m= ', new ExpressionScope(), noHints);
          if (isPromise(result[1])) {
            unreachableCode.should.be.true;
          } else {
            result[0].should.equal('m=');
            (typeof result[1]).should.equal('object');
            result[1].dataTypeRef.should.equal('Time');
          }
        });
      });
      describe('Stack Tests', () => {
        it('Should parse a value expression (data type=Number) with no hints', () => {
          const scope = new ExpressionScope();
          const expressionStackParser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
          const result = expressionStackParser.parseAndResolve('12345 =', scope, undefined);
          if (isPromise(result[1])) {
            unreachableCode.should.be.true;
          } else {
            result[0].should.equal('=');
            result[1].dataTypeRef.should.equal('Number');
            result[1].type.should.equal('Value');
            if (isValueExpressionReference(result[1])) {
              (result[1] as ValueExpressionReference).value.should.equal(12345);
            } else {
              unreachableCode.should.be.true;
            }
          }
        });
        it('Should parse a value expression (data type=Number) with full hints', () => {
          const scope = new ExpressionScope();
          const expressionStackParser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
          const result = expressionStackParser.parseAndResolve('<<ex type=Value data-type=Number>> 12345 =', scope, undefined);
          if (isPromise(result[1])) {
            unreachableCode.should.be.true;
          } else {
            result[0].should.equal('=');
            result[1].dataTypeRef.should.equal('Number');
            result[1].type.should.equal('Value');
            if (isValueExpressionReference(result[1])) {
              (result[1] as ValueExpressionReference).value.should.equal(12345);
            } else {
              unreachableCode.should.be.true;
            }
          }
        });
        it('Should parse a text attribute expression with suggested data type (hello)', () => {
          const scope = new ExpressionScope();
          const expressionStackParser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
          const [remaining, expressionRef] = expressionStackParser.parseAndResolve('hello', scope, {inferredDataType: StandardDataType.Text});
          if (isPromise(expressionRef)) {
            unreachableCode.should.be.true;
          } else {
            remaining.length.should.equal(0);
            expressionRef.type.should.equal(ExpressionType.Attribute);
            (expressionRef as AttributeExpressionReference).path.should.equal('hello');
          }
        });
        it('Should parse a text attribute expression with path "foo[other.lookup]"', () => {
          const scope = new ExpressionScope();
          const expressionStackParser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
          const [remaining, expressionRef] = expressionStackParser.parseAndResolve('foo[other.lookup]', scope, {inferredDataType: StandardDataType.Text});
          if(isPromise(expressionRef)) {
            unreachableCode.should.be.true;
          } else {
            (expressionRef as AttributeExpressionReference).path.should.equal('foo[other.lookup]');
          }
        });
      });

      describe('Inline data type tests', () => {
        it('Should parse attribute with inline data type fields', () => {
          const scope = new ExpressionScope();
          const expressionStackParser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
          const [remaining, refOrPromise] = expressionStackParser.parseAndResolve(`<<ex 
          data-type="Contrived Data Type" 
          data-type-module-name=../../../testing/parser/contrived-data-type.js
          data-type-function-name=contrivedDataType
          data-type-module-resolution=es>> myAttribute`, scope);
          if (isPromise(refOrPromise)) {
            refOrPromise
              .then((expressionRef) => {
                expressionRef.type.should.equal(ExpressionType.Attribute);
                expressionRef.dataTypeRef.should.equal('Contrived Data Type');
                if (isAttributeExpressionReference(expressionRef)) {
                  expressionRef.path.should.equal('myAttribute');
                }
                const dataTypeFactory: DataTypeFactory = scope.get(ExpressionScope.DataTypeFactory);
                const dataType = dataTypeFactory.getRegistered('Contrived Data Type');
                dataType.refName.should.equal('Contrived Data Type');
                expressionRef.dataTypeModule.moduleName.should.equal('../../../testing/parser/contrived-data-type');
                expressionRef.dataTypeModule.functionName.should.equal('contrivedDataType');
              });
          } else {
            unreachableCode.should.be.true;
          }
        });
        it('Should parse attribute with inline data type module', () => {
          const scope = new ExpressionScope();
          const expressionStackParser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
          const [remaining, refOrPromise] = expressionStackParser.parseAndResolve(`<<ex 
          data-type="Contrived Data Type" 
          data-type-module={"moduleName": "../../../testing/parser/contrived-data-type.js", "functionName": "contrivedDataType", "moduleResolution":"es"}>> myAttribute`, scope);
          if (isPromise(refOrPromise)) {
            refOrPromise
              .then((expressionRef) => {
                expressionRef.type.should.equal(ExpressionType.Attribute);
                expressionRef.dataTypeRef.should.equal('Contrived Data Type');
                if (isAttributeExpressionReference(expressionRef)) {
                  expressionRef.path.should.equal('myAttribute');
                }
                const dataTypeFactory: DataTypeFactory = scope.get(ExpressionScope.DataTypeFactory);
                const dataType = dataTypeFactory.getRegistered('Contrived Data Type');
                dataType.refName.should.equal('Contrived Data Type');
                expressionRef.dataTypeModule.moduleName.should.equal('../../../testing/parser/contrived-data-type');
                expressionRef.dataTypeModule.functionName.should.equal('contrivedDataType');
              });
          } else {
            unreachableCode.should.be.true;
          }
        });
      });
    });
  });
});

