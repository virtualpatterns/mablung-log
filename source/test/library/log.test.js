import { Console } from 'console'
import { CreateRandomId, LoggedWorkerClient } from '@virtualpatterns/mablung-worker/test'
import { Destination, Log } from '@virtualpatterns/mablung-log'
import { FileSystem } from '@virtualpatterns/mablung-file-system'
import { Is } from '@virtualpatterns/mablung-is'
import { Path } from '@virtualpatterns/mablung-path'
import { Process } from '@virtualpatterns/mablung-process'
import Test from 'ava'

const FilePath = __filePath
const FolderPath = Path.dirname(FilePath)

const DataPath = FilePath.replace('/release/', '/data/').replace(/\.test\.c?js/, '')
const WorkerPath = Path.resolve(FolderPath, 'worker/log.js')

Test.before(() => {
  return FileSystem.emptyDir(DataPath)
})

Test.beforeEach(async (test) => {

  let id = await CreateRandomId()

  let jsonPath = Path.resolve(DataPath, `${id}.json`)
  let jsonPathAfterSIGHUP = Path.resolve(DataPath, `${id}-after-sighup.json`)
  let jsonPathBeforeSIGHUP = Path.resolve(DataPath, `${id}-before-sighup.json`)

  let logPath = Path.resolve(DataPath, `${id}.log`)

  test.context.jsonPath = jsonPath
  test.context.jsonPathAfterSIGHUP = jsonPathAfterSIGHUP
  test.context.jsonPathBeforeSIGHUP = jsonPathBeforeSIGHUP

  test.context.logPath = logPath

  // test.log(`test.context.logPath = '${Path.relative('', test.context.logPath)}'`)

})

// Test.beforeEach(() => {
//   return Promise.all([
//     FileSystem.remove(test.context.jsonPath),
//     FileSystem.remove(test.context.jsonPathAfterSIGHUP),
//     FileSystem.remove(test.context.jsonPathBeforeSIGHUP)
//   ])
// })

Test('Log()', (test) => {
  test.notThrows(() => { new Log() })
})

Test('Log(Destination)', (test) => {
  test.notThrows(() => { new Log(new Destination()) })
})

Test('Log(Console)', (test) => {
  test.notThrows(() => {
    new Log(new Console({
      'colorMode': false,
      'ignoreErrors': false,
      'stderr': Process.stdout,
      'stdout': Process.stdout
    }))
  })
})

Test('Log(Stream.Writable)', (test) => {
  test.notThrows(() => { new Log(Process.stdout) })
})

Test('Log(\'...\')', (test) => {
  return test.notThrowsAsync((new Log(test.context.jsonPath)).close())
})

Test('Log({ ... })', (test) => {
  test.notThrows(() => { new Log({}) })
})

Test('Log(...)', (test) => {
  test.notThrows(() => { new Log(42) })
})

Test('Log(Destination, { ... })', (test) => {
  test.notThrows(() => { new Log(new Destination(), {}) })
})

Test('Log(Console, { ... })', (test) => {
  test.notThrows(() => {
    new Log(new Console({
      'colorMode': false,
      'ignoreErrors': false,
      'stderr': Process.stdout,
      'stdout': Process.stdout
    }), {})
  })
})

Test('Log(Stream.Writable, { ... })', (test) => {
  test.notThrows(() => { new Log(Process.stdout, {}) })
})

Test('Log(\'...\', { ... })', (test) => {
  return test.notThrowsAsync((new Log(test.context.jsonPath, {})).close())
})

Test('Log(..., { ... })', (test) => {
  test.notThrows(() => { new Log(42, {}) })
})

Test.serial('Log(\'...\', { handleExit })', async (test) => {

  let client = new LoggedWorkerClient(test.context.logPath, WorkerPath)

  await client.whenReady()

  try {
    await client.worker.openLog(test.context.jsonPath, { 'level': 'trace', 'handleExit': true })
  } finally {
    await client.exit()
  }

  let content = null
  content = await FileSystem.readFile(test.context.jsonPath, { 'encoding': 'utf-8' })
  content = content
    .split('\n')
    .filter((line) => Is.not.equal(line, ''))
    .map((line) => JSON.parse(line))

  // test.log(content)
  test.is(content.length, 1)
  test.is(content[0].message, 'Log#onBeforeExit(0)')

})

Test.serial('Log(\'...\', { handleExit }) when not required', async (test) => {

  let client = new LoggedWorkerClient(test.context.logPath, WorkerPath)

  await client.whenReady()

  try {
    await client.worker.openLog(test.context.jsonPath, { 'level': 'trace', 'handleExit': true })
    await client.worker.closeLog()
  } finally {
    await client.exit()
  }

  let content = null
  content = await FileSystem.readFile(test.context.jsonPath, { 'encoding': 'utf-8' })
  content = content
    .split('\n')
    .filter((line) => Is.not.equal(line, ''))
    .map((line) => JSON.parse(line))

  // test.log(content)
  test.is(content.length, 0)

})
  
;(Is.windows() ? Test.skip : Test.serial)('Log(\'...\', { handleRotate })', async (test) => {

  // Error {
  //   code: 'ENOENT',
  //   errno: -2,
  //   path: '/Volumes/Data/Users/fficnar/Projects/mablung-log/data/test/library/log.json',
  //   syscall: 'lstat',
  //   message: 'ENOENT: no such file or directory, lstat \'/Volumes/Data/Users/fficnar/Projects/mablung-log/data/test/library/log.json\'',
  // }

  let client = new LoggedWorkerClient(test.context.logPath, WorkerPath)

  await client.whenReady()

  try {

    await client.worker.openLog(test.context.jsonPath, { 'level': 'trace', 'handleRotate': [ 'SIGHUP' ] })
    
    try {

      await client.worker.trace('before SIGHUP')
      await FileSystem.move(test.context.jsonPath, test.context.jsonPathBeforeSIGHUP)

      await client.send('SIGHUP')
      await FileSystem.whenExists(3000, 500, test.context.jsonPath)

      await client.worker.trace('after SIGHUP')
      await FileSystem.move(test.context.jsonPath, test.context.jsonPathAfterSIGHUP)

    } finally {
      await client.worker.closeLog()
    }

  } finally {
    await client.exit()
  }

  let content = null
  content = await FileSystem.readFile(test.context.jsonPathBeforeSIGHUP, { 'encoding': 'utf-8' })
  content = content
    .split('\n')
    .filter((line) => Is.not.equal(line, ''))
    .map((line) => JSON.parse(line))

  test.is(content.length, 2)
  test.is(content[0].message, 'before SIGHUP')
  test.is(content[1].message, 'Log#onRotate(\'SIGHUP\')')

  content = await FileSystem.readFile(test.context.jsonPathAfterSIGHUP, { 'encoding': 'utf-8' })
  content = content
    .split('\n')
    .filter((line) => Is.not.equal(line, ''))
    .map((line) => JSON.parse(line))

  test.is(content.length, 1)
  test.is(content[0].message, 'after SIGHUP')

})

Test('Log(\'...\', { ... }) volume', async (test) => {

  let count = 1000
  let log = new Log(test.context.jsonPath, { 'level': 'trace' })

  try {
    for (let index = 0; index < count; index++) { log.trace() }
  } finally {
    await log.close()
  }

  let content = null
  content = await FileSystem.readFile(test.context.jsonPath, { 'encoding': 'utf-8' })
  content = content
    .split('\n')
    .filter((line) => Is.not.equal(line, ''))
    .map((line) => JSON.parse(line))

  test.is(content.length, count)

})
