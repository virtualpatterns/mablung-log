import '@virtualpatterns/mablung-source-map-support/install'

import { WorkerServer } from '@virtualpatterns/mablung-worker'

import { FormattedLog } from '../../../../index.js'

class Worker {

  static log = null

  static createFormattedLog(...argument) {
    Worker.log = new FormattedLog(...argument)
  }

  static trace(...argument) {
    return Worker.log.trace(...argument)
  }

}

WorkerServer.start(Worker)
