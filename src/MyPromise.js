class MyPromise {
  constructor(executor) {
    this._state = 'pending';

    this._value;
    this._rejectionReason;

    this._resolutionQueue = [];
    this._rejectionQueue = [];

    executor(this.resolve.bind(this), this.reject.bind(this));
  }

  // resolution
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

  // rejection
  _runRejectionHandlers() {
    while(this._rejectionQueue.length > 0) {
      let rejection = this._rejectionQueue.shift();
      const returnValue = rejection.handler(this._rejectionReason);

      if (returnValue && returnValue instanceof MyPromise) {
        returnValue.then(v => {
          rejection.promise.resolve(v);
        });
      } else {
        rejection.promise.resolve(returnValue);
      }
    }
  }

  reject(reason) {
    if (this._state === 'pending') {
      this._state = 'rejected';
      this._rejectionReason = reason;

      this._runRejectionHandlers();
    }
  }

  catch(rejectionHandler) {
    const newPromise = new MyPromise(() => {});

    this._rejectionQueue.push({
      handler: rejectionHandler,
      promise: newPromise
    });

    if (this._state === 'rejected') {
      this._runRejectionHandlers();
    }

    return newPromise;
  }

}

module.exports = MyPromise;