
import { Destination } from '../destination.js'

import { DestinationInvalidLevelError } from '../error/destination-invalid-level-error.js'

class ConsoleDestination extends Destination {

  constructor(userConsole = console, ...argument) {
    super(...argument)
    this.console = userConsole
  }
  
  write(level, data) {

    switch (level) {
      // case 'trace':
      //   this.console.trace(data)
      //   break
      case 'log':
        return this.console.log(data)
      case 'trace':
      case 'debug':
        return this.console.debug(data)
      case 'info':
        return this.console.info(data)
      case 'warn':
        return this.console.warn(data)
      case 'error':
      case 'fatal':
        return this.console.error(data)
      default:
        throw new DestinationInvalidLevelError(level)
    }

  }

}

export { ConsoleDestination }
