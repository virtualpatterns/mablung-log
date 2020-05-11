import { FileSystem } from '@virtualpatterns/mablung-file-system'
import Path from 'path'
import Test from 'ava'

import { ShortFormattedLog } from '../../../index.js'

Test('new ShortFormattedLog(path, option)', async (test) => {

  let logPath = 'process/log/short-formatted-log-constructor.log'
  await FileSystem.ensureDir(Path.dirname(logPath))

  let log = new ShortFormattedLog(logPath, { 'level': 'trace' })

  try {
    log.trace({ 'value': { 'value': { 'value': { 'value': {} } } } }, 'trace')  
  } finally {
    // await FileSystem.remove(logPath)
  }

  test.log(`Manually validate '${logPath}'`)
  test.pass()

})

