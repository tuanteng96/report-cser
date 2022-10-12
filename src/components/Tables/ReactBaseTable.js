import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import Pagination from '@material-ui/lab/Pagination'
import { ButtonGroup, Dropdown, DropdownButton } from 'react-bootstrap'
import Table, { AutoResizer } from 'react-base-table'
import 'react-base-table/styles.css'
import ElementEmpty from '../Empty/ElementEmpty'
import Text from 'react-texty'

ReactBaseTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  loading: PropTypes.bool
}

const sizePerPageLists = [10, 25, 50, 100, 500, 1000]

function ReactBaseTable({
  columns,
  data,
  onPagesChange,
  loading,
  filters,
  pageCount,
  rowKey,
  rowRenderer,
  ...props
}) {
  const [width, setWidth] = useState(0)
  const refElm = useRef(null)
  const tableRef = useRef(null)

  useEffect(() => {
    tableRef?.current?.scrollToRow(0, 'start')
  }, [filters])

  useEffect(() => {
    setWidth(refElm?.current?.offsetWidth || 0)
  }, [refElm])

  const TableCell = ({ className, cellData }) => (
    <Text tooltipMaxWidth={280} className={className}>
      {cellData}
    </Text>
  )

  const TableHeaderCell = ({ className, column }) => (
    <Text tooltipMaxWidth={280} className={className}>
      {column.title}
    </Text>
  )

  return (
    <div className="w-100" ref={refElm}>
      <div className="w-100 h-500px">
        <AutoResizer>
          {({ width, height }) => (
            <Table
              {...props}
              fixed
              rowKey={rowKey}
              width={width}
              height={height}
              columns={columns}
              data={data}
              overlayRenderer={() => (
                <>
                  {loading && (
                    <div className="BaseTable-loading">
                      <div className="spinner spinner-primary"></div>
                    </div>
                  )}
                </>
              )}
              emptyRenderer={() => !loading && <ElementEmpty />}
              rowRenderer={rowRenderer}
              components={{ TableCell, TableHeaderCell }}
              ignoreFunctionInColumnCompare={false}
            />
          )}
        </AutoResizer>
      </div>
      <div className="pagination d-flex justify-content-between align-items-center mt-15px">
        <Pagination
          count={pageCount}
          page={filters.Pi}
          siblingCount={1}
          boundaryCount={1}
          variant="outlined"
          shape="rounded"
          onChange={(event, value) => {
            onPagesChange({
              Pi: value,
              Ps: filters.Ps
            })
          }}
        />
        <div className="d-flex align-items-center text-gray-500">
          Hiển thị
          <div className="px-8px">
            <DropdownButton
              as={ButtonGroup}
              key="secondary"
              id={`dropdown-variants-Secondary`}
              variant=" font-weight-boldest"
              title={filters.Ps}
            >
              {sizePerPageLists.map((item, index) => (
                <Dropdown.Item
                  key={index}
                  eventKey={index}
                  active={item === filters.Ps}
                  onClick={() => {
                    onPagesChange({
                      Pi: 1,
                      Ps: item
                    })
                  }}
                >
                  {item}
                </Dropdown.Item>
              ))}
            </DropdownButton>
          </div>
          trên trang
        </div>
      </div>
    </div>
  )
}

export default ReactBaseTable
