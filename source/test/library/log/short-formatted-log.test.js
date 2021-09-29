import { CreateLoggedProcess, WorkerClient } from '@virtualpatterns/mablung-worker'
import { FileSystem } from '@virtualpatterns/mablung-file-system'
import { Is } from '@virtualpatterns/mablung-is'
import Path from 'path'
import Test from 'ava'

const FilePath = __filePath
const LogPath = FilePath.replace(/\/release\//, '/data/').replace(/\.test\.c?js$/, '.log')
const LoggedClient = CreateLoggedProcess(WorkerClient, LogPath)
const Require = __require
const WorkerPath = Require.resolve('./worker/short-formatted-log.js')

const JsonPath = FilePath.replace('/release/', '/data/').replace('.test.js', '.json')

Test.before(async () => {
  await FileSystem.ensureDir(Path.dirname(LogPath))
  await FileSystem.remove(LogPath)
})

Test.beforeEach(() => {
  return FileSystem.remove(JsonPath)
})

Test.serial('ShortFormattedLog(\'...\', { ... })', async (test) => {

  let client = new LoggedClient(WorkerPath)

  await client.whenReady()

  try {

    await test.notThrowsAsync(async () => {

      await client.worker.createShortFormattedLog(JsonPath, { 'level': 'trace', 'handleExit': true })

      await client.worker.trace({ 'value': { 'value': { 'value': 0 } } }, 'trace')
      await client.worker.trace({ 'value': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }, 'trace')

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

  // test.log(content)
  test.assert(content.length >= 4)
  test.assert(/^\d{4}\.\d{2}\.\d{2}-\d{2}:\d{2}:\d{2}\.\d{3}-\d{4} .+? \d+ TRACE trace$/.test(content[0]))
  test.is(content[1], '{ value: { value: [Object] } }')
  test.is(content[3], '{ value: [ 0, 1, 2, 3, 4, ... 5 more items ] }')

})
