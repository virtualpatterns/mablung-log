import { LogError } from '../../../library/error/log-error.js'

class LogDoesNotExistError extends LogError {

  constructor() {
    super('A log does not exist.')
  }

}

export { LogDoesNotExistError }
