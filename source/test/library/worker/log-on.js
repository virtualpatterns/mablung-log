import '@virtualpatterns/mablung-source-map-support/install'
import { WorkerServer } from '@virtualpatterns/mablung-worker'
import Sinon from 'sinon'

import { Log } from '../../../index.js'

const Process = process

class Worker {

  static onRotate() {

    return new Promise((resolve, reject) => {

      let log = new Log({ 'level': 'trace', 'handleRotate': [ 'SIGHUP' ] })

      let onRotateStub = Sinon
        .stub(log, 'onRotate')
        .throws(new Error())

      try {

        let errorStub = Sinon
          .stub(log, 'error')
          .callsFake(function (error) {
            reject(error)
          })

        try {
          Process.emit('SIGHUP')
        } finally {
          errorStub.restore()
        }

      } finally {
        onRotateStub.restore()
      }

    })

  }

  static onBeforeExit() {

    return new Promise((resolve, reject) => {

      let log = new Log({ 'level': 'trace', 'handleExit': true })

      let onBeforeExitStub = Sinon
        .stub(log, 'onBeforeExit')
        .throws(new Error())

      try {

        let errorStub = Sinon
          .stub(log, 'error')
          .callsFake(function (error) {
            reject(error)
          })

        try {
          Process.emit('beforeExit', 0)
        } finally {
          errorStub.restore()
        }

      } finally {
        onBeforeExitStub.restore()
      }

    })

  }

  // static onBeforeExit() {

  //   return new Promise((resolve, reject) => {

  //     let onBeforeExitStub = Sinon
  //       .stub(WorkerServer, 'onBeforeExit')
  //       .throws(new Error())

  //     try {

  //       let errorStub = Sinon
  //         .stub(WorkerServer, 'error')
  //         .callsFake(function (error) {
  //           reject(error)
  //         })

  //       try {
  //         Process.emit('beforeExit', null, null)
  //       } finally {
  //         onErrorStub.restore()
  //       }

  //     } finally {
  //       onBeforeExitStub.restore()
  //     }

  //   })

  // }

}

WorkerServer.start(Worker)
