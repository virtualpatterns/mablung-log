import { FileSystem } from '@virtualpatterns/mablung-file-system'
import { Is } from '@virtualpatterns/mablung-is'
import { Log } from '@virtualpatterns/mablung-log'
import { Path } from '@virtualpatterns/mablung-path'
import Test from 'ava'

const FilePath = __filePath

const JsonPath = FilePath.replace('/release/', '/data/').replace('.test.js', '.json')

Test.before(async () => {
  await FileSystem.ensureDir(Path.dirname(JsonPath))
  await FileSystem.remove(JsonPath)
})

Test.beforeEach(() => {
  return FileSystem.remove(JsonPath)
})

Log.level.forEach((level) => {

  Test(`isLevelEnabled(...) when level = '${level}'`, (test) => {

    const logLevel = level

    let log = new Log({ 'level': logLevel })
    let isLevelEnabled = [ ...Log.level, 'log' ].map((itemLevel) => log.isLevelEnabled(itemLevel))

    switch (logLevel) {
      case 'trace':
        test.deepEqual(isLevelEnabled, [ true, true, true, true, true, true, true ])
        break
      case 'debug':
        test.deepEqual(isLevelEnabled, [ false, true, true, true, true, true, true ])
        break
      case 'info':
        test.deepEqual(isLevelEnabled, [ false, false, true, true, true, true, true ])
        break
      case 'warn':
        test.deepEqual(isLevelEnabled, [ false, false, false, true, true, true, true ])
        break
      case 'error':
        test.deepEqual(isLevelEnabled, [ false, false, false, false, true, true, true ])
        break
      case 'fatal':
        test.deepEqual(isLevelEnabled, [ false, false, false, false, false, true, true ])
        break
    }
    
  })

})

;[ ...Log.level, 'log' ].forEach((level) => {

  Test.serial(`${level}()`, async (test) => {

    let log = new Log(JsonPath, { 'level': level })

    try {
      await log[level]()
    } finally {
      await log.close()
    }

    let content = null
    content = await FileSystem.readFile(JsonPath, { 'encoding': 'utf-8' })
    content = content
      .split('\n')
      .filter((line) => Is.not.equal(line, ''))
      .map((line) => JSON.parse(line))

    // test.log(content)
    test.is(content.length, 1)
    test.is(content[0].level, level)
    test.false(Is.propertyDefined(content[0], 'message'))

  })

  Test.serial(`${level}('...')`, async (test) => {

    let log = new Log(JsonPath, { 'level': level })

    try {
      await log[level]('Hello, world!')
    } finally {
      await log.close()
    }

    let content = null
    content = await FileSystem.readFile(JsonPath, { 'encoding': 'utf-8' })
    content = content
      .split('\n')
      .filter((line) => Is.not.equal(line, ''))
      .map((line) => JSON.parse(line))

    // test.log(content)
    test.is(content.length, 1)
    test.is(content[0].level, level)
    test.is(content[0].message, 'Hello, world!')

  })

})

Test.serial('log(\'...\', \'...\')', async (test) => {

  let log = new Log(JsonPath, { 'level': 'fatal' })

  try {
    await log.log('Hello', ', world!')
  } finally {
    await log.close()
  }

  let content = null
  content = await FileSystem.readFile(JsonPath, { 'encoding': 'utf-8' })
  content = content
    .split('\n')
    .filter((line) => Is.not.equal(line, ''))
    .map((line) => JSON.parse(line))

  // test.log(content)
  test.is(content.length, 1)
  test.is(content[0].message.length, 2) // , 'Hello, world!')
  test.is(content[0].message[0], 'Hello')
  test.is(content[0].message[1], ', world!')

})

Test.serial('log(Error)', async (test) => {

  let log = new Log(JsonPath, { 'level': 'fatal' })

  try {
    await log.log(new Error('Hello, world!'))
  } finally {
    await log.close()
  }

  let content = null
  content = await FileSystem.readFile(JsonPath, { 'encoding': 'utf-8' })
  content = content
    .split('\n')
    .filter((line) => Is.not.equal(line, ''))
    .map((line) => JSON.parse(line))

  // test.log(content)
  test.is(content.length, 1)
  test.is(content[0].data.message, 'Hello, world!')

})

Test.serial('log(Error, Error)', async (test) => {

  let log = new Log(JsonPath, { 'level': 'fatal' })

  try {
    await log.log(new Error('Hello'), new Error(', world!'))
  } finally {
    await log.close()
  }

  let content = null
  content = await FileSystem.readFile(JsonPath, { 'encoding': 'utf-8' })
  content = content
    .split('\n')
    .filter((line) => Is.not.equal(line, ''))
    .map((line) => JSON.parse(line))

  // test.log(content)
  test.is(content.length, 1)
  test.is(content[0].data.length, 2)
  test.is(content[0].data[0].message, 'Hello')
  test.is(content[0].data[1].message, ', world!')

})

Test.serial('log(...)', async (test) => {

  let log = new Log(JsonPath, { 'level': 'fatal' })

  try {
    await log.log(42)
  } finally {
    await log.close()
  }

  let content = null
  content = await FileSystem.readFile(JsonPath, { 'encoding': 'utf-8' })
  content = content
    .split('\n')
    .filter((line) => Is.not.equal(line, ''))
    .map((line) => JSON.parse(line))

  // test.log(content)
  test.is(content.length, 1)
  test.is(content[0].data, 42)

})

