import {Hints} from '@franzzemen/app-utility';
import {StandardDataType} from '@franzzemen/re-data-type';
import chai from 'chai';
import 'mocha';
import {
  ExpressionScope,
  isAttributeExpressionReference,
  isValueExpressionReference,
  SetExpressionParser
} from '../../publish';


const expect = chai.expect;
const should = chai.should();

const scope = new ExpressionScope();
const parser = new SetExpressionParser();
const stackParser = scope.get(ExpressionScope.ExpressionStackParser);
const unreachableCode = false;

describe('Rules Engine Tests', () => {
  describe('Set Expression Parser Tests', () => {
    describe('/core/expression/parser/set-expression-parser.test', () => {
      it('should not parse empty string', done => {
        let [remaining, expRef] = parser.parse('', scope, new Hints(''));
        remaining.should.equal('');
        expect(expRef).to.be.undefined;
        done();
      });
      it ('should not parse empty contents without data type hint[]', done => {
        try {
          let [remaining, expRef] = parser.parse('[]', scope, new Hints(''));
          unreachableCode.should.be.true;
        } catch (err) {
          err.message.should.equal('Indeterminate data type for set expression');
          done();
        }
      })
      it ('should parse empty contents with data type hint <<ex data-type=Number>> []', done => {
        try {
          const hints = new Hints('data-type=Number');
          let [remaining, expRef] = parser.parse('[]', scope, hints);
          remaining.should.equal('');
          expRef.set.should.be.empty;
          done();
        } catch (err) {
          unreachableCode.should.be.true;
          done();
        }
      })
      it ('should parse Value expression contents with data type hint <<ex data-type=Number>> [6]', done => {
        try {
          const hints = new Hints('data-type=Number');
          let [remaining, expRef] = parser.parse('[6]', scope, hints);
          remaining.should.equal('');
          expRef.set.length.should.equal(1);
          if(isValueExpressionReference(expRef.set[0])) {
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
      it ('should parse Value expression contents  [6]', done => {
        try {
          const hints = new Hints('');
          let [remaining, expRef] = parser.parse('[6]', scope, hints);
          remaining.should.equal('');
          expRef.set.length.should.equal(1);
          if(isValueExpressionReference(expRef.set[0])) {
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
      it ('should parse Value expression contents  [6 7]', done => {
        try {
          const hints = new Hints('');
          let [remaining, expRef] = parser.parse('[6 7]', scope, hints);
          remaining.should.equal('');
          expRef.set.length.should.equal(2);
          if(isValueExpressionReference(expRef.set[0])) {
            expRef.set[0].value.should.equal(6);
          } else unreachableCode.should.be.true;
          if(isValueExpressionReference(expRef.set[1])) {
            expRef.set[1].value.should.equal(7);
          } else unreachableCode.should.be.true;
          done();
        } catch (err) {
          unreachableCode.should.be.true;
          done();
        }
      });
      it ('should parse Number expression contents including attribute [6 myAttribute]', done => {
        try {
          const hints = new Hints('');
          let [remaining, expRef] = parser.parse('[6 myAttribute]', scope, hints);
          remaining.should.equal('');
          expRef.set.length.should.equal(2);
          if(isValueExpressionReference(expRef.set[0])) {
            expRef.set[0].value.should.equal(6);
          } else unreachableCode.should.be.true;
          if(isAttributeExpressionReference(expRef.set[1])) {
            expRef.set[1].path.should.equal('myAttribute');
          } else unreachableCode.should.be.true;
          done();
        } catch (err) {
          unreachableCode.should.be.true;
          done();
        }
      })
      it ('should parse Number expression contents including attribute [6, myAttribute]', done => {
        try {
          const hints = new Hints('');
          let [remaining, expRef] = parser.parse('[6, myAttribute]', scope, hints);
          remaining.should.equal('');
          expRef.set.length.should.equal(2);
          if(isValueExpressionReference(expRef.set[0])) {
            expRef.set[0].value.should.equal(6);
          } else unreachableCode.should.be.true;
          if(isAttributeExpressionReference(expRef.set[1])) {
            expRef.set[1].path.should.equal('myAttribute');
          } else unreachableCode.should.be.true;
          done();
        } catch (err) {
          unreachableCode.should.be.true;
          done();
        }
      })
      it ('should parse Number expression contents including attribute [myAttribute, 6]', done => {
          const hints = new Hints('');
          let [remaining, expRef] = parser.parse('[myAttribute, 6]', scope, hints);
          remaining.should.equal('');
          expRef.set.length.should.equal(2);
          if(isValueExpressionReference(expRef.set[1])) {
            expRef.set[1].value.should.equal(6);
            expRef.set[1].dataTypeRef.should.equal(StandardDataType.Number);
          } else unreachableCode.should.be.true;
          if(isAttributeExpressionReference(expRef.set[0])) {
            expRef.set[0].path.should.equal('myAttribute');
          } else unreachableCode.should.be.true;
          done();
      })
    })
    it ('should parse Number expression contents including attribute [<<ex type=Attribute data-type=Number>> myAttribute, 6]', done => {
      try {
        const hints = new Hints('');
        let [remaining, expRef] = parser.parse('[<<ex type=Attribute data-type=Number>> myAttribute, 6]', scope, hints);
        remaining.should.equal('');
        expRef.set.length.should.equal(2);
        if(isValueExpressionReference(expRef.set[1])) {
          expRef.set[1].value.should.equal(6);
          expRef.set[1].dataTypeRef.should.equal(StandardDataType.Number);
        } else unreachableCode.should.be.true;
        if(isAttributeExpressionReference(expRef.set[0])) {
          expRef.set[0].path.should.equal('myAttribute');
        } else unreachableCode.should.be.true;
        done();
      } catch (err) {
        unreachableCode.should.be.true;
        done();
      }
    })
    it ('should parse Number expression contents including attribute [<<ex type=Attribute data-type=Number>> myAttribute, 6 18]', done => {
      try {
        const hints = new Hints('');
        let [remaining, expRef] = parser.parse('[<<ex type=Attribute data-type=Number>> myAttribute, 6 18]', scope, hints);
        remaining.should.equal('');
        expRef.set.length.should.equal(3);
        if(isValueExpressionReference(expRef.set[1])) {
          expRef.set[1].value.should.equal(6);
          expRef.set[1].dataTypeRef.should.equal(StandardDataType.Number);
        } else unreachableCode.should.be.true;
        if(isAttributeExpressionReference(expRef.set[0])) {
          expRef.set[0].path.should.equal('myAttribute');
        } else unreachableCode.should.be.true;
        if(isValueExpressionReference(expRef.set[2])) {
          expRef.set[2].value.should.equal(18);
        } else unreachableCode.should.be.true;
        done();
      } catch (err) {
        unreachableCode.should.be.true;
        done();
      }
    })
  })
})
