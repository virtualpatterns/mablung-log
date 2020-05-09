import Is from '@pwn/is';
import Stream from 'stream';

import { LogDestination } from './log-destination.js';

class LogParameter {

  static getConstructorParameter(log, ...parameter) {

    // the defaults
    let _destination = log.createDestination();
    let _option = {};

    switch (parameter.length) {
      case 0:
        // _destination = default
        // _option = default
        break;
      case 1:

        switch (true) {
          case parameter[0] instanceof LogDestination:
          case parameter[0] instanceof Stream.Writable:
            _destination = parameter[0];
            // _option = default
            break;
          case Is.string(parameter[0]):
            _destination = log.createDestination(parameter[0]);
            // _option = default
            break;
          default:
            // _destination = default
            _option = parameter[0];}


        break;
      default:

        switch (true) {
          case parameter[0] instanceof LogDestination:
          case parameter[0] instanceof Stream.Writable:
            _destination = parameter[0];
            _option = parameter[1];
            break;
          case Is.string(parameter[0]):
            _destination = log.createDestination(parameter[0]);
            _option = parameter[1];
            break;
          default:
            _destination = parameter[0];
            _option = parameter[1];}}




    return [_destination, _option];

  }}



export { LogParameter };
//# sourceMappingURL=log-parameter.js.map