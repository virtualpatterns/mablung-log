import '@virtualpatterns/mablung-source-map-support/install'

class Poo {

  constructor() {
    this.poo = 42
  }

  pooper(value) {
    this.poo = value
  }

}

async function main() {

  try {

    let p = new Poo()
    p.pooper(12)

    console.log(p.poo)

  } catch (error) {
    console.error(error)
  }

}

main()