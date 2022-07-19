import { CreateRandomId } from '@virtualpatterns/mablung-worker/test'
import { FastDestination, FastLog } from '@virtualpatterns/mablung-log'
import { FileSystem } from '@virtualpatterns/mablung-file-system'
import { Is } from '@virtualpatterns/mablung-is'
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

Test('FastLog(\'...\', { ... })', async (test) => {

  let log = new FastLog(test.context.logPath, { 'level': 'trace' }) // Log(test.context.logPath, { 'level': 'trace' }) //

  test.true(log.destination instanceof FastDestination)

  try {
    await log.trace('trace')
  } finally {
    await log.close()
  }

  test.true(await FileSystem.pathExists(test.context.logPath))

  let content = null
  content = await FileSystem.readFile(test.context.logPath, { 'encoding': 'utf-8' })
  content = content
    .split('\n')
    .filter((line) => Is.not.equal(line, ''))
    .map((line) => JSON.parse(line))

  // test.log(content)
  test.assert(content.length >= 1)
  test.is(content[0].message, 'trace')

})

// Test.only('...', async (test) => {

//   let log = new FastLog(test.context.logPath, { 'level': 'trace' })

//   try {

//     for (let index = 0; index < 500; index++) {
//       log.trace()
//     }

//   } finally {
//     log.close()
//   }

//   test.pass()

// })
