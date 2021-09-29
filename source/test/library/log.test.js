import { CreateLoggedProcess, WorkerClient } from '@virtualpatterns/mablung-worker'
import { FileSystem } from '@virtualpatterns/mablung-file-system'
import { Is } from '@virtualpatterns/mablung-is'
import Path from 'path'
import Test from 'ava'

import { Log } from '../../index.js'

import { LogOptionNotSupportedError } from '../../index.js'

const FilePath = __filePath
const LogPath = FilePath.replace(/\/release\//, '/data/').replace(/\.test\.c?js$/, '.log')
const LoggedClient = CreateLoggedProcess(WorkerClient, LogPath)
const Require = __require
const WorkerPath = Require.resolve('./worker/log.js')

const JsonPath = FilePath.replace('/release/', '/data/').replace('.test.js', '.json')
const JsonPathBeforeSIGHUP = JsonPath.replace('.json', '-before-sighup.json')

Test.before(async () => {
  await FileSystem.ensureDir(Path.dirname(LogPath))
  await FileSystem.remove(LogPath)
})

Test.beforeEach(() => {
  return Promise.all([
    FileSystem.remove(JsonPath),
    FileSystem.remove(JsonPathBeforeSIGHUP)
  ])
})

Test.serial('Log()', (test) => {
  test.notThrows(() => { new Log() })
})

Test.serial('Log(\'...\')', async (test) => {
  test.notThrows(() => { new Log(JsonPath) })
  test.true(await FileSystem.pathExists(JsonPath))
})

Test.serial('Log(\'...\', { ... })', async (test) => {
  test.notThrows(() => { new Log(JsonPath, {}) })
  test.true(await FileSystem.pathExists(JsonPath))
})

Test.serial('Log(\'...\', { handleExit })', async (test) => {

  let client = new LoggedClient(WorkerPath)

  await client.whenReady()

  try {
    await test.notThrowsAsync(client.worker.createLog(JsonPath, { 'level': 'trace', 'handleExit': true }))
  } finally {
    await client.exit()
  }

  test.true(await FileSystem.pathExists(JsonPath))

  let content = null
  content = await FileSystem.readFile(JsonPath, { 'encoding': 'utf-8' })
  content = content
    .split('\n')
    .filter((line) => Is.not.equal(line, ''))
    .map((line) => JSON.parse(line))

  // test.log(content)
  test.is(content.length, 1)
  test.is(content[0].msg, 'Process.on(\'exit\', (0) => { ... })')

})

;(Is.windows() ? Test.serial.skip : Test.serial)('Log(\'...\', { handleExit, handleRotate })', async (test) => {

  let client = new LoggedClient(WorkerPath)

  await client.whenReady()

  try {

    await test.notThrowsAsync(async () => {

      await client.worker.createLog(JsonPath, { 'level': 'trace', 'handleExit': true, 'handleRotate': [ 'SIGHUP'] })
      await client.worker.trace('before SIGHUP')

      await FileSystem.move(JsonPath, JsonPathBeforeSIGHUP)

      await client.send('SIGHUP')
      await FileSystem.whenExists(5000, 250, JsonPath)

      await client.worker.trace('after SIGHUP')

    })

  } finally {
    await client.exit()
  }

  test.true(await FileSystem.pathExists(JsonPathBeforeSIGHUP))

  let content = null
  content = await FileSystem.readFile(JsonPathBeforeSIGHUP, { 'encoding': 'utf-8' })
  content = content
    .split('\n')
    .filter((line) => Is.not.equal(line, ''))
    .map((line) => JSON.parse(line))

  test.is(content.length, 2)
  test.is(content[0].msg, 'before SIGHUP')
  test.is(content[1].msg, 'Process.on(\'SIGHUP\', () => { ... })')

  test.true(await FileSystem.pathExists(JsonPath))

  content = await FileSystem.readFile(JsonPath, { 'encoding': 'utf-8' })
  content = content
    .split('\n')
    .filter((line) => Is.not.equal(line, ''))
    .map((line) => JSON.parse(line))

  test.is(content.length, 2)
  test.is(content[0].msg, 'after SIGHUP')
  test.is(content[1].msg, 'Process.on(\'exit\', (0) => { ... })')

})

;(Is.windows() ? Test.serial : Test.serial.skip)('Log(\'...\', { handleRotate }) throws LogOptionNotSupportedError', async (test) => {
  test.throws(() => { new Log(JsonPath, { 'handleRotate': [ 'SIGHUP' ] }) }, { 'instanceOf': LogOptionNotSupportedError })
  test.true(await FileSystem.pathExists(JsonPath))
})
