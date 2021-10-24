import { Configuration } from '@virtualpatterns/mablung-configuration'
import { Console } from 'console'
import { Is } from '@virtualpatterns/mablung-is'
import OS from 'os'
import Stream from 'stream'

import { Destination } from './destination.js'
import { ConsoleDestination } from './destination/console-destination.js'
import { FileDestination } from './destination/file-destination.js'
import { StreamDestination } from './destination/stream-destination.js'

const Process = process

class Log {

  constructor(...argument) {

    let [ userDestination, userOption ] = this.getConstructorArgument(...argument)

    this.destination = userDestination
    this.option = Configuration.getOption(this.defaultOption, userOption)

    if (this.handleRotate &&
        Is.not.windows()) {

      this.handleRotate.forEach((signal) => {
        Process.on(signal, this[`on${signal}Handler`] = async () => {

          try {
            await this.onRotate(signal)
          } catch (error) {
            await this.error(error)
          }

        })
      })

    }

    if (this.handleExit) {

      Process.once('beforeExit', this.onBeforeExitHandler = async (code) => {
        delete this.onBeforeExitHandler

        try {
          await this.onBeforeExit(code)
        } catch (error) {
          await this.error(error)
        }

      })

    }

  }

  static get level() {
    return [
      'trace',
      'debug',
      'info',
      'warn',
      'error',
      'fatal'
    ]
  }

  getConstructorArgument(...argument) {

    // the defaults
    let destination = this.createConsoleDestination()
    let option = {}

    switch (argument.length) {
      case 0:
        // destination = default
        // option = default
        break
      case 1:

        switch (true) {
          case argument[0] instanceof Destination:
            destination = argument[0]
            // option = default
            break
          case argument[0] instanceof Console:
            destination = this.createConsoleDestination(argument[0])
            // option = default
            break
          case argument[0] instanceof Stream.Writable:
            destination = this.createStreamDestination(argument[0])
            // option = default
            break
          case Is.string(argument[0]):
            destination = this.createFileDestination(argument[0])
            // option = default
            break
          default:
            // destination = default
            option = argument[0]
        }

        break
      default:

        switch (true) {
          case argument[0] instanceof Destination:
            destination = argument[0]
            option = argument[1]
            break
          case argument[0] instanceof Console:
            destination = this.createConsoleDestination(argument[0])
            option = argument[1]
            break
          case argument[0] instanceof Stream.Writable:
            destination = this.createStreamDestination(argument[0])
            option = argument[1]
            break
          case Is.string(argument[0]):
            destination = this.createFileDestination(argument[0])
            option = argument[1]
            break
          default:
            // destination = default
            option = argument[1]
        }

    }

    return [ destination, option ]

  }

  createConsoleDestination(...argument) {
    return new ConsoleDestination(...argument)
  }

  createStreamDestination(...argument) {
    return new StreamDestination(...argument)
  }

  createFileDestination(...argument) {
    return new FileDestination(...argument)
  }

  get defaultOption() {
    return {
      'level': 'info'
    }
  }

  get level() {
    return this.option.level
  }

  get handleRotate() {
    return this.option.handleRotate || false
  }

  get handleExit() {
    return this.option.handleExit || false
  }

  // attach() {

  //   if (this.handleRotate &&
  //       Is.not.windows()) {

  //     this.handleRotate.forEach((signal) => {
  //       Process.on(signal, this[`on${signal}Handler`] = async () => {
  //         // console.log(`Process.on('${signal}', async () => { ... })`)

  //         try {
  //           await this.onRotate(signal)
  //         } catch (error) {
  //           await this.error(error)
  //         }

  //       })
  //     })

  //   }

  //   if (this.handleExit) {

  //     Process.once('beforeExit', this.onBeforeExitHandler = async (code) => {
  //       // console.log(`Process#once('beforeExit', async (${code}) => { ... })`)
  //       delete this.onBeforeExitHandler

  //       try {
  //         await this.onBeforeExit(code)
  //       } catch (error) {
  //         await this.error(error)
  //       }

  //     })

  //   }

  // }

  async onRotate(signal) {
    await this.trace(`Log#onRotate('${signal}')`)
    return this.rotate()
  }

