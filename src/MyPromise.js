class MyPromise {
  constructor(executor) {
    this._state = 'pending';

    this._value;
    this._rejectionReason;

    this._resolutionQueue = [];
    this._rejectionQueue = [];

    try {
      executor(this.resolve.bind(this), this.reject.bind(this));
    } catch(e) {
      this.reject(e);
    }
  }

  // resolution
  _runResolutionHandlers() {
    while(this._resolutionQueue.length > 0) {
      const resolution = this._resolutionQueue.shift();

      let returnValue;
      try {
        returnValue = resolution.handler(this._value)
      } catch(e) {
        resolution.promise.reject(e);
      }

      if (returnValue && returnValue instanceof MyPromise) {
        returnValue
          .then(v => {
            resolution.promise.resolve(v);
          })
          .catch(e => {
            resolution.promise.reject(e);
          })
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

  then(resolutionHandler, rejectionHandler) {
    const newPromise = new MyPromise(() => {});

    this._resolutionQueue.push({
      handler: resolutionHandler,
      promise: newPromise
    });

    if (typeof rejectionHandler === 'function') {
      this._rejectionQueue.push({
        handler: rejectionHandler,
        promise: newPromise
      });
    }

    if (this._state === 'resolved') {
      this._runResolutionHandlers();
    }

    if (this._state === 'rejected') {
      newPromise.reject(this._rejectionReason);
    }

    return newPromise;
  }

  // rejection
  _runRejectionHandlers() {
    while(this._rejectionQueue.length > 0) {
      const rejection = this._rejectionQueue.shift();

      let returnValue;
      try {
        returnValue = rejection.handler(this._rejectionReason)
      } catch(e) {
        rejection.promise.reject(e);
      }

      if (returnValue && returnValue instanceof MyPromise) {
        returnValue
        .then(v => {
          rejection.promise.resolve(v);
        })
        .catch(e => {
          rejection.promise.reject(e);
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

      while (this._resolutionQueue.length > 0) {
        const resolution = this._resolutionQueue.shift();
        resolution.promise.reject(this._rejectionReason);
      }
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