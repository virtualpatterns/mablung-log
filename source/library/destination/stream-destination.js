import Queue from 'p-queue'

import { Destination } from '../destination.js'
import { Lock } from '../lock.js'

class StreamDestination extends Destination {

  constructor(userStream, ...argument) {
    super(...argument)

    this.stream = userStream
    this.queue = new Queue({
      'autoStart': true,
      'concurrency': 1
    })
     
    this.rotate = Object.getPrototypeOf(this).rotate.bind(this, userStream, ...argument)
    
  }

  write(level, data) {
    return this.queue.add(this._write.bind(this, level, data))
  }

  _write(level, data) {

    if (this.stream.write(data)) {
      return Promise.resolve()
    } else {
      
      return new Promise((resolve) => { // , reject) => {

        let lock = new Lock()

        let onDrain = null
        let onError = null

        this.stream.once('drain', onDrain = () => {

          if (lock.isOpen) {

            this.stream.off('error', onError)

            onDrain = null
            onError = null

            resolve()

          }

        })

        this.stream.once('error', onError = (error) => {

          if (lock.isOpen) {

            this.stream.off('drain', onDrain)

            onDrain = null
            onError = null

            console.error(error)
            
            resolve()

          }

        })

      })

    }

  }

  flush() {
    return this.queue.onIdle()
  }

  rotate(userStream, ...argument) {
    this.stream = userStream
    return super.rotate(...argument)
  }

}

export { StreamDestination }
