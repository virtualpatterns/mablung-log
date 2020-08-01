import '@virtualpatterns/mablung-source-map-support/install'
import { Is } from '@virtualpatterns/mablung-is'

async function main() {

  try {

    let f = async () => {}

    console.log(Is.function(f))
    console.dir(typeof f)

  } catch (error) {
    console.error(error)
  }

}

main()