import { Configuration } from '@virtualpatterns/mablung-configuration'
import { FileSystem } from '@virtualpatterns/mablung-file-system'
import { Is } from '@virtualpatterns/mablung-is'
import Stream from 'stream'

import { StreamDestination } from './stream-destination.js'

const Process = process

class FileDestination extends StreamDestination {

  constructor(userPath, ...argument) {
    super(...FileDestination.getSuperConstructorArgument(userPath, ...argument))
    this.rotate = Object.getPrototypeOf(this).rotate.bind(this, userPath, ...argument)
  }

  static getSuperConstructorArgument(...argument) {

    // the defaults
    let stream = Process.stdout
    let option = {}

    switch (argument.length) {
      /* c8 ignore next 4 */
      case 0:
        // stream = default
        // option = default
        break
      case 1:

        switch (true) {
          case argument[0] instanceof Stream.Writable:
            stream = argument[0]
            // option = default
            break
          case Is.string(argument[0]):
            stream = this.createStream(argument[0])
            // option = default
            break
          default:
            // stream = default
            option = argument[0]
        }

        break
      default:

        switch (true) {
          case Is.string(argument[0]):
            stream = this.createStream(argument[0], argument[1])
            option = argument[1]
            break
          default:
            stream = argument[0]
            option = argument[1]
        }

    }

    return [ stream, option ]

  }

  static createStream(path, option = {}) {
    return FileSystem.createWriteStream(path, Configuration.getOption(this.defaultStreamOption, option))
  }

  static get defaultStreamOption() {
    return {
      'autoClose': true,
      'encoding': 'utf8',
      'flags': 'a+'
    }
  }

  async rotate(userPath, ...argument) {
    await this.close()
    return super.rotate(...this.getSuperRotateArgument(userPath, ...argument))
  }

  getSuperRotateArgument(...argument) {
    return FileDestination.getSuperConstructorArgument(...argument)
  }

  async close() {

    await this.flush()

    return new Promise((resolve, reject) => {

      this.stream.close((error) => {

        if (Is.nil(error)) {
          resolve()
        } else {
          reject(error)
        }

      })

    })

  }

}

export { FileDestination }
