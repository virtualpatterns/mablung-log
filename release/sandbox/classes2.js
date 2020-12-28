// import Source from 'source-map-support'

// Source.install({ 'handleUncaughtExceptions': true })

(async () => {

  function Boogie() {}

  try {

    const resourcePrototype = Object.create({});

    const Resource = Object.create({});

    Resource.createResource = function Resource(prototype = resourcePrototype) {
      return Object.create(prototype);
    };

    resourcePrototype.constructor = Resource.createResource;
    // resourcePrototype.constructor.name = 'Resource'

    let resource = Resource.createResource();

    class Base {
      comstructor() {}}


    let base = new Base();

    let boog = new Boogie();

    console.log('Hey!');

  } catch (error) {
    console.error(error);
  }

})();
//# sourceMappingURL=classes2.js.map