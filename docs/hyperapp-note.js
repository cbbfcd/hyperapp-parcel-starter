/**
 * version: 🔥 🔥 1.2.8
 * author: ❤️ ❤️ 波比小金刚
*/

// ⚠️ ⚠️ h 函数的作用是构建 v-DOM
// 用 JavaScript 来表示一个 DOM 节点是很简单的事情，你只需要记录它的节点类型、属性，还有子节点, key?
// v-DOM 黄金结构法则：
// {
//    key?: ''
//    nodeName: '',
//    attributes: '',
//    children: []
// }
export function h(name, attributes) {
  var rest = []
  var children = []
  var length = arguments.length

  // 🌈 🌈 超过 2 个参数的时候，把多余的参数‘倒序’放进 rest 队列中
  // 。请 ⚠️ 区别 a-- 和 --a 
  while (length-- > 2) rest.push(arguments[length])

  // 🔥 扁平化 rest
  // 为什么要进行扁平化处理的目的❓ 看👇的例子你就明白了。
  /**
   * const children = [ <button>btn1</button>, <button>btn2</button> ]
   * const btnNode = (
   *   <div>
   *    <p>text</p>
   *    { children }
   *   </div>
   * )
   * ⚠️ 接下来，编译之后 👇：
   * const children = [
   *   h("button", {}, "btn1"),
   *   h("button", {}, "btn2")
   * ]
   * const btnNode = h("div", {}, h("p", {}, "text"), children);
   * 😫 这肯定跟预期的不符合，我们希望的是这样的结构 👇：
   * const btnNode = h("div", {}, [
   *   h("p", {}, "text"),
   *   h("button", {}, "btn1"),
   *   h("button", {}, "btn2")
   * ])
   * 结合👇源码，你就知道为什么了吧 😄
   */
  while (rest.length) {
    var node = rest.pop()
    // 如果是数组(数组有 pop 的方法)
    if (node && node.pop) {
      // 这里倒序，为了出来的结构顺序是对的
      for (length = node.length; length--; ) {
        rest.push(node[length])
      }
    } else if (node != null && node !== true && node !== false) { // 排除空值，布尔值
      children.push(node)
    }
  }
  // 🏁 🏁 这里看出 h 函数的主要功能就是生成一个 v-DOM 结构来，但是双 api 结构，使得 h 函数脱离开来，
  // 表明 hyperapp 希望用户使用时，用来生成 v-DOM 的方式更加自由，可以直接用 h 函数，也可以用别的模版语法，比如 JSX。
  return typeof name === "function"
    // 这里 name 为函数的情况，比如对一个组件的操作。
    /**
     * const Demo = ({name: 'jack ma'}) => (<div><h1>{ name }</h1></div>)
     * 编译 👇：
     * const Demo = ({name: 'jack ma'}) => h('div', {}, h('h1', {}, name))
     * 👀 💡 是不是直接调用也可以得到一个 v-DOM 结构嘛！！！！ 👀 👉 👉 h(Demo, {name: 'jack ma'})
     */
    ? name(attributes || {}, children)
    : {
        nodeName: name,
        attributes: attributes || {},
        children: children,
        key: attributes && attributes.key
      }
}

