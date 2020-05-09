import { FastDestination } from './fast-destination.js'
import { Log } from '../log.js'

class FastLog extends Log {

  constructor(...parameter) {
    super(...parameter)
  }

  createDestination(...parameter) {
    return new FastDestination(...parameter)
  }
  
}

export { FastLog }
