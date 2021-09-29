import Pino from 'pino'

import { LogDestination } from '../log-destination.js'

class FastDestination extends LogDestination {

  constructor(...argument) {
    super(...argument)
  }

  createPinoDestination(path) {
    // return Pino.extreme(...argument)
    return Pino.destination({
      'dest': path,
      'minLength': 4096,
      'sync': false
    })
  }

}

export { FastDestination }
