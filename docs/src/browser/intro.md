---
title: 浏览器原理
date: 2022-07-13
tags:
 - Browser
categories: 
 - FrontEnd
sidebar: 'auto'
---
javascript可以在node环境里运行 （js v8引擎）

输入url后、dns、ip地址、服务器、index.html文件、遇到link标签css文件xxx.css、遇到script变迁JavaScript文件xxx.js，下载完毕js代码到浏览器里面，浏览器开始帮助执行js代码

核心问题：**JavaScript代码，在浏览器中如何被执行？**

## **浏览器内核**

常见浏览器内核：

- Gecko：目前使用很少；
- Trident：微软开发，IE使用，但是Edge浏览器没用，而转为Blink；
- WebKit：苹果开发，Safari使用，Chrome浏览器之前也用；
- Blink：是WebKit的一个分支，Google开发，目前用于Chrome、Edge、Opera等；

浏览器内核的概念：浏览器的排版引擎（layout engine），也称为浏览器引擎（browser engine），页面渲染引擎（rendering engine）或样板引擎；

## 浏览器渲染过程

HTML解析的时候遇到JS标签，该怎么办？

html一般是第一个被下载下来的；

index.html中很多标签，去解析，浏览器内核帮助解析，利用parser将html转成对应dom树；

对于dom tree可以利用js代码做相关操作，谁来执行这个操作？js引擎来做；

浏览器缓存

- 强缓存：本地缓存未过期，直接读取本地缓存，无须发起HTTP请求；
  - 此时状态为：200 from cache；
  - 判断缓存是否过期失效的方法：
    - 现在：头部的cache-control字段的max-age属性值规定的过期时长；【更准确而且安全】
    - 以前：使用expires标识的服务器过期时间判断
- 协商缓存：浏览器向服务器发起HTTP请求，来判断浏览器本地缓存的文件是否仍未修改；
  - 若未修改，则从缓存中读取，此时状态码为：304；
  - 判断所访问的数据是否发生更改：
    - 现在：判断浏览器头部if-none-match与服务器的e-tag是否匹配；
    - 以前：HTTP1.0版本通过last-modified判断上次文件修改时间

## JavaScript引擎

==**为什么需要JavaScript引擎呢？**==

- **高级的编程语言**都需要转成**最终的机器指令来执行**的；
- JavaScript无论交给**浏览器或Node执行**，最后都是需要被**CPU执行**的；
- 但是CPU只认识自己的指令集，实际上是机器语言，才能被CUP执行；
- 所以需要**JavaScript引擎**帮助我们将**JavaScript代码**翻译成**CPU指令**来执行；

常见的JavaScript引擎：

- SpiderMonkey：第一款JavaScript引擎，由JavaScript作者Brendan Eich开发；
- Chakra：微软开发，用于IE浏览器；
- JavaScriptCore：WebKit的JavaScript引擎，Apple开发；
- V8：Google开发的强大的JavaScript引擎，帮助Chrome脱颖而出；

==**浏览器内核和JavaScript引擎的关系**==

先WebKit为例，WebKit实际上由两个部分组成：

- WebCore：负责HTML解析、布局、渲染等相关工作；
- JavaScriptCore：解析、执行JavaScript代码；
- 举例：小程序
  - 在小程序中编写的JavaScript代码就是被JSCore执行的；
  - 渲染层WebView；
  - 逻辑层JsCore；

## V8的解析与预解析

**V8执行的细节**

1. Blink将源码交给V8引擎；
2. Stream获取到源码并且进行编码转换；
3. Scanner会进行词法分析「lexical analysis」，词法分析会将代码转换成tokens；
4. tokens会被转换成AST树，经过Parser和PreParser
   - Parser就是直接将tokens转成AST树结构；
   - PreParser成为预解析，为何需要预解析？
     - 并非所有JS代码在一开始就会被执行，如果将所有JS代码都进行解析，会影响页面运行效率；
     - V8引擎实现了延迟加载「Lazy Parsing」的方案，将不必要的函数进行预解析，也就是只解析暂时需要的内容，而对函数的全量解析是在函数被调用时才会进行；
5. 生成AST树后，会被Ignition转成字节码「byteCode」，之后的过程就是代码的执行过程；

```js
// * outer函数被调用，因此是Parser；
function outer() {
    // * inner函数没有调用运行，压根不转化为AST结构，不直接解析；
    // ! 因此只对inner进行预解析「V8引擎的Lazy Parsing延迟解析」
    function inner() {
    }
}

outer()
```
