import { CreateLoggedProcess, WorkerClient } from '@virtualpatterns/mablung-worker'
import { FileSystem } from '@virtualpatterns/mablung-file-system'
import { Is } from '@virtualpatterns/mablung-is'
import Path from 'path'
import Test from 'ava'

// import { FastLog } from '../../../index.js'

const FilePath = __filePath
const LogPath = FilePath.replace(/\/release\//, '/data/').replace(/\.test\.c?js$/, '.log')
const LoggedClient = CreateLoggedProcess(WorkerClient, LogPath)
const Require = __require
const WorkerPath = Require.resolve('./worker/fast-log.js')

const JsonPath = FilePath.replace('/release/', '/data/').replace('.test.js', '.json')

Test.before(async () => {
  await FileSystem.ensureDir(Path.dirname(LogPath))
  await FileSystem.remove(LogPath)
})

Test.beforeEach(() => {
  return FileSystem.remove(JsonPath)
})

Test.serial('FastLog(\'...\', { ... })', async (test) => {

  let client = new LoggedClient(WorkerPath)

  await client.whenReady()

  try {

    await test.notThrowsAsync(async () => {
      await client.worker.createFastLog(JsonPath, { 'level': 'trace', 'handleExit': true })
      await client.worker.trace('trace')
    })

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
  test.assert(content.length >= 1)
  test.is(content[0].msg, 'trace')

})
