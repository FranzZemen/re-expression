import {ExecutionContextI, LoggerAdapter} from '@franzzemen/app-utility';
import {defaultCliFactory, execute, logParserMessages} from '@franzzemen/re-common/cli-common.js';
import {ExpressionStackParser} from './parser/expression-stack-parser.js';
import {ExpressionScope} from './scope/expression-scope.js';

export const expressionExecutionKey = 're-expression';

function executeExpressionCLI(args: string[], ec?: ExecutionContextI) {
  const log = new LoggerAdapter(ec, 're-expression', 'cli', 'executeExpressionCLI');
  try {
    log.debug(args, 'arguments');
    if (args.length !== 1) {
      log.error(new Error(`Missing command line arguments: ${expressionExecutionKey} ["|']expression["|']`));
      process.exit(1);
    }
    let expressionStr: string = args[0];
    if (expressionStr) {
      log.debug(`Expression text: \"${expressionStr}\"`);
      const scope: ExpressionScope = new ExpressionScope({}, undefined, ec);
      const parser = scope.get(ExpressionScope.ExpressionStackParser) as ExpressionStackParser;
      let [remaining, ref, parserMessages] = parser.parse(expressionStr, scope, undefined, ec);
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
