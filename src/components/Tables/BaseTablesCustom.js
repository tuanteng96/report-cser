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
  selectRow: PropTypes.object
}
BaseTablesCustom.defaultProps = {
  data: null,
  columns: null,
  className: '',
  loading: false,
  options: null,
  classes: 'table-head-custom table-vertical-center overflow-hidden',
  selectRow: null
}

function BaseTablesCustom({
  data,
  columns,
  options,
  loading,
  className,
  classes,
  keyField,
  optionsMoible,
  textDataNull
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
      setColumnsTable([
        ...ArrayHeplers.getItemSize(columns, optionsMoible?.itemShow),
        ...(optionsMoible?.columns || []),
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
      ])
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
                    <DropdownButton
                      as={ButtonGroup}
                      key="secondary"
                      id={`dropdown-variants-Secondary`}
                      variant=" font-weight-boldest"
                      title={paginationProps.sizePerPage}
                    >
                      {paginationProps.sizePerPageList.map((item, index) => (
                        <Dropdown.Item
                          key={index}
                          eventKey={index}
                          active={
                            paginationProps.sizePerPageList[index] ===
                            paginationProps.sizePerPage
                          }
                          onClick={() =>
                            paginationProps.onSizePerPageChange(
                              paginationProps.sizePerPageList[index]
                            )
                          }
                        >
                          {paginationProps.sizePerPageList[index]}
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
