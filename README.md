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
// "solution"

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