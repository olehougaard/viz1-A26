async function visualize() {
  const svg = d3.select("svg")

  svg.append("marker")
  .attr("id", "arrow")
  .attr("viewBox", "0 0 20 20")
  .attr("refX", 10)
  .attr("refY", 5)
  .attr("markerWidth", 10)
  .attr("markerHeight", 10)
  .attr("orient", "auto")
  .append("path")
    .attr("d", "M 0 0 l 10 5 l -10 5")
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("fill", "none")
    
    const systolicScale = d3.scaleLinear()  
    .domain([90, 160])
  .range([100, 660])

  const diastolicScale = d3.scaleLinear()
  .range([500, 100])
  .domain([60, 110])

  const countScale = d3.scaleLinear()
    .domain([0, 2000])
    .range([0, 20])

  const dayScale = d3.scaleLinear()
    .domain([0, 3])
    .range(["white", "lightgray", "darkgray", "gray"])

  svg.append("g")
  .attr("id", "horizontal-axis")
  .attr("transform", "translate(0, 500)")
  .call(d3.axisBottom(systolicScale).tickSizeOuter(0).tickValues([100, 110, 120, 130, 140, 150]))
  .attr("stroke-width", 2)
  .selectAll("text")
    .attr("y", 10)

  d3.select("#horizontal-axis path.domain").attr("marker-end", "url(#arrow)")  

  svg.append("text")
  .attr("x", 590)
  .attr("y", 525)
  .attr("font-size", 16)
  .text("Systolic Pressure")

  svg.append("g")
  .attr("id", "vertical-axis")
  .attr("transform", "translate(100, 0)")
  .call(d3.axisLeft(diastolicScale).tickSizeOuter(0).tickValues([70, 80, 90, 100]))
  .attr("stroke-width", 2)
  .selectAll("text")
  .attr("x", -10)

  d3.select("#vertical-axis path.domain").attr("marker-end", "url(#arrow)")

  svg.append("text").append("tspan")
    .attr("x", 120)
    .attr("y", 105)
    .attr("font-size", 16)
    .text("Diastolic Pressure")

  const data = await d3.json("./data/bp.json")

  svg.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => systolicScale(d.systolic))
    .attr("cy", d => diastolicScale(d.diastolic))
    .attr("r", d => countScale(d.count))
    .attr("fill", d => dayScale(d.day))
    .attr("stroke", "black")
    .attr("stroke-width", 2)
}