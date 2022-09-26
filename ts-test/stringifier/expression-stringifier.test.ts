import {ExecutionContextI, LoggerAdapter} from '@franzzemen/app-utility';
import {Scope} from '@franzzemen/re-common';
import {StandardDataType} from '@franzzemen/re-data-type';
import chai from 'chai';
import 'mocha';
import {isPromise} from 'util/types';
import {
  AwaitEvaluationFactory,
  ExpressionScope,
  ExpressionStackParser,
  ExpressionStringifier, isAttributeExpressionReference, isFunctionExpressionReference, isValueExpressionReference
} from '../../publish/index.js';

import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);

const json = require('../../package.json');
const version = json.version;
const packageName = json.name;
const repo = `${packageName} v.${version}`;

const filename = import.meta.url;

const expect = chai.expect;
const should = chai.should();

const unreachableCode = false;

describe('Rules Engine Tests - expression-stringifier.test', () => {
  describe('Expression Stringifier Tests', () => {
    it('should stringify a Text Value Expression "Hello"', () => {

      const scope = new ExpressionScope();
      const parser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
      const result = parser.parse('"Hello"', scope);
      const stringifier: ExpressionStringifier = scope.get(ExpressionScope.ExpressionStringifier);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('"Hello"');
    });
    it('should stringify a Text Value with type hint "<<ex type=Value>> Hello"', () => {
      const scope = new ExpressionScope();
      const parser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
      const result = parser.parse('<<ex type=Value>> "Hello"', scope);
      const stringifier: ExpressionStringifier = scope.get(ExpressionScope.ExpressionStringifier);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('"Hello"');
    });
    it('should stringify a Text Value with data type hint "<<ex data-type="Text">> Hello"', () => {
      const scope = new ExpressionScope();
      const parser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
      const result = parser.parse('<<ex data-type="Text">> "Hello"', scope);
      const stringifier: ExpressionStringifier = scope.get(ExpressionScope.ExpressionStringifier);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('"Hello"');
    });
    it('should stringify a Text Value with full hint "<<ex type=Value data-type="Text">> Hello"', () => {
      const scope = new ExpressionScope();
      const parser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
      const result = parser.parse('<<ex type=Value data-type="Text">> "Hello"', scope);
      const stringifier: ExpressionStringifier = scope.get(ExpressionScope.ExpressionStringifier);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('"Hello"');
    });
    it('should stringify a Number Value Expression "1"', () => {
      const scope = new ExpressionScope();
      const parser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
      const result = parser.parse('1', scope);
      const stringifier: ExpressionStringifier = scope.get(ExpressionScope.ExpressionStringifier);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('1');
    });
    it('should stringify a Float Value Expression "1.0"', () => {
      const scope = new ExpressionScope();
      const parser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
      const result = parser.parse('1.0', scope);
      const stringifier: ExpressionStringifier = scope.get(ExpressionScope.ExpressionStringifier);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('1.0');
    });
    it('should stringify a Float Value Expression "1.1"', () => {
      const scope = new ExpressionScope();
      const parser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
      const result = parser.parse('1.1', scope);
      const stringifier: ExpressionStringifier = scope.get(ExpressionScope.ExpressionStringifier);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('1.1');
    });
    it('should stringify a Boolean Value Expression "true"', () => {
      const scope = new ExpressionScope();
      const parser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
      const result = parser.parse('true', scope);
      const stringifier: ExpressionStringifier = scope.get(ExpressionScope.ExpressionStringifier);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('true');
    });
    it('should stringify a Boolean Value Expression "false"', () => {
      const scope = new ExpressionScope();
      const parser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
      const result = parser.parse('false', scope);
      const stringifier: ExpressionStringifier = scope.get(ExpressionScope.ExpressionStringifier);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('false');
    });
    it('should stringify a Time Value Expression "23:00:59"', () => {
      const scope = new ExpressionScope();
      const parser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
      const result = parser.parse('23:00:59', scope);
      const stringifier: ExpressionStringifier = scope.get(ExpressionScope.ExpressionStringifier);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('23:00:59');
    });
    it('should stringify a Date Value Expression "1999-01-01"', () => {
      const scope = new ExpressionScope();
      const parser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
      const result = parser.parse('1999-01-01', scope);
      const stringifier: ExpressionStringifier = scope.get(ExpressionScope.ExpressionStringifier);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('1999-01-01');
    });
    it('should stringify a Timestamp Value Expression "1999-01-01 15:53:01"', () => {
      const scope = new ExpressionScope();
      const parser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
      const result = parser.parse('1999-01-01 15:53:01', scope);
      const stringifier: ExpressionStringifier = scope.get(ExpressionScope.ExpressionStringifier);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('1999-01-01T15:53:01');
    });
    it('should stringify a Timestamp Value Expression leveraging timestamp separator option as space "1999-01-01 15:53:01"', () => {
      const scope = new ExpressionScope();
      const parser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
      const result = parser.parse('1999-01-01 15:53:01', scope);
      const stringifier: ExpressionStringifier = scope.get(ExpressionScope.ExpressionStringifier);
      const stringified = stringifier.stringify(result[1], scope, {literals: {timestampSeparator: ' '}});
      stringified.should.equal('1999-01-01 15:53:01');
    });
    it('should stringify with option on type hint "1999-01-01 15:53:01"', () => {
      const scope = new ExpressionScope();
      const parser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
      const result = parser.parse('1999-01-01 15:53:01', scope);
      const stringifier: ExpressionStringifier = scope.get(ExpressionScope.ExpressionStringifier);
      const stringified = stringifier.stringify(result[1], scope, {
        expressionHints: {value: {forceTypeHint: true}},
        literals: {timestampSeparator: ' '}
      });
      stringified.should.equal('<<ex type=Value>> 1999-01-01 15:53:01');
    });
    it('should stringify with option on data-type hint "1999-01-01 15:53:01"', () => {
      const scope = new ExpressionScope();
      const parser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
      const result = parser.parse('1999-01-01 15:53:01', scope);
      const stringifier: ExpressionStringifier = scope.get(ExpressionScope.ExpressionStringifier);
      const stringified = stringifier.stringify(result[1], scope, {
        expressionHints: {value: {forceDataTypeHint: true}},
        literals: {timestampSeparator: ' '}
      });
      stringified.should.equal('<<ex data-type=Timestamp>> 1999-01-01 15:53:01');
    });
    it('should stringify with option on data-type and type hint "1999-01-01 15:53:01"', () => {
      const scope = new ExpressionScope();
      const parser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
      const result = parser.parse('1999-01-01 15:53:01', scope);
      const stringifier: ExpressionStringifier = scope.get(ExpressionScope.ExpressionStringifier);
      const stringified = stringifier.stringify(result[1], scope, {
        expressionHints: {
          value: {
            forceTypeHint: true,
            forceDataTypeHint: true
          }
        }, literals: {timestampSeparator: ' '}
      });
      stringified.should.equal('<<ex type=Value data-type=Timestamp>> 1999-01-01 15:53:01');
    });
    it('should stringify an attribute expression <<ex data-type=Text>> path.to.text[5]', () => {
      const scope = new ExpressionScope();
      const parser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
      const result = parser.parse('<<ex data-type=Text>> path.to.text[5]', scope);
      const stringifier: ExpressionStringifier = scope.get(ExpressionScope.ExpressionStringifier);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('<<ex data-type=Text>> path.to.text[5]');
    });
    it('should stringify a function expression <<ex data-type=Number module={"moduleName": "../../../testing/parser/await-evaluation-factory-number-5.js" "moduleResolution"="es", "functionName":"../../../testing/parser/awaitEvaluationFactoryNumber5" }>> ReturnsNumber5', () => {
      const scope = new ExpressionScope();
      const parser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
      const result = parser.parse('<<ex data-type=Number module={"moduleName": "../../../testing/parser/await-evaluation-factory-number-5.js", "moduleResolution":"es", "functionName":"awaitEvaluationFactoryNumber5" }>> @ReturnsNumber5', scope);
      const trueValOrPromise = Scope.resolve(scope);
      if(isPromise(trueValOrPromise)) {
        trueValOrPromise
          .then(trueVal => {
            const stringifier: ExpressionStringifier = scope.get(ExpressionScope.ExpressionStringifier);
            const stringified = stringifier.stringify(result[1], scope);
            stringified.should.equal('<<ex data-type=Number module={"moduleName":"../../../testing/parser/await-evaluation-factory-number-5","functionName":"awaitEvaluationFactoryNumber5"}>> @ReturnsNumber5');
          });
      } else {
        unreachableCode.should.be.true;
      }
    });
    it('should stringify a Number Value set expression <<ex data-type=Number>> [1, 2,3 , 4 ]', () => {
      const scope = new ExpressionScope();
      const parser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
      const result = parser.parse('<<ex data-type=Number>> [1, 2 , 3 , 4]', scope);
      const stringifier: ExpressionStringifier = scope.get(ExpressionScope.ExpressionStringifier);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('[1, 2, 3, 4]');
      
    });
    it('should stringify a Number, mixed expression type set expression', () => {
      const scope = new ExpressionScope();
      const parser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
      const result = parser.parse('[1, count , 3 , element[0]]', scope);
      const stringifier: ExpressionStringifier = scope.get(ExpressionScope.ExpressionStringifier);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('[1, count, 3, element[0]]');
      
    });
    it('should stringify a non inferrable data type  set expression', () => {
      const scope = new ExpressionScope();
      const parser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
      const result = parser.parse('<<ex data-type=Number>> [count element[0]]', scope);
      const stringifier: ExpressionStringifier = scope.get(ExpressionScope.ExpressionStringifier);
      const stringified = stringifier.stringify(result[1], scope);
      stringified.should.equal('<<ex data-type=Number>> [count, element[0]]');
      
    });
    it('should stringify Function expression with parameters', () => {
      const scope = new ExpressionScope();
      const parser: ExpressionStackParser = scope.get(ExpressionScope.ExpressionStackParser);
      const result = parser.parse(`<<ex data-type=Number
                  module-name="../../../testing/parser/await-evaluation-factory-params.js" 
                  function-name="awaitEvaluationFactoryParams" module-resolution=es>> 
                  @ParamsFunction[<<ex data-type=Text>> my.name, 5]`, scope);
      const trueValOrPromise = Scope.resolve(scope);
      if(isPromise(trueValOrPromise)) {
        trueValOrPromise
          .then(trueVal => {
            const ref = result[1];
            ref.should.exist;
            if (isFunctionExpressionReference(ref)) {
              ref.refName.should.equal('ParamsFunction');
              ref.dataTypeRef.should.equal(StandardDataType.Number);
              const factory = scope.get(ExpressionScope.AwaitEvaluationFactory) as AwaitEvaluationFactory;
              (typeof factory.getRegistered('ParamsFunction')).should.equal('function');
              ref.params.length.should.equal(2);
              if (isAttributeExpressionReference(ref.params[0])) {
                ref.params[0].path.should.equal('my.name');
              } else {
                unreachableCode.should.be.true;
              }
              if (isValueExpressionReference(ref.params[1])) {
                ref.params[1].value.should.equal(5);
              } else {
                unreachableCode.should.be.true;
              }
              const stringifier: ExpressionStringifier = scope.get(ExpressionScope.ExpressionStringifier);
              const stringified = stringifier.stringify(ref, scope);
              stringified.should.equal('<<ex data-type=Number module={"moduleName":"../../../testing/parser/await-evaluation-factory-params","functionName":"awaitEvaluationFactoryParams"}>> @ParamsFunction[<<ex data-type=Text>> my.name, 5]');
            } else {
              unreachableCode.should.be.true;
            }
          }, err=> {
            unreachableCode.should.be.true;
          });

      } else {
        unreachableCode.should.be.true;
      }
    });
    it('is an annotation test', () => {

      // Function factory version
      const loggerAdapter = () => {
        function logimpl(target: any, propertyKey: any, descriptor: PropertyDescriptor): PropertyDescriptor {
          const original = descriptor.value;
          let replace = false;
          descriptor.value = function (...args) {
            this.logger = new LoggerAdapter(args[args.length-1], repo, filename, propertyKey);
            //this.logger = new LoggerAdapter(args[args.length-1], repo, filename, propertyKey);
            original.call(this, ...args);
          }
            return descriptor;
        }
        return logimpl;
      }


      const ec: ExecutionContextI = {config:{log:{logAttributes: {hideMethod: false}}}};
      class LogMethodAnnotation {
        constructor() {
        }

        @loggerAdapter()
        logSomething(ec?: ExecutionContextI) {
          let b = 5+4;
          const a = 5;
          this['logger'].trace('Hello World');  // Works but contrived
        }
      }
      const a = new LogMethodAnnotation();
      a.logSomething(ec);
    })
  });
});
