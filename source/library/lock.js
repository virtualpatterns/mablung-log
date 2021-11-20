class Lock {

  constructor() {
    this.open = true
  }

  get isOpen() {
    
    try {
      return this.open
    } finally {
      this.open = false
    }

  }

}

export { Lock }