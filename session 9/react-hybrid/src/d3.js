import * as d3 from 'd3'

export async function loadData() {
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

export function createModel(data) {
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

export function createViz({groupedData, whoRegions}) {
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

export function initState(data) {
  const model = createModel(data)
  const viz = createViz(model)

  return {
    model,
    viz,
    update(patch) {
      state.model = {...state.model, ...patch}
      view(state)
    }
  }
}
