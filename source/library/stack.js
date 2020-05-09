class Stack extends Array {

  constructor(...parameter) {
    super(...parameter)
  }

  push(element) {
    super.unshift(element)
  }

  peek(index = Stack.FIRST) {
    return this[index < 0 ? this.length - 1 : index]
  }

  pop() {
    return super.shift()
  }

}

Stack.FIRST = 0
Stack.LAST = -1

export { Stack }