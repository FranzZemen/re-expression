import 'mocha';
import chai from 'chai';
import {_mergeExpressionOptions, ExpressionOptions} from '../../publish/index.js';

const should = chai.should();
const expect = chai.expect;

describe('re-expression tests',  () => {
  describe('expression options tests', () => {
    describe('scope/expression-options.test', () => {
      it('should merge into', () => {
        let source: ExpressionOptions = {name: 'Source', allowUnknownDataType: false};
        let target: ExpressionOptions = {name: 'Target', allowUnknownDataType: true};
        const merged = _mergeExpressionOptions(target, source, true);
        (merged === target).should.be.true;
        merged.name.should.equal('Source');
        merged.allowUnknownDataType.should.be.false;
      });
      it('should merge new', () => {
        const source: ExpressionOptions = {name: 'Source'};
        const target: ExpressionOptions = {name: 'Target', allowUnknownDataType: true};
        const merged = _mergeExpressionOptions(target, source, false);
        (merged === target).should.be.false;
        merged.name.should.equal('Source');
        merged.allowUnknownDataType.should.be.true;
      })
    })
  })
});
