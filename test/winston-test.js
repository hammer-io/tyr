import assert from 'assert';
import fs from 'fs-extra';

import { enableLogFile, setActiveLogger, getActiveLogger } from '../dist/utils/winston';
import { beforeEach, afterEach } from 'mocha';

// Test strategy for capturing console output found here:
// https://stackoverflow.com/questions/18543047/mocha-monitor-application-output
function captureStream(stream){
  const oldWrite = stream.write;
  let buf = '';
  stream.write = function(chunk, encoding, callback){
    buf += chunk.toString(); // chunk is a String or Buffer
    oldWrite.apply(stream, arguments);
  };

  return {
    unhook: function unhook(){
      stream.write = oldWrite;
    },
    captured: function(){
      return buf;
    },
    clear: function(){
      buf = '';
    }
  };
}

function logAllLevels(logger) {
  // NOTE: We can't capture stderr during mocha tests (which
  // 'error' and 'debug' are written to) unless they are
  // logged to a file.
  logger.error('error');
  logger.warn('warn');
  logger.info('info');
  logger.verbose('verbose');
  logger.debug('debug');
  logger.silly('silly');
}

describe('Winston:', () => {
  let hook;

  beforeEach(function(){
    // NOTE: We can't capture stderr during mocha tests
    hook = captureStream(process.stdout);
  });

  afterEach(function(){
    hook.unhook();
  });

  it('Info logger should print \'info\' level and below in color', () => {
    setActiveLogger('info');
    logAllLevels(getActiveLogger());
    const expected = '[WARN] \u001b[33mwarn\u001b[39m\n'
      + '\u001b[32minfo\u001b[39m\n';
    assert.equal(hook.captured(), expected);
  });

  it('Verbose logger should print \'verbose\' level and below in color', () => {
    setActiveLogger('verbose');
    logAllLevels(getActiveLogger());
    const expected = '[WARN] \u001b[33mwarn\u001b[39m\n'
      + '\u001b[32minfo\u001b[39m\n'
      + '[VERBOSE] \u001b[36mverbose\u001b[39m\n';
    assert.equal(hook.captured(), expected);
  });

  it('Debug logger should print \'debug\' level and below (minus verbose) in color', () => {
    setActiveLogger('debug');
    logAllLevels(getActiveLogger());
    const expected = '[WARN] \u001b[33mwarn\u001b[39m\n'
      + '\u001b[32minfo\u001b[39m\n';
    // NOTE: 'debug' level is also written to stderr
    // See https://github.com/winstonjs/winston/pull/558
    assert.equal(hook.captured(), expected);
  });

  it('Should log to file if logging to file is enabled', (done) => {
    const logFileName = 'tyr-test.log';
    setActiveLogger('debug');
    enableLogFile(logFileName);

    // This happens in a tricky asynchronous way that can't be waited for,
    // so we'll check the results in a timeout.
    logAllLevels(getActiveLogger());

    setTimeout(() => {
      assert.equal(fs.existsSync(logFileName), true, `The log file '${logFileName}' does not exist!`);

      const actualContents = fs.readFileSync(logFileName);
      const containsLogs = (
        actualContents.includes('[ERROR  ] error\n') &&
        actualContents.includes('[WARN   ] warn\n') &&
        actualContents.includes('[INFO   ] info\n') &&
        actualContents.includes('[DEBUG  ] debug\n')
      );
      assert.ok(containsLogs, 'The contents of the log file don\'t match what\'s expected!');

      fs.removeSync(logFileName);
      done();
    }, 1000);
  });
});
