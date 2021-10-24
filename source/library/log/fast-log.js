
import { FastDestination } from '../destination/fast-destination.js'
import { Log } from '../log.js'

class FastLog extends Log {

  constructor(...argument) {
    super(...argument)
  }

  createFileDestination(...argument) {
    return new FastDestination(...argument)
  }

}

export { FastLog }
