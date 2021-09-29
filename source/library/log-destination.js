import { FileSystem } from '@virtualpatterns/mablung-file-system'
import { Is } from '@virtualpatterns/mablung-is'
import Path from 'path'
import Pino from 'pino'

const Process = process

class LogDestination {

  constructor(target = Process.stdout.fd) {

    if (Is.string(target)) {
      FileSystem.ensureDirSync(Path.dirname(target))
    }

    this.pinoDestination = this.createPinoDestination(target)

  }

  createPinoDestination(...argument) {
    return Pino.destination(...argument)
  }

  rotate() {
    this.pinoDestination.reopen()
  }

}

export { LogDestination }
