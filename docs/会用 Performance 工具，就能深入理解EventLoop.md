---
title: 会用 Performance 工具，就能深入理解 Event Loop
day: 
link: https://mp.weixin.qq.com/s/22tS74K5JQr1V98Q4DPqJg
---

<CommonTitle></CommonTitle>

通过学习神光大大的文章，我动手实践了一下，来重新认识一下页面渲染的流程是怎么样的？

我们先在`Performance`面板，重新捕捉一下页面的渲染执行情况，点击此按钮

![](https://cdn.jsdelivr.net/gh/Merlin218/image-storage/picGo/202210231633798.png)

大概1s时间即可。

我们看到，最开始是先创建一个请求，获取`index.html`文件

![](https://cdn.jsdelivr.net/gh/Merlin218/image-storage/picGo/202210231635188.png)

当获取到文件之后，获取data中的数据，接下来开始解析`HTML`中的内容。以下为`index.html`文件的源代码。

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <title>Home</title>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width" />
</head>

<body>
  <div>Learn Event Loop</div>
  <script src="./async.js" async></script>
  <script src="./defer.js" defer></script>
  <script>
	  setTimeout(function setTimeoutFunc1() {
	    new Promise(function PromiseResolveFunc(resolve) {
	      console.log('111');
	      resolve('222');
	    }).then(function promiseThenFunc(res) {
	      console.log(res);
	      setTimeout(function setTimeoutFunc2() {
	        console.log('333');
	      });
	    });
	  }, 100);
	
	  function animationFrameFunction() {
	    document.body.style.background = `rgba(${Math.random() * 255},${Math.random() * 255
	      },${Math.random() * 255},.1)`;
	  }
	  function idleCallbackFunc() {
	    console.log('requestIdleCallback')
	  }
	  setInterval(function intervalFunc() {
	    window.requestAnimationFrame(animationFrameFunction);
	    window.requestIdleCallback(idleCallbackFunc)
	  }, 50)
	</script>
</body>


</html>
```

![](https://cdn.jsdelivr.net/gh/Merlin218/image-storage/picGo/202210231642655.png)

我们可以看到，在这个过程中，发送了两次请求，分别对应 `async` 方式请求`async.js`  和 `defer`方式请求`defer.js`。加载这两个文件都不会阻塞渲染，接下来会继续解析并执行`script`标签中的内容。

`js`代码的执行分为两个部分：`Compile Script`编译和最终执行。

注册了两个`Timer`，分别对应`setTimeout`和`setInterval`。

在紧接着呢，解析`image`标签，创建微任务。文档的状态会发生变化，触发`readystatechange`事件，DOM处于`interactive`状态。

> readystatechange事件，在文档状态发生改变时，会触发。有以下几种状态：
> - `loading`：document仍在加载。
> - `interactive`：文档已被解析，"**正在加载**"状态结束，但是诸如图像，样式表和框架之类的子资源仍在加载。
> - `complete`：文档和所有子资源已完成加载。

接着执行微任务，请求图片资源。

![](https://cdn.jsdelivr.net/gh/Merlin218/image-storage/picGo/202210231803891.png)

接着会重新计算样式，进行布局，然后预绘制，绘制，合成图层等。此时以及可以看到界面中的内容。

![](https://cdn.jsdelivr.net/gh/Merlin218/image-storage/picGo/202210231804541.png)


完成之后，会等待`defer`的脚本全部**按顺序**加载并执行完成，知道脚本执行完之后，才会触发`DOMContentLoaded`事件，标记着dom内容加载完毕。

而对于`async`的脚本，即是加载完之后，在完成当前任务之后会进行执行。

我们把代码修改成这样：

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <title>Home</title>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width" />
</head>

<body>
  <div>Learn Event Loop</div>
  <script>
    Promise.resolve().then(() => {
      console.log('promise resolve')
    })
    function inSetYTimeout() {
      console.log('in setTimeout')
    }
    setTimeout(function setTimeoutFunc1() {
      new Promise(function PromiseResolveFunc(resolve) {
        console.log('111');
        resolve('222');
      }).then(function promiseThenFunc(res) {
        console.log(res);
        setTimeout(function setTimeoutFunc2() {
          console.log('333');
        });
      });
      inSetYTimeout();
    });

    function animationFrameFunction() {
      document.body.style.background = `rgba(${Math.random() * 255},${Math.random() * 255
        },${Math.random() * 255},.1)`;
    }
    function idleCallbackFunc() {
      console.log('requestIdleCallback')
    }
    setInterval(function intervalFunc() {
      window.requestAnimationFrame(animationFrameFunction);
      window.requestIdleCallback(idleCallbackFunc)
    }, 50)
    window.addEventListener('load', () => {
      console.log('load')
    })
  </script>
  <script src="https://unpkg.com/vue@3/dist/vue.global.js" defer></script>
  <script src="./async1.js" async></script>
  <script src="./async2.js" async></script>
  <script src="./defer1.js" defer></script>
  <script src="./defer2.js" defer></script>
  <image src="./20220516083713.png" mode="scaleToFill" />
</body>

</html>
```

例如我们通过CDN链接，使用`defer`的方式加载`vue`框架的源码。

![](https://cdn.jsdelivr.net/gh/Merlin218/image-storage/picGo/202210231740114.png)

`DOMContentLoaded`的事件是在vue的`script`文件加载执行完之后的。

![](https://cdn.jsdelivr.net/gh/Merlin218/image-storage/picGo/202210231741769.png)

而如果是使用`async`的方式的话，当vue加载执行完时，`DOMContentLoaded`事件早已触发。

![](https://cdn.jsdelivr.net/gh/Merlin218/image-storage/picGo/202210231743195.png)

![](https://cdn.jsdelivr.net/gh/Merlin218/image-storage/picGo/202210231744547.png)

文档加载完成之后呢，当图片资源接受到时，会重新进行视图的绘制。

![](https://cdn.jsdelivr.net/gh/Merlin218/image-storage/picGo/202210231808267.png)

当资源全部加载完后，会触发`load`事件，标识着整个页面及所有依赖资源如样式表和图片都已完成加载。

![](https://cdn.jsdelivr.net/gh/Merlin218/image-storage/picGo/202210231902132.png)

对于后续的事件循环，宏任务微任务相关api，下面逐个来分析。

- `requestAnimationFrame`

属于宏任务，每16.7ms会执行一次，要求浏览器在下次重绘之前调用指定的回调函数更新动画。该方法需要传入一个回调函数作为参数，该回调函数会在浏览器下一次重绘之前执行。

> 此处通过setInterval来控制50ms注册一次requestAnimationFrame，递归调用则是16.7ms执行一次

![](https://cdn.jsdelivr.net/gh/Merlin218/image-storage/picGo/202210231923875.png)

当回调函数执行之后，会发现还有很多空闲的时间，那么我们可以再这些时间来让浏览器处理一下事情。

- requestIdleCallback

属于宏任务，在浏览器空闲时期被调用。这使开发者能够在主事件循环上执行后台和低优先级工作，而不会影响延迟关键事件，如动画和输入响应。

-   callback 回调，浏览器空余时间执行回调函数。
-   timeout 超时时间。如果浏览器长时间没有空闲，那么回调就不会执行，为了解决这个问题，可以通过 requestIdleCallback 的第二个参数指定一个超时时间。

![](https://cdn.jsdelivr.net/gh/Merlin218/image-storage/picGo/202210231917751.png)

在react中则是使用了这个原理来进行控制React的更新。

- setTimeout(cb, delay, arg1, ...)

属于宏任务，在定时器到期后执行一个函数或指定的一段代码。

![](https://cdn.jsdelivr.net/gh/Merlin218/image-storage/picGo/202210231927976.png)

- promise

属于微任务，会在当前任务完成后执行，导致有点像和宏任务交替执行。

在执行一个任务中的代码时，遇到微任务，会动态添加回调到微任务队列中，在任务执行完后，浏览器会执行所有微任务，清空微任务列表。

如下图，是先注册定时器（即执行同步代码），再`run microtasks`。

![](https://cdn.jsdelivr.net/gh/Merlin218/image-storage/picGo/202210231938440.png)

- setInterval(cb, delay, arg1, ...)

属于宏任务，重复调用一个函数或执行一个代码片段，在每次调用之间具有固定的时间间隔。

- GC垃圾回收

也属于宏任务

## 总结

- 页面第一次渲染时，从上下解析，遇到图片等资源不会阻塞，发起请求，继续渲染下面的内容，当资源请求完成，会重新绘制视图。
- 对于script标签，正常情况下，阻塞渲染，执行脚本；遇到defer或async时，发起请求不阻塞，多个defer脚本按顺序加载执行完后是DOMContentLoaded，async脚本加载完就会安排执行，会阻塞；全部资源加载后是onload
-   rAF 回调和 reflow、repaint 还有渲染构成一个宏任务，每 16.7 ms 执行一次。
-   rAF 回调、rIC 回调、GC、html 中的 script 等都是宏任务
-   在任务执行完后，浏览器会执行所有微任务，也就是 runAllMicroTasks 部分。

由于文章在编写时，可能修改样例代码，导致截图与文字不同步，建议大家自行调试加深理解。

> 参考文章
> [会用 Performance 工具，就能深入理解 Event Loop](https://mp.weixin.qq.com/s/22tS74K5JQr1V98Q4DPqJg)