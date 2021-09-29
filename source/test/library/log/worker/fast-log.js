import '@virtualpatterns/mablung-source-map-support/install'

import { WorkerServer } from '@virtualpatterns/mablung-worker'

import { FastLog } from '../../../../index.js'

class Worker {

  static log = null

  static createFastLog(...argument) {
    Worker.log = new FastLog(...argument)
  }

  static trace(...argument) {
    return Worker.log.trace(...argument)
  }

}

WorkerServer.start(Worker)
