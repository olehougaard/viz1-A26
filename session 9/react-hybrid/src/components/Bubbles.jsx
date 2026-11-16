import { useContext, useEffect } from "react";
import { useViz, useVizModel } from "./Viz";
import * as d3 from 'd3'
import { TooltipContext } from "./Tooltip";

export function Bubbles() {
  const { groupedData, selected } = useVizModel()
  const { diastolicScale, systolicScale, whoRegionScale, sizeScale } = useViz()
  const filteredData = groupedData.filter(d => selected.has(d.WHO_Region))
  const { showTooltip, hideTooltip } = useContext(TooltipContext)

  useEffect(() => {
    const diagram = d3.select('#bubbles')
    const circles = diagram.selectAll("circle")
      .data(filteredData, d => d.key)
      .join(
        enter => enter
          .append("circle")
          .style('opacity', 0)
          .attr("r", 0)
          .transition()
          .duration(200)
          .attr("r", d => sizeScale(d.sampleSize))
          .style('opacity', 1),
        update => update,
        exit => exit
          .transition()
          .duration(200)
          .style('opacity', 0)
          .attr("r", 0)
          .remove()
      )
      .attr("cx", d => systolicScale(d.averageSystolic))
      .attr("cy", d => diastolicScale(d.averageDiastolic))
      .attr("fill", d => whoRegionScale(d.WHO_Region))
      .attr("stroke", "black")
      .attr("stroke-width", 2)

    function tooltipEnabled({clientX, clientY}, {key}) {
      const x = (clientX - 380) * .97
      const y = (clientY - 80) * .88
      showTooltip(x, y, key)
    }

    circles.on('mouseenter', tooltipEnabled)
    
    circles.on('mousemove', tooltipEnabled)
    
    circles.on('mouseleave', hideTooltip)

  }, [filteredData, diastolicScale, systolicScale, whoRegionScale])

  return <g id='bubbles'></g>
}