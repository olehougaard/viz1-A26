export function GraphArea(props) {
    const {viewBox, margins} = props

    const {width, height} = viewBox
    const scaleX = (width - margins.left - margins.right) / width
    const scaleY = (height - margins.top - margins.bottom) / height

    return <g id='drawArea' 
        transform={
          `translate(${margins.left}, ${margins.top})
           scale(${scaleX}, ${scaleY})`
        }>
          {props.children}
      </g>
}
