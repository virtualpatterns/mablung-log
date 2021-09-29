import '@virtualpatterns/mablung-source-map-support/install'

import { WorkerServer } from '@virtualpatterns/mablung-worker'

import { Log } from '../../../index.js'

class Worker {

  static log = null

  static createLog(...argument) {
    Worker.log = new Log(...argument)
  }

  static trace(...argument) {
    return Worker.log.trace(...argument)
  }

}

WorkerServer.start(Worker)
