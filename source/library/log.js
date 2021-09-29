import { Configuration } from '@virtualpatterns/mablung-configuration'
import { Is } from '@virtualpatterns/mablung-is'
import Pino from 'pino'
import Stream from 'stream'

import { LogDestination } from './log-destination.js'
// import { LogHandler } from './log-handler.js'
// import { LogArgument } from './log-argument.js'

// import { LogAttachedError } from './error/log-attached-error.js'
// import { LogDetachedError } from './error/log-detached-error.js'
import { LogOptionNotSupportedError } from './error/log-option-not-supported-error.js'

const Process = process

class Log {

  constructor(...argument) {

    let [ userDestination, userOption ] = Log.getConstructorArgument(this, ...argument)
  
    let logDestination = userDestination
    let logOption = Configuration.getOption(this.defaultOption, userOption)

    let pinoDestination = logDestination instanceof LogDestination ? logDestination.pinoDestination : logDestination
    let pinoOption = logOption

    this.pinoLog = this.createPinoLog(pinoDestination, pinoOption)

    this.logDestination = logDestination
    this.logOption = logOption

    this.attachAllHandler()

  }

  createPinoLog(destination, option) {
    return Pino(option, destination)
  }

  createDestination(...argument) {
    return new LogDestination(...argument)
  }

  get destination() {
    return this.logDestination
  }

  get defaultOption() {
    return {
      'level': 'info',
      'nestedKey': 'data'
    }
  }

  get option() {
    return this.logOption
  }

  get handleExit() {
    return this.logOption.handleExit || false
  }

  get handleRotate() {
    return this.logOption.handleRotate || false
  }

  attachAllHandler() {

    try {

      if (this.handleExit) {

        Process.on('exit', this.onExitHandler = this.onImmediate((immediateLog, code) => {
          immediateLog.trace(`Process.on('exit', (${code}) => { ... })`)

          try {
            this.onExit(code)
          } catch (error) {
            immediateLog.error(error)
          }

        }))

      }

      // if (handleKillSignal) {

      //   if (Is.windows()) {
      //     throw new LogOptionNotSupportedError('handleKillSignal')
      //   } else {

      //     handleKillSignal.forEach((signal) => {
      //       Process.on(signal, this[`on${signal}Handler`] = this.onImmediate((immediateLog) => {
      //         immediateLog.trace(`Process.on('${signal}', this.on${signal}Handler = this.onImmediate((immediateLog) => { ... }))`)

      //         try {
      //           this.detachAllHandler()
      //           /* c8 ignore next 3 */
      //         } catch (error) {
      //           immediateLog.error(error)
      //         }

      //         let count = Process.listenerCount(signal)

      //         /* c8 ignore next 5 */
      //         if (count <= 0) {
      //           Process.exit()
      //         } else {
      //           immediateLog.trace(`Process.listenerCount('${signal}') returned ${count}`)
      //         }

      //       }))
      //     })

      //   }

      // }

      if (this.handleRotate) {

        if (Is.windows()) {
          throw new LogOptionNotSupportedError('handleRotate')
        } else {

          this.handleRotate.forEach((signal) => {
            Process.on(signal, this[`on${signal}Handler`] = () => {
              this.trace(`Process.on('${signal}', () => { ... })`)

              try {
                this.onRotate()
              } catch (error) {
                this.error(error)
              }

            })
          })

        }

      }

    } catch (error) {

      // if (this.logOption.handleExit &&
      //   this.onExitHandler) {
      //   Process.off('exit', this.onExitHandler)
      //   delete this.onExitHandler
      // }

      // if (handleKillSignal) {

      //   handleKillSignal.forEach((signal) => {
      //     if (this[`on${signal}Handler`]) {
      //       Process.off(signal, this[`on${signal}Handler`])
      //       delete this[`on${signal}Handler`]
      //     }
      //   })

      // }

      // if (handleRotate) {

      //   this.handleRotate.forEach((signal) => {
      //     if (this[`on${signal}Handler`]) {
      //       Process.off(signal, this[`on${signal}Handler`])
      //       delete this[`on${signal}Handler`]
      //     }
      //   })

      // }

      this.detachAllHandler()
      throw error

    }

  }

  detachAllHandler() {

    if (this.handleRotate) {

      this.handleRotate.forEach((signal) => {
        if (this[`on${signal}Handler`]) {
          Process.off(signal, this[`on${signal}Handler`])
          delete this[`on${signal}Handler`]
        }
      })

    }

    // if (handleKillSignal) {

    //   handleKillSignal.forEach((signal) => {
    //     if (this[`on${signal}Handler`]) {
    //       Process.off(signal, this[`on${signal}Handler`])
    //       delete this[`on${signal}Handler`]
    //     }
    //   })

    // }

    if (this.handleExit &&
        this.onExitHandler) {
      Process.off('exit', this.onExitHandler)
      delete this.onExitHandler
    }

  }

  onExit(/* code */) {
    this.detachAllHandler()
  }

  onRotate() {
    this.rotate()
  }

  getLevelName(levelNumber) {
    return this.pinoLog.levels.labels[levelNumber]
  }

  trace(...argument) {
    return this.pinoLog.trace(...argument)
  }

  debug(...argument) {
    return this.pinoLog.debug(...argument)
  }

  info(...argument) {
    return this.pinoLog.info(...argument)
  }

  warn(...argument) {
    return this.pinoLog.warn(...argument)
  }

  error(...argument) {
    return this.pinoLog.error(...argument)
  }

  fatal(...argument) {
    return this.pinoLog.fatal(...argument)
  }

  rotate() {
    this.logDestination.rotate()
  }

  // createProxy(object) {
  //   return new Proxy(object, new LogHandler(this))
  // }

  onImmediate(immediateFn) {

    return Pino.final(this.pinoLog, (error, pinoLog, ...argument) => {

      let immediateLog = null
      immediateLog = new this.constructor(this.logDestination, Configuration.getOption(this.logOption, { 'handleExit': false, 'handleRotate': false }))
      immediateLog.pinoLog = pinoLog

      let immediateArgument = Is.null(error) ? argument : [ error, ...argument ]

      immediateFn.call(this, immediateLog, ...immediateArgument)

    })

  }

  static getConstructorArgument(log, ...argument) {

    // the defaults
    let _destination = null
    let logOption = {}

    switch (argument.length) {
      case 0:
        // _destination = default
        // logOption = default
        break
      case 1:

        switch (true) {
          case argument[0] instanceof LogDestination:
          case argument[0] instanceof Stream.Writable:
            _destination = argument[0]
            // logOption = default
            break
          case Is.string(argument[0]):
            _destination = log.createDestination(argument[0])
            // logOption = default
            break
          default:
            // _destination = default
            logOption = argument[0]
        }

        break
      default:

        switch (true) {
          case argument[0] instanceof LogDestination:
          case argument[0] instanceof Stream.Writable:
            _destination = argument[0]
            logOption = argument[1]
            break
          case Is.string(argument[0]):
            _destination = log.createDestination(argument[0])
            logOption = argument[1]
            break
          default:
            _destination = argument[0]
            logOption = argument[1]
        }

    }

    return [ Is.null(_destination) ? log.createDestination() : _destination, logOption ]

  }

}

export { Log }
