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

const render = (el, container) => {
  const { type, props } = el

  const dom = type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(el.type)

  props && Object.keys(props).forEach(key => {
    if (key !== 'children') {
      dom[key] = props[key]
    }
  })

  props && props.children.forEach(child => {
    render(child, dom)
  })

  container.appendChild(dom)
}

const React = {
  createElement,
  render
}

export default React
