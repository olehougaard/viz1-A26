async function loadData() {
  const rawData = await d3.csv("./data/blood_pressure_global_dataset.csv", d3.autoType)
  const data = rawData.map(d => {
    return {
      ...d,
      Date: new Date(d.Date),
    }
  })
  console.log(data)
  console.log(data[0])
  console.log(descriptiveStatistics(data, d => d.Diastolic_BP_mmHg))
  console.log(descriptiveStatistics(data, d => d.Systolic_BP_mmHg))
  return data
}

function descriptiveStatistics(data, extractor) {
  const values = data.map(extractor)
  const min = d3.min(values)
  const max = d3.max(values)
  const mean = d3.mean(values)
  const median = d3.median(values)
  const q1 = d3.quantile(values, 0.25)
  const q3 = d3.quantile(values, 0.75)
  return {min, max, mean, median, q1, q3}
}

function drawAxes({viz, dom}) {
  const {diastolicScale, systolicScale} = viz
  const {diagram} = dom

  diagram.append("g")
    .attr("id", "horizontal-axis")
    .attr("transform", "translate(0, 500)")
    .call(d3.axisBottom(systolicScale))
    .attr("stroke-width", 2)
    .selectAll("text")
      .attr("y", 10)

  diagram.append("text")
  .attr("x", 590)
  .attr("y", 535)
  .attr("font-size", 16)
  .text("Systolic Pressure")

 diagram.append("g")
  .attr("id", "vertical-axis")
  .attr("transform", "translate(100, 0)")
  .call(d3.axisLeft(diastolicScale))
  .attr("stroke-width", 2)
  .selectAll("text")
  .attr("x", -10)

  diagram.append("text")
    .attr("x", 40)
    .attr("y", 85)
    .attr("font-size", 16)
    .text("Diastolic Pressure")
}

function drawLegend({model, viz, dom, update}) {
  const {selected} = model
  const {whoRegionScale} = viz
  const {legend} = dom

  legend
    .selectAll("rect")
    .data(d => d)
    .join("rect")
    .attr("x", 0)
    .attr("y", (_, i) => i * 30)
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", d => whoRegionScale(d))
    .attr("stroke", d => selected.has(d)? 'black': 'white')
    .attr("stroke-width", d => selected.has(d)? 2 : 1)
    .on('click', (e, d) => {
      update({selected: selected.symmetricDifference(new Set([d]))})
      e.stopPropagation()
    })

  legend
    .selectAll("text")
    .data(d => d)
    .join("text")
    .attr("x", 30)
    .attr("y", (_, i) => i * 30 + 15)
    .attr("font-size", 16)
    .text(d => d)
}

function view(state) {
  const {model, viz, dom, update} = state

  const selected = model.selected
  
  const { diastolicScale, systolicScale, whoRegionScale } = viz

  drawAxes(state)
  drawLegend(state)

  const filteredData = model.groupedData.filter(d => selected.has(d.WHO_Region))
  
  const sizeScale = viz.sizeScale
  
  const diagram = dom.diagram

  const circles = diagram.selectAll("circle")
    .data(filteredData, d => d.key)
    .join(
      enter => enter
        .append("circle")
        .style('opacity', 0)
        .attr("r", 0)
        .transition()
        .duration(2000)
        .attr("r", d => sizeScale(d.sampleSize))
        .style('opacity', 1),
      update => update,
      exit => exit
        .transition()
        .duration(2000)
        .style('opacity', 0)
        .attr("r", 0)
        .remove()
    )
    .attr("cx", d => systolicScale(d.averageSystolic))
    .attr("cy", d => diastolicScale(d.averageDiastolic))
    .attr("fill", d => whoRegionScale(d.WHO_Region))
    .attr("stroke", "black")
    .attr("stroke-width", 2)

  
  const toolTipFadeDuration = 500

  const showTooltip = ({clientX, clientY}, {key}) => {
    const x = (clientX - 10) / dom.scaleX
    const y = (clientY - 80) / dom.scaleY
    dom.toolTipText
      .text(key)
    dom.toolTip
      .attr('transform', `translate(${x}, ${y})`)
      .transition()
      .duration(toolTipFadeDuration)
      .ease(d3.easeQuadInOut)
      .style('opacity', 1)
  }

  const hideTooltip = () => dom.toolTip
    .transition()
    .duration(toolTipFadeDuration)
    .ease(d3.easeQuadOut)
    .style('opacity', 0)
    

  circles.on('mouseenter', showTooltip)
  
  circles.on('mousemove', showTooltip)
  
  circles.on('mouseleave', hideTooltip)
}

function createModel(data) {
  const groupedMap = d3.group(data, d => d.Country)
  const groupedData = Array.from(groupedMap, ([key, values]) => ({
    key: key,
    Country: key, 
    WHO_Region: d3.mode(values, d => d.WHO_Region),
    averageDiastolic: d3.mean(values, d => d.Diastolic_BP_mmHg),
    averageSystolic: d3.mean(values, d => d.Systolic_BP_mmHg),
    sampleSize: values.length
  }))  
  const whoRegions = new Set(data.map(d => d.WHO_Region))
  return {
    groupedData,
    selected: whoRegions,
    whoRegions: Array.from(whoRegions).sort()
  }
}

function createDOM({whoRegions}) {
  d3.select("#container").select("*").remove()

  const x = 10
  const y = 10
  const scaleX = .75
  const scaleY = .75

  const svg = d3.select("#container")
    .append("svg")
    .attr("viewBox", "0 0 800 600")

  const drawArea = svg.append('g')
    .attr("transform", 
      `translate(${x}, ${y}) 
      scale(${scaleX}, ${scaleY})`)
    
  const legend = svg.selectAll("#legend")
    .data([whoRegions])
    .join("g")
    .attr("id", "legend")
    .attr("transform", "translate(600, 100)")
      
  const diagram = drawArea.append('g')
    .attr('id', 'diagram')

  const toolTip = drawArea.append('g')
    .attr('id', 'tool-tip')
    .style('opacity', 0)
  
  toolTip.append('rect')
    .attr('width', '160')
    .attr('height', '20')
    .attr('fill', 'cornsilk')
    .attr('stroke', 'black')
    .attr('stroke-width', 1)

  const toolTipText = toolTip.append('text')
    .attr('x', 5)
    .attr('y', 15)
  
  return {x, y, scaleX, scaleY, svg, diagram, legend, toolTip, toolTipText }
}

function createViz({groupedData, whoRegions}) {
  const diastolicScale = d3.scaleLinear()
    .domain(d3.extent(groupedData, d => d.averageDiastolic))
    .range([500, 100])
    .nice()

  const systolicScale = d3.scaleLinear()
    .domain(d3.extent(groupedData, d => d.averageSystolic))
    .range([100, 700])
    .nice()

  const whoRegionScale = d3.scaleOrdinal()
    .domain(whoRegions)
    .range(d3.schemeAccent)

  const sizeScale = d3.scaleLinear()
  .domain(d3.extent(groupedData, d => d.sampleSize))
  .range([5, 25])
  .nice()
  
  return {
    diastolicScale, 
    systolicScale,
    sizeScale,
    whoRegionScale,
  }
}

async function init() {
  const model = createModel(await loadData())
  const dom = createDOM(model)
  const viz = createViz(model)

  const state = {
    model,
    dom,
    viz,
    update(patch) {
      state.model = {...state.model, ...patch}
      view(state)
    }
  }
  
  view(state)
}
