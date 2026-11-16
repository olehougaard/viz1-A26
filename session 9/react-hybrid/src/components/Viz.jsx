import { createContext, useContext, useEffect, useState } from "react";
import * as d3 from 'd3'

const emptyState = {
    model: {
        groupedData: [],
        whoRegions: [], 
        selected: new Set()
    },
    viz: {
        systolicScale: d3.scaleLinear().domain([50, 200]).range([100, 700]),
        diastolicScale: d3.scaleLinear().domain([50, 200]).range([500, 100]),
        whoRegionScale: d3.scaleOrdinal().domain([]).range(d3.schemeAccent),
        sizeScale: d3.scaleLinear().domain([0, 1000]).range([0, 25])
    }
}

export const VizContext = createContext(emptyState)

export function Viz(props) {
    const {viewBox} = props
    const [state, setState] = useState(emptyState)

    useEffect(() => {
        async function init() {
          const state = await props.state()
          setState(state)
        }
        init()
    }, [])

    const {left, top, width, height} = viewBox

    function update(patch) {
      const model = {...state.model, ...patch}
      setState({...state, model})
    }

    return <VizContext value={{state, update}}>
        <svg viewBox = {`${left} ${top} ${width} ${height}`}>
            {props.children}
        </svg>
    </VizContext>
}

export function useVizModel() {
  const {state} = useContext(VizContext)
  return state.model
}

export function useViz() {
  const {state} = useContext(VizContext)
  return state.viz
}

export function useUpdate() {
    const {update} = useContext(VizContext)
    return update
}