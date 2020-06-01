import { Configuration } from '@virtualpatterns/mablung-configuration'
import { Is } from '@virtualpatterns/mablung-is'
import Pino from 'pino'

import { LogDestination } from './log-destination.js'
import { LogHandler } from './log-handler.js'
import { LogParameter } from './log-parameter.js'

import { LogAttachedError } from './error/log-attached-error.js'
import { LogDetachedError } from './error/log-detached-error.js'
import { LogOptionNotSupportedError } from './error/log-option-not-supported-error.js'

const Process = process

class Log {

  constructor(...parameter) {

    let [ userDestination, userOption ] = LogParameter.getConstructorParameter(this, ...parameter)
  
    let destination = userDestination
    let option = Configuration.getOption(this.defaultOption, userOption)

    let pinoDestination = destination instanceof LogDestination ? destination.pinoDestination : destination
    let pinoOption = option

    this._pinoLog = this._createPinoLog(pinoDestination, pinoOption)

    this._destination = destination
    this._option = option

  }

  _createPinoLog(destination, option) {
    return Pino(option, destination)
  }

  createDestination(...parameter) {
    return new LogDestination(...parameter)
  }

  /* c8 ignore next 3 */
  get destination() {
    return this._destination
  }

  get defaultOption() {
    return {
      'level': 'info',
      'nestedKey': 'data'
    }
  }

  /* c8 ignore next 3 */
  get option() {
    return this._option
  }

  getLevelName(levelNumber) {
    return this._pinoLog.levels.labels[levelNumber]
  }

  trace(...parameter) {
    return this._pinoLog.trace(...parameter)
  }

  debug(...parameter) {
    return this._pinoLog.debug(...parameter)
  }

  info(...parameter) {
    return this._pinoLog.info(...parameter)
  }

  warn(...parameter) {
    return this._pinoLog.warn(...parameter)
  }

  error(...parameter) {
    return this._pinoLog.error(...parameter)
  }

  fatal(...parameter) {
    return this._pinoLog.fatal(...parameter)
  }

  attach({ handleExit = true, handleKillSignal = Is.windows() ? false : [ 'SIGINT', 'SIGTERM' ], handleRotate = Is.windows() ? false : [ 'SIGHUP' ] } = {}) {
    this.trace({ handleExit, handleKillSignal, handleRotate }, 'Log.attach(option)')

    if (this._attachOption) {
      throw new LogAttachedError()
    } else {

      try { 

        if (handleExit) {

          Process.on('exit', this.__onExit = this.onImmediate((immediateLog) => {
            immediateLog.trace('Process.on(\'exit\', this.__onExit = this.onImmediate((immediateLog) => { ... }))')
  
            try {
              this.detach()
            /* c8 ignore next 3 */
            } catch (error) {
              immediateLog.error(error)
            }
  
          }))
  
        }
  
        if (handleKillSignal) {
    
          if (Is.windows()) {
            throw new LogOptionNotSupportedError('handleKillSignal')
          } else {
            
            handleKillSignal.forEach((signal) => {
              Process.on(signal, this[`__on${signal}`] = this.onImmediate((immediateLog) => {
                immediateLog.trace(`Process.on('${signal}', this.__on${signal} = this.onImmediate((immediateLog) => { ... }))`)
  
                try {
                  this.detach()
                /* c8 ignore next 3 */
                } catch (error) {
                  immediateLog.error(error)
                }
        
                let count = Process.listenerCount(signal)
  
                /* c8 ignore next 5 */
                if (count <= 0) {
                  Process.exit()
                } else {
                  immediateLog.trace(`Process.listenerCount('${signal}') returned ${count}`)
                }
  
              }))
            })
  
          }
  
        }
  
        if (handleRotate) {
    
          if (Is.windows()) {
            throw new LogOptionNotSupportedError('handleRotate')
          } else {
              
            handleRotate.forEach((signal) => {
              Process.on(signal, this[`__on${signal}`] = () => {
                this.trace(`Process.on('${signal}', this.__on${signal} = () => { ... })`)
  
                try {
                  this.rotate()
                /* c8 ignore next 3 */
                } catch (error) {
                  this.error(error)
                }
  
              })
            })
  
          }
  
        }
          
      } catch (error) {

        if (handleExit && 
            this.__onExit) {
          Process.off('exit', this.__onExit)
          delete this.__onExit
        }

        if (handleKillSignal) {

          handleKillSignal.forEach((signal) => {
            if (this[`__on${signal}`]) {
              Process.off(signal, this[`__on${signal}`])
              delete this[`__on${signal}`]
            }
          })

        }

        if (handleRotate) {

          handleRotate.forEach((signal) => {
            if (this[`__on${signal}`]) {
              Process.off(signal, this[`__on${signal}`])
              delete this[`__on${signal}`]
            }
          })

        }

        throw error

      }

      this._attachOption = { handleExit, handleKillSignal, handleRotate }

    }

  }

  detach() {
    this.trace('Log.detach()')

    if (this._attachOption) {

      let { handleExit, handleKillSignal, handleRotate } = this._attachOption

      if (handleExit && 
          this.__onExit) {
        Process.off('exit', this.__onExit)
        delete this.__onExit
      }

      if (handleKillSignal) {
  
        handleKillSignal.forEach((signal) => {
          if (this[`__on${signal}`]) {
            Process.off(signal, this[`__on${signal}`])
            delete this[`__on${signal}`]
          }
        })

      }

      if (handleRotate) {

        handleRotate.forEach((signal) => {
          if (this[`__on${signal}`]) {
            Process.off(signal, this[`__on${signal}`])
            delete this[`__on${signal}`]
          }
        })

      }

      delete this._attachOption
        
    } else {
      throw new LogDetachedError()
    }

  }

  rotate() {
    this._destination.rotate()
  }

  createProxy(object) {
    return new Proxy(object, new LogHandler(this))
  }

  onImmediate(immediateFn) {

    return Pino.final(this._pinoLog, (error, pinoLog, ...parameter) => {

      let immediateLog = null
      immediateLog = new this.constructor(this._destination, this._option)
      immediateLog._pinoLog = pinoLog

      let immediateParameter = Is.not.null(error) ? [error, ...parameter] : parameter

      immediateFn(immediateLog, ...immediateParameter)

    })

  }

}

export { Log }
