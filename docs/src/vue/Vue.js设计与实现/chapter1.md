---
title: 《Vue.js设计与实现》第1章 权衡的艺术
date: 2022-07-23
tags:
 - Vue.js
categories: 
 - FrontEnd
sidebar: 'auto'
---
# 《Vue.js设计与实现》

[[toc]]

## 第1章 权衡的艺术

### 1.0 本章核心要点

- 框架设计成 **命令式** or **声明式** ？
  - 差异？优缺点？如何权衡？
- 框架设计成 **纯运行时** or **纯编译时** or **运行时+编译时** ？
  - 差异？优缺点？如何权衡？

### 1.1 命令式和声明式

- 命令式框架：**关注过程**

  ```js
  // div标签，文本内容为'hello world'，点击后弹出提示'ok'
  const div = document.querySelector('#app');
  div.innerText = 'hello world';
  div.addEventListener('click', () => { alert('ok') });
  ```
- 声明式框架：**关注结果**

  ```vue
  <div @click="() => alert('ok')">hello world</div>
  ```

总结：Vue.js帮用户封装了过程，因此**Vue.js的内部实现是命令式的，暴露给用户的是声明式的**。

### 1.2 性能与可维护性的权衡

命令式VS声明式：**声明式代码的性能不优于命令式代码的性能**，**在保持可维护性的同时让性能损失最小化**。

- 命令式：直接调用相关命令，直接修改

  ```js
  div.innerText = 'hello vue3';
  ```

  **没有其他办法比上面这句代码的性能更好**，命令式代码可以做到极致的性能优化，因为我们明确知道哪里发生了变更，只需要做必要的修改即可；
- 声明式：重写相关代码，交给vue去寻找差异，再更新

  ```vue
  <div @click="() => alert('ok')">hello vue3</div>
  ```

  **需要找到前后的差异并只更新变化的地方**，但是最终完成这次更新的依旧是

  ```js
  div.innerText = 'hello vue3';
  ```

命令式与声明式性能损耗：

- **命令式代码的更新性能消耗 = 直接修改的性能消耗「A」**
  - 命令式代码，需要维护实现目标的整个过程，包括DOM相关工作；
  - 但是很难写出绝对优化的命令式代码；
- **声明式代码的更新性能消耗 = 找出差异的性能消耗「B」 + 直接修改的性能消耗「A」**
  - 声明式代码会比命令式代码多出**找出差异的性能消耗「B」**
  - 框架本身就是**封装了命令式代码**才实现了面向用户的声明式
  - 声明式代码可维护性更强，代码展示的就是要的结果，更加直观，过程的事情交给Vue.js；

### 1.3 虚拟DOM的性能到底如何

**声明式代码的更新性能消耗 = 找出差异的性能消耗「B」 + 直接修改的性能消耗「A」**

核心目标：**最小化找出差异的性能消耗「B」**$0 $

解决方案：采用**虚拟DOM**

- 采用声明式代码；（让我们不用付太多的努力）
- 保证应用程序的性能下限；（让应用程序的性能不至于太差）
- 想办法逼近命令式代码的性能；

⚠️注意点：

- 采用虚拟DOM的更新技术「**理论上**」不可能比原生JavaScript操作DOM更高；
- 但是实际上，我们**很难写出绝对优化的命令式代码**，代码规模很大时，投入产出比不高；

  ⚠️注意：原生JavaScript代码实际上指的是 `document.createElement` 之类的DOM操作方法，并不包括特殊的 `innerHTML`；

  1. 思考1：使用 `innerHTML` 操作页面和 虚拟DOM 相比性能如何？
  2. 思考2: `innerHTML` 和 `document.createElement` 等DOM操作方法有何差异？

比较 `innerHTML` 和 虚拟DOM 的性能

- `innerHTML` 在**创建页面时**的性能

  - 创建Step1：**构造一段HTML字符串**

    ```js
    const html = `
    	<div><span>...</span></div>
    `
    ```
  - 创建Step2：**将该字符串赋值给DOM元素的 `innerHTML` 属性**

    ```js
    div.innerHTML = html
    ```

    为了渲染出页面，需要**把字符串解析成DOM树**；「DOM层面的计算，涉及DOM的运算要远比JavaScript层面的计算性能差」

  ⚠️`innerHTML` 创建页面的性能：**HTML字符串拼接的计算量 + `innerHTML` 的DOM计算量**
- 虚拟DOM在**创建页面时**的性能

  - 创建Step1：**创建JavaScript对象**
  - 创建Step2：**递归地遍历虚拟DOM树并创建真实DOM**

  ⚠️虚拟DOM创建页面的性能：**创建JavaScript对象的计算量 + 创建真实DOM的计算量**

| 「虚拟DOM和 `innerHTML` 在创建页面时的性能」 | 虚拟DOM                     | `innerHTML`   |
| ---------------------------------------------- | --------------------------- | --------------- |
| 纯JavaScript运算                               | 创建JavaScript对象（VNode） | 渲染HTML字符串  |
| DOM运算                                        | 新建所有DOM元素             | 新建所有DOM元素 |

