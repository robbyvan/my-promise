### ES6的Promise实现
Implement promise in es6 case by case.    
实现一个class: MyPromise(简写MP)

### case 1: executor function is called immediately
解决: 让生成MP时, 让他接受一个executor, 然后立刻执行就好.
```js
class MyPromise {
  constructor(executor) {
    executor();
  }
}
```
