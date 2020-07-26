import { FileSystem } from '@virtualpatterns/mablung-file-system';
import Is from '@pwn/is';
import Path from 'path';
import Pino from 'pino';

const Process = process;

class LogDestination {

  constructor(target = Process.stdout.fd) {

    if (Is.string(target)) {
      FileSystem.ensureDirSync(Path.dirname(target));
    }

    this._pinoDestination = this._createPinoDestination(target);

  }

  _createPinoDestination(...parameter) {
    return Pino.destination(...parameter);
  }

  get pinoDestination() {
    return this._pinoDestination;
  }

  rotate() {
    this._pinoDestination.reopen();
  }}



export { LogDestination };
//# sourceMappingURL=log-destination.js.map