Test.serial('log(..., ...)', async (test) => {

  let log = new Log(JsonPath, { 'level': 'fatal' })

  try {
    await log.log(42, 43)
  } finally {
    await log.close()
  }

  let content = null
  content = await FileSystem.readFile(JsonPath, { 'encoding': 'utf-8' })
  content = content
    .split('\n')
    .filter((line) => Is.not.equal(line, ''))
    .map((line) => JSON.parse(line))

  // test.log(content)
  test.is(content.length, 1)
  test.is(content[0].data.length, 2)
  test.is(content[0].data[0], 42)
  test.is(content[0].data[1], 43)

})

Test.serial('log({ ... })', async (test) => {

  let log = new Log(JsonPath, { 'level': 'fatal' })

  try {
    await log.log({ 'a': 'b' })
  } finally {
    await log.close()
  }

  let content = null
  content = await FileSystem.readFile(JsonPath, { 'encoding': 'utf-8' })
  content = content
    .split('\n')
    .filter((line) => Is.not.equal(line, ''))
    .map((line) => JSON.parse(line))

  // test.log(content)
  test.is(content.length, 1)
  test.deepEqual(content[0].data, { 'a': 'b' })

})

Test.serial('log({ ... }, { ... })', async (test) => {

  let log = new Log(JsonPath, { 'level': 'fatal' })

  try {
    await log.log({ 'a': 'b' }, [ 'b', 'c' ])
  } finally {
    await log.close()
  }

  let content = null
  content = await FileSystem.readFile(JsonPath, { 'encoding': 'utf-8' })
  content = content
    .split('\n')
    .filter((line) => Is.not.equal(line, ''))
    .map((line) => JSON.parse(line))

  // test.log(content)
  test.is(content.length, 1)
  test.is(content[0].data.length, 2)
  test.deepEqual(content[0].data[0], { 'a': 'b' })
  test.deepEqual(content[0].data[1], [ 'b', 'c' ])

})

Test.serial('log([ ... ])', async (test) => {

  let log = new Log(JsonPath, { 'level': 'fatal' })

  try {
    await log.log([ 'a', 'b' ])
  } finally {
    await log.close()
  }

  let content = null
  content = await FileSystem.readFile(JsonPath, { 'encoding': 'utf-8' })
  content = content
    .split('\n')
    .filter((line) => Is.not.equal(line, ''))
    .map((line) => JSON.parse(line))

  // test.log(content)
  test.is(content.length, 1)
  test.is(content[0].data.length, 1)
  test.deepEqual(content[0].data[0], [ 'a', 'b' ])

})

Test.serial('log([ ... ], [ ... ])', async (test) => {

  let log = new Log(JsonPath, { 'level': 'fatal' })

  try {
    await log.log([ 'a', 'b' ], [ 'b', 'c' ])
  } finally {
    await log.close()
  }

  let content = null
  content = await FileSystem.readFile(JsonPath, { 'encoding': 'utf-8' })
  content = content
    .split('\n')
    .filter((line) => Is.not.equal(line, ''))
    .map((line) => JSON.parse(line))

  // test.log(content)
  test.is(content.length, 1)
  test.is(content[0].data.length, 2)
  test.deepEqual(content[0].data[0], [ 'a', 'b' ])
  test.deepEqual(content[0].data[1], [ 'b', 'c' ])

})

Test.serial('log({ ... }, [ ... ], \'...\')', async (test) => {

  let log = new Log(JsonPath, { 'level': 'fatal' })

  try {
    await log.log({ 'a': 'b' }, [ 'b', 'c' ], 'Hello, world!')
  } finally {
    await log.close()
  }

  let content = null
  content = await FileSystem.readFile(JsonPath, { 'encoding': 'utf-8' })
  content = content
    .split('\n')
    .filter((line) => Is.not.equal(line, ''))
    .map((line) => JSON.parse(line))

  // test.log(content)
  test.is(content.length, 1)
  test.is(content[0].message, 'Hello, world!')
  test.is(content[0].data.length, 2)
  test.deepEqual(content[0].data[0], { 'a': 'b' })
  test.deepEqual(content[0].data[1], [ 'b', 'c' ])

})

Test.serial('log([ ... ], { ... }, \'...\')', async (test) => {

  let log = new Log(JsonPath, { 'level': 'fatal' })

  try {
    await log.log([ 'a', 'b' ], { 'b': 'c' }, 'Hello, world!')
  } finally {
    await log.close()
  }

  let content = null
  content = await FileSystem.readFile(JsonPath, { 'encoding': 'utf-8' })
  content = content
    .split('\n')
    .filter((line) => Is.not.equal(line, ''))
    .map((line) => JSON.parse(line))

  // test.log(content)
  test.is(content.length, 1)
  test.is(content[0].message, 'Hello, world!')
  test.is(content[0].data.length, 2)
  test.deepEqual(content[0].data[0], [ 'a', 'b' ])
  test.deepEqual(content[0].data[1], { 'b': 'c' })

})
