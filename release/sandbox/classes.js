// import Source from 'source-map-support'

// Source.install({ 'handleUncaughtExceptions': true })

(async () => {

  try {

    class A {

      constructor() {
        this.a = { 'b': 'c' };
      }

      aa() {
        console.log('aa');
        console.dir(this.a);
        A.bb.bind(this)();
      }

      static bb() {
        console.log('bb');
        console.dir(this.a);
        this.cc();
      }

      cc() {
        console.log('cc');
        console.dir(this.a);
      }}



    class B extends A {

      constructor() {
        super();
        this.b = { 'c': 'd' };
      }

      cc() {
        console.log('cc');
        console.dir(this.b);
      }}



    new A().aa();
    new B().aa();

  } catch (error) {
    console.error(error);
  }

})();
//# sourceMappingURL=classes.js.map