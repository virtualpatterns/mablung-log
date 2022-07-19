import { CreateRandomId } from '@virtualpatterns/mablung-worker/test'
import { FileSystem } from '@virtualpatterns/mablung-file-system'
import { ShortFormattedLog } from '@virtualpatterns/mablung-log'
import { Path } from '@virtualpatterns/mablung-path'
import Test from 'ava'

const FilePath = __filePath

const DataPath = FilePath.replace('/release/', '/data/').replace(/\.test\.c?js/, '')

Test.before(() => {
  return FileSystem.emptyDir(DataPath)
})

Test.beforeEach(async (test) => {

  let id = await CreateRandomId()
  let logPath = Path.resolve(DataPath, `${id}.log`)

  test.context.logPath = logPath

})

Test('ShortFormattedLog(\'...\', { ... })', async (test) => {

  let log = new ShortFormattedLog(test.context.logPath, { 'level': 'trace' }) // Log(test.context.logPath, { 'level': 'trace' }) //

  try {
    await log.trace({ 'value': { 'value': { 'value': 0 } } }, 'trace')
    await log.trace([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 'trace')
  } finally {
    await log.close()
  }

  test.true(await FileSystem.pathExists(test.context.logPath))

  let content = null
  content = await FileSystem.readFile(test.context.logPath, { 'encoding': 'utf-8' })
  content = content
    .split('\n')

  // test.log(content)
  test.assert(/^\d{4}\.\d{2}\.\d{2}-\d{2}:\d{2}:\d{2}\.\d{3}[-+]\d{2}:\d{2} .+? \d+ TRACE trace$/.test(content[0]))
  test.is(content[2], '{ value: { value: [Object] } }')
  test.is(content[6], '[ 0, 1, 2, 3, 4, ... 5 more items ]')

})
