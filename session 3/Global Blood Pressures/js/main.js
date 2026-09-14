let data

async function loadData() {
  const rawData = await d3.csv("./data/blood_pressure_global_dataset.csv", d3.autoType)
  data = rawData.map(d => {
    return {
      ...d,
      Date: new Date(d.Date),
    }
  })
  console.log(data)
  console.log(data[0])
  console.log(descriptiveStatistics(data, d => d.Diastolic_BP_mmHg))
  console.log(descriptiveStatistics(data, d => d.Systolic_BP_mmHg))
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

const ageGroups = [
  "Infant (0-1)",
  "Early Childhood (1-5)",
  "Middle Childhood (6-10)",
  "Early Adolescence (11-15)",
  "Late Adolescence (16-18)",
  "Young Adult (19-29)",
  "Adult (30-39)",
  "Middle-Aged (40-49)",
  "Middle-Aged Senior (50-59)",
  "Young Elderly (60-69)",
  "Elderly (70-79)",
  "Very Elderly (80+)"
]

function displayLegend(visibleArea, ageGroupColorScale, y = 0) {
  const bottom = 30 * ageGroups.length

  const legend = visibleArea.append("g")
    .attr("id", "legend")
    .attr("transform", `translate(840, ${y})`)
  
  legend
    .selectAll("rect")
    .data(ageGroups)
    .join("rect")
    .attr("x", 0)
    .attr("y", (_, i) => bottom - (i + 1) * 30)
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", d => ageGroupColorScale(d))
    .attr("stroke", "black")
    .attr("stroke-width", 2)

  legend
    .selectAll("text")
    .data(ageGroups)
    .join("text")
    .attr("x", 30)
    .attr("y", (_, i) => bottom - (i + 1) * 30 + 15)
    .attr("font-size", 16)
    .text(d => d)
}

function visualizeAgeGroupByRegion() {
  const groupedData = d3.rollup(data, d => d.length, d => d.WHO_Region, d => d.Age_Group)

  console.log(groupedData)

  const regions = groupedData.keys().toArray().sort()

  console.log(regions)

  console.log(regions.map(region => groupedData.get(region)))

  const stacking = d3.stack()
    .keys(ageGroups)
    .value(([, regionalData], ageGroup) => regionalData.get(ageGroup))

  console.log(stacking(groupedData))

  const stacks = stacking(groupedData)

  const regionSizes = regions.map(region => d3.sum(groupedData.get(region).values()))

  const sizeScale = d3.scaleLinear()
    .domain([0, d3.max(regionSizes)])
    .range([600, 0])
    .nice()

  const regionScale = d3.scaleBand()
    .domain(regions)
    .range([0, 800])
    .padding(0.2)

  const ageGroupColorScale = d3.scaleOrdinal()
    .domain(ageGroups)
    .range(ageGroups.map((_, i) => d3.interpolateViridis((ageGroups.length - i - 1) / ageGroups.length)))
//    .range(ageGroups.map((_, i) => d3.interpolateTurbo((ageGroups.length - i - 1) / ageGroups.length)))

  const width = 1000
  const height = 600
  const margins = {top: 50, right: 50, bottom: 50, left: 50}
  const visibleWidth = width - margins.left - margins.right
  const visibleHeight = height - margins.top - margins.bottom

  d3.select("#container").selectAll("*").remove()
  const svg = d3.select("#container").append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)

  const visibleArea = svg.append("g")
    .attr("transform", 
          `translate(${margins.left}, ${margins.top}) 
           scale(${visibleWidth / width}, ${visibleHeight / height})`)

           
  visibleArea.append("g")
    .attr("id", "horizontal-axis")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(regionScale))
    .attr("stroke-width", 2)
    .selectAll("text")
      .attr("font-size", 16)      

 visibleArea.append("g")
  .attr("id", "vertical-axis")
  .call(d3.axisLeft(sizeScale))
  .attr("stroke-width", 2)
  .selectAll("text")
  .attr("x", -10)
  .attr("font-size", 16)

  visibleArea.append("text")
    .attr("x", 20)
    .attr("y", 0)
    .attr("font-size", 20)
    .text("People")

  const ageGroupVis = visibleArea.selectAll(".ageGroupRects")
    .data(stacks)
    .join("g")
    .attr("class", "ageGroupRects")
    .attr("fill", d => ageGroupColorScale(d.key))

  ageGroupVis.selectAll("rect")
    .data(d => d)
    .join("rect")
    .attr("x", d => regionScale(d.data[0]))
    .attr("width", regionScale.bandwidth())
    .attr("y", d => sizeScale(d[1]))
    .attr("height", d => sizeScale(d[0]) - sizeScale(d[1]))

  displayLegend(visibleArea, ageGroupColorScale)
}