// 🌈  核心应用
// 我们可以通过下边的代码看出 app 函数的整个执行生命周期过程 👇：
// 🔥 🔥 app函数执行( app() ) --> 🕖 初始化 --> 🚄 scheduleRender()
export function app(state, actions, view, container) {
  // 🕖 初始化👇的这一堆东东
  var map = [].map
  var rootElement = (container && container.children[0]) || null
  var oldNode = rootElement && recycleElement(rootElement)
  var lifecycle = []
  var skipRender
  var isRecycling = true
  var globalState = clone(state)
  var wiredActions = wireStateToActions([], globalState, clone(actions))

  // 🚄 字如其名，开始调度渲染
  scheduleRender()

  // 当你看到这里 app 的主流程就结束了，10行代码，惊不惊喜❕刺不刺激❕ 🔚 🔚 🔚
  // @see https://github.com/hyperapp/hyperapp#interoperability 
  // 📖 文档中说过的(The app function returns a copy of your actions where every function is wired to changes in the state)
  return wiredActions 


  // 🔥 接下来就是 16 个辅助函数的疯狂输出！
  // ⚠️ 建议首先根据执行流程顺序，➡️ 关注 scheduleRender 函数

  // 🌈 这个函数最早叫做 elementToNode，又改名叫 toVNode，现在这个名字更准确
  function recycleElement(element) {
    return {
      nodeName: element.nodeName.toLowerCase(),
      attributes: {},
      children: map.call(element.childNodes, function(element) {
        return element.nodeType === 3 // Node.TEXT_NODE
          ? element.nodeValue
          : recycleElement(element)
      })
    }
  }

  // 🌈 生成一个 v-DOM
  function resolveNode(node) {
    // 其实就是调用 view 函数就可以得到一个 v-DOM 结构
    // 这里递归 + 三目的写法是为了巧妙的使做 check 的分支结构语句更简洁 👍
    return typeof node === "function"
      ? resolveNode(node(globalState, wiredActions))
      : node != null
        ? node
        : ""
  }

  // 🌈 实际渲染函数
  function render() {
    // 1. 更新锁状态
    skipRender = !skipRender
    // 2. ➡️ 生成一个新的 v-DOM
    var node = resolveNode(view)

    if (container && !skipRender) {
      // 3. ➡️ 若满足条件，进行 patch 操作
      rootElement = patch(container, rootElement, oldNode, (oldNode = node))
    }
    // 4. 更新 isRecycling 状态，这个状态只用于决定生命周期执行 oncreate 还是 onupdate
    // var cb = isRecycling ? attributes.oncreate : attributes.onupdate
    isRecycling = false
    // 5. 将队列中的生命周期 hook 全部执行一次。
    while (lifecycle.length) lifecycle.pop()()
  }

  // 🌈 调度渲染
  // 这里的调度有两层含义：
  //   1. 利用浏览器的 event-loop 机制实现异步执行渲染(render) 
  //   2. 通过一个锁机制(skipRender)避免密集更新造成的性能损耗。
  // 通过 actions 触发状态更新就会调用这个调度渲染函数，为了性能采用了异步和锁机制。但是略粗糙（相比于 Vue 之类复杂框架的 nextTick、waterQueue） 
  function scheduleRender() {
    if (!skipRender) {
      skipRender = true
      // ➡️ 接下来，看看实际执行渲染的 render 函数
      setTimeout(render)
    }
  }

  // 🌈 简单版的克隆函数，虽然寒酸不及lodash之类的全面，够用就行！
  function clone(target, source) {
    var out = {}
    // source 覆盖 target 中的同名属性
    for (var i in target) out[i] = target[i]
    for (var i in source) out[i] = source[i]

    return out
  }

  // 🌈 设置局部的 state 很巧妙的办法，简单高效 👍
  function setPartialState(path, value, source) {
    var target = {}
    if (path.length) {
      target[path[0]] =
        path.length > 1
          ? setPartialState(path.slice(1), value, source[path[0]])
          : value
      return clone(source, target)
    }
    return value
  }

  // 🌈 获取局部的 state 很巧妙的办法，简单高效 👍
  function getPartialState(path, source) {
    var i = 0
    while (i < path.length) {
      source = source[path[i++]]
    }
    return source
  }

  // 🌈 把 state 和 actions 连接起来
  // 通过这个函数也可以看出来为什么 readme 文档中说的嵌套 state，嵌套 actions 问题。
  function wireStateToActions(path, state, actions) {
    // 遍历
    for (var key in actions) {
      typeof actions[key] === "function"
        ? (function(key, action) {
            // 使用 IIFE 形成一个闭包，重写 action 函数
            actions[key] = function(data) {
              // 执行 action
              var result = action(data)
              // 如果得到的结果是函数，就传入 state, actions 再执行
              // 这就是为什么可以这样用：const actions = { up: (value) => (state, actions) => ({count: state.count + value}) }
              if (typeof result === "function") {
                result = result(getPartialState(path, globalState), actions)
              }
              // result 存在、不是 Promise、且与当前 state 中同路径下局部 state 不一致时，应该重新渲染视图了。
              if (
                result &&
                result !== (state = getPartialState(path, globalState)) &&
                !result.then // !isPromise
              ) {
                // 安排上！重新渲染！
                // 这里也说明了只有 actions 能够改变 state 触发重新渲染，并且每次返回的新 state（Immutable）
                scheduleRender(
                  // 更新 globalState
                  (globalState = setPartialState(
                    path,
                    clone(state, result),
                    globalState
                  ))
                )
              }

              return result
            }
          })(key, actions[key])
        : wireStateToActions( // 递归的执行，用于按照上面的逻辑解析那些嵌套更深的 actions 对象
            path.concat(key),
            (state[key] = clone(state[key])),
            (actions[key] = clone(actions[key]))
          )
    }
    // 返回处理后的所有函数，相当于暴露接口
    return actions
  }

  // 🌈 获取 key
  function getKey(node) {
    return node ? node.key : null
  }

  // 🌈 注册事件
  function eventListener(event) {
    // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Event/currentTarget
    return event.currentTarget.events[event.type](event)
  }

  // 🌈 更新属性
  function updateAttribute(element, name, value, oldValue, isSvg) {
    if (name === "key") { // 1. 忽略 key 这个属性
    } else if (name === "style") { 
      // 2.更新样式对象
      for (var i in clone(oldValue, value)) {
        // 只更新 value（新的）中有的
        var style = value == null || value[i] == null ? "" : value[i]
        // ⚠️ 这里是为了支持自定义的 CSS 变量
        // @see https://github.com/hyperapp/hyperapp/commit/11d65a580adefae308716590ff78f8766b315cf9
        if (i[0] === "-") {
          // https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables
          element[name].setProperty(i, style)
        } else {
          element[name][i] = style
        }
      }
    } else {
      // 3.更新事件
      if (name[0] === "o" && name[1] === "n") {
        // event.type
        name = name.slice(2)
        // 缓存到 element 的 events 属性
        if (element.events) {
          if (!oldValue) oldValue = element.events[name]
        } else {
          element.events = {}
        }
        // 更新对应的事件
        element.events[name] = value
        // 确保事件只被注册一次且在没指定的时候被释放
        if (value) {
          if (!oldValue) {
            element.addEventListener(name, eventListener)
          }
        } else {
          element.removeEventListener(name, eventListener)
        }
      } else if (
        name in element &&
        name !== "list" &&
        name !== "type" &&
        name !== "draggable" &&
        name !== "spellcheck" &&
        name !== "translate" &&
        !isSvg
      ) {
        // 👆的一堆 !== 的判断作用是 看👇的 PR 内容即可明白了 💃 💃。
        // 🔥 🔥 这一部分的处理我觉得仍然是有问题的！毕竟这么短小精悍，很多细节是很粗放的去解决的。(可以参见 readme.md 中坑点总结)
        // @see https://github.com/hyperapp/hyperapp/pull/629
        // 4. 更新元素的属性（比如：<input disabled={true}/>）
        element[name] = value == null ? "" : value
      } else if (value != null && value !== false) {
        // 5. 更新普通值属性
        element.setAttribute(name, value)
      }

      if (value == null || value === false) {
        // 6. 移除
        element.removeAttribute(name)
      }
    }
  }

  // 🌈 根据 v-DOM 创建真实的 DOM 节点
  function createElement(node, isSvg) {
    // @see https://developer.mozilla.org/en-US/docs/Web/API/Document/createTextNode
    // @see https://developer.mozilla.org/en-US/docs/Web/API/Document/createElementNS
    var element =
      typeof node === "string" || typeof node === "number"
        ? document.createTextNode(node)
        : (isSvg = isSvg || node.nodeName === "svg")
          ? document.createElementNS(
              "http://www.w3.org/2000/svg",
              node.nodeName
            )
          : document.createElement(node.nodeName)

    var attributes = node.attributes
    if (attributes) {
      // 压入 oncreate hook
      if (attributes.oncreate) {
        lifecycle.push(function() {
          attributes.oncreate(element)
        })
      }

      // 处理 children
      for (var i = 0; i < node.children.length; i++) {
        element.appendChild(
          createElement(
            (node.children[i] = resolveNode(node.children[i])),
            isSvg
          )
        )
      }

      // 属性
      for (var name in attributes) {
        updateAttribute(element, name, attributes[name], null, isSvg)
      }
    }

    return element
  }

  // 🌈 根据新老 v-DOM 的属性进行按需更新
  function updateElement(element, oldAttributes, attributes, isSvg) {
    for (var name in clone(oldAttributes, attributes)) {
      if (
        attributes[name] !==
        (name === "value" || name === "checked"
          ? element[name]
          : oldAttributes[name])
      ) {
        // 属性值不同的时候才执行更新
        updateAttribute(
          element,
          name,
          attributes[name],
          oldAttributes[name],
          isSvg
        )
      }
    }

    // 属性更新的时候，首次渲染为 oncreate hook，否则为 onupdate hook，然后压入生命周期队列中。
    var cb = isRecycling ? attributes.oncreate : attributes.onupdate
    if (cb) {
      lifecycle.push(function() {
        cb(element, oldAttributes)
      })
    }
  }

  // 🌈 递归 (从最叶节点开始)触发所有定义的 ondestroy hook，这里其实没有删除的操作
  // 不理解的可以了解一下递归-调用栈的知识
  function removeChildren(element, node) {
    var attributes = node.attributes
    if (attributes) {
      for (var i = 0; i < node.children.length; i++) {
        removeChildren(element.childNodes[i], node.children[i])
      }

      if (attributes.ondestroy) {
        attributes.ondestroy(element)
      }
    }
    return element
  }

  // 🌈 删除元素
  // 一旦定义了 onremove 的 hook，意味着执行删除操作的权利就反转到了 done 函数的拥有者，所以可以通过这个 hook 做一些删除前的操作。
  // 文档中也说了：Call done inside the function to remove the element.（https://github.com/hyperapp/hyperapp#onremove）
  function removeElement(parent, element, node) {
    function done() {
      // 删除执行！ https://developer.mozilla.org/zh-CN/docs/Web/API/Node/removeChild
      // 执行 parent.removeChild(element) 就完事儿了，但是这里加了一层 removeChildren 函数是为了触发另一个 hook，用来做删除后的操作（ondestroy）
      parent.removeChild(removeChildren(element, node))
    }

    var cb = node.attributes && node.attributes.onremove
    if (cb) {
      cb(element, done)
    } else {
      done()
    }
  }

  // 🌈 虚拟 DOM 技术三板斧之 -- patch
  // 你可以想象成增量的去给之前的 v-DOM 打补丁，使得所有的改变以最小的代价附着上去。
  // 只有在这一步是真实的操作了 DOM 的，Hyperapp 在内存中保存着两颗树来做 diff 以及视图更新，提高了性能。
  // ⚠️参数说明（依次是）：父节点、当前节点、旧的 v-DOM、新的 v-DOM、是否是 svg (因为 svg 较之更特殊一点)
  // diff 本身是一个 O(n^3) 复杂度的算法，如果平级比较，复杂度就回到了 O(n)
  function patch(parent, element, oldNode, node, isSvg) {
    if (node === oldNode) {
      // 1⃣️ v-DOM 没改变，则不用更新
    } else if (oldNode == null || oldNode.nodeName !== node.nodeName) {
      // 2⃣️ 如果旧 v-DOM 不存在, 直接插入在当前节点之前（如果当前节点不存在，则插入在末尾位置）。
      // 如果新的 v-DOM 和旧 v-DOM 不同（通过 nodeName 判断的），也是插入到当前节点的前面，且旧节点存在的话就移除旧的。
      var newElement = createElement(node, isSvg)
      // https://developer.mozilla.org/zh-CN/docs/Web/API/Node/insertBefore
      parent.insertBefore(newElement, element)

      if (oldNode != null) {
        // 删除当前节点
        removeElement(parent, element, oldNode)
      }
      // 更新当前节点
      element = newElement
    } else if (oldNode.nodeName == null) {
      // 3⃣️ 根据 h 函数可以知道，oldName.nodeName 为空指的是 👉 非元素节点类型 👈 ！！
      // 🚀 补课：DOM 中有三大节点类型：元素节点、属性节点、文本节点，都有 nodeType、nodeName 和 nodeValue 三大属性。
      // 🚀 根据 DOM Level 2 规范，nodeValue == null 的节点类型，对它赋值不会有任何效果(比如元素节点的 nodeValue == null，更新其 nodeValue 并不会有任何卵用)，
      // 🚀 而其它的比如 🔥 text、🔥 comment、🔥 CDATA、🔥 attributes 等节点的 nodeValue 不为空，所以直接更新其 nodeValue 值即可完成节点更新。
      // https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeValue
      element.nodeValue = node
    } else {
      // 4⃣️ 剩下的就是新旧节点均存在，nodeName 还一样，但二者不是同一节点的情况。
      // ⚠️ readme 文档中有一个流程图可以参考（感谢北京邮电大学的 ChrisCindy）

      // 1. 🔥 属性更新（执行这一步相当于把第一层已经 diff -> patch 了，剩下的就是处理各自的 children）
      updateElement(
        element,
        oldNode.attributes,
        node.attributes,
        (isSvg = isSvg || node.nodeName === "svg")
      )
      // 2. 🔥 为了提高性能，采用 key 值标记（插入比删除再新建更高效，所以没有直接递归的去 patch children）
      var oldKeyed = {} // key: [oldRealDomNode, oldVirtualDomNode]映射
      var newKeyed = {} // key: newVirtualDomNode 映射
      var oldElements = [] // 旧真实 DOM 节点队列
      var oldChildren = oldNode.children // 旧虚拟节点
      var children = node.children // 新虚拟节点

      // 2.1 🐒 处理旧虚拟节点（主要就是处理成用 "key" 标记的 [oldRealDomNode, oldVirtualDomNode] 结构的映射）
      for (var i = 0; i < oldChildren.length; i++) {
        // 对应的真实节点
        oldElements[i] = element.childNodes[i]

        var oldKey = getKey(oldChildren[i])
        if (oldKey != null) {
          // 记录
          oldKeyed[oldKey] = [oldElements[i], oldChildren[i]]
        }
      }

      var i = 0 // 旧虚拟节点 索引
      var k = 0 // 新虚拟节点 索引

      // 2.2 🐒 遍历 patch 处理所有的新虚拟节点，从第一个新虚拟节点开始。
      while (k < children.length) {
        // 分别获取当前索引下的新旧key
        var oldKey = getKey(oldChildren[i])
        var newKey = getKey((children[k] = resolveNode(children[k])))
        // 新节点映射中已经记录了 oldKey 及对应节点的情况(就不用对比了，轮到下一个旧虚拟节点)
        if (newKeyed[oldKey]) {
          i++
          continue
        }
        // @see https://github.com/hyperapp/hyperapp/pull/663
        // @see https://github.com/hyperapp/hyperapp/commit/f16f7fca385cab00224013e8431cca487ce41773
        if (newKey != null && newKey === getKey(oldChildren[i + 1])) {
          if (oldKey == null) {
            removeElement(element, oldElements[i], oldChildren[i])
          }
          i++
          continue
        }
        // newKey 不存在或者是第一次渲染的情况
        if (newKey == null || isRecycling) {
          // 若 oldKey 也不存在，那就直接 patch 操作，然后轮到一下一个新虚拟节点
          if (oldKey == null) {
            patch(element, oldElements[i], oldChildren[i], children[k], isSvg)
            k++
          }
          // 若 oldKey 存在，就轮到下一个旧虚拟节点
          i++
        } else {
          // 🚀 其余情况的处理流程：

          // 旧虚拟节点映射中 newKey 映射的数据
          var keyedNode = oldKeyed[newKey] || []
          // 如果新旧虚拟节点的 key 相同，递归的 patch 之后，轮到下一个旧虚拟节点
          if (oldKey === newKey) {
            patch(element, keyedNode[0], keyedNode[1], children[k], isSvg)
            i++
          } else if (keyedNode[0]) {
            // 如果新旧虚拟节点 key 不同，而且 keyedNode 存在, 插入 keyedNode[0] 节点，patch
            patch(
              element,
              element.insertBefore(keyedNode[0], oldElements[i]),
              keyedNode[1],
              children[k],
              isSvg
            )
          } else {
            patch(element, oldElements[i], null, children[k], isSvg)
          }
          // 建立新虚拟节点的映射关系
          newKeyed[newKey] = children[k]
          k++
        }
      }

      // 2.3 🐒 去除所有没有 key 的旧虚拟节点
      while (i < oldChildren.length) {
        if (getKey(oldChildren[i]) == null) {
          removeElement(element, oldElements[i], oldChildren[i])
        }
        i++
      }

      // 2.4 🐒 去掉所有没有被复用的老节点
      for (var i in oldKeyed) {
        if (!newKeyed[i]) {
          removeElement(element, oldKeyed[i][0], oldKeyed[i][1])
        }
      }
    }
    return element
  }
}