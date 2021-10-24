import '@virtualpatterns/mablung-source-map-support/install'

const Process = process

async function main() {

  try {

    await new Promise(() => {
      throw new Error('hey!')
    })
    Process.exitCode = 1

  } catch (error) {
    console.error('ho!')
    console.error(error)
    Process.exitCode = 1
  }

}

main()