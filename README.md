### ES6的Promise实现
Implement promise in es6 case by case.    
实现一个class: MyPromise(简写MP)

### case 1: executor function is called immediately.
说明: executor需要立即执行.

```js
// test case

new MyPromise(function () {
    string = 'foo';
});
```

Solution
+ 在生成MP时, 让他接受一个executor, 然后立刻执行就好.
```js
// solution

class MyPromise {
  constructor(executor) {
    executor();
  }
}
```


### case 2: resolution handler is called when promise is resolved.

说明: 当executor resolve(可以理解为异步有了结果, 可以开始"解决(resolve)", 即调用resolve方法)时, resolution handler需要被调用. (then中的函数称resolution handler, 即用来对结果进行"解决(resolve)").

```js
// test case

var promise = new MyPromise(function (resolve) {
    setTimeout(function () {
        resolve(testString);
    }, 100);
});

promise.then(function (string) {
    t.equal(string, testString);
    t.end();
});
```

Solution:
+ 添加then方法, 接收resolutionHandler, 保存到resolutionQueue当中.
+ 添加resolve方法, 接收"结果", 被调用时对"结果"执行resolutionHandler.
+ 为executor提供resolve方法. executor在适当时机得到"结果"并"解决"// resolve(value).

```js
// solution

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
```

### case 3: promise supports many resolution handlers.
说明: promise支持多个resolution handler.
```js
// test case
var testString = 'foo';

var promise = new MyPromise(function (resolve) {
    setTimeout(function () {
        resolve(testString);
    }, 100);
});

promise.then(function (string) {
    t.equal(string, testString);
});

promise.then(function (string) {
    t.equal(string, testString);
    t.end();
});
```

Solution: 为了支持多个resolution handler, 所以在case 2中就先采用了一个queue来保存, 以支持多个then中的resolution handler.所以这里case 3在case 2中就已经实现了.


### case 4: resolution handlers can be chained.
说明: MP需要支持多个resolution handler被chain起来, 所以继续改造来支持then被链式调用.
```js
 var testString = 'foo';

var promise = new MyPromise(function (resolve) {
    setTimeout(function () {
        resolve();
    }, 100);
});

promise.then(function () {

    return new MyPromise(function (resolve) {
        setTimeout(function () {
            resolve(testString);
        }, 100);
    });

}).then(function (string) {
    t.equal(string, testString);
    t.end();
});
```
在test case中, 期望的流程是
1. promise的executor执行setTimeout
2. 在100ms后调用了promise的"解决", 即resolve(), 然后开始执行第一个then中的"解决"
3. 这里第一个then中返回了一个新的promise, 执行这个新promise的executor
4. 新promise有了"结果"testString, 调用resolve, 去第二个then中"解决"testString
5. 执行第二个then.
   
Solution: 为了满足期望的顺序, 应该
1. then需要返回一个promise类型, 用来支持链式调用then. 所以这里在then中new一个新的MP并返回.
2. 
  + 在执行resolve中的resolution handler时, 对其返回值进行检查
    - 如果```[当前then]```中的resolution handler被resolve后, 又```[返回了一个promise]```, 那么就需要把```[下一个then]```当中的resolution handler, 通过这个```[返回的promise]```来调用 (这里保证了按顺序chain). 
    - 也就是说, 把```[下一个then]```中的resolution handler放在```[返回promise]```的then之中(等返回promise有了结果再执行"后续handler").
    - 而这时的"后续handler", 正是之前push到queue中的东西.
    - 所以总结来说, ```[返回promise]的then中```应该[拿到"结果"]并把用"后续handler"自己的resolve去"解决"这个"结果"(每个handler和自己的resolve是一一对应的).

![](./illustrations/case4_1.jpeg)
![](./illustrations/case4_2.jpeg)
![](./illustrations/case4_3.png)

```js
// solution

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
```
