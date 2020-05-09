import { Configuration } from '@virtualpatterns/mablung-configuration'
import Luxon from 'luxon'
import Utilities from 'util'
import Is from '@pwn/is'

import { Log } from '../log.js'

const { DateTime } = Luxon

const MILLISECONDS_PER_NANOSECOND = 1000000

class FormattedLog extends Log {

  constructor(...parameter) {
    super(...parameter)
  }

  get defaultOption() {

    let defaultOption = { 
      'prettyPrint': { 
        'inspect': { 
          'depth': null, 
          'maxArrayLength': null, 
          'showHidden': true 
        }
      }, 
      'prettifier': this.getPrettifier.bind(this) 
    }

    return Configuration.merge(super.defaultOption, defaultOption)

  }

  getPrettifier(prettifierOption) {
    // return this.format.bind(this, prettifierOption)
    return (function (option, data) { return this.format(data, option) }).bind(this, prettifierOption)
  }

  format(data, option) {

    let string = ''
    string += Utilities.format(
      '%s %s %s %s %s%s',
      this.formatDateTime(data.time),
      this.formatComputerName(data.hostname),
      data.pid,
      this.formatLevelName(data.level),
      data[option.messageKey || 'msg'] || '',
      data.duration ? ` in ${this.formatDuration(data.duration)}` : '')

    if (data.stack) {
      string += `\n\n${data.stack}\n\n`
    } else {

      let _data = Object.assign({}, data)

      delete _data.time
      delete _data.hostname
      delete _data.pid
      delete _data.level
      delete _data[option.messageKey || 'msg']
      delete _data.duration
      delete _data.v

      if (Is.not.emptyObject(_data)) {
        string += `\n\n${this.formatInspect(_data, option.inspect)}\n\n`
      }
      else {
        string += '\n'
      }

    }

    return string
  
  }

  formatDateTime(dateTime) {
    return DateTime.fromMillis(dateTime).toFormat('yyyy.LL.dd-HH:mm:ss.SSSZZZ')
  }

  formatComputerName(longName) {

    let pattern = /^(.+)\./i
    let match = null

    if (Is.not.null(match = pattern.exec(longName))) {
      let [ , shortName ] = match
      return shortName
    }

    return longName

  }
  
  formatLevelName(levelNumber) {
    return this.getLevelName(levelNumber).toUpperCase().padStart(5)
  }

  formatDuration(durationInNanoseconds) {
    return `${durationInNanoseconds / MILLISECONDS_PER_NANOSECOND}ms`
  }

  formatInspect(data, option) {
    return Utilities.inspect(data, option)
  }

}

export { FormattedLog }
