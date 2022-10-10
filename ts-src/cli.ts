import {ExecutionContextI, LoggerAdapter} from '@franzzemen/app-utility';
import {ExpressionStackParser} from './parser/expression-stack-parser.js';
import {ExpressionScope} from './scope/expression-scope.js';


const ec: ExecutionContextI = {
  config: {
    log: {
    }
  }
}

export function execute() {
  const log = new LoggerAdapter(ec, 're-expression', 'cli', 'execute');
  log.info(process.argv, 'argv');
  if(process.argv.length < 3) {
    log.error(new Error (`Missing command line argument: data`));
    process.exit(1);
  }
  const ruleRegex = /^exp=[\s\t\r\n\v\f\u2028\u2029]*([^]+)$/;
  let result;
  let attempt: string;
  const found = process.argv.find(arg => (result = ruleRegex.exec(arg)) !== null);
  if(found) {
    attempt = result[1];
  } else {
    attempt = process.argv[2];
  }
  if(attempt) {
    try {
      const data = attempt;
      log.info(`found: "${data}"`);
      const scope: ExpressionScope = new ExpressionScope({}, undefined, ec);
      const parser = scope.get(ExpressionScope.ExpressionStackParser) as ExpressionStackParser;
      let [remaining, ref, parserMessages] = parser.parse(data,scope, undefined, ec);
      log.info(ref,`Expression: ${ref.type}`);
      log.info(parserMessages, 'Parser Messages');
      log.info(`Remaining: ${remaining}`);
    } catch (err) {
      log.error(err);
    }
  } else {
    log.error(new Error (`Missing command line argument: data`));
  }
}

execute();
