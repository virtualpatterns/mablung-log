import '@virtualpatterns/mablung-source-map-support/install'

import { Log } from '@virtualpatterns/mablung-log'
import { WorkerServer } from '@virtualpatterns/mablung-worker'
// import Sinon from 'sinon'

class Worker {

  // static stubIsWindows() {
  //   Worker.IsWindowsStub = Sinon
  //     .stub(Is.not, 'windows')
  //     .returns(false)
  // }

  static openLog(...argument) {
    Worker.Log = new Log(...argument)
  }

  static trace(...argument) {
    return Worker.Log.trace(...argument)
  }

  static async closeLog() {
    await Worker.Log.close()
    delete Worker.Log
  }

  // static restoreIsWindows() {
  //   Worker.IsWindowsStub.restore()
  //   delete Worker.IsWindowsStub
  // }

}

WorkerServer.start(Worker)
