import '@virtualpatterns/mablung-source-map-support/install'

const Process = process

function doIt() {
  return new Promise((resolve, reject) => setTimeout(() => reject(new Error('you suck!')), 5000))
}

Process.once('beforeExit', async (code) => {
  console.log(`beforeExit code=${code}`)

  try {
    await  doIt() // new Promise((resolve, reject) => setTimeout(() => reject(new Error('you suck!')), 5000))
  } catch (error) {
    await new Promise((resolve, reject) => setTimeout(() => {
      console.log(error)
      resolve()
    }, 5000))
  }

  // setTimeout(() => {
  //   console.log('beforeExit timeout')
  // }, 5000)

})

Process.once('exit', (code) => {
  console.log(`exit code=${code}`)
})

async function main() {

  try {

    console.log('done')
    Process.exitCode = 1

  } catch (error) {
    console.error(error)
    Process.exitCode = 1
  }

}

main()