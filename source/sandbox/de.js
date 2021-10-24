import '@virtualpatterns/mablung-source-map-support/install'
import { FileSystem } from '@virtualpatterns/mablung-file-system'

import { FileDestination } from '../index.js'

async function main() {

  try {

    // let stream = FileSystem.createWriteStream('data/sandbox/de.log', {
    //   'autoClose': false,
    //   'emitClose': true,
    //   'encoding': 'utf8',
    //   'flags': 'a+'
    // })

    let d = new FileDestination('data/sandbox/de.log', { 'a': 'b' })

    try {

      console.dir(d.option)
      await d.rotate()
      console.dir(d.option)

    } finally {
      await d.close()
    }

    // let d = new FileDestination({ 'a': 'b' }) // 'data/sandbox/de.log', { 'a': 'b' })

    // try {
    //   // await d.write('trace', 'before')
    //   // await d.write('trace', 'after')
    // } finally {
    //   await d.close()
    // }

  } catch (error) {
    console.error(error)
  }

}

main()