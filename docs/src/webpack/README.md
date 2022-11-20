---
sidebar: auto
---
# Webpack

Webpack原理与实践

## 模块化的背景

### 模块化的演变历程

1. 第一个阶段：文件划分方式

   - 一个script标签就 对应一个模块
   - 在代码中直接调用模块中的全局成员（函数/变量）
   - 所以模块都直接在全局范围工作，没有私有空间，可以直接被访问被修改，会造成污染全局作用域，以及命名冲突
   - 原始方式完全依靠约定
2. 第二个阶段：命名空间方式

   - 每个模块只暴露一个全局的对象，模块成员都挂载到这个对象下面
   - 减小命名冲突的可能
   - ⚠️但是模块仍然没有私有空间，仍然可以在外部被访问被修改
   - ⚠️模块之间的依赖关系也没有得到解决

   代码实例如下

   `Module-a.js`

   ```js
   var moduleA = {
     name: 'module-a',

     method1: function() {
       console.log(this.name + '#method1')
     },
     method2: function() {
       console.log(this.name + '#method2')
     }
   }
   ```

   `index.html` 中的 `script`

   ```js
   <script src='module-a.js'></script>
   <script src='module-b.js'></script>
   <script>
     modeleA.method1()
   	moduleB.method2()
   	moduleA.name = 'foo'
   </script>
   ```
3. 第三个阶段：IIFE

   - 为模块化提供私有空间：将模块中的每一个成员都存放在一个函数的私有作用域当中，对于需要暴露给外部的成员，则通过挂载到全局对象上的方式，实现了私有成员的方式，确保了私有变量的安全，并且使用函数的参数作为依赖关系的参考；

---

以上的几个阶段是早起在没有工具和规范的情况下对模块化的落地方式，解决了一些问题，但是仍然有些问题还未解决

---

### 模块化规范的出现

#### 模块加载

- 以前：通过 `script` 标签手动引入每一个模块，这意味着模块的加载并不是代码控制的，维护苦难；（模块的修改删除增加等问题）
- 目标：需要基础的公共代码，去实现通过代码自动加载模块；
- 模块化规范 + 模块加载器
  - commonJS：node.js中常见
    - 核心概念：一个文件就是一个模块
    - 特点：每个模块都有单独的作用域
    - 导出：通过 `module.exports` 导出成员
    - 载入：通过 `require` 函数载入模块
  - AMD：异步模块定义规范
    - 关键：`Require.js`
    - 定义模块：`define()` 函数
    - 加载模块：`require()` 函数
  - Sea.js+CMD：淘宝出品

**==总结：一般情况下，在node环境中采用Common JS规范，在浏览器环境中用ES Module规范；==**

---

## ES Module专栏

### ES Module的特性

在某个html文件中 `body` 部分

```html
<script type='module'>
  console.log('this is es module');
</script>
```

特点：

- **ESM自动采用严格模式，**因此不能在全局范围使用this；

  ```html
  <script>
    console.log(this); // Window
  </script>
  <script type='module'>
    console.log(this); // undefined
  </script>
  ```
- **每个ESM都是运行在单独的私有作用域**中，避免了作用域污染的问题；

  ```html
  <script type="module">
    var num = 110;
    console.log(num); // 110
  </script>
  <script type="module">
    console.log(num); // ReferenceError: num is not defined
  </script>
  ```
- **ESM是通过CORS方式请求的外部JS模块的；**

  不支持CORS的外部JS模块则会报错，并且在Chrome的Network版块

  ```html
  <script type="module" src="https://libs.baidu.com/jquery/2.1.4/jquery.min.js"></script>
  <!-- Access to script at 'https://libs.baidu.com/jquery/2.1.4/jquery.min.js' from origin 'http://127.0.0.1:5500' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource. -->
  ```
  支持CORS则正常

  ```html
  <script type="module" src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
  ```
- **ESM的script标签 会延迟执行脚本**

  新建一个 `demo.js`

  ```js
  alert('hello');
  ```
  `html`的 `body` 部分如下

  ```html
  <script type="module">
    var num = 110;
    console.log(num); 
  </script>
  <p>测试上</p> 
  <script src="demo.js"></script>
  <p>测试下</p>   
  <script type="module">
    var num = 220;
    console.log(num); 
  </script>  
  ```
  在弹出框显示 `hello` 的时候页面还没有显示出 `测试上`和 `测试下` 两个字，并且控制台中也是空白，点击确认后，页面出现了 `测试上`和 `测试下` ，并且控制台打印出了110和220；也就是要等脚本完成后，才会去显示其他内容；

  为 `script` 添加 `type='module'`

  ```html
  <script type="module">
    var num = 110;
    console.log(num); 
  </script>
  <p>测试上</p>
  <script type="module" src="demo.js"></script>
  <p>测试下</p>   
  <script type="module">
    var num = 220;
    console.log(num); 
  </script>  
  ```
  在弹出框显示 `hello` 的时候页面已经显示 `测试上`和 `测试下`  两个字，控制台中只显示110，点击确认后，控制台继续打印出了220；相当于给脚本启用延迟执行的机制，类似于使用 `defer` 属性；

  ### ES Module导出

  `export` 和 `import`
