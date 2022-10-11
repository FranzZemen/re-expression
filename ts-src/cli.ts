import {ExecutionContextI, LoggerAdapter} from '@franzzemen/app-utility';
import {defaultCliFactory, execute, logParserMessages} from '@franzzemen/re-common/cli-common.js';
import {ExpressionStackParser} from './parser/expression-stack-parser.js';
import {ExpressionScope} from './scope/expression-scope.js';

export const expressionExecutionKey = 're-expression';

function executeExpressionCLI(iteration: string, ec?: ExecutionContextI) {
  const log = new LoggerAdapter(ec, 're-expression', 'cli', 'executeExpressionCLI');
  try {
    if (iteration) {
      const scope: ExpressionScope = new ExpressionScope({}, undefined, ec);
      const parser = scope.get(ExpressionScope.ExpressionStackParser) as ExpressionStackParser;
      let [remaining, ref, parserMessages] = parser.parse(iteration, scope, undefined, ec);
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
  execute();
}
