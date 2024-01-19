import React from './react/react.js'

let countFoo = 1

function Foo() {
  console.log('foo rerun');
  const update = React.update()

  function handleClick() {
    countFoo++
    update()
  }

  return (
    <div>
      <h1>Foo</h1>
      {countFoo}
      <button onClick={handleClick}>click</button>
    </div>
  )
}

let countBar = 1

function Bar() {
  console.log('bar rerun');
  const update = React.update()

  function handleClick() {
    countBar++
    update()
  }

  return (
    <div>
      <h1>Bar</h1>
      {countBar}
      <button onClick={handleClick}>click</button>
    </div>
  )
}

function App() {
  return (
    <div>
      <Foo />
      <Bar />
    </div>
  )
}


export default App
