import { ConsoleDestination, DestinationInvalidLevelError } from '@virtualpatterns/mablung-log'
import { Console } from 'console'
import { Process } from '@virtualpatterns/mablung-process'
import Sinon from 'sinon'
import Test from 'ava'

Test('ConsoleDestination()', (test) => {
  test.notThrows(() => { new ConsoleDestination() })
})

Test('ConsoleDestination(Console)', (test) => {
  test.notThrows(() => {
    new ConsoleDestination(new Console({
      'colorMode': false,
      'ignoreErrors': false,
      'stderr': Process.stdout,
      'stdout': Process.stdout
    }))
  })
})

Test('ConsoleDestination(Console, { ... })', (test) => {
  test.notThrows(() => {
    new ConsoleDestination(new Console({
      'colorMode': false,
      'ignoreErrors': false,
      'stderr': Process.stdout,
      'stdout': Process.stdout
    }), {})
  })
})

Test('write(\'log\', \'...\')', (test) => {

  let _console = new Console({
    'colorMode': false,
    'ignoreErrors': false,
    'stderr': Process.stdout,
    'stdout': Process.stdout
  })

  let destination = new ConsoleDestination(_console)

  let debugStub = Sinon
    .stub(_console, 'log')
    .callsFake(function (data) {
      test.is(data, 'Hello, world!')
    })

  try {
    test.notThrows(() => { destination.write('log', 'Hello, world!') })
  } finally {
    debugStub.restore()
  }

})

Test('write(\'trace\', \'...\')', (test) => {
    
  let _console = new Console({
    'colorMode': false,
    'ignoreErrors': false,
    'stderr': Process.stdout,
    'stdout': Process.stdout
  })

  let destination = new ConsoleDestination(_console)

  let debugStub = Sinon
    .stub(_console, 'debug')
    .callsFake(function (data) {
      test.is(data, 'Hello, world!')
    })

  try {
    test.notThrows(() => { destination.write('trace', 'Hello, world!') })
  } finally {
    debugStub.restore()
  }

})

Test('write(\'info\', \'...\')', (test) => {
    
  let _console = new Console({
    'colorMode': false,
    'ignoreErrors': false,
    'stderr': Process.stdout,
    'stdout': Process.stdout
  })

  let destination = new ConsoleDestination(_console)

  let infoStub = Sinon
    .stub(_console, 'info')
    .callsFake(function (data) {
      test.is(data, 'Hello, world!')
    })

  try {
    test.notThrows(() => { destination.write('info', 'Hello, world!') })
  } finally {
    infoStub.restore()
  }

})

Test('write(\'warn\', \'...\')', (test) => {
    
  let _console = new Console({
    'colorMode': false,
    'ignoreErrors': false,
    'stderr': Process.stdout,
    'stdout': Process.stdout
  })

  let destination = new ConsoleDestination(_console)

  let warnStub = Sinon
    .stub(_console, 'warn')
    .callsFake(function (data) {
      test.is(data, 'Hello, world!')
    })

  try {
    test.notThrows(() => { destination.write('warn', 'Hello, world!') })
  } finally {
    warnStub.restore()
  }

})

Test('write(\'error\', \'...\')', (test) => {
    
  let _console = new Console({
    'colorMode': false,
    'ignoreErrors': false,
    'stderr': Process.stdout,
    'stdout': Process.stdout
  })

  let destination = new ConsoleDestination(_console)

  let errorStub = Sinon
    .stub(_console, 'error')
    .callsFake(function (data) {
      test.is(data, 'Hello, world!')
    })

  try {
    test.notThrows(() => { destination.write('error', 'Hello, world!') })
  } finally {
    errorStub.restore()
  }

})

Test('write(\'hello\', \'...\')', (test) => {
    
  let _console = new Console({
    'colorMode': false,
    'ignoreErrors': false,
    'stderr': Process.stdout,
    'stdout': Process.stdout
  })

  let destination = new ConsoleDestination(_console)
  
  test.throws(() => { destination.write('hello', 'Hello, world!') }, { 'instanceOf': DestinationInvalidLevelError })

})

Test('rotate()', (test) => {
  test.notThrows(() => { (new ConsoleDestination()).rotate() })
})

Test('close()', (test) => {
  test.notThrows(() => { (new ConsoleDestination()).close() })
})
