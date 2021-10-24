import { Configuration } from '@virtualpatterns/mablung-configuration'
import { DateTime } from 'luxon'
import { Is } from '@virtualpatterns/mablung-is'
import Utility from 'util'

import { Log } from '../log.js'

class FormattedLog extends Log {

  constructor(...argument) {
    super(...argument)
  }

  get defaultOption() {

    return Configuration.merge(super.defaultOption, {
      'inspect': {
        'depth': null,
        'maxArrayLength': null,
        'showHidden': true
      }
    })

  }

  get inspectOption() {
    return this.option.inspect
  }

  formatData(level, data) {

    let string = ''
    string += Utility.format(
      '%s %s %s %s',
      this.formatDateTime(data.date),
      this.formatComputerName(data.host),
      data.pid,
      this.formatLevelName(data.level))

    if (Is.propertyDefined(data, 'message')) {
      string += ` ${Is.array(data.message) ? data.message.join(', ') : data.message}\n`
    } else {
      string += '\n'
    }
    
    // if (Is.propertyDefined(data, 'error')) {
    //   (Is.array(data.error) ? data.error : [ data.error ]).forEach((error) => {
    //     string += `\n${error.stack}\n`
    //   })
    // }

    if (Is.propertyDefined(data, 'data')) {
      (Is.array(data.data) ? data.data : [ data.data ]).forEach((data) => {
        
        switch (true) {
          case data instanceof Error:
            string += `\n${data.stack}\n`
            break
          default:
            string += `\n${this.formatInspect(data)}\n`
        }

      })
    }

    return string
  
  }

  formatDateTime(date) {
    return DateTime.fromJSDate(date).toFormat('yyyy.LL.dd-HH:mm:ss.SSSZZZ')
  }

  formatComputerName(longName) {

    let pattern = /^(.+)\./i
    let match = null

    if (Is.not.null(match = pattern.exec(longName))) {
      let [ , shortName ] = match
      return shortName
    } else {
      return longName
    }

  }
  
  formatLevelName(levelName) {
    return levelName.toUpperCase().padStart(5)
  }

  formatInspect(data) {
    return Utility.inspect(data, this.inspectOption)
  }

}

export { FormattedLog }
