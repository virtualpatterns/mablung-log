import { Configuration } from '@virtualpatterns/mablung-configuration'
import { DateTime } from 'luxon'
import { Is } from '@virtualpatterns/mablung-is'
import Clone from 'clone'
import Utility from 'util'

import { Log } from '../log.js'

const MILLISECONDS_PER_NANOSECOND = 1000000

class FormattedLog extends Log {

  constructor(...argument) {
    super(...argument)
  }

  get defaultOption() {

    return Configuration.merge(super.defaultOption, {
      'prettyPrint': {
        'inspect': {
          'depth': null,
          'maxArrayLength': null,
          'showHidden': true
        },
        'nestedKey': super.defaultOption.nestedKey
      },
      'prettifier': this.getPrettifier.bind(this)
    })

  }

  getPrettifier(prettifierOption) {
    return (function (option, data) { return this.format(data, option) }).bind(this, prettifierOption)
  }

  format(data, option) {

    let nestedData = null

    if (option.nestedKey) {
      nestedData = data[option.nestedKey] || {}
    } else {

      nestedData = Clone(data)

      delete nestedData.time
      delete nestedData.hostname
      delete nestedData.pid
      delete nestedData.level
      delete nestedData[option.messageKey || 'msg']
      delete nestedData.v

    }

    let string = ''
    string += Utility.format(
      '%s %s %s %s %s%s',
      this.formatDateTime(data.time),
      this.formatComputerName(data.hostname),
      data.pid,
      this.formatLevelName(data.level),
      data[option.messageKey || 'msg'] || nestedData.message || '',
      nestedData.duration ? ` in ${this.formatDuration(nestedData.duration)}` : '')

    if (nestedData.stack) {
      string += `\n\n${nestedData.stack}\n\n`
    } else {
      
      delete nestedData.duration

      if (Is.not.emptyObject(nestedData)) {
        string += `\n\n${this.formatInspect(nestedData, option.inspect)}\n\n`
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
    return Utility.inspect(data, option)
  }

}

export { FormattedLog }
