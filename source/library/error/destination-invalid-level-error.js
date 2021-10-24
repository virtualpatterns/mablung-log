import { DestinationError } from './destination-error.js'

class DestinationInvalidLevelError extends DestinationError {

  constructor(level) {
    super(`The level '${level}' is invalid.`)
  }

}

export { DestinationInvalidLevelError }
