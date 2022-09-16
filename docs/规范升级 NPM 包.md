---
title: 规范升级 NPM 包
day: 5
link: https://mp.weixin.qq.com/s/FjU7wj9nRuzlx1O94LB5Wg
---


# 规范升级 NPM 包

## 版本号规则

语义化版本表示：X.Y.Z

- X：表示大版本号
	- 颠覆性更改
	- 递增时，次版本号和修订号必须归零
- Y：次版本号，小版本号
	- 新增向下兼容的功能
	- 递增时，修订号必须归零
- Z：修订号
	- 修复向下兼容的bug

## 版本号匹配

- 直接使用版本号
	- 只匹配对应版本
- `^`匹配：不能修改最左侧非零数字
	- `^2.3.1`：大于等于2.3.1，小于3.0.0
	- `^0.3.1`：大于等于0.3.1，小于0.4.0
	- `^0.0.1`：大于等于0.0.1，小于0.0.2
- `~`匹配：版本号列出 Y 时兼容 Z 的修改。列出 X 时兼容 Y、Z。
	- `~2`：大于等于2.0.0小于3.0.0
	- `~2.3.1`：大于2.3.1小于2.4.0
- `*、X、x`，空：表示可以匹配任何版本
	- `"2.3.X"、"2.3.x"、"2.3*"、"2.3"`：大于等于 2.3.0 小于 2.4.0
	- `"2.X"、"2.x"、"2.*"、"2"`：大于等于2.0.0 小于 3.0.0
	- `*、X、x，空`：任意版本

## 先行版本
- `alpha`：预览版；一般不对外发布，存在bug，不稳定，内部测试人员使用。
- `beta`：测试版；公开测试版，会一直加入功能
- `rc`：最终测试版本，一般未出现问题会作为正式版。

## 先行版本升级规则
- 如果包只是对现有的问题进行修复，那么只需要对 Z 进行加 1，然后添加延伸。
- 如果包本次是做**向下兼容**的功能性新增，那么需要对 Y 进行加 1，Z 清零，然后添加延伸。
- 如果包本次的升级是**无法向下兼容**的，那么就需要对 X 进行加 1，Y、Z 清零，然后添加延伸。

如果在加了延伸的版本上需要进行 bugfix 时，只需要将我们延伸的版本继续增加即可。**当 bugfix 结束，需要发布正式版本时，只需要去掉延伸版本，发布版本即可。**

## 什么时候需要使用先行版本

> npm 的 tag 到底有什么用呢？
> 
> 其实 tag 就相当于是 **git 的分支管理中的标签**，不同的 tag 之间的包互不影响。**可以使我们发布先行版本时不影响正式版本**

一般常用的有三种类型的 tag：

-   latest：最后的稳定版，**npm install 时就是下载的这个**
-   beta：测试版本，需要指定版本或者使用 `npm install packageName@beta`  来下载。例如：1.0.0-beta.0
-   next：先行版本，使用 `npm install packageName@next` 安装

想象这个场景：

项目P引用了项目A，项目A在前一天改动了，但是存在bug，却发布了正式版，没有使用先行版。导致当项目P在当天发布上线时，因为安装了最新的正式版的包，导致出现bug。

## 如何发布包

1. 修改`package.json`中的`version`

![](https://cdn.jsdelivr.net/gh/Merlin218/image-storage/picGo/202209160931480.png)

这种方式需要我们自己手动执行 `git commit -am 'XXXX'` 提交代码，如果需要在此版本的 git 仓库打上 tag 时，需要我们自己手动触发`git tag v2.3.2-beta.1` ，`git push origin v2.3.2-beta.1` 。

2. 借助`npm version`

A包中所有的改动都commit后，可以根据一下命令更新版本。

```bash
npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease | from-git]  
// newversion：指定更新的版本号  
// major：大版本并且不向下兼容时，使用 major  
// minor：有新功能且向下兼容时，使用 minor  
// patch：修复一些问题、优化等，使用 patch  
// 以 A：2.3.1 为例  
npm version premajor // 版本号会成为 3.0.0-0，即 3.0.0 的预发版本  
npm version preminor // 版本号为成为 2.4.0-0，即 2.4.0 的预发版本  
npm version prepatch // 版本号成为 2.3.2-0，即 2.3.2 的预发版本  
/**  
* 版本号会成为 2.3.2-0。  
* 执行此命令时，如果没有预发布版本号，则增加 Z，增加预发布号为 0  
* 如果有预发步号，增加预发步号  
*/  
npm version prerelease
```

根据上边的 API 可以看到我们能通过 `npm version 2.3.2-beta.1` 将 A 的版本升为 2.3.2-beta.1 的形式。

除此之外，在 `npm 6.4.0` 之后，我们也可以使用 `--preid` 参数来添加前缀：

```bash
npm version prerelease --preid=beta
```

**此种方式需要注意，必须要 commit 本地的修改之后才可以执行。**

`npm version` 修改版本号，会默认执行 `git add` -> `git commit` -> `git tag` 操作，此时的版本号看起来有 beta。但是这个beta是git仓库的tag，并不是npm的tag，如果不想默认给git添加tag。可以使用一下命令。

```bash
npm --no-git-tag-version version xxx
```

### npm version过程

![](https://cdn.jsdelivr.net/gh/Merlin218/image-storage/picGo/202209161017844.png)

执行完 `npm version 2.3.2-beta.1` 之后，**如果直接使用 `npm publish` 来发布的话，发布出来的包的 tag 是 latest**，但是我们其实是想发布一个测试包。如果其他人 `npm i` 下载时就会下载 version 为 2.3.2-beta.1 的包。

只有使用 `npm publish --tag XXX` 才是给 npm 包上打了 tag 标签。

也可以使用`npm dist-tag add <pkg>@2.3.2-beta.1 <tag>`来补加tag。

当需要删除多余的 tag 时：`npm dist-tag rm <pkg> <tag>`

一条指令完成beta版本的发布：

```json
"scripts": {  
    "publish:beta": npm version prerelease --preid=beta && npm run build && npm publish --tag=beta"  
 },
```

