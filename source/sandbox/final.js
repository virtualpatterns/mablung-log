// import Source from 'source-map-support'

import { FormattedLog, Log } from '../index'

// Source.install({ 'handleUncaughtExceptions': true })

;(async () => {

  try {

    let log = new Log()
    let formattedLog = new FormattedLog()

    // let _log = new (Object.getPrototypeOf(log)).constructor()
    // let _formattedLog = new (Object.getPrototypeOf(formattedLog)).constructor()

    // _log.info('info')
    // _formattedLog.info('info')

    Log.onImmediate(log, (immediateLog, ...parameter) => {
      immediateLog.info({ parameter }, 'Log.onImmediate(log, (immediateLog, ...parameter) => { ... })( ... )')
    })('new Log()')

    Log.onImmediate(formattedLog, (immediateLog, ...parameter) => {
      immediateLog.info({ parameter }, 'Log.onImmediate(log, (immediateLog, ...parameter) => { ... })( ... )')
    })('new FormattedLog()')

    console.log('hey')

  } catch (error) {
    console.error(error)
  }

})()
