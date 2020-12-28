import { LogError } from './log-error.js';

class LogOptionNotSupportedError extends LogError {

  constructor(name) {
    super(`The option '${name}' is not supported on this platform.`);
  }}



export { LogOptionNotSupportedError };
//# sourceMappingURL=log-option-not-supported-error.js.map