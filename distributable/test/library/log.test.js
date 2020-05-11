import { createRequire as _createRequire } from "module";import { FileSystem } from '@virtualpatterns/mablung-file-system';
import Path from 'path';
import { Process } from '@virtualpatterns/mablung-process';
import { WorkerClient } from '@virtualpatterns/mablung-worker';
import Test from 'ava';

import { Log, LogAttachedError, LogDetachedError } from '../../index.js';

const Require = _createRequire(import.meta.url);

Test('new Log(path, option)', async test => {

  let logPath = 'process/log/log-constructor.log';
  await FileSystem.ensureDir(Path.dirname(logPath));

  let log = new Log(logPath, { 'level': 'trace' });

  try {

    log.trace('trace');

    let logContent = await FileSystem.readAllJson(logPath, { 'encoding': 'utf-8' });

    test.is(logContent.length, 1);
    test.is(logContent[0].msg, 'trace');

  } finally {
    await FileSystem.remove(logPath);
  }

});

Test('Log.getLevelName(levelNumber)', async test => {

  let logPath = 'process/log/log-get-level-name.log';
  await FileSystem.ensureDir(Path.dirname(logPath));

  let log = new Log(logPath, { 'level': 'trace' });

  try {

    [
    [10, 'trace'],
    [20, 'debug'],
    [30, 'info'],
    [40, 'warn'],
    [50, 'error'],
    [60, 'fatal']].
    forEach(([levelNumber, levelName]) => {
      test.is(log.getLevelName(levelNumber), levelName);
    });

  } finally {
    await FileSystem.remove(logPath);
  }

});

Test('Log.attach() on exit', async test => {

  let rootPath = 'process/log';
  await FileSystem.ensureDir(rootPath);

  let workerLogPath = `${rootPath}/log-attach-on-exit-worker.log`;
  let logPath = `${rootPath}/log-attach-on-exit.log`;

  let worker = new WorkerClient();

  try {

    worker.writeTo(workerLogPath);

    await worker.import(Require.resolve('./worker.js'));

    await worker.module.createLog(logPath, { 'level': 'trace' });
    await worker.module.attach();

    await worker.end();

    let logContent = await FileSystem.readAllJson(logPath, { 'encoding': 'utf-8' });

    test.is(logContent.length, 3);

    test.is(logContent[1].msg, 'Process.on(\'exit\', this._onExit = this.onImmediate((immediateLog) => { ... }))');
    test.is(logContent[2].msg, 'Log.detach()');

  } finally {

    await Promise.all([
    FileSystem.remove(workerLogPath),
    FileSystem.remove(logPath)]);


  }

});

Test('Log.attach() on SIGHUP', async test => {

  let rootPath = 'process/log';
  await FileSystem.ensureDir(rootPath);

  let pidPath = 'process/pid/log-attach-on-sighup.pid';
  await FileSystem.ensureDir(Path.dirname(pidPath));

  let workerLogPath = `${rootPath}/log-attach-on-sighup-worker.log`;
  let originalLogPath = `${rootPath}/log-attach-on-sighup-original.log`;
  let renamedLogPath = `${rootPath}/log-attach-on-sighup-renamed.log`;

  let worker = new WorkerClient();

  try {

    worker.writeTo(workerLogPath);

    await worker.import(Require.resolve('./worker.js'));
    await worker.module.createPidFile(pidPath);

    try {

      await worker.module.createLog(originalLogPath, { 'level': 'trace' });

      try {

        await worker.module.attach();

        try {

          await worker.module.trace('before SIGHUP');

          await FileSystem.move(originalLogPath, renamedLogPath, { 'overwrite': true });

          Process.signalPidFile(pidPath, 'SIGHUP');

          let maximumDuration = 1000;
          let pollInterval = maximumDuration / 4;

          await FileSystem.whenExists(maximumDuration, pollInterval, originalLogPath);

          await worker.module.trace('after SIGHUP');

          let logContent = null;
          logContent = await FileSystem.readAllJson(renamedLogPath, { 'encoding': 'utf-8' });

          test.is(logContent.length, 3);
          test.is(logContent[1].msg, 'before SIGHUP');
          test.is(logContent[2].msg, 'Process.on(\'SIGHUP\', this._onSIGHUP = () => { ... })');

          logContent = await FileSystem.readAllJson(originalLogPath, { 'encoding': 'utf-8' });

          test.is(logContent.length, 1);
          test.is(logContent[0].msg, 'after SIGHUP');

        } finally {
          await worker.module.detach();
        }

      } finally {
        await worker.module.destroyLog();
      }

    } finally {
      await worker.module.deletePidFile();
    }

  } finally {

    await worker.end();

    await Promise.all([
    FileSystem.remove(workerLogPath),
    FileSystem.remove(originalLogPath),
    FileSystem.remove(renamedLogPath)]);


  }

});

