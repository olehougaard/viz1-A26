import { useUpdate, useViz, useVizModel } from "./Viz"

export function Legend({left = 0, top = 0}) {
  const {whoRegions, selected} = useVizModel()
  const {whoRegionScale} = useViz()
  const update = useUpdate()

  const stroke = region => {
    if (selected.has(region))
      return {color: 'black', width: 2}
    else
      return {color: 'white', width: 1}
  }

  const onClick = region => e => {
    update({selected: selected.symmetricDifference(new Set([region]))})
    e.stopPropagation()
  }

  return <g transform={`translate(${left}, ${top})`}>
    {whoRegions.map((region, i) => <>
      <rect x = '0' y = {i * 30} width='20' height='20' 
        fill={whoRegionScale(region)} stroke={stroke(region).color} stroke-width={stroke(region).width}
        onClick = {onClick(region)}
        key={`${region}rect`}
        ></rect>
      <text x='30' y={i * 30 + 15} 
        font-size='16' 
        key={`${region}text`}
        onClick = {onClick(region)}>{region}</text>
    </>)}
  </g>
}
