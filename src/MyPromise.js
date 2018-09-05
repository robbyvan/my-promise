class MyPromise {
  constructor(executor) {
    executor();
  }
}

module.exports = MyPromise;