  async onBeforeExit(code) {
    await this.trace(`Log#onBeforeExit(${code})`)
    return this.close()
  }

  trace(...argument) {
    return this.log('trace', ...argument)
  }

  debug(...argument) {
    return this.log('debug', ...argument)
  }

  info(...argument) {
    return this.log('info', ...argument)
  }

  warn(...argument) {
    return this.log('warn', ...argument)
  }

  error(...argument) {
    return this.log('error', ...argument)
  }

  fatal(...argument) {
    return this.log('fatal', ...argument)
  }

  log(level, ...argument) {

    [ level, ...argument ] = this.getLogArgument(level, ...argument)

    if (this.isLevelEnabled(level)) {
      return this.writeData(level, this.formatData(level, this.getData(level, ...argument)))
    }

  }

  getLogArgument(...argumentIn) {

    // the defaults
    let level = 'log'
    let argumentOut = []

    switch (argumentIn.length) {
      /* c8 ignore next 4 */
      case 0:
        // level = default
        // argumentOut = default
        break
      case 1:

        switch (true) {
          case [ ...Log.level, 'log' ].includes(argumentIn[0]):
            level = argumentIn[0]
            // argumentOut = default
            break
          default:
            // level = default
            argumentOut = argumentIn
        }

        break
      default:

        switch (true) {
          case [ ...Log.level, 'log' ].includes(argumentIn[0]):
            level = argumentIn[0]
            argumentOut = argumentIn.slice(1)
            break
          default:
            // level = default
            argumentOut = argumentIn
        }
        
    }

    return [ level, ...argumentOut ]

  }

  isLevelEnabled(level) {
    return Is.equal(level, 'log') || Log.level.indexOf(level) >= Log.level.indexOf(this.level)
  }

  writeData(level, data) {
    return this.destination.write(level, data)
  }

  formatData(level, data) {

    return `${JSON.stringify(data, (key, value) => {

      switch (true) {
        case value instanceof Error:
          return {
            'type': value.constructor.name,
            'code': value.code,
            'message': value.message,
            'stack': value.stack
          }
        default:
          return value
      }
      
    })}\n`

  }

  getData(level, ...argument) {

    let data = {
      'date': new Date(),
      'host': OS.hostname(),
      'level': level,
      'pid': Process.pid
    }

    argument.forEach((argument) => {

      switch (true) {
        // case argument instanceof Error:
        //   data.error = Is.propertyDefined(data, 'error') ? (Is.array(data.error) ? data.error.concat([ argument ]) : [ data.error, argument ]) : argument
        //   break
        case Is.string(argument):
          data.message = Is.propertyDefined(data, 'message') ? (Is.array(data.message) ? data.message.concat([ argument ]) : [ data.message, argument ]) : argument
          break
        default:
          data.data = Is.propertyDefined(data, 'data') ? (Is.array(data.data) ? data.data.concat([ argument ]) : [ data.data, argument ]) : (Is.array(argument) ? [ argument ] : argument)
      }

    })

    return data

  }

  rotate() {
    return this.destination.rotate()
  }

  close() {

    if (this.handleExit &&
        this.onBeforeExitHandler) {
      Process.off('beforeExit', this.onBeforeExitHandler)
      delete this.onBeforeExitHandler
    }

    if (this.handleRotate &&
        Is.not.windows()) {

      this.handleRotate.forEach((signal) => {
        if (this[`on${signal}Handler`]) {
          Process.off(signal, this[`on${signal}Handler`])
          delete this[`on${signal}Handler`]
        }
      })

    }

    return this.destination.close()

  }

  // detach() {

  //   if (this.handleExit &&
  //       this.onBeforeExitHandler) {
  //     Process.off('beforeExit', this.onBeforeExitHandler)
  //     delete this.onBeforeExitHandler
  //   }

  //   if (this.handleRotate &&
  //       Is.not.windows()) {

  //     this.handleRotate.forEach((signal) => {
  //       if (this[`on${signal}Handler`]) {
  //         Process.off(signal, this[`on${signal}Handler`])
  //         delete this[`on${signal}Handler`]
  //       }
  //     })

  //   }

  // }

}

export { Log }
