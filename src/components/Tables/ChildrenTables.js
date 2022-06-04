import React, { Fragment, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import ElementEmpty from '../Empty/ElementEmpty'
import { useWindowSize } from 'src/hooks/useWindowSize'
import LoadingTable from '../Loading/LoaderTable'
import Pagination from '@material-ui/lab/Pagination'
import { ButtonGroup, Dropdown, DropdownButton } from 'react-bootstrap'
import { ArrayHeplers } from 'src/helpers/ArrayHeplers'

ChildrenTables.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.array
}

function ChildrenTables({
  children,
  data,
  columns,
  options,
  loading,
  optionsMoible
}) {
  const refElm = useRef(0)
  const [widthElm, setWidthElm] = useState(0)
  const [columnsTable, setColumnsTable] = useState([
    { dataField: '', text: '' }
  ])
  const { width } = useWindowSize()

  useEffect(() => {
    if (width > 767) {
      setColumnsTable(columns)
    } else {
      setColumnsTable([
        ...ArrayHeplers.getItemSize(columns, optionsMoible?.itemShow),
        ...(optionsMoible?.columns || []),
        {
          formatter: row => (
            <button
              type="button"
              className="btn btn-primary btn-xs"
              onClick={() => optionsMoible?.CallModal(row)}
            >
              Xem chi tiết
            </button>
          ),
          attrs: { 'data-title': '.....' }
        }
      ])
    }
  }, [columns, width, optionsMoible])

  useEffect(() => {
    setWidthElm(refElm?.current?.clientWidth)
  }, [refElm, width])

  return (
    <div>
      <div className="react-bootstrap-table table-responsive table-responsive-attr">
        <div ref={refElm}></div>
        <table className="table table-bordered">
          <thead>
            <tr className="fw-500">
              {columnsTable.map((item, index) => (
                <th style={{ ...item?.headerStyle }} key={index}>
                  {item.text}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="p-0" colSpan={columnsTable.length}>
                  <LoadingTable
                    text="Đang tải dữ liệu ..."
                    width={`${widthElm}px`}
                  />
                </td>
              </tr>
            )}
            {!loading && (
              <Fragment>
                {data && data.length > 0 ? (
                  <>
                    {width > 767 ? (
                      children
                    ) : (
                      <Fragment>
                        {data.map((obj, objIndex) => (
                          <tr key={objIndex}>
                            {columnsTable.map((item, index) => (
                              <td key={index} {...item?.attrs}>
                                {item.formatter && item.formatter(obj)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </Fragment>
                    )}
                  </>
                ) : (
                  <tr>
                    <td colSpan={columnsTable.length}>
                      <ElementEmpty width={`${widthElm}px`} />
                    </td>
                  </tr>
                )}
              </Fragment>
            )}
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-between">
        <Pagination
          className="my-3"
          count={Math.ceil(options.totalSize / options.sizePerPage)}
          page={options.page}
          siblingCount={1}
          boundaryCount={1}
          variant="outlined"
          shape="rounded"
          onChange={(event, value) => {
            options.onPageChange(value)
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
              title={options.sizePerPage}
            >
              {options.sizePerPageList.map((item, index) => (
                <Dropdown.Item
                  key={index}
                  eventKey={index}
                  active={
                    options.sizePerPageList[index] === options.sizePerPage
                  }
                  onClick={() =>
                    options.onSizePerPageChange(options.sizePerPageList[index])
                  }
                >
                  {options.sizePerPageList[index]}
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

export default ChildrenTables
