import { FileSystem } from '@virtualpatterns/mablung-file-system'
import { Is } from '@virtualpatterns/mablung-is'
import Path from 'path'
import Test from 'ava'

import { ShortFormattedLog } from '../../../index.js'

const FilePath = __filePath
const LogPath = FilePath.replace('/release/', '/data/').replace('.test.js', '.log')

Test.before(async () => {
  await FileSystem.ensureDir(Path.dirname(LogPath))
})

Test.beforeEach(() => {
  return FileSystem.remove(LogPath)
})

Test.serial('ShortFormattedLog(\'...\', { ... })', async (test) => {

  let log = new ShortFormattedLog(LogPath, { 'level': 'trace' }) // Log(LogPath, { 'level': 'trace' }) //

  try {
    await log.trace({ 'value': { 'value': { 'value': 0 } } }, 'trace')
    await log.trace([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 'trace')
  } finally {
    await log.close()
  }

  test.true(await FileSystem.pathExists(LogPath))

  let content = null
  content = await FileSystem.readFile(LogPath, { 'encoding': 'utf-8' })
  content = content
    .split('\n')
    .filter((line) => Is.not.equal(line, ''))

  // test.log(content)
  test.assert(content.length >= 4)
  test.assert(/^\d{4}\.\d{2}\.\d{2}-\d{2}:\d{2}:\d{2}\.\d{3}-\d{4} .+? \d+ TRACE trace$/.test(content[0]))
  test.is(content[1], '{ value: { value: [Object] } }')
  test.is(content[3], '[ 0, 1, 2, 3, 4, ... 5 more items ]')

})
