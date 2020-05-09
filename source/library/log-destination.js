import Pino from 'pino'

const Process = process

class LogDestination {

  constructor(target = Process.stdout.fd) {
    this._pinoDestination = this._createPinoDestination(target)
  }

  _createPinoDestination(...parameter) {
    return Pino.destination(...parameter)
  }

  get pinoDestination() {
    return this._pinoDestination
  }

  rotate() {
    this._pinoDestination.reopen()
  }

}

export { LogDestination }
