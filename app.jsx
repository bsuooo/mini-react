import React from './react/react.js'

function Foo() {
  const [countFoo, setCountFoo] = React.useState(1)

  const [countBar, setCountBar] = React.useState('bar')

  function handleClick() {
    setCountFoo((countFoo) => countFoo + 1)
    setCountBar((countBar) => 'barbar')
  }

  React.useEffect(() => {
    console.log('foo effect');
  }, [])

  React.useEffect(() => {
    console.log('foo2 effect');
    return () => {
      console.log('foo2 cleanup');
    }
  }, [countFoo])


  return (
    <div>
      <h1>Foo</h1>
      <div>{countFoo}</div>
      <div>{countBar}</div>
      <button onClick={handleClick}>click</button>
    </div>
  )
}

// let countBar = 1

// function Bar() {
//   console.log('bar rerun');
//   const update = React.update()

//   function handleClick() {
//     countBar++
//     update()
//   }

//   return (
//     <div>
//       <h1>Bar</h1>
//       {countBar}
//       <button onClick={handleClick}>click</button>
//     </div>
//   )
// }

function App() {
  return (
    <div>
      <Foo />
      {/* <Bar /> */}
    </div>
  )
}


export default App
