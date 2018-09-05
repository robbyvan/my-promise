class MyPromise {
  constructor(executor) {
    this._resolutionQueue = [];

    executor(this.resolve.bind(this));
  }

  resolve(value) {
    while(this._resolutionQueue.length > 0) {
      let handler = this._resolutionQueue.shift();
      handler(value);
    }
  }

  then(resolutionHandler) {
    this._resolutionQueue.push(resolutionHandler);
  }
}

module.exports = MyPromise;