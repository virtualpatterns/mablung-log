import { FastDestination } from '@virtualpatterns/mablung-log'
import { FileSystem } from '@virtualpatterns/mablung-file-system'
import Path from 'path'
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

Test('FastDestination()', (test) => {
  test.notThrows(() => { new FastDestination() })
})

Test('FastDestination(...)', (test) => {
  test.notThrows(() => { new FastDestination(Process.stdout.fd) })
})

Test('FastDestination(..., { ... })', (test) => {
  test.notThrows(() => { new FastDestination(Process.stdout.fd, {}) })
})

Test('FastDestination(\'...\')', (test) => {
  test.notThrows(() => { (new FastDestination(LogPath)).close() })
})

Test('FastDestination(\'...\', { ... })', (test) => {
  test.notThrows(() => { (new FastDestination(LogPath, {})).close() })
})

Test('write(\'trace\', \'...\') using \'...\', { ... }', (test) => {

  let destination = new FastDestination(LogPath, {})

  try {
    test.notThrows(() => { destination.write('trace', 'Hello, world!') })
  } finally {
    destination.close()
  }

})

Test('rotate()', (test) => {
  test.notThrows(() => { (new FastDestination()).rotate() })
})

Test('rotate() using ...', (test) => {
  test.notThrows(() => { (new FastDestination(Process.stdout.fd)).rotate() })
})

Test('rotate() using ..., { ... }', (test) => {
  test.notThrows(() => { (new FastDestination(Process.stdout.fd, {})).rotate() })
})

Test('rotate() using \'...\'', (test) => {

  let destination = new FastDestination(LogPath)

  try {
    test.notThrows(() => { destination.rotate() })
  } finally {
    destination.close()
  }

})

Test('rotate() using \'...\', { ... }', (test) => {

  let destination = new FastDestination(LogPath, {})

  try {
    test.notThrows(() => { destination.rotate() })
  } finally {
    destination.close()
  }

})

Test('close()', (test) => {
  test.notThrows(() => { (new FastDestination()).close() })
})

Test('close() using ...', (test) => {
  test.notThrows(() => { (new FastDestination(Process.stdout.fd)).close() })
})

Test('close() using ..., { ... }', (test) => {
  test.notThrows(() => { (new FastDestination(Process.stdout.fd, {})).close() })
})

// Test('close() using \'...\'', (test) => {
//   return test.notThrowsAsync((new FastDestination(LogPath)).close())
// })

// Test('close() using \'...\', { ... }', (test) => {
//   return test.notThrowsAsync((new FastDestination(LogPath, {})).close())
// })

// Test('close() using \'...\', { ... } throws Error', async (test) => {

//   let destination = new FastDestination(LogPath, {})

//   try {

//     let closeStub = Sinon
//       .stub(destination.stream, 'close')
//       .callsArgWith(0, new Error())

//     try {
//       await test.throwsAsync(destination.close(), { 'instanceOf': Error })
//     } finally {
//       closeStub.restore()
//     }

//   } finally {
//     await destination.close()
//   }

// })

// Test('write(\'trace\', \'...\') using \'...\', { ... }', async (test) => {

//   let destination = new FastDestination(LogPath, {})

//   try {
//     await test.notThrowsAsync(destination.write('trace', 'Hello, world!'))
//   } finally {
//     await destination.close()
//   }

// })

// Test('write(\'trace\', \'...\') using \'...\', { ... } on false resolves', async (test) => {

//   let destination = new FastDestination(LogPath, {})

//   try {

//     let writeStub = Sinon
//       .stub(destination.stream, 'write')
//       .returns(false)

//     try {
//       await test.notThrowsAsync(Promise.all([ destination.write('trace', 'Hello, world!'), destination.stream.emit('drain') ]))
//     } finally {
//       writeStub.restore()
//     }

//   } finally {
//     await destination.close()
//   }

// })

// Test('write(\'trace\', \'...\') using \'...\', { ... } on false rejects', async (test) => {

//   let destination = new FastDestination(LogPath, {})

//   try {

//     let writeStub = Sinon
//       .stub(destination.stream, 'write')
//       .returns(false)

//     try {
//       await test.throwsAsync(Promise.all([ destination.write('trace', 'Hello, world!'), destination.stream.emit('error', new Error) ]), { 'instanceOf': Error })
//     } finally {
//       writeStub.restore()
//     }

//   } finally {
//     await destination.close()
//   }

// })

// // Test('write(\'info\', \'...\')', (test) => {
    
// //   let _console = new Console({
// //     'colorMode': false,
// //     'ignoreErrors': false,
// //     'stderr': Process.stdout,
// //     'stdout': Process.stdout
// //   })

// //   let destination = new FastDestination(_console)

// //   let infoStub = Sinon
// //     .stub(_console, 'info')
// //     .callsFake(function (data) {
// //       test.is(data, 'Hello, world!')
// //     })

// //   try {
// //     test.notThrows(() => { destination.write('info', 'Hello, world!') })
// //   } finally {
// //     infoStub.restore()
// //   }

// // })

// // Test('write(\'warn\', \'...\')', (test) => {
    
// //   let _console = new Console({
// //     'colorMode': false,
// //     'ignoreErrors': false,
// //     'stderr': Process.stdout,
// //     'stdout': Process.stdout
// //   })

// //   let destination = new FastDestination(_console)

// //   let warnStub = Sinon
// //     .stub(_console, 'warn')
// //     .callsFake(function (data) {
// //       test.is(data, 'Hello, world!')
// //     })

// //   try {
// //     test.notThrows(() => { destination.write('warn', 'Hello, world!') })
// //   } finally {
// //     warnStub.restore()
// //   }

// // })

// // Test('write(\'error\', \'...\')', (test) => {
    
// //   let _console = new Console({
// //     'colorMode': false,
// //     'ignoreErrors': false,
// //     'stderr': Process.stdout,
// //     'stdout': Process.stdout
// //   })

// //   let destination = new FastDestination(_console)

// //   let errorStub = Sinon
// //     .stub(_console, 'error')
// //     .callsFake(function (data) {
// //       test.is(data, 'Hello, world!')
// //     })

// //   try {
// //     test.notThrows(() => { destination.write('error', 'Hello, world!') })
// //   } finally {
// //     errorStub.restore()
// //   }

// // })

// // Test('write(\'log\', \'...\')', (test) => {
    
// //   let _console = new Console({
// //     'colorMode': false,
// //     'ignoreErrors': false,
// //     'stderr': Process.stdout,
// //     'stdout': Process.stdout
// //   })

// //   let destination = new FastDestination(_console)
// //   test.throws(() => { destination.write('log', 'Hello, world!') }, { 'instanceOf': DestinationInvalidLevelError })

// // })
