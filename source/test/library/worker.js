import { Is } from '@virtualpatterns/mablung-is'
import { Process } from '@virtualpatterns/mablung-process'

import { Log } from '../../index.js'

import { LogDoesNotExistError } from './error/log-does-not-exist-error.js'
import { LogExistsError } from './error/log-exists-error.js'

let log = null

export function createPidFile(...parameter) {
  // console.log('createPidFile(...parameter) { ... }')
  return Process.createPidFile(...parameter)
}

export function createLog(...parameter) {
  // console.log('createLog(...parameter) { ... }')

  if (Is.null(log)) {
    log = new Log(...parameter)
  } else {
    throw new LogExistsError()
  }

}

export function attach(...parameter) {
  // console.log('attach(...parameter) { ... }')

  if (Is.not.null(log)) {
    return log.attach(...parameter)
  } else {
    throw new LogDoesNotExistError()
  }

}

export function trace(...parameter) {
  // console.log('trace(...parameter) { ... }')

  if (Is.not.null(log)) {
    return log.trace(...parameter)
  } else {
    throw new LogDoesNotExistError()
  }

}

export function detach() {
  // console.log('detach() { ... }')

  if (Is.not.null(log)) {
    return log.detach()
  } else {
    throw new LogDoesNotExistError()
  }

}

export function destroyLog() {
  // console.log('destroyLog() { ... }')

  if (Is.not.null(log)) {
    log = null
  } else {
    throw new LogDoesNotExistError()
  }

}

export function deletePidFile() {
  // console.log('deletePidFile() { ... }')
  return Process.deletePidFile()
}
