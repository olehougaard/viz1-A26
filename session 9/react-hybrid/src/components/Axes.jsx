import { useEffect } from "react"
import { useViz } from "./Viz"
import { select, axisBottom, axisLeft } from 'd3'

export function Axes() {
  console.log(useViz())
  const {diastolicScale, systolicScale} = useViz()

  useEffect(() => {
    if (systolicScale) {
      select('#horizontal-axis')
        .call(axisBottom(systolicScale))
        .attr("stroke-width", 2)
        .selectAll("text")
          .attr("y", 10)
    }

    if (diastolicScale) {
      select('#vertical-axis')
      .call(axisLeft(diastolicScale))
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