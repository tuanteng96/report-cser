import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import Pagination from '@material-ui/lab/Pagination'
import { ButtonGroup, Dropdown, DropdownButton } from 'react-bootstrap'
import Table from 'react-base-table'
import 'react-base-table/styles.css'
import ElementEmpty from '../Empty/ElementEmpty'

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
  pageCount
}) {
  const refElm = useRef(null)
  return (
    <div className="w-100" ref={refElm}>
      <Table
        fixed
        width={refElm?.current?.offsetWidth || 0}
        height={500}
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
        emptyRenderer={<ElementEmpty />}
      />
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
