import { FastDestination } from './fast-destination.js'
import { Log } from '../log.js'

class FastLog extends Log {

  constructor(...argument) {
    super(...argument)
  }

  createDestination(...argument) {
    return new FastDestination(...argument)
  }
  
}

export { FastLog }
