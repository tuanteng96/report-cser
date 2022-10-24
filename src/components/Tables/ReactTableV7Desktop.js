import React, { useEffect, useRef } from 'react'
import { useTable, usePagination, useBlockLayout, useSortBy } from 'react-table'
import { useSticky } from 'react-table-sticky'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import Pagination from '@material-ui/lab/Pagination'
import { ButtonGroup, Dropdown, DropdownButton } from 'react-bootstrap'
import ElementEmpty from '../Empty/ElementEmpty'

ReactTableV7Desktop.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  fetchData: PropTypes.func,
  loading: PropTypes.bool
}

function useInstance(instance) {
  const { allColumns } = instance

  let rowSpanHeaders = []

  allColumns.forEach((column, i) => {
    const { id, enableRowSpan } = column

    if (enableRowSpan !== undefined) {
      rowSpanHeaders = [
        ...rowSpanHeaders,
        { id, topCellValue: null, topCellIndex: 0 }
      ]
    }
  })

  Object.assign(instance, { rowSpanHeaders })
}

const sizePerPageLists = [10, 25, 50, 100, 500, 1000]

function ReactTableV7Desktop() {
  return <>a</>
}

export default ReactTableV7Desktop
