import { Configuration } from '@virtualpatterns/mablung-configuration'

import { FormattedLog } from './formatted-log.js'

class ShortFormattedLog extends FormattedLog {

  constructor(...argument) {
    super(...argument)
  }

  get defaultOption() {

    return Configuration.merge(super.defaultOption, {
      'inspect': {
        'depth': 1,
        'maxArrayLength': 5,
        'showHidden': false
      }
    })
    
  }

}

export { ShortFormattedLog }
