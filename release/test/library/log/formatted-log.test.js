// import { FileSystem } from '@virtualpatterns/mablung-file-system'
// import Path from 'path'
import Test from 'ava';

import { FormattedLog } from '../../../index.js';

Test('new FormattedLog(path, option)', async test => {

  let logPath = 'process/log/formatted-log-constructor.log';
  // await FileSystem.ensureDir(Path.dirname(logPath))

  let log = new FormattedLog(logPath, { 'level': 'trace' });

  try {

    log.trace({ 'value': { 'value': { 'value': { 'value': {} } } } }, 'trace');
    log.error(new Error('error'));

  } finally {
    // await FileSystem.remove(logPath)
  }

  test.log(`Manually validate '${logPath}'`);
  test.pass();

});
//# sourceMappingURL=formatted-log.test.js.map