function visualizeAgeGroupByYear() {

  const groupedData = d3.rollup(data, d => d.length, d => d.Year, d => d.Age_Group)

  console.log(groupedData)

  const years = groupedData.keys().toArray().sort()

  const stacking = d3.stack()
    .keys(ageGroups)
    .value(([, annualData], ageGroup) => annualData.get(ageGroup))

  console.log(stacking(groupedData))

  const stacks = stacking(groupedData)

  const annualSizes = years.map(year => d3.sum(groupedData.get(year).values()))

  const sizeScale = d3.scaleLinear()
    .domain([0, d3.max(annualSizes)])
    .range([600, 0])
    .nice()

  const regionScale = d3.scaleBand()
    .domain(years)
    .range([0, 800])
    .padding(0.2)

  const ageGroupColorScale = d3.scaleOrdinal()
    .domain(ageGroups)
    .range(ageGroups.map((_, i) => d3.interpolateViridis((ageGroups.length - i - 1) / ageGroups.length)))

  const width = 1000
  const height = 600
  const margins = {top: 50, right: 50, bottom: 50, left: 50}
  const visibleWidth = width - margins.left - margins.right
  const visibleHeight = height - margins.top - margins.bottom

  d3.select("#container").selectAll("*").remove()
  const svg = d3.select("#container").append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)

  const visibleArea = svg.append("g")
    .attr("transform", 
          `translate(${margins.left}, ${margins.top}) 
           scale(${visibleWidth / width}, ${visibleHeight / height})`)

  visibleArea.append("g")
    .attr("id", "horizontal-axis")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(regionScale))
    .attr("stroke-width", 2)
    .selectAll("text")
      .attr("font-size", 16)
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-45)")     

 visibleArea.append("g")
  .attr("id", "vertical-axis")
  .call(d3.axisLeft(sizeScale))
  .attr("stroke-width", 2)
  .selectAll("text")
  .attr("x", -10)
  .attr("font-size", 16)

  visibleArea.append("text")
    .attr("x", 20)
    .attr("y", 0)
    .attr("font-size", 20)
    .text("People")

  const ageGroupVis = visibleArea.selectAll(".ageGroupRects")
    .data(stacks)
    .join("g")
    .attr("class", "ageGroupRects")
    .attr("fill", d => ageGroupColorScale(d.key))

  ageGroupVis.selectAll("rect")
    .data(d => d)
    .join("rect")
    .attr("x", d => regionScale(d.data[0]))
    .attr("width", regionScale.bandwidth())
    .attr("y", d => sizeScale(d[1]))
    .attr("height", d => sizeScale(d[0]) - sizeScale(d[1]))
  
  displayLegend(visibleArea, ageGroupColorScale)
}

