import React from './react/react.js'

const Counter = ({count}) => {
  return <div>{count}</div>
}

const App = () => {
  return (<div id="app">
    <Counter count={10} />
    <span>
      react-app
      <Counter count={20} />
    </span>
  </div>)
}

export default App
