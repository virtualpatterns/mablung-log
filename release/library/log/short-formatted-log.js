import { Configuration } from '@virtualpatterns/mablung-configuration';

import { FormattedLog } from './formatted-log.js';

class ShortFormattedLog extends FormattedLog {

  constructor(...parameter) {
    super(...parameter);
  }

  get defaultOption() {

    let defaultOption = {
      'prettyPrint': {
        'inspect': {
          'depth': 1,
          'maxArrayLength': 5,
          'showHidden': false } } };




    return Configuration.merge(super.defaultOption, defaultOption);

  }}



export { ShortFormattedLog };
//# sourceMappingURL=short-formatted-log.js.map