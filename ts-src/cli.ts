import {ExecutionContextI, LoggerAdapter} from '@franzzemen/app-utility';
import {CliFunction, defaultCliFactory, execute, logParserMessages} from '@franzzemen/re-common/cli-common.js';
import {ExpressionStackParser} from './parser/expression-stack-parser.js';
import {ExpressionScope} from './scope/expression-scope.js';

export const expressionExecutionKey = 're-expression';

export interface ExpressionCliFormat {
  text: string;
}

export const executeExpressionCLI: CliFunction<ExpressionCliFormat> = (iteration: ExpressionCliFormat, ec?: ExecutionContextI) => {
  const log = new LoggerAdapter(ec, 're-expression', 'cli', 'executeExpressionCLI');
  try {
    if (iteration) {
      log.info(`Text to parse: "${iteration.text}"`);
      const scope: ExpressionScope = new ExpressionScope({}, undefined, ec);
      const parser = scope.get(ExpressionScope.ExpressionStackParser) as ExpressionStackParser;
      let [remaining, ref, parserMessages] = parser.parse(iteration.text, scope, undefined, ec);
      logParserMessages(parserMessages, ec);
      if (ref) {
        log.info(ref, 'Expression Reference');
      }
      if (remaining && remaining.trim().length > 0) {
        log.info(`Remaining: ${remaining}`);
      }
    }
  } catch (err) {
    log.error(err);
  }
}

defaultCliFactory.register({
  instanceRef: {
    refName: expressionExecutionKey,
    instance: {commandLineKey: expressionExecutionKey, cliFunction: executeExpressionCLI}
  }
});


if (process.argv[2] === expressionExecutionKey) {
  execute<ExpressionCliFormat>();
}
