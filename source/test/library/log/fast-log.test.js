// import { FileSystem } from '@virtualpatterns/mablung-file-system'
// import Path from 'path'
import Test from 'ava'

import { FastLog } from '../../../index.js'

Test('new FastLog(path, option)', async (test) => {

  let logPath = 'process/log/fast-log-constructor.log'
  // await FileSystem.ensureDir(Path.dirname(logPath))

  let log = new FastLog(logPath, { 'level': 'trace' })

  try {
    log.trace({ 'value': { 'value': { 'value': { 'value': {} } } } }, 'trace')  
  } finally {
    // await FileSystem.remove(logPath)
  }

  test.log(`Manually validate '${logPath}'`)
  test.pass()

})

