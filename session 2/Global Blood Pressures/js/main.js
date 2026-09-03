let data

async function loadData() {
  data = await d3.csv("./data/blood_pressure_global_dataset.csv", d3.autoType)
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

function visualizeDiastolicSystolic() {
  const diastolicScale = d3.scaleLinear()
    .domain([25, 130])
    .range([500, 100])

  const systolicScale = d3.scaleLinear()
    .domain([40, 250])
    .range([100, 700])

  d3.select("#container").selectAll("*").remove()
  const svg = d3.select("#container").append("svg")
    .attr("viewBox", "0 0 800 600")

  svg.append("g")
    .attr("id", "horizontal-axis")
    .attr("transform", "translate(0, 500)")
    .call(d3.axisBottom(systolicScale))
    .attr("stroke-width", 2)
    .selectAll("text")
      .attr("y", 10)

  svg.append("text")
  .attr("x", 590)
  .attr("y", 535)
  .attr("font-size", 16)
  .text("Systolic Pressure")

  svg.append("g")
  .attr("id", "vertical-axis")
  .attr("transform", "translate(100, 0)")
  .call(d3.axisLeft(diastolicScale))
  .attr("stroke-width", 2)
  .selectAll("text")
  .attr("x", -10)

  svg.append("text").append("tspan")
    .attr("x", 40)
    .attr("y", 85)
    .attr("font-size", 16)
    .text("Diastolic Pressure")

  svg.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => systolicScale(d.Systolic_BP_mmHg))
    .attr("cy", d => diastolicScale(d.Diastolic_BP_mmHg))
    .attr("r", 1)
    .attr("fill", "black")
}

function visualizeBloodPressureByCountry() {
  const groupedData = d3.group(data, d => d.Country)
  const bloodPressureByCountry = Array.from(groupedData, ([country, values]) => {
    return { 
      country,
      WHO_Region: values[0].WHO_Region,
      averageDiastolic: d3.mean(values, d => d.Diastolic_BP_mmHg),
      averageSystolic: d3.mean(values, d => d.Systolic_BP_mmHg),
      sampleSize: values.length
    }
  })

  const whoRegions = Array.from(new Set(data.map(d => d.WHO_Region))).sort()

  const diastolicScale = d3.scaleLinear()
    .domain([70, 80])
    .range([500, 100])

  const systolicScale = d3.scaleLinear()
    .domain([120, 135])
    .range([100, 700])


  const sizeScale = d3.scaleLinear()
    .domain([70, 125])
    .range([1, 10])

  const whoRegionScale = d3.scaleOrdinal()
    .domain(whoRegions)
    .range(d3.schemeAccent)

  d3.select("#container").selectAll("*").remove()
  const svg = d3.select("#container").append("svg")
    .attr("viewBox", "0 0 800 600")

  svg.append("g")
    .attr("id", "horizontal-axis")
    .attr("transform", "translate(0, 500)")
    .call(d3.axisBottom(systolicScale))
    .attr("stroke-width", 2)
    .selectAll("text")
      .attr("y", 10)

  svg.append("text")
  .attr("x", 590)
  .attr("y", 535)
  .attr("font-size", 16)
  .text("Systolic Pressure")

 svg.append("g")
  .attr("id", "vertical-axis")
  .attr("transform", "translate(100, 0)")
  .call(d3.axisLeft(diastolicScale))
  .attr("stroke-width", 2)
  .selectAll("text")
  .attr("x", -10)

  svg.append("text")
    .attr("x", 40)
    .attr("y", 85)
    .attr("font-size", 16)
    .text("Diastolic Pressure")

  svg.selectAll("circle")
    .data(bloodPressureByCountry)
    .join("circle")
    .attr("cx", d => systolicScale(d.averageSystolic))
    .attr("cy", d => diastolicScale(d.averageDiastolic))
    .attr("r", d => sizeScale(d.sampleSize))
    .attr("fill", d => whoRegionScale(d.WHO_Region))
    .attr("stroke", "black")
    .attr("stroke-width", 2)

  const legend = svg.append("g")
    .attr("id", "legend")
    .attr("transform", "translate(600, 100)")
  
    legend
      .selectAll("rect")
      .data(whoRegions)
      .join("rect")
      .attr("x", 0)
      .attr("y", (_, i) => i * 30)
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", d => whoRegionScale(d))
      .attr("stroke", "black")
      .attr("stroke-width", 2)

    legend
      .selectAll("text")
      .data(whoRegions)
      .join("text")
      .attr("x", 30)
      .attr("y", (_, i) => i * 30 + 15)
      .attr("font-size", 16)
      .text(d => d)
}

