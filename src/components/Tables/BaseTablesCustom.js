import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import Pagination from '@material-ui/lab/Pagination'
import BootstrapTable from 'react-bootstrap-table-next'
import paginationFactory, {
  PaginationProvider
} from 'react-bootstrap-table2-paginator'
import { DropdownButton, ButtonGroup, Dropdown } from 'react-bootstrap'
import LoaderTable from '../Loading/LoaderTable'

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
  textDataNull
}) {
  const onTableChange = (type, { page, sizePerPage }) => {
    //console.log(page);
    //console.log(sizePerPage);
  }

  return (
    <Fragment>
      <PaginationProvider pagination={paginationFactory(options)}>
        {({ paginationProps, paginationTableProps }) => {
          return (
            <>
              <BootstrapTable
                wrapperClasses={`table-responsive ${className}`}
                rowClasses="text-nowrap"
                classes={classes}
                headerClasses="fw-500"
                remote={true}
                bordered={false}
                data={data}
                columns={columns}
                onTableChange={onTableChange}
                noDataIndication={() =>
                  loading ? (
                    <LoaderTable text="Đang tải dữ liệu ..." />
                  ) : (
                    'Không có dữ liệu'
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
