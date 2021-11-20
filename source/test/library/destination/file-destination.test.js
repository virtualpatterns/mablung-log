import { FileDestination } from '@virtualpatterns/mablung-log'
import { FileSystem } from '@virtualpatterns/mablung-file-system'
import Path from 'path'
import Sinon from 'sinon'
import Test from 'ava'

const FilePath = __filePath

const LogPath = FilePath.replace('/release/', '/data/').replace(/\.test\.c?js$/, '.log')

const Process = process

Test.before(() => {
  return FileSystem.ensureDir(Path.dirname(LogPath))
})

Test.beforeEach(() => {
  return FileSystem.remove(LogPath)
})

Test('FileDestination()', (test) => {
  test.notThrows(() => { new FileDestination() })
})

Test('FileDestination(Stream)', (test) => {
  test.notThrows(() => { new FileDestination(Process.stdout) })
})

Test('FileDestination(Stream, { ... })', (test) => {
  test.notThrows(() => { new FileDestination(Process.stdout, {}) })
})

Test('FileDestination(\'...\')', (test) => {
  return test.notThrowsAsync((new FileDestination(LogPath)).close())
})

Test('FileDestination(\'...\', { ... })', (test) => {
  return test.notThrowsAsync((new FileDestination(LogPath, {})).close())
})

Test('write(\'trace\', \'...\') using \'...\', { ... }', async (test) => {

  let destination = new FileDestination(LogPath, {})

  try {
    await test.notThrowsAsync(destination.write('trace', 'Hello, world!'))
  } finally {
    await destination.close()
  }

})

Test('write(\'trace\', \'...\') using \'...\', { ... } on false resolves on drain', async (test) => {

  let destination = new FileDestination(LogPath, {})

  try {

    let writeStub = Sinon
      .stub(destination.stream, 'write')
      .returns(false)

    try {
      await test.notThrowsAsync(Promise.all([ destination.write('trace', 'Hello, world!'), destination.stream.emit('drain') ]))
    } finally {
      writeStub.restore()
    }

  } finally {
    await destination.close()
  }

})

Test('write(\'trace\', \'...\') using \'...\', { ... } on false resolves on error', async (test) => {

  test.plan(2)

  let destination = new FileDestination(LogPath, {})

  try {

    let writeStub = Sinon
      .stub(destination.stream, 'write')
      .returns(false)

    try {

      let errorStub = Sinon
        .stub(console, 'error')
        .callsFake(function (error) {
          test.assert(error instanceof Error)
        })

      try {
        await test.notThrowsAsync(Promise.all([ destination.write('trace', 'Hello, world!'), destination.stream.emit('error', new Error()) ]))
      } finally {
        errorStub.restore()
      }

    } finally {
      writeStub.restore()
    }

  } finally {
    await destination.close()
  }

})

Test('rotate() throws TypeError', (test) => {
  return test.throwsAsync((new FileDestination()).rotate(), { 'instanceOf': TypeError })
})

Test('rotate() using Stream throws TypeError', (test) => {
  return test.throwsAsync((new FileDestination(Process.stdout)).rotate(), { 'instanceOf': TypeError })
})

Test('rotate() using Stream, { ... } throws TypeError', (test) => {
  return test.throwsAsync((new FileDestination(Process.stdout, {})).rotate(), { 'instanceOf': TypeError })
})

Test('rotate() using \'...\'', async (test) => {

  let destination = new FileDestination(LogPath)

  try {
    await test.notThrowsAsync(destination.rotate())
  } finally {
    await destination.close()
  }

})

Test('rotate() using \'...\', { ... }', async (test) => {

  let destination = new FileDestination(LogPath, {})

  try {
    await test.notThrowsAsync(destination.rotate())
  } finally {
    await destination.close()
  }

})

Test('close() throws TypeError', (test) => {
  return test.throwsAsync((new FileDestination()).close(), { 'instanceOf': TypeError })
})

Test('close() using Stream throws TypeError', (test) => {
  return test.throwsAsync((new FileDestination(Process.stdout)).close(), { 'instanceOf': TypeError })
})

Test('close() using Stream, { ... } throws TypeError', (test) => {
  return test.throwsAsync((new FileDestination(Process.stdout, {})).close(), { 'instanceOf': TypeError })
})

Test('close() using \'...\'', (test) => {
  return test.notThrowsAsync((new FileDestination(LogPath)).close())
})

Test('close() using \'...\', { ... }', (test) => {
  return test.notThrowsAsync((new FileDestination(LogPath, {})).close())
})

Test('close() using \'...\', { ... } throws Error', async (test) => {

  let destination = new FileDestination(LogPath, {})

  try {

    let closeStub = Sinon
      .stub(destination.stream, 'close')
      .callsArgWith(0, new Error())

    try {
      await test.throwsAsync(destination.close(), { 'instanceOf': Error })
    } finally {
      closeStub.restore()
    }

  } finally {
    await destination.close()
  }

})

// Test.only('...', async (test) => {

//   let destination = new FileDestination(LogPath, {})

//   try {

//     let writeStub = Sinon
//       .stub(destination.stream, 'write')
//       .returns(false)

//     try {

//       destination.write('trace', 'Hello, world!')
//       destination.stream.emit('error', new Error('you suck!'))

//       // await test.throwsAsync(Promise.all([ ,  ]), { 'instanceOf': Error })

//     } finally {
//       writeStub.restore()
//     }

//   } finally {
//     await destination.close()
//   }

//   test.pass()

// })
