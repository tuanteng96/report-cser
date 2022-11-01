import React from 'react'
import PropTypes from 'prop-types'
import Pagination from '@material-ui/lab/Pagination'
import { ButtonGroup, Dropdown, DropdownButton } from 'react-bootstrap'
import LoadingTable from '../Loading/LoaderTable'
import ElementEmpty from '../Empty/ElementEmpty'

ReactTableV7Mobile.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  fetchData: PropTypes.func,
  loading: PropTypes.bool
}

const sizePerPageLists = [10, 25, 50, 100, 500, 1000]

function ReactTableV7Mobile({
  columns,
  data,
  onPagesChange,
  loading,
  filters,
  optionMobile,
  dataMobile,
  pageCount: controlledPageCount
}) {
  return (
    <div>
      {loading && <LoadingTable text="Đang tải dữ liệu ..." />}
      {!loading && (
        <>
          {dataMobile ? (
            <>
              {dataMobile && dataMobile.length > 0 ? (
                <>
                  {dataMobile.map((row, index) => (
                    <div
                      className="border-top border-right border-left mb-15px"
                      key={index}
                    >
                      {columns &&
                        columns
                          .filter(column => column?.mobileOptions?.visible)
                          .map((cell, idx) => (
                            <div
                              className="d-flex justify-content-between align-items-center px-12px py-12px border-bottom position-relative"
                              key={idx}
                            >
                              <div className="text-uppercase fw-500 font-size-sm w-135px text-truncate">
                                {cell.title}
                              </div>
                              <div className="flex-1 text-end fw-600 font-size-md">
                                {typeof cell.cellRenderer !== 'function'
                                  ? row[cell.dataKey]
                                  : cell.cellRenderer({
                                      rowData: { ...row, rowIndex: index }
                                    })}
                              </div>
                            </div>
                          ))}
                      {optionMobile && optionMobile.CellModal && (
                        <div className="d-flex justify-content-between align-items-center px-12px py-12px border-bottom">
                          <div className="text-uppercase fw-500 font-size-sm w-135px text-truncate">
                            ...
                          </div>
                          <div className="flex-1 text-end fw-600 font-size-md">
                            <button
                              type="button"
                              className="btn btn-primary btn-xs"
                              onClick={() => optionMobile.CellModal(row, index)}
                            >
                              Xem chi tiết
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <ElementEmpty />
              )}
            </>
          ) : (
            <>
              {data && data.length > 0 ? (
                <>
                  {data.map((row, index) => (
                    <div
                      className="border-top border-right border-left mb-15px"
                      key={index}
                    >
                      {columns &&
                        columns
                          .filter(column => column?.mobileOptions?.visible)
                          .map((cell, idx) => (
                            <div
                              className="d-flex justify-content-between align-items-center px-12px py-12px border-bottom position-relative"
                              key={idx}
                            >
                              <div className="text-uppercase fw-500 font-size-sm w-135px text-truncate position-relative zindex-1">
                                {cell.title}
                              </div>
                              <div className="flex-1 text-end fw-600 font-size-md">
                                {typeof cell.cellRenderer !== 'function'
                                  ? row[cell.dataKey]
                                  : cell.cellRenderer({
                                      rowData: row,
                                      rowIndex: index
                                    })}
                              </div>
                            </div>
                          ))}
                      {optionMobile && optionMobile.CellModal && (
                        <div className="d-flex justify-content-between align-items-center px-12px py-12px border-bottom">
                          <div className="text-uppercase fw-500 font-size-sm w-135px text-truncate">
                            ...
                          </div>
                          <div className="flex-1 text-end fw-600 font-size-md">
                            <button
                              type="button"
                              className="btn btn-primary btn-xs"
                              onClick={() => optionMobile.CellModal(row, index)}
                            >
                              Xem chi tiết
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <ElementEmpty />
              )}
            </>
          )}
        </>
      )}
      {filters && (
        <div className="pagination d-flex justify-content-between align-items-center mt-15px">
          <Pagination
            count={controlledPageCount}
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
        </div>
      )}
    </div>
  )
}

export default ReactTableV7Mobile
