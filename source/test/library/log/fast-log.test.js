import { FileSystem } from '@virtualpatterns/mablung-file-system'
import { Is } from '@virtualpatterns/mablung-is'
import Path from 'path'
import Test from 'ava'

import { FastDestination, FastLog } from '../../../index.js'

const FilePath = __filePath
const LogPath = FilePath.replace('/release/', '/data/').replace('.test.js', '.json')

Test.before(async () => {
  await FileSystem.ensureDir(Path.dirname(LogPath))
})

Test.beforeEach(() => {
  return FileSystem.remove(LogPath)
})

Test.serial('FastLog(\'...\', { ... })', async (test) => {

  let log = new FastLog(LogPath, { 'level': 'trace' }) // Log(LogPath, { 'level': 'trace' }) //

  test.true(log.destination instanceof FastDestination)

  try {
    await log.trace('trace')
  } finally {
    await log.close()
  }

  test.true(await FileSystem.pathExists(LogPath))

  let content = null
  content = await FileSystem.readFile(LogPath, { 'encoding': 'utf-8' })
  content = content
    .split('\n')
    .filter((line) => Is.not.equal(line, ''))
    .map((line) => JSON.parse(line))

  // test.log(content)
  test.assert(content.length >= 1)
  test.is(content[0].message, 'trace')

})

// Test.only('...', async (test) => {

//   let log = new FastLog(LogPath, { 'level': 'trace' })

//   try {

//     for (let index = 0; index < 500; index++) {
//       log.trace()
//     }

//   } finally {
//     log.close()
//   }

//   test.pass()

// })
