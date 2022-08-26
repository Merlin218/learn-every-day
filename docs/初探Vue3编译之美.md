---
title: 初探 Vue3 编译之美
day: 3
link: https://mp.weixin.qq.com/s/
---

<CommonTitle></CommonTitle>

> 工具：[Vue3模板编译预览](https://vue-next-template-explorer.netlify.app)

## Vue是如何做编译的？

第一步`parse`：将开发者写的 `template` 模板字符串转换成抽象语法树 `AST`。

> AST 就这里来说就是一个树状结构的 JavaScript 对象，描述了这个模板，这个对象包含了每一个元素的上下文关系。

第二步`optimize`：深度遍历parse流程生成的 AST 树，去`检测它的每一棵子树是不是静态节点`，如果是静态节点表示生成的 DOM 永远不需要改变，这对运行时对模板的更新起到极大的优化作用，提升了运行效率。

第三步`generate`：把优化后的 AST 树转换成可执行的代码，即生成 render code。为后续 vnode生成提供基础。

## Vue3的编译优化

1. 在Vue2中，触发重新渲染的颗粒度是组件级的，也就是说一个组件中的某个响应式的值发生改变时，就会触发整个组件的重新渲染，**内部需要遍历该组件的整个vnode树，造成很多不必要的性能浪费，性能与模板大小正相关**，在Vue2中我们提倡尽可能的把模板组件化，来降低粒度的大小，从而提升性能。

Vue3中则是在编译阶段对静态模板进行分析，生成`Block tree`。

`Block Tree` 是将模板基于`动态节点指令分割`的一个嵌套区块，并且区块内部的节点结构都是固定的，只需要一个`Array`来追踪自身包含的动态结点。

借助 Block tree，Vue.js 将 vnode 更新性能由与模版整体大小相关提升为**与动态内容的数量相关**，这是一个非常大的性能突破。

除此之外，Vue.js 3.0 在编译阶段还包含了对 Slot 的编译优化、事件侦听函数的缓存优化，并且在运行时重写了 diff 算法。

## 如何做到这样子的优化？

### 编译前

`baseCompile`是整个底层核心编译系统的入口，虽然内部逻辑相对比较复杂，但是功能很明确，就是将输入的模板编译成运行时产物`render函数`。再通过执行`render函数`生成`vnode` 。

> baseCompile函数做三件事：
> - 将 template 解析成 AST
> - AST 转换
> - 代码生成

> 为什么不直接将模板转化为vnode
> 因为当状态改变时，需要重新渲染视图，而vnode无法获取最新的状态，这时就需要一个运行时的执行器，使vnode每次都能获得最新的状态，而render函数正好就**是一个可以执行的函数，可以获取到最新的状态**。

创建：template -> render -> vnode(旧) -> DOM
更新：render -> vnode（新） -> 对比旧vnode -> 最小量更新

```html
<div>
  <!-- 这是一段注释 -->
  {{msg}}
  <div>hello, {{msg}}.</div>
  this is text.
</div>
```

```js
const _Vue = Vue

return function render(_ctx, _cache, $props, $setup, $data, $options) {
  with (_ctx) {
    const { createCommentVNode: _createCommentVNode, toDisplayString: _toDisplayString, createElementVNode: _createElementVNode, createTextVNode: _createTextVNode, openBlock: _openBlock, createElementBlock: _createElementBlock } = _Vue

    return (_openBlock(), _createElementBlock("div", null, [
      _createCommentVNode(" 这是一段注释 "),
      _createTextVNode(" " + _toDisplayString(msg) + " ", 1 /* TEXT */),
      _createElementVNode("div", null, "hello, " + _toDisplayString(msg) + ".", 1 /* TEXT */),
      _createTextVNode("\n  this is text.\n")
    ]))
  }
}
```

> 生成的render函数中，为什么要用with进行包裹？
> - with的作用域与模板的作用域刚好契合
> - 编译生成的with可以实现作用域的动态注入

### 解析template到AST

在Vue3我们是支持Fragment语法的，也就是组件可以有多个根节点。

实际上在Vue3中解析后的AST根节点是一个`虚拟结点`，这种情况下也就支持了多结点的写法。

模板：

```html
<div>
  <!-- 这是一段注释 -->
  {{msg}}
  <div>hello, {{msg}}.</div>
  this is text.
</div>
<p>p标签</p>
```

```js
const _Vue = Vue

return function render(_ctx, _cache, $props, $setup, $data, $options) {
  with (_ctx) {
    const { createCommentVNode: _createCommentVNode, toDisplayString: _toDisplayString, createElementVNode: _createElementVNode, createTextVNode: _createTextVNode, Fragment: _Fragment, openBlock: _openBlock, createElementBlock: _createElementBlock } = _Vue
    // Fragment结点
    return (_openBlock(), _createElementBlock(_Fragment, null, [
      _createElementVNode("div", null, [
        _createCommentVNode(" 这是一段注释 "),
        _createTextVNode(" " + _toDisplayString(msg) + " ", 1 /* TEXT */),
        _createElementVNode("div", null, "hello, " + _toDisplayString(msg) + ".", 1 /* TEXT */),
        _createTextVNode("\n  this is text.\n")
      ]),
      _createTextVNode(),
      _createElementVNode("p", null, "p标签")
    ], 64 /* STABLE_FRAGMENT */))
  }
}
```
