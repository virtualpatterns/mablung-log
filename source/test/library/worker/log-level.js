import '@virtualpatterns/mablung-source-map-support/install'

import { WorkerServer } from '@virtualpatterns/mablung-worker'
import Command from 'commander'

import { Log } from '../../../index.js'

const Process = process

Command
  .option('--path [path]', 'Log path')
  .action((option) => {

    try {
      WorkerServer.start(new Log(option.path, { 'level': 'trace', 'handleExit': true }))
    } catch (error) {
      console.error(error)
      Process.exitCode = 1
    }

  })

Command
  .parse(Process.argv)
