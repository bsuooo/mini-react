import React from './react/react.js'

let count = 0

function handleClick() {
  count ++
  console.log(count);
  React.update()
}

const Counter = () => {
  return <button onClick={handleClick}>count ++</button>
}

const App = () => {
  return (<div id="app">
    <Counter count={10} />
    <span>
      key: {count}
    </span>
  </div>)
}

export default App
