---
title: 学会这10+个JavaScript 单行代码，让你的代码更优雅
day: 1
link: https://mp.weixin.qq.com/s/ST4we1SBCjP_W-LT-k0Jag
---

# Day {{ $frontmatter.day }} 

# {{ $frontmatter.title }}

> 原文链接: <a :href=$frontmatter.link>{{ $frontmatter.title }}</a>

## 数组去重

通过原生Set进行数据处理，再转化为数组。

```js
const uniqueArr = arr => [...new Set(arr)];
```

## 从url获取参数并转化为对象

先对由`encodedURI`处理过的路径进行解析，通过`?`截取后半段，将`"`转译为`\\"`,将`&`转化为`","`,将`=`转化为`":"`，前后再拼接上`{"`和`"}`，最后通过`JSON.parse`方法进行JSON解析。

```js
// https://xxx?params=1&params2=2
// ----------> {"params":1,"params":2}
const getParams = url => JSON.parse(`{"${decodeURI(url.split("?")[1]).replace(/"/g, '\\"').replace(/&/g,'","').replace(/=/g, '":"')}"}`)

console.log(getParams("https://www.google.com.hk/search?q=js+md&newwindow=1"))
// {q: 'js+md', newwindow: '1'}
```

## 检查对象是否为空

> 不能直接比较 `obj === {}`

通过`Reflect.ownKeys`来获取所有自身可枚举属性的集合，判断长度是否为0，且该对象的`constructor`为 `Object`。

```js
const isEmpty = obj => Reflect.ownKeys(obj).length === 0 && obj.constructor === Object;
```

## 反转字符串

转化为数组，再反转，再拼接。

```js
const reserveStr = str => str.split('').reserve().join('');
```

## 随机生成十六进制

先生产随机数，之后乘以`0xffffff`，取整，再格式化为十六进制字符串，如果位数不够，再后面进行补`0`处理。

```js
const randomHexColor = () => `#${Math.floor(Math.random() * 0xffffff).toString(16).padEnd(6,'0')}`
```

## 检测当前页面是否在前台

```js
const isTabActive = () => !document.hidden;
```

## 检测元素是否处于焦点

```js
const elementIsInFocus = (el) => (el === document.activeElement);
```

## 检查设备类型

> Navigator 接口表示用户代理的状态和标识。可以使用只读的 window.navigator 属性检索 navigator 对象。

> 正则匹配模式：i，忽略大小写

```js
const judgeDeviceType = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|OperaMini/i.test(navigator.userAgent) ? 'Mobile' : 'PC';
```

## 文字复制到剪贴板

`Clipboard API` 它的所有操作都是异步的，返回 `Promise` 对象，不会造成页面卡顿。而且，它可以将任意内容（比如图片）放入剪贴板。

```js
const copyText = () => async (text) => await navigator.clipbroad.writeText(text);
```

## 选取选定文本

```js
const getSelectedText = () => window.getSelection().toString();
```

## 查询某一天是否是工作日

> 注意：new Date(year, monthIndex, day) : 1-12月monthIndex分别是0-11

> `Date.prototype.getDay()`: 根据本地时间，返回一个 0 到 6 之间的整数值，代表星期几： 0 代表星期日， 1 代表星期一，2 代表星期二， 依次类推。

```js
const isWeekday = (date) => date.getDay() % 6 !== 0;

// 判断今天是不是工作日
isWeekday(new Date(Date.now()))
```

## 转化华氏度/摄氏度

- 将华氏温度转换为摄氏温度
```js
const fahrenheitToCelsius = (fahrenheit) => (fahrenheit - 32) * 5 / 9;

fahrenheitToCelsius(50); // 10
```

- 将摄氏温度转华氏温度
```js
const celsiusToFahrenheit = (celsius) => celsius * 9 / 5 + 32;

celsiusToFahrenheit(100)
// 212
```

## 两日期相差的天数

取得两个日期的时间戳的差值，除以进制数(`1000 * 60 * 60 *24`)，向上取整得到。

```js
const dayDiff = (date1, date2) => Math.ceil(Math.abs(date1.getTime() - date2.getTime()) / 86400000);

dayDiff(new Date("2021-10-21"), new Date("2022-02-12"))
// Result: 114
```

## 将RGB转化为十六进制

先将十进制的三个数相加成一个最多有24位的二进制数，在转化为十六进制字符串，可能结果不足6位，还需要在前头补0。

```js
const rgbToHex = (r, g, b) => `#${((r << 8 * 2) + (g << 8) + b).toString(16).padStart(6, '0')}`
```

## 计算数组的平均值

```js
const average = arr => arr.reduce((a, b) => a + b) / arr.length;
```