Test('Log.attach() on SIGINT', async test => {

  let rootPath = 'process/log';
  await FileSystem.ensureDir(rootPath);

  let pidPath = 'process/pid/log-attach-on-sigint.pid';
  await FileSystem.ensureDir(Path.dirname(pidPath));

  let workerLogPath = `${rootPath}/log-attach-on-sigint-worker.log`;
  let logPath = `${rootPath}/log-attach-on-sigint.log`;

  let worker = new WorkerClient();

  try {

    worker.writeTo(workerLogPath);

    await worker.import(Require.resolve('./worker.js'));

    await worker.module.createPidFile(pidPath);
    await worker.module.createLog(logPath, { 'level': 'trace' });
    await worker.module.attach();

    Process.signalPidFile(pidPath, 'SIGINT');

    let maximumDuration = 4000;
    let pollInterval = maximumDuration / 8;

    await FileSystem.whenNotExists(maximumDuration, pollInterval, pidPath);

    let logContent = await FileSystem.readAllJson(logPath, { 'encoding': 'utf-8' });

    test.is(logContent.length, 3);

    test.is(logContent[1].msg, 'Process.on(\'SIGINT\', this._onSIGINT = this.onImmediate((immediateLog) => { ... }))');
    test.is(logContent[2].msg, 'Log.detach()');

  } finally {

    await Promise.all([
    FileSystem.remove(workerLogPath),
    FileSystem.remove(logPath)]);


  }

});

Test('Log.attach() when called twice', async test => {

  let logPath = 'process/log/log-attach-twice.log';
  await FileSystem.ensureDir(Path.dirname(logPath));

  let log = new Log(logPath, { 'level': 'trace' });

  try {

    log.attach();

    test.throws(() => {log.attach();}, { 'instanceOf': LogAttachedError });

  } finally {
    await FileSystem.remove(logPath);
  }

});

Test('Log.detach()', async test => {

  let rootPath = 'process/log';
  await FileSystem.ensureDir(rootPath);

  let pidPath = 'process/pid/log-detach.pid';
  await FileSystem.ensureDir(Path.dirname(pidPath));

  let workerLogPath = `${rootPath}/log-detach-worker.log`;
  let logPath = `${rootPath}/log-detach.log`;

  let worker = new WorkerClient();

  try {

    worker.writeTo(workerLogPath);

    await worker.import(Require.resolve('./worker.js'));

    await worker.module.createPidFile(pidPath);
    await worker.module.createLog(logPath, { 'level': 'trace' });

    await worker.module.attach();
    await worker.module.detach();

    Process.signalPidFile(pidPath, 'SIGINT');

    let maximumDuration = 4000;
    let pollInterval = maximumDuration / 8;

    await FileSystem.whenNotExists(maximumDuration, pollInterval, pidPath);

    let logContent = await FileSystem.readAllJson(logPath, { 'encoding': 'utf-8' });

    test.is(logContent.length, 2);
    test.is(logContent[1].msg, 'Log.detach()');

  } finally {

    await Promise.all([
    FileSystem.remove(workerLogPath),
    FileSystem.remove(logPath)]);


  }

});

Test('Log.detach() when called twice', async test => {

  let logPath = 'process/log/log-detach-twice.log';
  await FileSystem.ensureDir(Path.dirname(logPath));

  let log = new Log(logPath, { 'level': 'trace' });

  try {

    log.attach();
    log.detach();

    test.throws(() => {log.detach();}, { 'instanceOf': LogDetachedError });

  } finally {
    await FileSystem.remove(logPath);
  }

});

[
// 'trace',
// 'debug',
// 'info',
'error'
// ,
// 'warn',
// 'fatal'
].forEach(methodName => {

  Test.only(`Log.${methodName}('${methodName}')`, async test => {

    let logPath = `process/log/log-${methodName}.log`;
    await FileSystem.ensureDir(Path.dirname(logPath));

    let log = new Log(logPath, { 'level': methodName });

    try {

      log[methodName](methodName);

      await Process.wait(1000);

      let logContent = await FileSystem.readAllJson(logPath, { 'encoding': 'utf-8' });

      test.is(logContent.length, 1);
      test.is(logContent[0].msg, methodName);

    } finally {
      // await FileSystem.remove(logPath)
    }

  });

});
//# sourceMappingURL=log.test.js.map