function visualizeAgeGroupByYearStreamGraph() {
  const groupedData = d3.rollup(data, d => d.length, d => d.Year, d => d.Age_Group)

  console.log(groupedData)

  const years = groupedData.keys().toArray().sort()

  const sortedGroups = years.map(year => [year, groupedData.get(year)])

  const stacking = d3.stack()
    .keys(ageGroups)
    .value(([, annualData], ageGroup) => annualData.get(ageGroup))

  console.log(stacking(sortedGroups))

  const stacks = stacking(sortedGroups)

  const annualSizes = years.map(year => d3.sum(groupedData.get(year).values()))

  const sizeScale = d3.scaleLinear()
    .domain([0, d3.max(annualSizes)])
    .range([600, 0])
    .nice()

  const yearScale = d3.scaleBand()
    .domain(years)
    .range([0, 800])
    .padding(0.2)

  const ageGroupColorScale = d3.scaleOrdinal()
    .domain(ageGroups)
    .range(ageGroups.map((_, i) => d3.interpolateViridis((ageGroups.length - i - 1) / ageGroups.length)))

  const width = 1000
  const height = 600
  const margins = {top: 50, right: 50, bottom: 50, left: 50}
  const visibleWidth = width - margins.left - margins.right
  const visibleHeight = height - margins.top - margins.bottom

  d3.select("#container").selectAll("*").remove()
  const svg = d3.select("#container").append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)

  const visibleArea = svg.append("g")
    .attr("transform", 
          `translate(${margins.left}, ${margins.top}) 
           scale(${visibleWidth / width}, ${visibleHeight / height})`)

  visibleArea.append("g")
    .attr("id", "horizontal-axis")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(yearScale))
    .attr("stroke-width", 2)
    .selectAll("text")
      .attr("font-size", 16)
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-45)")     

 visibleArea.append("g")
  .attr("id", "vertical-axis")
  .call(d3.axisLeft(sizeScale))
  .attr("stroke-width", 2)
  .selectAll("text")
  .attr("x", -10)
  .attr("font-size", 16)

  visibleArea.append("text")
    .attr("x", 20)
    .attr("y", 0)
    .attr("font-size", 20)
    .text("People")

  const areaGenerator = d3.area()
    .x(d => yearScale(d.data[0]) + yearScale.bandwidth() / 2)
    .y0(d => sizeScale(d[0]))
    .y1(d => sizeScale(d[1]))
    .curve(d3.curveBasis)

  visibleArea.append('g')
    .attr('class', 'graph')
    .selectAll("path")
    .data(stacks)
    .join("path")
    .attr("d", areaGenerator)
    .attr("fill", d => ageGroupColorScale(d.key))   
    
  displayLegend(visibleArea, ageGroupColorScale)
}

function visualizeAgeGroupByYearStreamGraphCentered() {
  const groupedData = d3.rollup(data, d => d.length, d => d.Year, d => d.Age_Group)

  console.log(groupedData)

  const years = groupedData.keys().toArray().sort()

  const sortedGroups = years.map(year => [year, groupedData.get(year)])

  const stacking = d3.stack()
    .keys(ageGroups)
    .value(([, annualData], ageGroup) => annualData.get(ageGroup))

  console.log(stacking(sortedGroups))

  const stacks = stacking(sortedGroups)

  const annualSizes = years.map(year => d3.sum(groupedData.get(year).values()))

  const sizeScale = d3.scaleLinear()
    .domain([0, d3.max(annualSizes)])
    .range([600, 0])
    .nice()

  const yearScale = d3.scaleBand()
    .domain(years)
    .range([0, 800])
    .padding(0.2)

  const ageGroupColorScale = d3.scaleOrdinal()
    .domain(ageGroups)
    .range(ageGroups.map((_, i) => d3.interpolateViridis((ageGroups.length - i - 1) / ageGroups.length)))

  const width = 1000
  const height = 600
  const margins = {top: 20, right: 20, bottom: 40, left: 0}
  const visibleWidth = width - margins.left - margins.right
  const visibleHeight = height - margins.top - margins.bottom

  d3.select("#container").selectAll("*").remove()
  const svg = d3.select("#container").append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)

  const visibleArea = svg.append("g")
    .attr("transform", 
          `translate(${margins.left}, ${margins.top}) 
           scale(${visibleWidth / width}, ${visibleHeight / height})`)

  visibleArea.append("g")
    .attr("id", "horizontal-axis")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(yearScale))
    .attr("stroke-width", 2)
    .selectAll("text")
      .attr("font-size", 16)
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-45)")     

  const center = 300

  const areaGenerator = d3.area()
    .x(d => yearScale(d.data[0]) + yearScale.bandwidth() / 2)
    .y0((d, i) => sizeScale(d[0] - annualSizes[i] / 2) - center)
    .y1((d, i) => sizeScale(d[1] - annualSizes[i] / 2) - center)
    .curve(d3.curveBasis)

  visibleArea.append('g')
    .attr('class', 'graph')
    .selectAll("path")
    .data(stacks)
    .join("path")
    .attr("d", areaGenerator)
    .attr("fill", d => ageGroupColorScale(d.key))   
    
  displayLegend(visibleArea, ageGroupColorScale, 110)
}

async function init() {
  await loadData()
  visualizeAgeGroupByRegion()
  document.getElementById("vis1").checked = true
}
