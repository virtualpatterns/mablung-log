import { LogError } from '../../../library/error/log-error.js';

class LogExistsError extends LogError {

  constructor() {
    super('A log already exists.');
  }}



export { LogExistsError };
//# sourceMappingURL=log-exists-error.js.map