import React from './react/react.js'

let count = 0
let props = {id: 'id'}

function handleClick() {
  count ++
  props = {}
  React.update()
}

const Counter = () => {
  return <button onClick={handleClick}>click ++</button>
}

const App = () => {
  return (<div {...props}>
    <Counter count={10} />
    <span>
      key: {count}
    </span>
  </div>)
}

export default App
