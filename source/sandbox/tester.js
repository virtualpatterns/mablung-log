import '@virtualpatterns/mablung-source-map-support/install'

import { FormattedLog, Log, LogOptionNotSupportedError } from '../index.js'

async function main() {

  try {

    let log = new Log('data/sandbox/tester.log', { 'level': 'trace' })

    // try {

    log.trace('trace this!')
    // log.trace('trace this!', 'trace this!')
    // log.trace(new LogOptionNotSupportedError('You suck!'))
    log.trace(new Error('You suck ...'), new Error('... donkey balls!'))
    // log.trace(1,2,3)

    // log.error(new Error('error this!'))
    // log.info({ 'value': {} }, 'info this!')

    // } finally {
    // log.close()
    // }

  } catch (error) {
    console.error(error)
  }

}

main()
