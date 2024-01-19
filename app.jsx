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
  console.log(1);
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
//   const foo = <div>foo</div>
//   const bar = <div>bar</div>
//   return (
//     <div id="app">
//       {showFoo ? foo : bar} 
//       {showFoo ? foo : bar} 
//       <button onClick={changeShowFoo}>change</button>
//     </div>
//   )
// }

const App = () => {
  return (
    <div id="app" onClick={changeShowFoo}>
      <Foo></Foo>
      <Foo></Foo>
      <Foo></Foo>
    </div>
  )
}

export default App
