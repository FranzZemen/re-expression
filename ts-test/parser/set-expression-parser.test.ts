import {Hints} from '@franzzemen/app-utility';
import {StandardDataType} from '@franzzemen/re-data-type';
import chai from 'chai';
import 'mocha';
import {isPromise} from 'util/types';
import {
  ExpressionScope,
  isAttributeExpressionReference, isSetExpressionReference,
  isValueExpressionReference, ResolvedExpressionParserResult,
  SetExpressionParser, SetExpressionReference
} from '../../publish/index.js';


const expect = chai.expect;
const should = chai.should();


const unreachableCode = false;

describe('re-expression', () => {
  describe('set expression parser tests', () => {
    describe('parser/set-expression-parser.test', () => {
      it('should not parse empty string', () => {
        const scope = new ExpressionScope();
        const parser = new SetExpressionParser();
        const hints = new Hints('');
        hints.loadAndResolve();
        let [remaining, expRef] = parser.parseAndResolve('', scope,  hints) as [string, SetExpressionReference | Promise<SetExpressionReference>]
        if(isPromise(expRef))  {
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
          let [remaining, expRef] = parser.parseAndResolve('[]', scope,  hints) as [string, SetExpressionReference | Promise<SetExpressionReference>]
          unreachableCode.should.be.true;
        } catch (err) {
          expect(err.message.startsWith('Empty multivariate with indeterminate data type')).to.be.true;
        }
      })
      it('should parse empty contents with data type hint <<ex data-type=Number>> []', () => {
        try {
          const scope = new ExpressionScope();
          const parser = new SetExpressionParser();
          const hints = new Hints('data-type=Number');
          hints.loadAndResolve();
          let [remaining, expRef] = parser.parseAndResolve('[]', scope, hints) as [string, SetExpressionReference | Promise<SetExpressionReference>]
          if(isPromise(expRef)) {
            unreachableCode.should.be.true
          } else {
            remaining.should.equal('');
            expRef.set.should.be.empty;
          }
        } catch (err) {
          unreachableCode.should.be.true;
          
        }
      })
      it('should parse Value expression contents with data type hint <<ex data-type=Number>> [6]', () => {
        try {
          const scope = new ExpressionScope();
          const parser = new SetExpressionParser();
          const hints = new Hints('data-type=Number');
          hints.loadAndResolve();
          let [remaining, expRef] = parser.parseAndResolve('[6]', scope,  hints) as [string, SetExpressionReference | Promise<SetExpressionReference>]
          remaining.should.equal('');
          if(isPromise(expRef))  {
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
          let [remaining, expRef] = parser.parseAndResolve('[6]', scope,  hints) as [string, SetExpressionReference | Promise<SetExpressionReference>]
          remaining.should.equal('');
          if(isPromise(expRef))  {
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
          let [remaining, expRef] = parser.parseAndResolve('[6 7]', scope,  hints) as [string, SetExpressionReference | Promise<SetExpressionReference>]
          remaining.should.equal('');
          if(isPromise(expRef))  {
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
          let [remaining, expRef] = parser.parseAndResolve('[6 myAttribute]', scope,  hints) as [string, SetExpressionReference | Promise<SetExpressionReference>]
          remaining.should.equal('');
          if(isPromise(expRef))  {
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
      })
      it('should parse Number expression contents including attribute [6, myAttribute]', () => {
        try {
          const scope = new ExpressionScope();
          const parser = new SetExpressionParser();
          const hints = new Hints('');
          hints.loadAndResolve();
          let [remaining, expRef] = parser.parseAndResolve('[6, myAttribute]', scope,  hints) as [string, SetExpressionReference | Promise<SetExpressionReference>]
          remaining.should.equal('');
          if(isPromise(expRef))  {
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
      })
      it('should parse Number expression contents including attribute [myAttribute, 6]', () => {
        const scope = new ExpressionScope();
        const parser = new SetExpressionParser();
        const hints = new Hints('');
        hints.loadAndResolve();
        let [remaining, expRef] = parser.parseAndResolve('[myAttribute, 6]', scope,  hints) as [string, SetExpressionReference | Promise<SetExpressionReference>]
        remaining.should.equal('');
        if(isPromise(expRef))  {
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
      })
    })
    it('should parse Number expression contents including attribute [<<ex type=Attribute data-type=Number>> myAttribute, 6]', () => {
      try {
        const scope = new ExpressionScope();
        const parser = new SetExpressionParser();
        const hints = new Hints('');
        hints.loadAndResolve();
        let [remaining, expRef] = parser.parseAndResolve('[<<ex type=Attribute data-type=Number>> myAttribute, 6]', scope, hints) as [string, SetExpressionReference | Promise<SetExpressionReference>]
        if(isPromise(expRef))  {
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
    })
    it('should parse Number expression contents including attribute [<<ex type=Attribute data-type=Number>> myAttribute, 6 18]', () => {
      try {
        const scope = new ExpressionScope();
        const parser = new SetExpressionParser();
        const hints = new Hints('');
        hints.loadAndResolve();
        let [remaining, expRef] = parser.parseAndResolve('[<<ex type=Attribute data-type=Number>> myAttribute, 6 18]', scope, hints) as [string, SetExpressionReference | Promise<SetExpressionReference>]
        if(isPromise(expRef))  {
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
    })
  })
});
