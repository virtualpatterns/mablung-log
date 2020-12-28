import { FileSystem } from '@virtualpatterns/mablung-file-system'
import Path from 'path'
import Test from 'ava'

import { Log/*, FormattedLog */ } from '../../index.js'

const Process = process
const SymbolProperty = Symbol('property')

class AClass {

  constructor(name) {
    this.name = name
  }

  createA(name) {
    return new AClass(name)
  }

  [SymbolProperty]() { return 'property' }

  getPid(duration = 0) {

    if (duration) {
  
      return new Promise((resolve) => {
  
        setTimeout(() => {
          /* c8 ignore next 1 */
          resolve(Process.pid)
        }, duration)
  
      })
  
    } else {
      return Process.pid
    }
  
  }

  throwIt(error) {
    throw error
  }

  callIt() {}

}

AClass._formatConstructorParameter = function _formatConstructorParameter(name) {
  return [ {}, `name = '${name}'` ]
}

AClass.prototype.getPid._formatParameter = function _formatParameter(duration = 0) {
  return [ {}, `duration = ${duration}` ]
}

AClass.prototype.getPid._formatReturnValue = function _formatReturnValue(pid) {
  return [ {}, `AClass.getPid() = ${pid}` ]
}

Test('LogHandler.construct(target, parameter) using _formatConstructorParameter', async (test) => {

  let logPath = 'process/log/log-handler-construct.log'
  // await FileSystem.ensureDir(Path.dirname(logPath))

  let log = new Log(logPath, { 'level': 'trace' })

  try {

    let _AClass = log.createProxy(AClass)
    
    test.truthy(new _AClass('name'))
  
    let logContents = await FileSystem.readAllJson(logPath, { 'encoding': 'utf-8' })
  
    test.is(logContents.length, 2)
    test.is(logContents[1].msg, '< new AClass(name = \'name\')')
  
  } finally {
    await FileSystem.remove(logPath)
  }

})

Test('LogHandler.get(target, propertyName, receiver) when propertyName is a symbol', async (test) => {

  let logPath = 'process/log/log-handler-get-symbol.log'
  // await FileSystem.ensureDir(Path.dirname(logPath))

  let log = new Log(logPath, { 'level': 'trace' })

  try {

    let aClass = new AClass()
    let _aClass = log.createProxy(aClass)

    test.is(_aClass[SymbolProperty](), 'property')
  
    let logContents = await FileSystem.readAllJson(logPath, { 'encoding': 'utf-8' })

    test.is(logContents.length, 2)
    test.is(logContents[1].msg, '< AClass.[property]() returned \'property\'')
  
  } finally {
    await FileSystem.remove(logPath)
  }

})

Test('LogHandler.get(target, propertyName, receiver) when propertyName is \'_formatConstructorParameter\'', async (test) => {

  let logPath = 'process/log/log-handler-get-format-constructor-parameter.log'
  // await FileSystem.ensureDir(Path.dirname(logPath))

  let log = new Log(logPath, { 'level': 'trace' })

  try {

    let _AClass = log.createProxy(AClass)

    test.is(_AClass._formatConstructorParameter('name')[1], 'name = \'name\'')
  
    let logContents = await FileSystem.readAllJson(logPath, { 'encoding': 'utf-8' })

    // calls to _formatConstructorParameter are not logged
    test.is(logContents.length, 0)
  
  } finally {
    await FileSystem.remove(logPath)
  }

})

Test('LogHandler.get(target, propertyName, receiver) when propertyName is \'_formatParameter\'', async (test) => {

  let logPath = 'process/log/log-handler-get-format-parameter.log'
  // await FileSystem.ensureDir(Path.dirname(logPath))

  let log = new Log(logPath, { 'level': 'trace' })

  try {

    let aClass = new AClass()
    let _aClass = log.createProxy(aClass)

    test.is(_aClass.getPid._formatParameter(1000)[1], 'duration = 1000')
  
    let logContents = await FileSystem.readAllJson(logPath, { 'encoding': 'utf-8' })

    // calls to _formatXParameter are not logged
    test.is(logContents.length, 0)
  
  } finally {
    await FileSystem.remove(logPath)
  }

})

Test('LogHandler.get(target, propertyName, receiver) when propertyName is \'_formatReturnValue\'', async (test) => {

  let logPath = 'process/log/log-handler-get-format-return-value.log'
  // await FileSystem.ensureDir(Path.dirname(logPath))

  let log = new Log(logPath, { 'level': 'trace' })

  try {

    let aClass = new AClass()
    let _aClass = log.createProxy(aClass)

    test.is(_aClass.getPid._formatReturnValue(1000)[1], 'AClass.getPid() = 1000')
  
    let logContents = await FileSystem.readAllJson(logPath, { 'encoding': 'utf-8' })

    // calls to _formatXReturnValue are not logged
    test.is(logContents.length, 0)
  
  } finally {
    await FileSystem.remove(logPath)
  }

})

Test('LogHandler.apply(target, self, parameter) when target fails', async (test) => {

  let logPath = 'process/log/log-handler-apply-fails.log'
  // await FileSystem.ensureDir(Path.dirname(logPath))

  let log = new Log(logPath, { 'level': 'trace' })

  try {

    let aClass = new AClass()
    let _aClass = log.createProxy(aClass)

    test.throws(() => { _aClass.throwIt(new Error('error')) }, { 'instanceOf': Error })
  
    let logContents = await FileSystem.readAllJson(logPath, { 'encoding': 'utf-8' })
  
    test.is(logContents.length, 2)
    test.is(logContents[1].msg, 'error')
  
  } finally {
    await FileSystem.remove(logPath)
  }

})

Test('LogHandler.apply(target, self, parameter) when target returns a Promise', async (test) => {

  let logPath = 'process/log/log-handler-apply-promise.log'
  // await FileSystem.ensureDir(Path.dirname(logPath))

  let log = new Log(logPath, { 'level': 'trace' })

  try {

    let aClass = new AClass()
    let _aClass = log.createProxy(aClass)

    test.is(await _aClass.getPid(1000), Process.pid)
  
    let logContents = await FileSystem.readAllJson(logPath, { 'encoding': 'utf-8' })
  
    test.is(logContents.length, 2)
    test.is(logContents[1].msg, `< AClass.getPid(duration = 1000) returned AClass.getPid() = ${Process.pid}`)
  
  } finally {
    await FileSystem.remove(logPath)
  }

})

Test('LogHandler.apply(target, self, parameter) when target takes a variety of arguments', async (test) => {

  let logPath = 'process/log/log-handler-apply-variety.log'
  await FileSystem.ensureDir(Path.dirname(logPath))

  let log = new Log(logPath, { 'level': 'trace' })

  try {

    let aClass = new AClass()
    let _aClass = log.createProxy(aClass)

    let date = new Date('1995-12-17T03:24:00')
    let offset = date.getTimezoneOffset() / 60

    test.notThrows(() => { _aClass.callIt(null, undefined, date, /abc/i) })
  
    let logContents = await FileSystem.readAllJson(logPath, { 'encoding': 'utf-8' })
  
    test.is(logContents.length, 2)

    test.log(logContents[1].msg)
    test.is(logContents[1].msg, `< AClass.callIt(null, undefined, '1995.12.17-03:24:00.000${offset > 0 ? '-' : '+'}${(offset * 100).toString().padStart(4, '0')}', /abc/i)`)
      
  } finally {
    await FileSystem.remove(logPath)
  }

})
