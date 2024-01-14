const createTextNode = (text) => {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  }
}

const createElement = (type, props, ...children) => {
  return {
    type,
    props: {
      ...props,
      children: children.map(child => typeof child === 'string' ? createTextNode(child) : child)
    }
  }
}

const createDom = (type) => {
  return type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(type)
}

const updateProps = (dom, props) => {
  props && Object.keys(props).forEach(key => {
    if (key !== 'children') {
      dom[key] = props[key]
    }
  })
}

const initChildren = (fiber) => {
  const { children } = fiber.props
  let prev = null
  children.forEach((child, index) => {
    const newFiber = {
      dom: child.dom,
      parent: fiber,
      child: null,
      sibling: null,
      type: child.type,
      props: child.props
    }
    if (index === 0) {
      fiber.child = newFiber
    } else {
      prev.sibling = newFiber
    }
    prev = newFiber
  })
}

const perWorkOfUnit = (fiber) => {
  const { type, props, parent } = fiber
  // 没有dom创建dom
  if (!fiber.dom) {
    fiber.dom = createDom(type)
    // 更新props
    updateProps(fiber.dom, props)
    // 添加节点
    parent.dom.appendChild(fiber.dom)
  }

  // 创建链表
  initChildren(fiber)

  // 返回下一个节点
  return fiber.child || fiber.sibling
}

let nextUnitOfWork = null
let shouldYield = false

const workLoop = (IdleDeadline) => {
  shouldYield = false
  while (!shouldYield && nextUnitOfWork) {
    nextUnitOfWork = perWorkOfUnit(nextUnitOfWork)
    shouldYield = IdleDeadline.timeRemaining() > 0
  }
  requestIdleCallback(workLoop)
}

// 开始渲染子节点
requestIdleCallback(workLoop)

const render = (el, container) => {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [el],
    }
  }
}

const React = {
  createElement,
  render
}

export default React
