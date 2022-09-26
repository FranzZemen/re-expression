import 'mocha';
import {Hints} from '@franzzemen/app-utility';
import {isFragment, isRecursiveGrouping} from '@franzzemen/re-common';
import {DataType, StandardDataType} from '@franzzemen/re-data-type';
import chai from 'chai';
import {
  ExpressionScope, ExpressionType,
  FormulaExpressionParser,
  FormulaOperator, isAttributeExpressionReference,
  isFormulaExpressionReference, isValueExpressionReference
} from '../../publish/index.js';

const should = chai.should();
const expect = chai.expect;

const unreachableCode = false;

describe('re-expression tests', () => {
  describe('formula expression parser tests', () => {
    describe('parser/formula-expression-parser.test', () => {
      it('it should pass the identifying regular expressions', () => {
        let regex = /^#?([a-zA-Z]+[a-zA-Z0-9]*)(\[[^]+]([\s\t\r\n\v\f\u2028\u2029][^]*$|$))/;
        let result = regex.exec('');
        expect(result).to.be.null;

        result = regex.exec('myFunc');
        expect(result).to.be.null;

        result = regex.exec('#[adsfasdfa]');
        expect(result).to.be.null;

        result = regex.exec('#a123 adfjasdf');
        expect(result).to.be.null;

        result = regex.exec('#a123[]');
        expect(result).to.be.null; // No formula

        result = regex.exec('#a123 [dasfd]');
        expect(result).to.be.null; // space

        result = regex.exec('#adfaDFAD[asd asdfa;l asdfaj]asfa');
        expect(result).to.be.null;

        result = regex.exec('#adfaDFAD[asd asdfa;]asdfaj] asfa');
        result.should.exist;
        result[1].should.equal('adfaDFAD');
        result[2].should.equal('[asd asdfa;]asdfaj] asfa');

        result = regex.exec('adfaDFAD[asd asdfa;]asdfaj]')
        result.should.exist;
        result[1].should.equal('adfaDFAD');
        result[2].should.equal('[asd asdfa;]asdfaj]');

        regex = /^#?([a-zA-Z]+[a-zA-Z0-9]*)([\s\t\r\n\v\f\u2028\u2029]+[^]*$|$)/;

        result = regex.exec('');
        expect(result).to.be.null;

        result = regex.exec('myFunc');
        result.should.exist;
        result[1].should.equal('myFunc');
        result[2].should.equal('');

        result = regex.exec('#[adsfasdfa]');
        expect(result).to.be.null;

        result = regex.exec('#a123  adfjasdf');
        result.should.exist;
        result[1].should.equal('a123');
        result[2].should.equal('  adfjasdf')

        result = regex.exec('#a123[]');
        expect(result).to.be.null;

        result = regex.exec('#adfaDFAD    [ad asdfa;l asdfaj] asfa');
        expect(result).to.exist;
        result[1].should.equal('adfaDFAD');
        result[2].should.equal('    [ad asdfa;l asdfaj] asfa')

        regex = /^#?(\[[^]*])(([\s\t\r\n\v\f\u2028\u2029]+[^]*$)|$)/;
        result = regex.exec('');
        expect(result).to.be.null;

        result = regex.exec('sadfas[adsfs]asd');
        expect(result).to.be.null;

        result = regex.exec('[adsfs]asd');
        expect(result).to.be.null;

        result = regex.exec('#[adsdfa adfa fs]');
        expect(result).to.exist;

        result = regex.exec('[adsdfa adfa fs] adsfa');
        expect(result).to.exist;
        result[1].should.equal('[adsdfa adfa fs]');
        result[2].should.equal(' adsfa')

        result = regex.exec('#[ 1 - [1] ] 123');
        expect(result).to.exist;
        result[1].should.equal('[ 1 - [1] ]');
        result[2].should.equal(' 123');
      });
      it('should parse #formula1[1]', () => {
        const scope = new ExpressionScope();
        const parser = new FormulaExpressionParser();
        const hints = new Hints('');
        hints.loadAndResolve() as Hints;

        let [remaining, formulaExpRef] = parser.parse('#formula1[1]', scope, hints, false);
        remaining.should.equal('');
        expect(formulaExpRef).to.exist;
        formulaExpRef.refName.should.equal('formula1');
        formulaExpRef.dataTypeRef.should.equal(StandardDataType.Number);
        formulaExpRef.operator.should.equal(FormulaOperator.Add);
        formulaExpRef.group.length.should.equal(1);
        if (isFragment(formulaExpRef.group[0])) {
          formulaExpRef.group[0].operator.should.equal(FormulaOperator.Add);
          let ref = formulaExpRef.group[0].reference;
          if (isValueExpressionReference(ref)) {
            ref.dataTypeRef.should.equal(StandardDataType.Number);
            ref.type.should.equal(ExpressionType.Value);
            ref.value.should.equal(1);
          } else {
            unreachableCode.should.be.true;
          }
        } else {
          unreachableCode.should.be.true;
        }
      })
      it('should parse #formula1[+1]', () => {
        const scope = new ExpressionScope();
        const parser = new FormulaExpressionParser();
        const hints = new Hints('');
        hints.loadAndResolve() as Hints;

        let [remaining, formulaExpRef] = parser.parse('#formula1[1]', scope, hints, false);
        remaining.should.equal('');
        expect(formulaExpRef).to.exist;
        formulaExpRef.refName.should.equal('formula1');
        formulaExpRef.dataTypeRef.should.equal(StandardDataType.Number);
        formulaExpRef.operator.should.equal(FormulaOperator.Add);
        formulaExpRef.group.length.should.equal(1);
        if (isFragment(formulaExpRef.group[0])) {
          formulaExpRef.group[0].operator.should.equal(FormulaOperator.Add);
          let ref = formulaExpRef.group[0].reference;
          if (isValueExpressionReference(ref)) {
            ref.dataTypeRef.should.equal(StandardDataType.Number);
            ref.type.should.equal(ExpressionType.Value);
            ref.value.should.equal(1);
          } else {
            unreachableCode.should.be.true;
          }
        } else {
          unreachableCode.should.be.true;
        }
      })
      it('should parse #formula1[1] 123', () => {
        const scope = new ExpressionScope();
        const parser = new FormulaExpressionParser();
        const hints = new Hints('');
        hints.loadAndResolve() as Hints;

        let [remaining, formulaExpRef] = parser.parse('#formula1[1] 123', scope, hints, false);
        remaining.should.equal(' 123');
        expect(formulaExpRef).to.exist;
        formulaExpRef.refName.should.equal('formula1');
        formulaExpRef.dataTypeRef.should.equal(StandardDataType.Number);
        formulaExpRef.operator.should.equal(FormulaOperator.Add);
        formulaExpRef.group.length.should.equal(1);
        if (isFragment(formulaExpRef.group[0])) {
          formulaExpRef.group[0].operator.should.equal(FormulaOperator.Add);
          let ref = formulaExpRef.group[0].reference;
          if (isValueExpressionReference(ref)) {
            ref.dataTypeRef.should.equal(StandardDataType.Number);
            ref.type.should.equal(ExpressionType.Value);
            ref.value.should.equal(1);
          } else {
            unreachableCode.should.be.true;
          }
        } else {
          unreachableCode.should.be.true;
        }
      })
      it('should parse #formula1[<<ex data-type=Float>> attribute] 123', () => {
        const scope = new ExpressionScope();
        const parser = new FormulaExpressionParser();
        const hints = new Hints('');
        hints.loadAndResolve() as Hints;

        let [remaining, formulaExpRef] = parser.parse('#formula1[<<ex data-type=Float>> attribute] 123', scope, hints, false);
        remaining.should.equal(' 123');
        expect(formulaExpRef).to.exist;
        formulaExpRef.refName.should.equal('formula1');
        formulaExpRef.dataTypeRef.should.equal(StandardDataType.Float);
        formulaExpRef.operator.should.equal(FormulaOperator.Add);
        formulaExpRef.group.length.should.equal(1);
        if (isFragment(formulaExpRef.group[0])) {
          formulaExpRef.group[0].operator.should.equal(FormulaOperator.Add);
          let ref = formulaExpRef.group[0].reference;
          if (isAttributeExpressionReference(ref)) {
            ref.dataTypeRef.should.equal(StandardDataType.Float);
            ref.type.should.equal(ExpressionType.Attribute);
            ref.path.should.equal('attribute');
          } else {
            unreachableCode.should.be.true;
          }
        } else {
          unreachableCode.should.be.true;
        }
      })
      it('should parse #formula1[1 + <<ex data-type=Float>> attribute] 123', () => {
        const scope = new ExpressionScope();
        const parser = new FormulaExpressionParser();
        const hints = new Hints('');
        hints.loadAndResolve() as Hints;

        let [remaining, formulaExpRef] = parser.parse('#formula1[1 * <<ex data-type=Float>> attribute] 123', scope, hints, false);
        remaining.should.equal(' 123');
        expect(formulaExpRef).to.exist;
        formulaExpRef.refName.should.equal('formula1');
        formulaExpRef.dataTypeRef.should.equal(StandardDataType.Float);
        formulaExpRef.operator.should.equal(FormulaOperator.Add);
        formulaExpRef.group.length.should.equal(2);
        if (isFragment(formulaExpRef.group[0])) {
          formulaExpRef.group[0].operator.should.equal(FormulaOperator.Add);
          let ref = formulaExpRef.group[0].reference;
          if (isValueExpressionReference(ref)) {
            ref.dataTypeRef.should.equal(StandardDataType.Number);
            ref.type.should.equal(ExpressionType.Value);
            ref.value.should.equal(1);
          } else {
            unreachableCode.should.be.true;
          }
        } else {
          unreachableCode.should.be.true;
        }
        if (isFragment(formulaExpRef.group[1])) {
          let ref = formulaExpRef.group[1].reference;
          if (isAttributeExpressionReference(ref)) {
            ref.dataTypeRef.should.equal(StandardDataType.Float);
            ref.type.should.equal(ExpressionType.Attribute);
            ref.path.should.equal('attribute');
          } else {
            unreachableCode.should.be.true;
          }
        } else {
          unreachableCode.should.be.true;
        }
      })
      it('should parse #formula1[ 1 + <<ex data-type=Float>> attribute ] 123', () => {
        const scope = new ExpressionScope();
        const parser = new FormulaExpressionParser();
        const hints = new Hints('');
        hints.loadAndResolve() as Hints;

        let [remaining, formulaExpRef] = parser.parse('#formula1[ 1 - <<ex data-type=Float>> attribute ] 123', scope, hints, false);
        remaining.should.equal(' 123');
        expect(formulaExpRef).to.exist;
        formulaExpRef.refName.should.equal('formula1');
        formulaExpRef.dataTypeRef.should.equal(StandardDataType.Float);
        formulaExpRef.operator.should.equal(FormulaOperator.Add);
        formulaExpRef.group.length.should.equal(2);
        if (isFragment(formulaExpRef.group[0])) {
          formulaExpRef.group[0].operator.should.equal(FormulaOperator.Add);
          let ref = formulaExpRef.group[0].reference;
          if (isValueExpressionReference(ref)) {
            ref.dataTypeRef.should.equal(StandardDataType.Number);
            ref.type.should.equal(ExpressionType.Value);
            ref.value.should.equal(1);
          } else {
            unreachableCode.should.be.true;
          }
        } else {
          unreachableCode.should.be.true;
        }
        if (isFragment(formulaExpRef.group[1])) {
          let ref = formulaExpRef.group[1].reference;
          formulaExpRef.group[1].operator.should.equal(FormulaOperator.Subtract);
          if (isAttributeExpressionReference(ref)) {
            ref.dataTypeRef.should.equal(StandardDataType.Float);
            ref.type.should.equal(ExpressionType.Attribute);
            ref.path.should.equal('attribute');
          } else {
            unreachableCode.should.be.true;
          }
        } else {
          unreachableCode.should.be.true;
        }
      })

      it('should not parse formula1[ 1 - <<ex data-type=Float>> attribute ] 123', () => {
        const scope = new ExpressionScope();
        const parser = new FormulaExpressionParser();
        const hints = new Hints('');
        hints.loadAndResolve() as Hints;

        let [remaining, formulaExpRef] = parser.parse('formula1[ 1 - <<ex data-type=Float>> attribute ] 123', scope, hints, false);
        remaining.should.equal('formula1[ 1 - <<ex data-type=Float>> attribute ] 123');
        expect(formulaExpRef).to.be.undefined;
        /*
        expect(formulaExpRef).to.exist;
        formulaExpRef.refName.should.equal('formula1');
        formulaExpRef.dataTypeRef.should.equal(StandardDataType.Float);
        formulaExpRef.operator.should.equal(FormulaOperator.Add);
        formulaExpRef.group.length.should.equal(2);
        if(isFragment(formulaExpRef.group[0])) {
          formulaExpRef.group[0].operator.should.equal(FormulaOperator.Add);
          let ref = formulaExpRef.group[0].reference;
          if (isValueExpressionReference(ref)) {
            ref.dataTypeRef.should.equal(StandardDataType.Number);
            ref.type.should.equal(ExpressionType.Value);
            ref.value.should.equal(1);
          } else {
            unreachableCode.should.be.true;
          }
        } else {
          unreachableCode.should.be.true;
        }
        if(isFragment(formulaExpRef.group[1])) {
          let ref = formulaExpRef.group[1].reference;
          formulaExpRef.group[1].operator.should.equal(FormulaOperator.Subtract);
          if(isAttributeExpressionReference(ref)) {
            ref.dataTypeRef.should.equal(StandardDataType.Float);
            ref.type.should.equal(ExpressionType.Attribute);
            ref.path.should.equal('attribute');
          } else {
            unreachableCode.should.be.true;
          }
        } else {
          unreachableCode.should.be.true;
        }
      })
      */
      })


      it('should parse with type hint formula1[ 1 - <<ex data-type=Float>> attribute ] 123', () => {
        const scope = new ExpressionScope();
        const parser = new FormulaExpressionParser();
        const hints = new Hints('type=Formula');
        hints.loadAndResolve() as Hints;

        let [remaining, formulaExpRef] = parser.parse('formula1[ 1 - <<ex data-type=Float>> attribute ] 123', scope, hints, false);
        remaining.should.equal(' 123');
        expect(formulaExpRef).to.exist;
        formulaExpRef.refName.should.equal('formula1');
        formulaExpRef.dataTypeRef.should.equal(StandardDataType.Float);
        formulaExpRef.operator.should.equal(FormulaOperator.Add);
        formulaExpRef.group.length.should.equal(2);
        if (isFragment(formulaExpRef.group[0])) {
          formulaExpRef.group[0].operator.should.equal(FormulaOperator.Add);
          let ref = formulaExpRef.group[0].reference;
          if (isValueExpressionReference(ref)) {
            ref.dataTypeRef.should.equal(StandardDataType.Number);
            ref.type.should.equal(ExpressionType.Value);
            ref.value.should.equal(1);
          } else {
            unreachableCode.should.be.true;
          }
        } else {
          unreachableCode.should.be.true;
        }
        if (isFragment(formulaExpRef.group[1])) {
          let ref = formulaExpRef.group[1].reference;
          formulaExpRef.group[1].operator.should.equal(FormulaOperator.Subtract);
          if (isAttributeExpressionReference(ref)) {
            ref.dataTypeRef.should.equal(StandardDataType.Float);
            ref.type.should.equal(ExpressionType.Attribute);
            ref.path.should.equal('attribute');
          } else {
            unreachableCode.should.be.true;
          }
        } else {
          unreachableCode.should.be.true;
        }
      })
      it('should parse  #[ 1 - <<ex data-type=Number>> attribute ] 123', () => {
        const scope = new ExpressionScope();
        const parser = new FormulaExpressionParser();
        const hints = new Hints('type=Formula');
        hints.loadAndResolve() as Hints;

        let [remaining, formulaExpRef] = parser.parse('#[ 1 - <<ex data-type=Number>> attribute ] 123', scope, hints, false);
        remaining.should.equal(' 123');
        expect(formulaExpRef).to.exist;
        expect(formulaExpRef.refName).to.not.exist;
        formulaExpRef.dataTypeRef.should.equal(StandardDataType.Number);
        formulaExpRef.operator.should.equal(FormulaOperator.Add);
        formulaExpRef.group.length.should.equal(2);
        if (isFragment(formulaExpRef.group[0])) {
          formulaExpRef.group[0].operator.should.equal(FormulaOperator.Add);
          let ref = formulaExpRef.group[0].reference;
          if (isValueExpressionReference(ref)) {
            ref.dataTypeRef.should.equal(StandardDataType.Number);
            ref.type.should.equal(ExpressionType.Value);
            ref.value.should.equal(1);
          } else {
            unreachableCode.should.be.true;
          }
        } else {
          unreachableCode.should.be.true;
        }
        if (isFragment(formulaExpRef.group[1])) {
          let ref = formulaExpRef.group[1].reference;
          formulaExpRef.group[1].operator.should.equal(FormulaOperator.Subtract);
          if (isAttributeExpressionReference(ref)) {
            ref.dataTypeRef.should.equal(StandardDataType.Number);
            ref.type.should.equal(ExpressionType.Attribute);
            ref.path.should.equal('attribute');
          } else {
            unreachableCode.should.be.true;
          }
        } else {
          unreachableCode.should.be.true;
        }
      })
    })
  })
})
