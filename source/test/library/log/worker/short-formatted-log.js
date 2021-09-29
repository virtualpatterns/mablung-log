import '@virtualpatterns/mablung-source-map-support/install'

import { WorkerServer } from '@virtualpatterns/mablung-worker'

import { ShortFormattedLog } from '../../../../index.js'

class Worker {

  static log = null

  static createShortFormattedLog(...argument) {
    Worker.log = new ShortFormattedLog(...argument)
  }

  static trace(...argument) {
    return Worker.log.trace(...argument)
  }

}

WorkerServer.start(Worker)
