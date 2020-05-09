import { LogError } from './log-error.js'

class LogDetachedError extends LogError {

  constructor() {
    super('The log is not yet attached.')
  }

}

export { LogDetachedError }
