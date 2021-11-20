import { FileSystem } from '@virtualpatterns/mablung-file-system'
import { FormattedLog } from '@virtualpatterns/mablung-log'
import OS from 'os'
import Path from 'path'
import Sinon from 'sinon'
import Test from 'ava'

const FilePath = __filePath

const FileMapPath = `${FilePath}.map`
const LogPath = FilePath.replace('/release/', '/data/').replace('.test.js', '.log')

Test.before(async () => {
  await FileSystem.ensureDir(Path.dirname(LogPath))
})

Test.beforeEach(() => {
  return FileSystem.remove(LogPath)
})

Test.serial('FormattedLog(\'...\', { ... })', async (test) => {

  let log = new FormattedLog(LogPath, { 'level': 'trace' })

  try {
    await log.trace({ 'value': { 'value': { 'value': 0 } } })
    await log.trace([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    await log.trace(new Error())
    await log.trace('Hello', 'world!')
  } finally {
    await log.close()
  }

  test.true(await FileSystem.pathExists(LogPath))

  let content = null
  content = await FileSystem.readFile(LogPath, { 'encoding': 'utf-8' })
  content = content
    .split('\n')

  // test.log(content)
  test.assert(/^\d{4}\.\d{2}\.\d{2}-\d{2}:\d{2}:\d{2}\.\d{3}[-+]\d{2}:\d{2} .+? \d+ TRACE$/.test(content[0]))
  test.is(content[2], '{ value: { value: { value: 0 } } }')
  test.is(content[6], '[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, [length]: 10 ]')
  
  ;((await FileSystem.pathExists(FileMapPath)) ? test.is : test.is.skip )(content[11], `    at file://${FilePath.replace('/release/', '/source/')}:28:21`)

  test.assert(/^\d{4}\.\d{2}\.\d{2}-\d{2}:\d{2}:\d{2}\.\d{3}[-+]\d{2}:\d{2} .+? \d+ TRACE Hello, world!$/.test(content[13]))

})

Test.serial('FormattedLog(\'...\', { ... }) using \'hello-world.local\'', async (test) => {

  let hostnameStub = Sinon
    .stub(OS, 'hostname')
    .returns('hello-world.local')
  
  try {

    let log = new FormattedLog(LogPath, { 'level': 'trace' })

    try {
      await log.trace()
    } finally {
      await log.close()
    }

  } finally {
    hostnameStub.restore()
  }

  test.true(await FileSystem.pathExists(LogPath))

  let content = null
  content = await FileSystem.readFile(LogPath, { 'encoding': 'utf-8' })
  content = content
    .split('\n')

  // test.log(content)
  test.assert(/^\d{4}\.\d{2}\.\d{2}-\d{2}:\d{2}:\d{2}\.\d{3}[-+]\d{2}:\d{2} hello-world \d+ TRACE$/.test(content[0]))

})

Test.serial('FormattedLog(\'...\', { ... }) using \'hello-world\'', async (test) => {

  let hostnameStub = Sinon
    .stub(OS, 'hostname')
    .returns('hello-world')
  
  try {

    let log = new FormattedLog(LogPath, { 'level': 'trace' })

    try {
      await log.trace()
    } finally {
      await log.close()
    }

  } finally {
    hostnameStub.restore()
  }

  test.true(await FileSystem.pathExists(LogPath))

  let content = null
  content = await FileSystem.readFile(LogPath, { 'encoding': 'utf-8' })
  content = content
    .split('\n')

  // test.log(content)
  test.assert(/^\d{4}\.\d{2}\.\d{2}-\d{2}:\d{2}:\d{2}\.\d{3}[-+]\d{2}:\d{2} hello-world \d+ TRACE$/.test(content[0]))

})
