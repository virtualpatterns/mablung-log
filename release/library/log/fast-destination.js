import Pino from 'pino';

import { LogDestination } from '../log-destination.js';

class FastDestination extends LogDestination {

  constructor(...parameter) {
    super(...parameter);
  }

  _createPinoDestination(...parameter) {
    return Pino.extreme(...parameter);
  }}



export { FastDestination };
//# sourceMappingURL=fast-destination.js.map