import React from './react/react.js'

// let count = 0
// let props = {id: 'id'}

// function handleClick() {
//   count ++
//   props = {}
//   React.update()
// }

// const Counter = () => {
//   return <button onClick={handleClick}>click ++</button>
// }

let showFoo = false

function changeShowFoo() {
  showFoo = !showFoo
  React.update()
}

function Foo() {
  return <div onClick={changeShowFoo}>foo</div>
}

function Bar() {
  return <div onClick={changeShowFoo}><Foo></Foo>bar</div>
}

// const App = () => {
//   const foo = <div onClick={changeShowFoo}>foo</div>
//   // const bar = <div onClick={changeShowFoo}>bar</div>
//   return (
//     <div id="app">
//       <button onClick={changeShowFoo}>change</button>
//       {showFoo ? <Foo></Foo>: <Bar></Bar>} 
//     </div>
//   )
// }

const App = () => {
  return (
    <div id="app">
      {showFoo && <Foo></Foo>}
      {!showFoo && <Bar></Bar>}
    </div>
  )
}

export default App
