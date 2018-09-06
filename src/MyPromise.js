class MyPromise {
  constructor(executor) {
    this._state = 'pending';
    this._value;

    this._resolutionQueue = [];

    executor(this.resolve.bind(this));
  }

  _runResolutionHandlers() {
    while(this._resolutionQueue.length > 0) {
      let resolution = this._resolutionQueue.shift();
      const returnValue = resolution.handler(this._value);

      if (returnValue && returnValue instanceof MyPromise) {
        returnValue.then(v => {
          resolution.promise.resolve(v);
        });
      } else {
        resolution.promise.resolve(returnValue);
      }
    }
  }

  resolve(value) {
    if (this._state === 'pending') {
      this._state = 'resolved';
      this._value = value;

      this._runResolutionHandlers();
    }
  }

  then(resolutionHandler) {
    const newPromise = new MyPromise(() => {});

    this._resolutionQueue.push({
      handler: resolutionHandler,
      promise: newPromise
    });

    if (this._state === 'resolved') {
      this._runResolutionHandlers();
    }

    return newPromise;
  }
}

module.exports = MyPromise;