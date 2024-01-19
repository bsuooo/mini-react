import React from './react/react.js'

let showBar = true;
function Counter() {
  const bar = <div>bar</div>;

  function handleShowBar() {
    showBar = !showBar;
    React.update();
  }

  return (
    <div>
      Counter
      {showBar && bar}
      <button onClick={handleShowBar}>showBar</button>
    </div>
  );
}

function App() {
  return (
    <div>
      hi-mini-react
      <Counter></Counter>
    </div>
  );
}

export default App
