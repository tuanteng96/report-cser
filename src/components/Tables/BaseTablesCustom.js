import React, { Fragment, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import Pagination from '@material-ui/lab/Pagination'
import BootstrapTable from 'react-bootstrap-table-next'
import paginationFactory, {
  PaginationProvider
} from 'react-bootstrap-table2-paginator'
import { DropdownButton, ButtonGroup, Dropdown } from 'react-bootstrap'
import LoadingTable from '../Loading/LoaderTable'
import ElementEmpty from '../Empty/ElementEmpty'
import { ArrayHeplers } from 'src/helpers/ArrayHeplers'
import { useWindowSize } from 'src/hooks/useWindowSize'

BaseTablesCustom.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.array,
  options: PropTypes.object,
  loading: PropTypes.bool,
  className: PropTypes.string,
  classes: PropTypes.string,
  selectRow: PropTypes.object,
  rowStyle: PropTypes.func
}
BaseTablesCustom.defaultProps = {
  data: null,
  columns: null,
  className: '',
  loading: false,
  options: null,
  classes: 'table-head-custom table-vertical-center overflow-hidden',
  selectRow: null,
  rowStyle: null
}

const sizePerPageLists = [10, 25, 50, 100, 500, 1000]

function BaseTablesCustom({
  data,
  columns,
  options,
  loading,
  className,
  classes,
  keyField,
  optionsMoible,
  footerClasses,
  rowStyle
}) {
  const refElm = useRef(0)
  const [widthElm, setWidthElm] = useState(0)
  const onTableChange = (type, { page, sizePerPage }) => {
    //console.log(page);
    //console.log(sizePerPage);
  }
  const { width } = useWindowSize()
  const [columnsTable, setColumnsTable] = useState([
    { dataField: '', text: '' }
  ])

  useEffect(() => {
    if (width > 767) {
      setColumnsTable(columns)
    } else {
      var newArray = [
        ...ArrayHeplers.getItemSize(columns, optionsMoible?.itemShow),
        ...(optionsMoible?.columns || [])
      ]
      if (!optionsMoible?.hideBtnDetail) {
        newArray = [
          ...newArray,
          {
            dataField: 'Active',
            text: '#',
            //headerAlign: "center",
            //style: { textAlign: "center" },
            formatter: (cell, row) => (
              <button
                type="button"
                className="btn btn-primary btn-xs"
                onClick={() => optionsMoible?.CallModal(row)}
              >
                Xem chi tiết
              </button>
            ),
            attrs: { 'data-title': '.....' },
            headerStyle: () => {
              return { minWidth: '150px', width: '150px' }
            }
          }
        ]
      }
      setColumnsTable(newArray)
    }
  }, [columns, width, optionsMoible])

  useEffect(() => {
    setWidthElm(refElm?.current?.clientWidth)
  }, [refElm, width])

  return (
    <Fragment>
      <div ref={refElm}></div>
      <PaginationProvider pagination={paginationFactory(options)}>
        {({ paginationProps, paginationTableProps }) => {
          return (
            <>
              <BootstrapTable
                footerClasses={footerClasses}
                rowStyle={rowStyle}
                wrapperClasses={`table-responsive ${className}`}
                //rowClasses="text-nowrap"
                classes={classes}
                headerClasses="fw-500"
                remote={true}
                bordered={false}
                data={data}
                columns={columnsTable}
                onTableChange={onTableChange}
                noDataIndication={() =>
                  loading ? (
                    <LoadingTable
                      text="Đang tải dữ liệu ..."
                      width={`${widthElm}px`}
                    />
                  ) : (
                    <ElementEmpty width={`${widthElm}px`} />
                  )
                }
                {...paginationTableProps}
                keyField={keyField}
              />
              {width < 768 && optionsMoible.tfoot && (
                <div className="bg-light d-flex align-items-center justify-content-between p-10px mb-15px">
                  <div className="text-uppercase fw-600">
                    {optionsMoible.tfoot.Title}
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-xs"
                    onClick={() => optionsMoible.tfoot.CallModal()}
                  >
                    Xem chi tiết
                  </button>
                </div>
              )}

              <div className="d-flex justify-content-between">
                <Pagination
                  className="my-3"
                  count={Math.ceil(
                    paginationProps.totalSize / paginationProps.sizePerPage
                  )}
                  page={paginationProps.page}
                  siblingCount={1}
                  boundaryCount={1}
                  variant="outlined"
                  shape="rounded"
                  onChange={(event, value) => {
                    paginationProps.onPageChange(value)
                  }}
                />
                <div className="d-flex align-items-center text-gray-500">
                  Hiển thị
                  <div className="px-8px">
                    <Dropdown
                      as={ButtonGroup}
                      id={`dropdown-variants-Secondary`}
                      variant=" font-weight-boldest"
                      title={paginationProps.sizePerPage}
                    >
                      <Dropdown.Menu popperConfig={{ strategy: 'fixed' }}>
                        {sizePerPageLists.map((item, index) => (
                          <Dropdown.Item
                            key={index}
                            eventKey={index}
                            active={
                              sizePerPageLists[index] ===
                              paginationProps.sizePerPage
                            }
                            onClick={() =>
                              paginationProps.onSizePerPageChange(
                                sizePerPageLists[index]
                              )
                            }
                          >
                            {sizePerPageLists[index]}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                    <DropdownButton
                      as={ButtonGroup}
                      key="secondary"
                      id={`dropdown-variants-Secondary`}
                      variant=" font-weight-boldest"
                      title={paginationProps.sizePerPage}
                    >
                      {sizePerPageLists.map((item, index) => (
                        <Dropdown.Item
                          key={index}
                          eventKey={index}
                          active={
                            sizePerPageLists[index] ===
                            paginationProps.sizePerPage
                          }
                          onClick={() =>
                            paginationProps.onSizePerPageChange(
                              sizePerPageLists[index]
                            )
                          }
                        >
                          {sizePerPageLists[index]}
                        </Dropdown.Item>
                      ))}
                    </DropdownButton>
                  </div>
                  trên trang
                </div>
              </div>
            </>
          )
        }}
      </PaginationProvider>
    </Fragment>
  )
}

export default BaseTablesCustom
