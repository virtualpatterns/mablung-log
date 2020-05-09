import { LogError } from './log-error.js'

class LogAttachedError extends LogError {

  constructor() {
    super('The log is already attached.')
  }

}

export { LogAttachedError }
