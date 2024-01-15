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
      children: children.map(child => ['string', 'number'].includes(typeof child) ? createTextNode(child) : child)
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

const initChildren = (fiber, children) => {
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

const commitRoot = () => {
  commitWork(root.child)
}

const commitWork = (fiber) => {
  if (!fiber) {
    return
  }
  let parentFiber = fiber?.parent
  while (parentFiber && !parentFiber.dom) {
    parentFiber = parentFiber.parent
  }
  if (parentFiber && fiber.dom) {
    parentFiber.dom.appendChild(fiber.dom)
  }
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

const updateFunctionComponent = (fiber) => {
  const children = [fiber.type(fiber.props)]

  // 创建链表
  initChildren(fiber, children)
}

const updateHostComponent = (fiber) => {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber.type)
  }
  // 更新props
  updateProps(fiber.dom, fiber.props)
  // 创建链表
  initChildren(fiber, fiber.props.children)
}

const perWorkOfUnit = (fiber) => {
  const { type } = fiber
  const isFunctionComponent = typeof type === 'function'
  if (isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }

  // 返回下一个节点
  if (fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}

let nextUnitOfWork = null
let shouldYield = false

const workLoop = (IdleDeadline) => {
  shouldYield = false
  while (!shouldYield && nextUnitOfWork) {
    nextUnitOfWork = perWorkOfUnit(nextUnitOfWork)
    shouldYield = IdleDeadline.timeRemaining() > 0
  }
  if (!nextUnitOfWork && root) {
    commitRoot()
    root = null
  }
  requestIdleCallback(workLoop)
}

// 开始渲染子节点
requestIdleCallback(workLoop)

let root = null
const render = (el, container) => {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [el],
    },
  }
  root = nextUnitOfWork
}

const React = {
  createElement,
  render
}

export default React
