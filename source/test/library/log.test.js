import { Console } from 'console'
import { CreateLoggedProcess, WorkerClient } from '@virtualpatterns/mablung-worker'
import { FileSystem } from '@virtualpatterns/mablung-file-system'
import { Is } from '@virtualpatterns/mablung-is'
import Path from 'path'
import Test from 'ava'

import { Destination, Log } from '../../index.js'

const FilePath = __filePath
const LogPath = FilePath.replace('/release/', '/data/').replace(/\.test\.c?js$/, '.log')
const LoggedClient = CreateLoggedProcess(WorkerClient, LogPath)
const Require = __require
const WorkerPath = Require.resolve('./worker/log.js')

const JsonPath = FilePath.replace('/release/', '/data/').replace('.test.js', '.json')
const JsonPathAfterSIGHUP = JsonPath.replace('.json', '-after-sighup.json')
const JsonPathBeforeSIGHUP = JsonPath.replace('.json', '-before-sighup.json')

const Process = process

Test.before(async () => {
  await FileSystem.ensureDir(Path.dirname(LogPath))
  await FileSystem.remove(LogPath)
})

Test.beforeEach(() => {
  return Promise.all([
    FileSystem.remove(JsonPath),
    FileSystem.remove(JsonPathAfterSIGHUP),
    FileSystem.remove(JsonPathBeforeSIGHUP)
  ])
})

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
  return test.notThrowsAsync((new Log(JsonPath)).close())
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
  return test.notThrowsAsync((new Log(JsonPath, {})).close())
})

Test('Log(..., { ... })', (test) => {
  test.notThrows(() => { new Log(42, {}) })
})

Test.serial('Log(\'...\', { handleExit })', async (test) => {

  let client = new LoggedClient(WorkerPath)

  await client.whenReady()

  try {
    await client.worker.openLog(JsonPath, { 'level': 'trace', 'handleExit': true })
  } finally {
    await client.exit()
  }

  let content = null
  content = await FileSystem.readFile(JsonPath, { 'encoding': 'utf-8' })
  content = content
    .split('\n')
    .filter((line) => Is.not.equal(line, ''))
    .map((line) => JSON.parse(line))

  // test.log(content)
  test.is(content.length, 1)
  test.is(content[0].message, 'Log#onBeforeExit(0)')

})

Test.serial('Log(\'...\', { handleExit }) when not required', async (test) => {

  let client = new LoggedClient(WorkerPath)

  await client.whenReady()

  try {
    await client.worker.openLog(JsonPath, { 'level': 'trace', 'handleExit': true })
    await client.worker.closeLog()
  } finally {
    await client.exit()
  }

  let content = null
  content = await FileSystem.readFile(JsonPath, { 'encoding': 'utf-8' })
  content = content
    .split('\n')
    .filter((line) => Is.not.equal(line, ''))
    .map((line) => JSON.parse(line))

  // test.log(content)
  test.is(content.length, 0)

})
  
;(Is.windows() ? Test.serial.skip : Test.serial)('Log(\'...\', { handleRotate })', async (test) => {

  let client = new LoggedClient(WorkerPath)

  await client.whenReady()

  try {

    await client.worker.openLog(JsonPath, { 'level': 'trace', 'handleRotate': [ 'SIGHUP' ] })
    
    try {

      await client.worker.trace('before SIGHUP')
      await FileSystem.move(JsonPath, JsonPathBeforeSIGHUP)

      await client.send('SIGHUP')
      await FileSystem.whenExists(5000, 500, JsonPath)

      await client.worker.trace('after SIGHUP')
      await FileSystem.move(JsonPath, JsonPathAfterSIGHUP)

    } finally {
      await client.worker.closeLog()
    }

  } finally {
    await client.exit()
  }

  let content = null
  content = await FileSystem.readFile(JsonPathBeforeSIGHUP, { 'encoding': 'utf-8' })
  content = content
    .split('\n')
    .filter((line) => Is.not.equal(line, ''))
    .map((line) => JSON.parse(line))

  test.is(content.length, 2)
  test.is(content[0].message, 'before SIGHUP')
  test.is(content[1].message, 'Log#onRotate(\'SIGHUP\')')

  content = await FileSystem.readFile(JsonPathAfterSIGHUP, { 'encoding': 'utf-8' })
  content = content
    .split('\n')
    .filter((line) => Is.not.equal(line, ''))
    .map((line) => JSON.parse(line))

  test.is(content.length, 1)
  test.is(content[0].message, 'after SIGHUP')

})

Test.serial('Log(\'...\', { ... }) volume', async (test) => {

  let count = 100000
  let log = new Log(JsonPath, { 'level': 'trace' })

  try {
    for (let index = 0; index < count; index++) { log.trace() }
  } finally {
    await log.close()
  }

  let content = null
  content = await FileSystem.readFile(JsonPath, { 'encoding': 'utf-8' })
  content = content
    .split('\n')
    .filter((line) => Is.not.equal(line, ''))
    .map((line) => JSON.parse(line))

  test.is(content.length, count)

})
