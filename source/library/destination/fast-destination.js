import { Configuration } from '@virtualpatterns/mablung-configuration'
import { Is } from '@virtualpatterns/mablung-is'
import { Process } from '@virtualpatterns/mablung-process'
import Stream from 'sonic-boom'

import { Destination } from '../destination.js'

class FastDestination extends Destination {

  constructor(userPath = Process.stdout.fd, userOption = {}) {
    super(Configuration.merge(userOption, { [Is.string(userPath) ? 'dest' : 'fd']: userPath }))
    this.stream = new Stream(this.option)
    this.rotate = Object.getPrototypeOf(this).rotate.bind(this, userOption)
  }

  get defaultOption() {
    return Configuration.merge(super.defaultOption, {
      'mkdir': false,
      'sync': false
    })
  }

  write(level, data) {
    return this.stream.write(data)
  }

  rotate(...argument) {
    return Is.propertyDefined(this.option, 'dest') ? this.stream.reopen() : super.rotate(...argument)
  }

  close() {
    return Is.propertyDefined(this.option, 'dest') ? this.stream.end() : super.close()
  }

}

export { FastDestination }
