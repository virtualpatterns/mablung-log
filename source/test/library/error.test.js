import Test from 'ava'

import { LogOptionNotSupportedError } from '../../library/error/log-option-not-supported-error.js'

Test('LogOptionNotSupportedError', (test) => {
  test.throws(() => { throw new LogOptionNotSupportedError() }, { 'instanceOf': LogOptionNotSupportedError })
})
