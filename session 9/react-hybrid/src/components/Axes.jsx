import { useEffect } from "react"
import { useViz } from "./Viz"
import * as d3 from 'd3'

export function Axes() {
  console.log(useViz())
  const {diastolicScale, systolicScale} = useViz()

  useEffect(() => {
    if (systolicScale) {
      d3.select('#horizontal-axis')
        .call(d3.axisBottom(systolicScale))
        .attr("stroke-width", 2)
        .selectAll("text")
          .attr("y", 10)
    }

    if (diastolicScale) {
      d3.select('#vertical-axis')
      .call(d3.axisLeft(diastolicScale))
      .attr("stroke-width", 2)
      .selectAll("text")
        .attr("x", -10)    
    }
  }, [diastolicScale, systolicScale])

  return <>
    <g transform='translate(0, 500)' id='horizontal-axis'></g>
    <g transform='translate(100, 0)' id='vertical-axis'></g>
    <text x='590' y='535' fontSize='16'>Systolic Pressure</text>
    <text x='40' y='85' fontSize='16'>Diastolic Pressure</text>
  </>
}