import { Configuration } from '@virtualpatterns/mablung-configuration'

class Destination {

  constructor(userOption = {}) {
    this.option = Configuration.getOption(this.defaultOption, userOption)
    this.rotate = Object.getPrototypeOf(this).rotate.bind(this, userOption)
  }

  get defaultOption() {
    return {}
  }

  write(/* level, data */) {}

  rotate(userOption) {
    this.option = Configuration.getOption(this.defaultOption, userOption)
  }

  close() {}

}

export { Destination }
