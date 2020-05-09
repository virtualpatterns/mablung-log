import { FileSystem } from '@virtualpatterns/mablung-file-system';
import Path from 'path';
import Stream from 'stream';
import Test from 'ava';

import { Log /*, FormattedLog */ } from '../../index.js';
import { LogParameter } from '../../library/log-parameter.js';
import { LogDestination } from '../../library/log-destination.js';

Test.before(async test => {

  test.context.logPath = 'process/log/log-parameter.log';
  await FileSystem.ensureDir(Path.dirname(test.context.logPath));

  test.context.log = new Log(test.context.logPath, { 'level': 'trace' });

});

Test('LogParameter.getConstructorParameter(log)', test => {

  let [destination, option] = LogParameter.getConstructorParameter(test.context.log);

  test.assert(destination instanceof LogDestination);
  test.deepEqual(option, {});

});

Test('LogParameter.getConstructorParameter(log, destination)', test => {

  let [destination, option] = LogParameter.getConstructorParameter(test.context.log, new LogDestination());

  test.assert(destination instanceof LogDestination);
  test.deepEqual(option, {});

});

Test('LogParameter.getConstructorParameter(log, stream)', async test => {

  let path = 'process/log/log-parameter-stream-writable.log';
  let stream = FileSystem.createWriteStream(path, { 'encoding': 'utf8', 'flags': 'a+' });

  try {

    let [destination, option] = LogParameter.getConstructorParameter(test.context.log, stream);

    test.assert(destination instanceof Stream.Writable);
    test.deepEqual(option, {});

  } finally {

    await new Promise((resolve, reject) => {
      stream.end(error => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    await FileSystem.remove(path);

  }

});

Test('LogParameter.getConstructorParameter(log, path)', async test => {

  let path = 'process/log/log-parameter-string.log';
  let [destination, option] = LogParameter.getConstructorParameter(test.context.log, path);

  try {
    test.assert(destination instanceof LogDestination);
    test.deepEqual(option, {});
  } finally {
    await FileSystem.remove(path);
  }

});

Test('LogParameter.getConstructorParameter(log, option)', test => {

  let [destination, option] = LogParameter.getConstructorParameter(test.context.log, { 'abc': 123 });

  test.assert(destination instanceof LogDestination);
  test.deepEqual(option, { 'abc': 123 });

});

Test('LogParameter.getConstructorParameter(log, destination, option)', test => {

  let [destination, option] = LogParameter.getConstructorParameter(test.context.log, new LogDestination(), { 'abc': 123 });

  test.assert(destination instanceof LogDestination);
  test.deepEqual(option, { 'abc': 123 });

});

Test('LogParameter.getConstructorParameter(log, stream, option)', async test => {

  let path = 'process/log/log-parameter-stream-writable.log';
  let stream = FileSystem.createWriteStream(path, { 'encoding': 'utf8', 'flags': 'a+' });

  try {

    let [destination, option] = LogParameter.getConstructorParameter(test.context.log, stream, { 'abc': 123 });

    test.assert(destination instanceof Stream.Writable);
    test.deepEqual(option, { 'abc': 123 });

  } finally {

    await new Promise((resolve, reject) => {
      stream.end(error => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    await FileSystem.remove(path);

  }

});

Test('LogParameter.getConstructorParameter(log, path, option)', test => {

  let [destination, option] = LogParameter.getConstructorParameter(test.context.log, 'process/log/log-parameter-string.log', { 'abc': 123 });

  test.assert(destination instanceof LogDestination);
  test.deepEqual(option, { 'abc': 123 });

});

Test.after.always(async test => {

  delete test.context.log;

  await FileSystem.remove(test.context.logPath);
  delete test.context.logPath;

});
//# sourceMappingURL=log-parameter.test.js.map