class Lock {

  constructor() {
    this._open = true
  }

  get isOpen() {
    
    try {
      return this._open
    } finally {
      this._open = false
    }

  }

}

export { Lock }