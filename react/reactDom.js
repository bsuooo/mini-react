import React from "./react"

function createRoot(container) {
  return {
    render(App) {
      React.render(App, container)
    }
  }
}

const ReactDom = {
  createRoot
}

export default ReactDom