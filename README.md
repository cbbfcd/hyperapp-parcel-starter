# 🚀 ✈️ 🇧🇷 hyperapp 分析

> 1 kB JavaScript micro-framework for building web applications -- [hyperapp](https://github.com/hyperapp/hyperapp)

最吸引人的就是这句介绍了。

# 🔥 🇪🇸 hyperapp 文档

[👮‍♀️官方文档](https://github.com/hyperapp/hyperapp)

这里我通俗易懂的、简单的介绍一下（我很多地方都引用了 React 做粗暴的比较）：

* 🔥 Minimal -- 我们积极地将您需要理解的概念最小化，以提高工作效率，同时保持与其他框架相同的功能。
* 🔥 Pragmatic -- 在管理你的状态的时候可以采用务实的办法，允许副作用、异步操作和 DOM 操作。
* 🔥 Standalone -- 同样支持牛逼的 virtual DOM 来用更小的代价管理状态、渲染视图，有简单的生命周期和基于 key 标识的节点更新

Hyperapp 只有两个最重要的 API:

- 🚀 h: 用于处理 view，返回 Virtual DOM 节点(后续都以 v-DOM 代表虚拟 DOM 🌈)
- 🚀 app: 用于将一个应用程序挂载到特定的 DOM 元素上，也可以不指定 DOM 元素（文档中叫做 'headless', 这将利于测试）

## ❤️ 🔥 h

文档中使用了 jsx，需要安装 babel 插件将 jsx 编译成 h 函数能够处理的样子。

大体上你可以想象一下 React.createElement() 👈

```js
const view = (state, actions) =>
  h("div", {}, [
    h("h1", {}, state.count),
    h("button", { onclick: () => actions.down(1) }, "-"),
    h("button", { onclick: () => actions.up(1) }, "+")
  ])

// 而 h 函数的作用就是，经过它处理之后得到一个 v-DOM
{
  nodeName: "div",
  attributes: {},
  children: [
    {
      nodeName: "h1",
      attributes: {},
      children: [0]
    },
    {
      nodeName: "button",
      attributes: { ... },
      children: ["-"]
    },
    {
      nodeName:   "button",
      attributes: { ... },
      children: ["+"]
    }
  ]
}
```

⚠️ 事实上并不是一定要 jsx 的，你直接写 h 函数的 view 也能顺利得到一个 v-DOM 结构。当然也可以用其他的解析模版，很随便，很开心。

## 🚴‍♀️ 🚢 app

Hyperapp 应用程序主要的三板斧还是 state, actions, view。React 用户似乎对这个很熟悉...

初始化后，你的应用程序将在连续循环中执行，从用户或外部事件接收操作，更新状态，并通过 v-DOM 模型表示视图中的更改。 
将 actions 视为通知 Hyperapp 更新状态并安排下一个视图重绘的信号。 在处理 actions 之后，将新 state 呈现给用户。

妥妥的单向数据流！

### 🀄️ 🍲 state

简单的说就是一个 plain object，必须通过 actions 来改变它。

```js
const state = {
  count: 0
}
```

因为在更新 state 的时候执行的是浅合并(shallow merge)，所以顶层必须是 plain object,至于内部的，随便你了。 Map? 👌,Immutablejs? 👌, Sets? 👌。

Question：如果遇到嵌套状态树(state can be a nested tree of objects)如何破❓

```js
const state = {
  counter: {
    count: 0
  }
}

// 你只需要让你的 action 和它保持同样的嵌套结构即可（同样的命名空间下）
const actions = {
  counter: {
    down: value => state => ({ count: state.count - value }),
    up: value => state => ({ count: state.count + value })
  }
}
```

### 👧 🌧️ actions

同 Redux 很像。

actions 也是一个载体，是一个一元函数（只有一个参数），只能通过 actions 来更新状态，返回一个浅合并的新的状态，然后 v-DOM 一番操作猛如虎之后视图重绘。

⚠️ 当然你也可以返回一个函数，参数是当前的 state 和 actions, 然后再返回一个局部的 state.

```js
const actions = {
  up: (value) => (state, actions) => ({count: state.count + value})
}
```
同 redux 一样，状态的更新应该是 immutable 的，就是不要在 actions 直接改变 state, 而是返回一个新的状态，这对时间旅行调试很有用，
也能避免一些难以追踪的异常。

#### 🐟 😢 异步 actions

用于副作用的操作（写入数据库，向服务器发送请求等）不需要具有返回值。 

⚠️你可以从另一个 action 或回调函数中调用操作。 返回 Promise，undefined 或 null 的操作不会触发重绘或更新状态。

直白的说就是你可以随便整，返回一个 promise 啥的又不会引起重绘，异步最终也是要拿到数据的，这时候你再调用另一个 action 完成状态更新就好了。

```js
const actions = {
  upLater: () => async(state, actions) => {
    const { data } = await this.fetch('xxxx')
    actions.up(data)
  },
  up: value => state => ({ count: state.count + value })
}
```
#### 🐘 🐰 嵌套 actions

~~这个在嵌套的状态树已经提过了~~

#### 🐷 🐎 交互

app 函数将会返回一个有所有定义的 actions 属性的副本。

将这个对象暴露给外界（部），对于从其他程序或框架操作应用程序，订阅全局事件，监听鼠标和键盘输入等非常有用(对于测试的时候也很有用处哦❕笔芯)。

```js
const main = app(state, actions, view, document.body)
main.up()
main.down()
```

包含一个直接返回原 state 的 actions 有时候会有一定的用处(类似于 redux 中的 store.getState())，毕竟不会引起重绘呀😂😂

```js
const actions = {
  getState: () => state => state
}
```

### 🐒 🍑 view

一起都源于状态的改变，当 state 改变的时候，view 函数被调用。然后在 h 函数的作用下，将会有一个新的 v-Dom 结构诞生。

```js
import { h } from "hyperapp"

export const view = (state, actions) =>
  h("div", {}, [
    h("h1", {}, state.count),
    h("button", { onclick: () => actions.down(1) }, "-"),
    h("button", { onclick: () => actions.up(1) }, "+")
  ])

// h 的作用就是产生一个 v-DOM
{
  nodeName: "div",
  attributes: {},
  children: [
    {
      nodeName: "h1",
      attributes: {},
      children: [0]
    },
    {
      nodeName: "button",
      attributes: { ... },
      children: ["-"]
    },
    {
      nodeName:   "button",
      attributes: { ... },
      children: ["+"]
    }
  ]
}
```
利用 v-DOM 的 diff、patch 一系列骚操作之后，视图得以更新。完美安排上了❕ 👌

v-DOM 经典步骤：

1. 用 JavaScript 对象结构表示 DOM 树的结构；然后用这个树构建一个真正的 DOM 树，插到文档当中

2. 当状态变更的时候，重新构造一棵新的对象树。然后用新的树和旧的树进行比较，记录两棵树差异

3. 把 2 所记录的差异应用到步骤 1 所构建的真正的DOM树上，视图就更新了

Virtual DOM 算法主要是实现上面步骤的三个函数：element，diff，patch。就像是在 DOM 和 JS 之间加了一层缓存

直接操作 DOM 的代价是昂贵的，感觉随便一动都会引起重排啊，v-DOM 的出现使得我们可以事无忌惮的刷起来。

Hyperapp 在内存中保存了两颗 v-DOM 树，目的也是为了避免每次丢弃旧的 v-DOM 树的浪费。

### 🔥 🌞 Mounting

要在页面中安装应用程序，我们需要一个 DOM 元素。 此元素称为应用程序容器。 使用 Hyperapp 构建的应用程序始终只有一个容器。

```js
app(state, actions, view, container)
```

Hyperapp还将尝试重用容器内的现有元素，从而实现 SEO 优化并改善您的网站交互。（对于 SEO 优化，就仁者见仁了）

当然 Hyperapp 是支持 SSR 的！😄😄😄

### 🍇 🏠 Components

组件大家应该非常的熟悉了，是一个返回虚拟节点的纯函数（对于纯函数概念不太熟悉的童鞋参见 Redux 中的说明）。

组件是可以复用的对样式、属性、行为的封装体而已。玩儿的6⃣️的话，代码会很清晰，维护起来方便。

```js
import { h } from "hyperapp"

const TodoItem = ({ id, value, done, toggle }) => (
  <li
    class={done && "done"}
    onclick={() =>
      toggle({
        value: done,
        id: id
      })
    }
  >
    {value}
  </li>
)

export const view = (state, actions) => (
  <div>
    <h1>Todo</h1>
    <ul>
      {state.todos.map(({ id, value, done }) => (
        <TodoItem id={id} value={value} done={done} toggle={actions.toggle} />
      ))}
    </ul>
  </div>
)
```

#### 🚠 🇫🇯 Lazy Components

上面的例子中的 TodoItem 组件就是万千普通组件中的一员，只能从父组件接收属性和子项。当然，如果一个组件需要接收全局的 state or actions，那么可以试试🔥惰性组件🔥。

🔥惰性组件🔥的实现其实也很简单，就是利用函数的柯里化，返回的是一个以 state 和 actions 为参数的函数。

```js
import { h } from "hyperapp"

export const Up = ({ by }) => (state, actions) => (
  <button onclick={() => actions.up(by)}>+ {by}</button>
)

export const Down = ({ by }) => (state, actions) => (
  <button onclick={() => actions.down(by)}>- {by}</button>
)

export const Double = () => (state, actions) => (
  <button onclick={() => actions.up(state.count)}>+ {state.count}</button>
)

export const view = (state, actions) => (
  <main>
    <h1>{state.count}</h1>
    <Up by={2} />
    <Down by={1} />
    <Double />
  </main>
)
```

#### 👦 🧒 Children Composition

组件通过第二个参数接收子元素，允许你和其他组件将任意子组件传递给它们。

```js
const Box = ({ color }, children) => (
  <div class={`box box-${color}`}>{children}</div>
)

const HelloBox = ({ name }) => (
  <Box color="green">
    <h1 class="title">Hello, {name}!</h1>
  </Box>
)
```

## 📖 🌈 Supported Attributes

支持的属性包括 HTML 属性，SVG 属性，DOM 事件，生命周期事件和 Keys。 ⚠️请注意，不支持非标准 HTML 属性名称，onclick 和 class 有效，但 onClick 或 className 不支持。

你看我脚手架中怎么又是用的 className, onClick 呢？那是 JSX ❕

### 🈵️ 1⃣️ Styles

这个 React 用户懂的！ 对象、驼峰...

### 🚴 🚚 Lifecycle Events

同样生命周期的概念都已经烂大街了，Hyperapp 👍 有更简单的生命周期(可以方便你更加好的完成各种骚操作)。

Hyperapp 中通过生命周期事件实现对 v-DOM 的更新、创建、删除等，从而实现诸如 1⃣️ 获取数据、 2⃣️ 动画、 3⃣️ 清理资源、 4⃣️ 封装三方库等骚操作。

⚠️ 生命周期操作的是 v-DOM，并不是组件本身。这里需要考虑加一个🔑 key 保证我们的事件是绑定到特定的 DOM 元素的。不要乱了套🦆！

#### 1⃣️ 🌈 oncreate

这个事件的触发时机是（⚠️element is created and attached to the DOM）总感觉中文我说不清楚这个感觉。粗暴类比于 React 中的 ComponentDidMount 吧！

直白的说就是 v-DOM 在 patch 操作后再挂载到 DOM 容器后这个时间点。

也就是这个生命周期中是可以直接操作 DOM 的，这里可以处理动画的淡入淡出、网络请求之类的（React 用户很懂）。

~~这里没有 onWillCreate 难道是提前想到了 Fiber 也会干掉这个？~~

```js
import { h } from "hyperapp"

export const Textbox = ({ placeholder }) => (
  <input
    type="text"
    placeholder={placeholder}
    oncreate={element => element.focus()}
  />
)
```

#### 2⃣️ 🌈 onupdate

每次更新元素属性时都会触发此事件。 在事件处理程序中使用 oldAttributes 来检查是否有任何属性发生了变化。

强行凑合着当 getDerivedStateFromProps 用❓❓

```js
import { h } from "hyperapp"

export const Textbox = ({ placeholder }) => (
  <input
    type="text"
    placeholder={placeholder}
    onupdate={(element, oldAttributes) => {
      if (oldAttributes.placeholder !== placeholder) {
        // Handle changes here!
      }
    }}
  />
)
```

#### 3⃣️ 🌈 onremove

在从 DOM 中删除元素 *之前* 👈 触发此事件。 用它来创建幻灯片/淡出动画。 

⚠️ 在函数内部调用以删除元素。 不会在其子元素中调用此事件。

```js
import { h } from "hyperapp"

export const MessageWithFadeout = ({ title }) => (
  <div onremove={(element, done) => fadeout(element).then(done)}>
    <h1>{title}</h1>
  </div>
)
```

#### 4⃣️ 🌈 ondestroy

在从 DOM 中删除元素 *之后* 👈 直接（或由于父项被删除从而）触发此事件。 用它来使计时器无效，取消网络请求，删除全局事件监听器等。

就像 componentWillUnMount ❓❓

```js
import { h } from "hyperapp"

export const Camera = ({ onerror }) => (
  <video
    poster="loading.png"
    oncreate={element => {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(stream => (element.srcObject = stream))
        .catch(onerror)
    }}
    ondestroy={element => element.srcObject.getTracks()[0].stop()}
  />
)
```

### 🔑 🚪 keys

每次更新DOM时，Keys 都有助于识别节点。 通过在虚拟节点上设置 key 属性，可以声明该节点应该对应于特定的 DOM 元素。 

如果位置发生变化，这允许我们将元素重新排序到新位置，而不是冒险破坏它。

```js
import { h } from "hyperapp"

export const ImageGallery = ({ images }) =>
  images.map(({ hash, url, description }) => (
    <li key={hash}>
      <img src={url} alt={description} />
    </li>
  ))
```

⚠️ 键必须在兄弟节点中是唯一的。 如果索引还指定了兄弟节点的顺序，请不要将数组索引用作键。 

⚠️ 如果列表中项目的位置和数量是固定的，则没有区别，但如果列表是动态的，则每次重建树时 key 都会更改。

```js
import { h } from "hyperapp"

export const PlayerList = ({ players }) =>
  players
    .slice()
    .sort((player, nextPlayer) => nextPlayer.score - player.score)
    .map(player => (
      <li key={player.username} class={player.isAlive ? "alive" : "dead"}>
        <PlayerProfile {...player} />
      </li>
    ))
```
❕ ❕ ⚠️ 密钥未在视图的顶级节点上注册。 如果要切换顶级视图，并且必须使用密钥，请将它们包装在不变的节点中。

# 🌈 🌈 源码分析

[你进来啊❕](./docs/hyperapp-note.js)

## 🐍 🐛 react

与 React 做一个简单粗暴的对比：

```jsx
import React from 'react'
import ReactDom from 'react-dom'
ReactDOM.render(<App />, document.getElementById('root'))


import { h, app } from 'hyperapp'
app(state, actions, view, document.getElementById('root'))
```

更多比较细细体会，主要我不想写了。🈚️ 🈚️ 

# ✈️ 🦃️ 脚手架

这是一个基于 parcel + typescript + hyperapp + pwa 的脚手架（本来是打算改吧改吧支持 chrome extensions 开发的）, 正在试图使其支持 antd、再加上数据流、路由等常规配置。

目前正处于不断完善中，希望有兴趣的可以 PR。

# 🌞 🌞 参考

[🔥文档](./about.md)

[🔥虚拟DOM](https://www.zhihu.com/question/29504639)