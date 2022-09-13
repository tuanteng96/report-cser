import React from 'react'
import { useWindowSize } from 'src/hooks/useWindowSize'
import ReactTableV7Desktop from './ReactTableV7Desktop'
import ReactTableV7Mobile from './ReactTableV7Mobile'

function ReactTableV7(props) {
  const { width } = useWindowSize()
  return width > 767 ? (
    <ReactTableV7Desktop {...props} />
  ) : (
    <ReactTableV7Mobile {...props} />
  )
}

export default ReactTableV7
