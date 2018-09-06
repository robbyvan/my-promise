class MyPromise {
  constructor(executor) {
    this._resolutionQueue = [];

    executor(this.resolve.bind(this));
  }

  resolve(value) {
    while(this._resolutionQueue.length > 0) {
      let resolution = this._resolutionQueue.shift();
      const returnValue = resolution.handler(value);

      if (returnValue && returnValue instanceof MyPromise) {
        returnValue.then(v => {
          resolution.promise.resolve(v);
        });
      } else {
        resolution.promise.resolve(returnValue);
      }

    }
  }

  then(resolutionHandler) {
    const newPromise = new MyPromise(() => {});

    this._resolutionQueue.push({
      handler: resolutionHandler,
      promise: newPromise
    });

    return newPromise;
  }
}

module.exports = MyPromise;