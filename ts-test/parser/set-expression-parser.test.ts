import {Hints} from '@franzzemen/app-utility';
import {StandardDataType} from '@franzzemen/re-data-type';
import chai from 'chai';
import 'mocha';
import {isPromise} from 'util/types';
import {
  ExpressionHintKey,
  ExpressionScope,
  isAttributeExpressionReference,
  isSetExpressionReference,
  isValueExpressionReference, MultivariateDataTypeHandling, ParserMessages, ResolvedExpressionParserResult,
  SetExpressionParser,
  SetExpressionReference
} from '../../publish/index.js';
import qunit = Mocha.interfaces.qunit;


const expect = chai.expect;
const should = chai.should();


const unreachableCode = false;

describe('re-expression', () => {
  describe('set expression parser tests', () => {
    describe('parser/set-expression-parser.test', () => {
      describe('legacy tests', () => {
        it('should not parse empty string', () => {
          const scope = new ExpressionScope();
          const parser = new SetExpressionParser();
          const hints = new Hints('');
          hints.loadAndResolve();
          let [remaining, expRef, messages] = parser.parseAndResolve('', scope, hints) as [string, SetExpressionReference | Promise<SetExpressionReference>, ParserMessages];
          if (isPromise(expRef)) {
            unreachableCode.should.be.true;
          } else {
            remaining.should.equal('');
            expect(expRef).to.be.undefined;
          }
        });
        it('should not parse empty contents without data type hint[]', () => {
          try {
            const scope = new ExpressionScope();
            const parser = new SetExpressionParser();
            const hints = new Hints('');
            hints.loadAndResolve();
            let [remaining, expRef, parserMessages] = parser.parseAndResolve('[]', scope, hints) as ResolvedExpressionParserResult;
            expect(parserMessages).to.be.undefined;
          } catch (err) {
            unreachableCode.should.be.true;
          }
        });
        it('should parse empty contents with data type hint <<ex data-type=Number>> []', () => {
          try {
            const scope = new ExpressionScope();
            const parser = new SetExpressionParser();
            const hints = new Hints('data-type=Number');
            hints.loadAndResolve();
            let [remaining, expRef, parserMessages] = parser.parseAndResolve('[]', scope, hints) as [string, SetExpressionReference | Promise<SetExpressionReference>, ParserMessages];
            if (isPromise(expRef)) {
              unreachableCode.should.be.true;
            } else {
              remaining.should.equal('');
              expRef.set.should.be.empty;
            }
          } catch (err) {
            unreachableCode.should.be.true;

          }
        });
        it('should parse Value expression contents with data type hint <<ex data-type=Number>> [6]', () => {
          try {
            const scope = new ExpressionScope();
            const parser = new SetExpressionParser();
            const hints = new Hints('data-type=Number');
            hints.loadAndResolve();
            let [remaining, expRef, parserMessages] = parser.parseAndResolve('[6]', scope, hints) as [string, SetExpressionReference | Promise<SetExpressionReference>, ParserMessages];
            remaining.should.equal('');
            if (isPromise(expRef)) {
              unreachableCode.should.be.true;
            } else {
              expRef.set.length.should.equal(1);
              if (isValueExpressionReference(expRef.set[0])) {
                expRef.set[0].value.should.equal(6);
              } else {
                unreachableCode.should.be.true;
              }
            }
          } catch (err) {
            unreachableCode.should.be.true;

          }
        });
        it('should parse Value expression contents  [6]', () => {
          try {
            const scope = new ExpressionScope();
            const parser = new SetExpressionParser();
            const hints = new Hints('');
            hints.loadAndResolve();
            let [remaining, expRef, parserMessages] = parser.parseAndResolve('[6]', scope, hints) as [string, SetExpressionReference | Promise<SetExpressionReference>, ParserMessages];
            remaining.should.equal('');
            if (isPromise(expRef)) {
              unreachableCode.should.be.true;
            } else {
              expRef.set.length.should.equal(1);
              if (isValueExpressionReference(expRef.set[0])) {
                expRef.set[0].value.should.equal(6);
              } else {
                unreachableCode.should.be.true;
              }
            }
          } catch (err) {
            unreachableCode.should.be.true;

          }
        });
        it('should parse Value expression contents  [6 7]', () => {
          try {
            const scope = new ExpressionScope();
            const parser = new SetExpressionParser();
            const hints = new Hints('');
            hints.loadAndResolve();
            let [remaining, expRef, paraserMessages] = parser.parseAndResolve('[6 7]', scope, hints) as [string, SetExpressionReference | Promise<SetExpressionReference>, ParserMessages];
            remaining.should.equal('');
            if (isPromise(expRef)) {
              unreachableCode.should.be.true;
            } else {
              expRef.set.length.should.equal(2);
              if (isValueExpressionReference(expRef.set[0])) {
                expRef.set[0].value.should.equal(6);
              } else unreachableCode.should.be.true;
              if (isValueExpressionReference(expRef.set[1])) {
                expRef.set[1].value.should.equal(7);
              } else unreachableCode.should.be.true;
            }
          } catch (err) {
            unreachableCode.should.be.true;

          }
        });
        it('should parse Number expression contents including attribute [6 myAttribute]', () => {
          try {
            const scope = new ExpressionScope();
            const parser = new SetExpressionParser();
            const hints = new Hints('');
            hints.loadAndResolve();
            let [remaining, expRef, parserMessages] = parser.parseAndResolve('[6 myAttribute]', scope, hints) as [string, SetExpressionReference | Promise<SetExpressionReference>, ParserMessages];
            remaining.should.equal('');
            if (isPromise(expRef)) {
              unreachableCode.should.be.true;
            } else {
              expRef.set.length.should.equal(2);
              if (isValueExpressionReference(expRef.set[0])) {
                expRef.set[0].value.should.equal(6);
              } else unreachableCode.should.be.true;
              if (isAttributeExpressionReference(expRef.set[1])) {
                expRef.set[1].path.should.equal('myAttribute');
              } else unreachableCode.should.be.true;
            }
          } catch (err) {
            unreachableCode.should.be.true;

          }
        });
        it('should parse Number expression contents including attribute [6, myAttribute]', () => {
          try {
            const scope = new ExpressionScope();
            const parser = new SetExpressionParser();
            const hints = new Hints('');
            hints.loadAndResolve();
            let [remaining, expRef, parserMessages] = parser.parseAndResolve('[6, myAttribute]', scope, hints) as [string, SetExpressionReference | Promise<SetExpressionReference>, ParserMessages];
            remaining.should.equal('');
            if (isPromise(expRef)) {
              unreachableCode.should.be.true;
            } else {
              expRef.set.length.should.equal(2);
              if (isValueExpressionReference(expRef.set[0])) {
                expRef.set[0].value.should.equal(6);
              } else unreachableCode.should.be.true;
              if (isAttributeExpressionReference(expRef.set[1])) {
                expRef.set[1].path.should.equal('myAttribute');
              } else unreachableCode.should.be.true;
            }
          } catch (err) {
            unreachableCode.should.be.true;

          }
        });
        it('should parse Number expression contents including attribute [myAttribute, 6]', () => {
          const scope = new ExpressionScope();
          const parser = new SetExpressionParser();
          const hints = new Hints('');
          hints.loadAndResolve();
          let [remaining, expRef, parserMessages] = parser.parseAndResolve('[myAttribute, 6]', scope, hints) as [string, SetExpressionReference | Promise<SetExpressionReference>, ParserMessages];
          remaining.should.equal('');
          if (isPromise(expRef)) {
            unreachableCode.should.be.true;
          } else {
            expRef.set.length.should.equal(2);
            if (isValueExpressionReference(expRef.set[1])) {
              expRef.set[1].value.should.equal(6);
              expRef.set[1].dataTypeRef.should.equal(StandardDataType.Number);
            } else unreachableCode.should.be.true;
            if (isAttributeExpressionReference(expRef.set[0])) {
              expRef.set[0].path.should.equal('myAttribute');
            } else unreachableCode.should.be.true;
          }
        });
        it('should parse Number expression contents including attribute [<<ex type=Attribute data-type=Number>> myAttribute, 6]', () => {
          try {
            const scope = new ExpressionScope();
            const parser = new SetExpressionParser();
            const hints = new Hints('');
            hints.loadAndResolve();
            let [remaining, expRef, parserMessages] = parser.parseAndResolve('[<<ex type=Attribute data-type=Number>> myAttribute, 6]', scope, hints) as [string, SetExpressionReference | Promise<SetExpressionReference>, ParserMessages];
            if (isPromise(expRef)) {
              unreachableCode.should.be.true;
            } else {
              if (isSetExpressionReference(expRef)) {
                remaining.should.equal('');
                expRef.set.length.should.equal(2);
                if (isValueExpressionReference(expRef.set[1])) {
                  expRef.set[1].value.should.equal(6);
                  expRef.set[1].dataTypeRef.should.equal(StandardDataType.Number);
                } else unreachableCode.should.be.true;
                if (isAttributeExpressionReference(expRef.set[0])) {
                  expRef.set[0].path.should.equal('myAttribute');
                } else unreachableCode.should.be.true;
              }
            }
          } catch (err) {
            unreachableCode.should.be.true;
          }
        });
        it('should parse Number expression contents including attribute [<<ex type=Attribute data-type=Number>> myAttribute, 6 18]', () => {
          try {
            const scope = new ExpressionScope();
            const parser = new SetExpressionParser();
            const hints = new Hints('');
            hints.loadAndResolve();
            let [remaining, expRef, parserMessages] = parser.parseAndResolve('[<<ex type=Attribute data-type=Number>> myAttribute, 6 18]', scope, hints) as [string, SetExpressionReference | Promise<SetExpressionReference>, ParserMessages];
            if (isPromise(expRef)) {
              unreachableCode.should.be.true;
            } else {
              if (isSetExpressionReference(expRef)) {
                remaining.should.equal('');
                expRef.set.length.should.equal(3);
                if (isValueExpressionReference(expRef.set[1])) {
                  expRef.set[1].value.should.equal(6);
                  expRef.set[1].dataTypeRef.should.equal(StandardDataType.Number);
                } else unreachableCode.should.be.true;
                if (isAttributeExpressionReference(expRef.set[0])) {
                  expRef.set[0].path.should.equal('myAttribute');
                } else unreachableCode.should.be.true;
                if (isValueExpressionReference(expRef.set[2])) {
                  expRef.set[2].value.should.equal(18);
                } else unreachableCode.should.be.true;
              }
            }
          } catch (err) {
            unreachableCode.should.be.true;
          }
        });
      });
      describe('multivariate and multivariate data handling tests', () => {
        it('Should infer Number for Consistent also for attribute element in [myAttribute, 6 18]', () => {
          const scope = new ExpressionScope();
          const parser = new SetExpressionParser();
          const hints = new Hints(`${ExpressionHintKey.Multivariate} ${ExpressionHintKey.MultivariateDataTypeHandling}=${MultivariateDataTypeHandling.Consistent}`);
          hints.loadAndResolve();
          const parsStr = '[myAttribute, 6 18]';
          let [remaining, expRef, parserMessages] = parser.parseAndResolve(parsStr, scope, hints) as [string, SetExpressionReference, ParserMessages]; // We know there are no promises
          expect(expRef).to.exist;
          expRef.dataTypeRef.should.equal(StandardDataType.Number);
          expRef.set[0].dataTypeRef.should.equal(StandardDataType.Number);
        });
      });
    });
  });
});
