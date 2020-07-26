import '@virtualpatterns/mablung-source-map-support/install.js'
import { FileSystem } from '@virtualpatterns/mablung-file-system'
import Path from 'path'
import { WorkerClient } from '@virtualpatterns/mablung-worker'

import { ShortFormattedLog } from '../index.js'

async function main() {

  try {

    let logPath0 = 'process/log/worker0.log'
    await FileSystem.ensureDir(Path.dirname(logPath0))
  
    let log = new ShortFormattedLog(logPath0, { 'level': 'trace' })
  
    try {
      
      let logPath1 = 'process/log/worker1.log'
      await FileSystem.ensureDir(Path.dirname(logPath1))
      
      let worker = new WorkerClient()
      worker.writeTo(logPath1)

      worker.on._formatReturnValue = function _formatReturnValue() {
        return [ {}, '' ]
      }

      worker.off._formatReturnValue = function _formatReturnValue() {
        return [ {}, '' ]
      }
  
      worker = log.createProxy(worker)
  
      try {
        console.dir(await worker.module.getPid())
      } finally {
        await worker.exit()
      }
    
    } finally {
      // await FileSystem.remove(logPath0)
    }
  
  } catch (error) {
    console.error(error)
  }
  
  await new Promise((resolve) => setTimeout(resolve, 5000))

}

main()