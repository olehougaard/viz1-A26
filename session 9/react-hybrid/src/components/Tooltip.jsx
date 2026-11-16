import { createContext, useState } from "react"

export const TooltipContext = createContext(null)

export function Tooltip(props) {
  const [tooltipText, setTooltipText] = useState('')
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const [opacity, setOpacity] = useState(0)

  function showTooltip(x, y, text) {
    setX(x)
    setY(y)
    setTooltipText(text)
    setOpacity(1)
  }

  function hideTooltip() {
    setOpacity(0)
  }

  return <TooltipContext value={{showTooltip, hideTooltip}}>
    {props.children}
    <g id='tool-tip' opacity={opacity} transform={`translate(${x}, ${y})`}>
      <rect width='160' height='20' fill='cornsilk' stroke='black' stroke-width='1'></rect>
      <text x='5' y='15' fontSize='16'>{tooltipText}</text>
    </g>
  </TooltipContext>
}