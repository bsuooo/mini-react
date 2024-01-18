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

const updateProps = (dom, nextProps, oldProps = {}) => {
  // 删除旧的props
  dom && Object.keys(oldProps).forEach(key => {
    if (key !== 'children' && !key.startsWith('on') && !nextProps[key]) {
      dom.removeAttribute(key)
    }
  })
  nextProps && Object.keys(nextProps).forEach(key => {
    if (key.startsWith('on')) {
      const event = key.slice(2).toLowerCase()
      dom.addEventListener(event, nextProps[key])
    }
    if (key !== 'children' && !key.startsWith('on') && dom) {
      dom[key] = nextProps[key]
    }
  })
}

const deletions = []

const reconcileChildren = (fiber, children) => {
  let prev = null
  let oldFiber = fiber.alternate?.child

  children && children.forEach((child, index) => {
    const isSameType = fiber && oldFiber && child.type === oldFiber.type
    let newFiber
    if (isSameType) {
      newFiber = {
        dom: oldFiber?.dom,
        parent: fiber,
        child: null,
        sibling: null,
        type: child.type,
        props: child.props,
        alternate: oldFiber,
        effectTag: 'UPDATE'
      }
    } else {
      newFiber = {
        dom: child.dom,
        parent: fiber,
        child: null,
        sibling: null,
        type: child.type,
        props: child.props,
        alternate: null,
        effectTag: 'PLACEMENT'
      }
      if (oldFiber) {
        // removeOldFiber(oldFiber)
        deletions.push(oldFiber)
      }
    }
    if (index === 0) {
      fiber.child = newFiber
    } else {
      prev.sibling = newFiber
    }
    prev = newFiber
    oldFiber = oldFiber?.sibling || null
  })
}

const commitDelete = (fiber) => {
  if (!fiber) {
    return
  }
  if (fiber.dom) {
    let parentFiber = fiber?.parent
    while (parentFiber && !parentFiber.dom) {
      parentFiber = parentFiber.parent
    }
    if (parentFiber.dom) {
      parentFiber.dom.removeChild(fiber.dom)
    }
  }
  commitDelete(fiber.child)
}

const commitRoot = () => {
  deletions.forEach(commitDelete)
  deletions.length = 0
  commitWork(wipRoot.child)
}

const commitWork = (fiber) => {
  if (!fiber) {
    return
  }
  let parentFiber = fiber?.parent
  while (parentFiber && !parentFiber.dom) {
    parentFiber = parentFiber.parent
  }
  if (parentFiber && fiber.dom && fiber.effectTag === 'PLACEMENT') {
    parentFiber.dom.appendChild(fiber.dom)
  }
  if (fiber.dom && fiber.effectTag === 'UPDATE') {
    updateProps(fiber.dom, fiber.props, fiber.alternate.props)
  }
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

const updateFunctionComponent = (fiber) => {
  const children = [fiber.type(fiber.props)]

  // 创建链表
  reconcileChildren(fiber, children)
}

const updateHostComponent = (fiber) => {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber.type)
  }
  // 更新props
  updateProps(fiber.dom, fiber.props)
  // 创建链表
  reconcileChildren(fiber, fiber.props?.children)
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
  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
    currentRoot = wipRoot
    wipRoot = null
  }
  requestIdleCallback(workLoop)
}

// 开始渲染子节点
requestIdleCallback(workLoop)

// 更新
const update = () => {
  wipRoot = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot
  }
  nextUnitOfWork = wipRoot
}

// work in progress wipRoot
let wipRoot = null
let currentRoot = null
const render = (el, container) => {
  wipRoot = {
    dom: container,
    props: {
      children: [el],
    },
  }
  nextUnitOfWork = wipRoot
}

const React = {
  createElement,
  render,
  update
}

export default React
