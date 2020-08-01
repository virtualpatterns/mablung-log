import '@virtualpatterns/mablung-source-map-support/install'
import { FileSystem } from '@virtualpatterns/mablung-file-system'
import Path from 'path'

import { ShortFormattedLog } from '../index.js'

async function main() {

  try {

    class Base {

      constructor() {
        this.b = 'instance b'
      }

      doBaseInstance() {
        console.log(this.b)
      }

    }

    class Aristocrat extends Base {

      constructor() {
        super()
        this.a = 'instance a'
      }

      doBaseInstance() {
        super.doBaseInstance()
      }

      doAristocratInstance() {
        console.log(this.a)
      }

      static doAristocratStatic() {
        console.log(this.a)
      }

    }

    Aristocrat.a = 'static a'

    let logPath = 'process/log/aristocrat.log'
    await FileSystem.ensureDir(Path.dirname(logPath))
  
    let log = new ShortFormattedLog(logPath, { 'level': 'trace' })

    let a = new Aristocrat()
    a = log.createProxy(a)

    a.doBaseInstance()
    // a.doAristocratInstance()

  } catch (error) {
    console.error(error)
  }

}

main()