import {Hints} from '@franzzemen/app-utility';
import {StandardDataType} from '@franzzemen/re-data-type';
import chai from 'chai';
import 'mocha';
import {
  ExpressionScope,
  isAttributeExpressionReference, isSetExpressionReference,
  isValueExpressionReference,
  SetExpressionParser, SetExpressionReference
} from '../../publish/index.js';


const expect = chai.expect;
const should = chai.should();

const scope = new ExpressionScope();
const parser = new SetExpressionParser();
const stackParser = scope.get(ExpressionScope.ExpressionStackParser);
const unreachableCode = false;
/*
describe('Rules Engine Tests', () => {
  describe('Set Expression Parser Tests', () => {
    describe('/core/expression/parser/set-expression-parser.test', () => {
      it('should not parse empty string', done => {
        const hints = new Hints('');
        hints.loadAndInitialize();
        let [remaining, expRef] = parser.parse('', scope, hints) as [string, SetExpressionReference];
        remaining.should.equal('');
        expect(expRef).to.be.undefined;
        done();
      });
      it('should not parse empty contents without data type hint[]', () => {
        try {
          const hints = new Hints('');
          hints.loadAndInitialize();
          let [remaining, expRef] = parser.parse('[]', scope, hints) as [string, SetExpressionReference];
          unreachableCode.should.be.true;
        } catch (err) {
          expect(err.message.startsWith('Indeterminate data type')).to.be.true;
        }
      })
      it('should parse empty contents with data type hint <<ex data-type=Number>> []', done => {
        try {
          const hints = new Hints('data-type=Number');
          hints.loadAndInitialize();
          let [remaining, expRef] = parser.parse('[]', scope, hints) as [string, SetExpressionReference];
          remaining.should.equal('');
          expRef.set.should.be.empty;
          done();
        } catch (err) {
          unreachableCode.should.be.true;
          done();
        }
      })
      it('should parse Value expression contents with data type hint <<ex data-type=Number>> [6]', done => {
        try {
          const hints = new Hints('data-type=Number');
          hints.loadAndInitialize();
          let [remaining, expRef] = parser.parse('[6]', scope, hints) as [string, SetExpressionReference];
          remaining.should.equal('');
          expRef.set.length.should.equal(1);
          if (isValueExpressionReference(expRef.set[0])) {
            expRef.set[0].value.should.equal(6);
          } else {
            unreachableCode.should.be.true;
          }
          done();
        } catch (err) {
          unreachableCode.should.be.true;
          done();
        }
      });
      it('should parse Value expression contents  [6]', done => {
        try {
          const hints = new Hints('');
          hints.loadAndInitialize();
          let [remaining, expRef] = parser.parse('[6]', scope, hints) as [string, SetExpressionReference];
          remaining.should.equal('');
          expRef.set.length.should.equal(1);
          if (isValueExpressionReference(expRef.set[0])) {
            expRef.set[0].value.should.equal(6);
          } else {
            unreachableCode.should.be.true;
          }
          done();
        } catch (err) {
          unreachableCode.should.be.true;
          done();
        }
      });
      it('should parse Value expression contents  [6 7]', done => {
        try {
          const hints = new Hints('');
          hints.loadAndInitialize();
          let [remaining, expRef] = parser.parse('[6 7]', scope, hints) as [string, SetExpressionReference];
          remaining.should.equal('');
          expRef.set.length.should.equal(2);
          if (isValueExpressionReference(expRef.set[0])) {
            expRef.set[0].value.should.equal(6);
          } else unreachableCode.should.be.true;
          if (isValueExpressionReference(expRef.set[1])) {
            expRef.set[1].value.should.equal(7);
          } else unreachableCode.should.be.true;
          done();
        } catch (err) {
          unreachableCode.should.be.true;
          done();
        }
      });
      it('should parse Number expression contents including attribute [6 myAttribute]', done => {
        try {
          const hints = new Hints('');
          hints.loadAndInitialize();
          let [remaining, expRef] = parser.parse('[6 myAttribute]', scope, hints) as [string, SetExpressionReference];
          remaining.should.equal('');
          expRef.set.length.should.equal(2);
          if (isValueExpressionReference(expRef.set[0])) {
            expRef.set[0].value.should.equal(6);
          } else unreachableCode.should.be.true;
          if (isAttributeExpressionReference(expRef.set[1])) {
            expRef.set[1].path.should.equal('myAttribute');
          } else unreachableCode.should.be.true;
          done();
        } catch (err) {
          unreachableCode.should.be.true;
          done();
        }
      })
      it('should parse Number expression contents including attribute [6, myAttribute]', done => {
        try {
          const hints = new Hints('');
          hints.loadAndInitialize();
          let [remaining, expRef] = parser.parse('[6, myAttribute]', scope, hints) as [string, SetExpressionReference];
          remaining.should.equal('');
          expRef.set.length.should.equal(2);
          if (isValueExpressionReference(expRef.set[0])) {
            expRef.set[0].value.should.equal(6);
          } else unreachableCode.should.be.true;
          if (isAttributeExpressionReference(expRef.set[1])) {
            expRef.set[1].path.should.equal('myAttribute');
          } else unreachableCode.should.be.true;
          done();
        } catch (err) {
          unreachableCode.should.be.true;
          done();
        }
      })
      it('should parse Number expression contents including attribute [myAttribute, 6]', done => {
        const hints = new Hints('');
        hints.loadAndInitialize();
        let [remaining, expRef] = parser.parse('[myAttribute, 6]', scope, hints) as [string, SetExpressionReference];
        remaining.should.equal('');
        expRef.set.length.should.equal(2);
        if (isValueExpressionReference(expRef.set[1])) {
          expRef.set[1].value.should.equal(6);
          expRef.set[1].dataTypeRef.should.equal(StandardDataType.Number);
        } else unreachableCode.should.be.true;
        if (isAttributeExpressionReference(expRef.set[0])) {
          expRef.set[0].path.should.equal('myAttribute');
        } else unreachableCode.should.be.true;
        done();
      })
    })
    it('should parse Number expression contents including attribute [<<ex type=Attribute data-type=Number>> myAttribute, 6]', () => {
      try {
        const hints = new Hints('');
        hints.loadAndInitialize();
        let [remaining, expRef] = parser.parse('[<<ex type=Attribute data-type=Number>> myAttribute, 6]', scope, hints) as ExpressionParseResult;
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
      } catch (err) {
        unreachableCode.should.be.true;
      }
    })
    it('should parse Number expression contents including attribute [<<ex type=Attribute data-type=Number>> myAttribute, 6 18]', () => {
      try {
        const hints = new Hints('');
        hints.loadAndInitialize();
        let [remaining, expRef] = parser.parse('[<<ex type=Attribute data-type=Number>> myAttribute, 6 18]', scope, hints) as ExpressionParseResult;
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
      } catch (err) {
        unreachableCode.should.be.true;
      }
    })
  })
});
*/
