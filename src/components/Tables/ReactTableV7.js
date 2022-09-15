import React from 'react'
import { useWindowSize } from 'src/hooks/useWindowSize'
import ReactBaseTable from './ReactBaseTable'
import ReactTableV7Mobile from './ReactTableV7Mobile'

function ReactTableV7(props) {
  const { width } = useWindowSize()
  return width > 767 ? (
    <ReactBaseTable {...props} />
  ) : (
    <ReactTableV7Mobile {...props} />
  )
}

export default ReactTableV7
