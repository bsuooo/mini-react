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
      dom.removeEventListener(event, oldProps[key])
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
    const isSameType = child?.type === oldFiber?.type
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
      if (child) {
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

    if (newFiber) {
      prev = newFiber
    }

    oldFiber = oldFiber?.sibling || null
  })
  // 检测有没有兄弟节点需要删除 新的已经遍历完了, 看看旧的有没有剩的
  while (oldFiber) {
    deletions.push(oldFiber);
    oldFiber = oldFiber.sibling
  }
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
    if (parentFiber.dom && fiber.type) {
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
    updateProps(fiber.dom, fiber.props, fiber.alternate?.props)
  }
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

let wipFiber = null

const updateFunctionComponent = (fiber) => {
  fiber.stateHook = []
  fiberHooksIndex = 0
  wipFiber = fiber
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

    if (wipRoot?.sibling?.type === nextUnitOfWork?.type) {
      nextUnitOfWork = undefined
    }

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
  let currentFiber = wipFiber
  return () => {
    wipRoot = {
      ...currentFiber,
      alternate: currentFiber
    }
    nextUnitOfWork = wipRoot
  }
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

let fiberHooksIndex
const useState = (init) => {
  let currentFiber = wipFiber
  const oldFiber = currentFiber.alternate
  const state = {
    value: oldFiber?.stateHook[fiberHooksIndex] ? oldFiber?.stateHook[fiberHooksIndex]?.value : init,
    queue: oldFiber?.stateHook[fiberHooksIndex]?.queue || []
  }

  state.queue.forEach(fn => {
    state.value = fn(state.value)
  })

  state.queue.length = 0

  fiberHooksIndex++
  wipFiber.stateHook.push(state)
  const setState = (fn) => {
    const eagerState = typeof fn === 'function' ? fn(state.value) : fn
    if (state.value === eagerState) {
      return
    }

    state.queue.push(typeof fn === 'function' ? fn : () => fn)
    wipRoot = {
      ...currentFiber,
      alternate: currentFiber
    }
    nextUnitOfWork = wipRoot
  }
  return [state.value, setState]
}

const React = {
  createElement,
  render,
  update,
  useState
}

export default React
