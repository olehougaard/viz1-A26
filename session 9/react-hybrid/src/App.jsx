import { loadData, initState } from './d3'
import './App.css'
import { Viz } from './components/Viz'
import { Legend } from './components/Legend'
import { Axes } from './components/Axes'
import { GraphArea } from './components/GraphArea'
import { Bubbles } from './components/Bubbles'
import { Tooltip } from './components/Tooltip'

function App() {
  async function loadState() {
    const data = await loadData()
    return initState(data)
  }

  const viewBox = { left: 0, top: 0, width: 800, height: 600 }
  return (
    <div id="container">
      <h1>Visualization</h1>
      <Viz viewBox={viewBox} state={loadState}>
        <Legend left='600' top={100}></Legend>
        <GraphArea viewBox={viewBox} margins={{left: 10, top: 10, bottom: 100, right: 200}}>
          <Axes></Axes>
          <Tooltip>
            <Bubbles></Bubbles>
          </Tooltip>
        </GraphArea>
      </Viz>
    </div>
  )
}

export default App