function visualizeBloodPressureByAgeGroup() {
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

  const groupedData = d3.group(data, d => d.Age_Group)
  const bloodPressureByAgeGroup = {}
  for(const ageGroup of ageGroups) {
    const values = groupedData.get(ageGroup)
    if(values) {
      bloodPressureByAgeGroup[ageGroup] = {
        averageMAP: d3.mean(values, d => d.Mean_Arterial_Pressure),
        averageDiastolic: d3.mean(values, d => d.Diastolic_BP_mmHg),
        averageSystolic: d3.mean(values, d => d.Systolic_BP_mmHg),
        sampleSize: values.length
      }
    }
  }

  console.log(d3.min(ageGroups.map(ageGroup => bloodPressureByAgeGroup[ageGroup].averageMAP)))
  console.log(d3.max(ageGroups.map(ageGroup => bloodPressureByAgeGroup[ageGroup].averageMAP)))

  const mapScale = d3.scaleLinear()
    .domain([50, 110])
    .range([150, 700])

  const ageGroupScale = d3.scaleBand()
    .domain(ageGroups)
    .range([100, 500])
    .padding(0.2)

  const ageGroupColorScale = d3.scaleOrdinal()
    .domain(ageGroups)
    .range(d3.schemeAccent)

  d3.select("#container").selectAll("*").remove()
  const svg = d3.select("#container").append("svg")
    .attr("viewBox", "0 0 800 600")
  
  svg.append("g")
    .attr("id", "horizontal-axis")
    .attr("transform", "translate(0, 500)")
    .call(d3.axisBottom(mapScale))
    .attr("stroke-width", 2)
    .selectAll("text")
      .attr("y", 10)

  svg.append("text")
  .attr("x", 590)
  .attr("y", 535)
  .attr("font-size", 16)
  .text("Mean Arterial Pressure")

 svg.append("g")
  .attr("id", "vertical-axis")
  .attr("transform", "translate(150, 0)")
  .call(d3.axisLeft(ageGroupScale))
  .attr("stroke-width", 2)
  .selectAll("text")
  .attr("x", -10)

  svg.append("text")
    .attr("x", 80)
    .attr("y", 85)
    .attr("font-size", 16)
    .text("Age Group")

  const leftMargin = 151

  svg.selectAll("rect")
    .data(ageGroups)
    .join("rect")
    .attr("x", leftMargin)
    .attr("y", d => ageGroupScale(d))
    .attr("width", d => mapScale(bloodPressureByAgeGroup[d].averageMAP) - leftMargin)
    .attr("height", ageGroupScale.bandwidth())
    .attr("fill", d => ageGroupColorScale(d))
}

function visualizeBloodPressureByCountryAndGender() {
  const groupedData = d3.group(data, d => d.Country, d => d.Sex)
  const countries = Array.from(groupedData.keys()).sort()
  const gender = ["Female", "Male"]
  const pressures = countries.flatMap(country => gender.map(g => d3.mean(groupedData.get(country).get(g), d => d.Mean_Arterial_Pressure)))
  console.log(d3.min(pressures))
  console.log(d3.max(pressures))

  const mapScale = d3.scaleLinear()
  .domain([80, 100])
  .range([0, 550])

  const countryScale = d3.scaleBand()
    .domain(countries)
    .range([0, 4000])
    .padding(0.2)

  const genderScale = d3.scaleBand()
    .domain(gender)
    .range([0, countryScale.bandwidth()])
    .padding(0.1)
    
  const genderColorScale = d3.scaleOrdinal()
    .domain(gender)
    .range(d3.schemeCategory10)

  d3.select("#container").selectAll("*").remove()
  const axisSVG = d3.select("#container").append("svg")
    .attr("viewBox", "0 0 800 60")



  const svg = d3.select("#container")
    .append("div")
    .attr("id", "barChartSVG")
    .append("svg")
    .attr("viewBox", "0 0 800 4000")

  axisSVG.append("g")
    .attr("id", "horizontal-axis")
    .attr("transform", "translate(150, 50)")
    .call(d3.axisTop(mapScale))
    .attr("stroke-width", 2)
    .selectAll("text")
      .attr("y", 10)

  axisSVG.append("text")
    .attr("x", 590)
    .attr("y", 35)
    .attr("font-size", 16)
    .text("Mean Arterial Pressure")

  const barChart = svg.append("g")
    .attr("id", "barChart")

  const countryGroup = barChart.selectAll("g.country-group")
    .data(countries)
    .join("g")
    .attr("class", "country-group")
    .attr("transform", d => `translate(0, ${countryScale(d)})`)

  countryGroup.selectAll("rect.country-label")
    .data(d => [d])
    .join("rect")
    .attr("class", "country-label")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 150)
    .attr("height", countryScale.bandwidth())
    .attr("fill", "lightgray")
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .text(d => d)

  countryGroup.selectAll("text.country-label")
    .data(d => [d])
    .join("text")
    .attr("class", "country-label")
    .attr("x", 10)
    .attr("y", countryScale.bandwidth() / 2)
    .attr("dy", "0.35em")
    .text(d => d)

  countryGroup.selectAll("rect.gender-bar")
    .data(d => groupedData.get(d).entries())
    .join ("rect")
    .attr("class", "gender-bar")
    .attr("x", 150)
    .attr("y", d => genderScale(d[0]))
    .attr("width", d => mapScale(d3.mean(d[1], d => d.Mean_Arterial_Pressure)))
    .attr("height", genderScale.bandwidth())
    .attr("fill", d => genderColorScale(d[0]))
}

async function init() {
  await loadData()
  visualizeDiastolicSystolic()
  document.getElementById("vis1").checked = true
}