- `innerHTML` 在**更新页面时**的性能

  - 更新Step1：**重新构建HTML字符串**
  - 更新Step2：**重新设置DOM元素的 `innerHTML` 属性**

    这相当于**损毁所有旧的DOM元素，在全量创建新的DOM元素**
- 虚拟DOM在**更新页面时**的性能

  - 更新Step1：**重新创建JavaScript对象（虚拟DOM树）**
  - 更新Step2：💡**比较新旧虚拟DOM「JavaScript层面的计算」，找到变化的元素并更新它**

| 「虚拟DOM和 `innerHTML` 在更新页面时的性能」 | 虚拟DOM                                | `innerHTML`                    |
| ---------------------------------------------- | -------------------------------------- | -------------------------------- |
| 纯JavaScript运算                               | 创建新的JavaScript对象 +**Diff** | 渲染HTML字符串                   |
| DOM运算                                        | 必要的DOM更新                          | 损毁所有旧的DOM；新建所有新的DOM |
| 性能因素                                       | 与数据变化量相关                       | 与模版大小相关                   |

- 虚拟DOM：无论页面多大，都只会更新变化的内容；
- `innerHTML` ：页面越大，更新时的性能消耗越大；

| 性能差                | $\to$    | 性能高         |
| --------------------- | ---------- | -------------- |
| `innerHTML`（模版） | 虚拟DOM    | 原生JavaScript |
| 心智负担中等          | 心智负担小 | 心智负担大     |
| 性能差                | 性能不错   | 性能高         |
|                       | 可维护性强 | 可维护性差     |

期望：**既声明式地描述UI，又具备JavaScript的性能**；

### 1.4 运行时和编译时

设计框架的三种选择：

- 纯运行时

  - 用户在使用Render函数渲染内容时，直接为Render函数提供了一个**`<u>`树型结构的数据对象 `</u>`**：

    ```js
    // 树型结构的数据对象
    const obj = {
      tag: 'div',
      children: [
        { tag: 'span', children: 'hello world' }
      ]
    }
    ```
  - Render函数的实现：

    ```js
    function Render(obj, root) {
      // 创建节点
      const el = document.createElement(obj.tag)
      // 先判断，后递归渲染：
      // 如果children是字符串，直接提取内容，并添加到节点后面，作为子节点
      if(typeof obj.children === 'string') {
        const text = document.createTextNode(obj.children)
        el.appendChild(test)
      } else if(obj.children) {
        // 如果子节点里面还有子节点，则递归渲染，此时root变为上一个el节点
        // 堆obj的children里面每一个元素都进行递归渲染
        obj.children((child) => Render(child, el))
      }
      // 递归结束将所有元素添加到root
      root.appendChild(el)
    }
    ```
  - Render函数的使用

    ```js
    // 树型结构的数据对象
    const obj = {
      tag: 'div',
      children: [
        { tag: 'span', children: 'hello world' }
      ]
    }
    // 渲染到root下
    Render(obj, document.body)
    ```

    但是手写树型结构的数据对象麻烦且不直观 :(

  ⚠️纯运行时的框架：没有编译的过程，无法分析用户提供的内容；
- 运行时 + 编译时

  - 引入编译的手段，把HTML标签编译成树型结构的数据对象，继续使用Render函数

    ```html
    <!-- HTML标签 -->
    <div>
      <span>hello world</span>
    </div>
    ```

    将上述HTML标签**编译成**树型结构的数据对象
  - 利用Compiler函数编译，用户在调用Render函数的基础上调用Compiler函数

    ```js
    const html = `
    	<div>
    		<span>hello world</span>
      </div>
    `
    // 调用Compiler编译得到树型结构的数据对象
    const obj = Compiler(html)
    // 再调用 Render 进行渲染
    Render(obj, document.body)
    ```

    代码运行时才开始编译，会产生一定的性能开销；最好在构建时就执行Compiler程序将内容编译好，等到运行时就无须编译了，对性能非常友好；

  ⚠️运行时 + 编译时的框架：加入编译步骤，可以分析用户提供的内容，预估哪些内容会改变或者永不改变，提取这些信息，提交给Render函数优化；「**Vue.js就是运行时 + 编译时的框架**」
- 纯编译时

  - 编译器直接将HTML字符串编译成命令式代码；

    ```html
    <!-- HTML标签 -->
    <div>
      <span>hello world</span>
    </div>
    ```

    上述HTML字符串代码直接由Compiler编译成下面的命令式代码

    ```js
    const div = document.createElement('div')
    const span = document.createElement('span')
    span.innerText = 'hello world'
    div.appendChild(span)
    document.body.appendChild(div)
    ```

    只需要一个Compiler函数即可，连Render函数都省去了；

  ⚠️纯编译时的框架：可以分析用户提供的内容，无需任何运行时，而是直接编译成执行的JS代码，性能可能更好，但是损失了灵活性；「Svelte就是纯编译时的框架」

### 1.5 总结

- **命令式**  VS  **声明式**
- **虚拟DOM的性能**，关键在于使得 **找出差异的性能损耗最小**
- **原生JavaScript**  VS **虚拟DOM**  VS  **`innerHTML`** 操作页面的性能对比；（创建页面 + 更新页面）
- **纯运行时**  VS  **编译时 + 运行时**  VS  **纯编译时**
