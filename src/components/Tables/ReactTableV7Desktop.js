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

function ReactTableV7Desktop({
  columns,
  data,
  onPagesChange,
  loading,
  filters,
  pageCount: controlledPageCount
}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    // rowSpanHeaders,
    // rows,
    page,
    // canPreviousPage,
    // canNextPage,
    // pageOptions,
    gotoPage,
    // nextPage,
    // previousPage,
    setPageSize,
    // Get the state from the instance
    state: { pageIndex, pageSize }
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: filters.Pi - 1, pageSize: filters.Ps }, // Pass our hoisted table state
      manualPagination: true, // Tell the usePagination
      // hook that we'll handle our own data fetching
      // This means we'll also have to provide our own
      // pageCount.
      pageCount: controlledPageCount
    },
    useSticky,
    useBlockLayout,
    useSortBy,
    usePagination,
    hooks => hooks.useInstance.push(useInstance)
  )
  const elmHeader = useRef(null)
  const elmTable = useRef(null)

  useEffect(() => {
    elmTable?.current?.scrollTo(0, 0)
  }, [pageIndex, pageSize])

  return (
    <>
      <div className={clsx('position-relative', loading && 'loading')}>
        <table
          className="table sticky table-bordered table-tanstack mb-0"
          {...getTableProps()}
          style={{ width: '100%', height: 495 }}
          ref={elmTable}
        >
          <thead className="table-tanstack__header" ref={elmHeader}>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()} className="tr">
                {headerGroup.headers.map(column => (
                  <th
                    {...column.getHeaderProps([
                      { style: column.style },
                      { ...column.getSortByToggleProps() }
                    ])}
                    className="th"
                  >
                    {column.render('Header')}
                    {column.sortable && (
                      <span className="sort-item">
                        <i
                          className={clsx(
                            'fas fa-caret-up',
                            column.isSorted && column.isSortedDesc && 'active'
                          )}
                        ></i>
                        <i
                          className={clsx(
                            'fas fa-caret-down',
                            (!column.isSorted || !column.isSortedDesc) &&
                              'active'
                          )}
                        ></i>
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className={`table-tanstack__body`}>
            {page.map((row, i) => {
              prepareRow(row)
              return (
                <tr {...row.getRowProps()} className="tr">
                  {row.cells.map(cell => {
                    return (
                      <td
                        {...cell.getCellProps([
                          {
                            style: {
                              ...cell.column.style,
                              ...cell.column.styleCell
                            },
                            className: cell.column.className
                          }
                        ])}
                        {...cell.getCellProps([
                          {
                            className: cell.column.className
                          }
                        ])}
                        className={clsx('td flex-fill', cell.column.classCell)}
                      >
                        {cell.render('Cell')}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
            {(!page || (page.length === 0 && !loading)) && (
              <tr>
                <td>
                  <ElementEmpty />
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div
          className="table-tanstack-loading"
          style={{
            height: `calc(100% - ${elmHeader?.current?.clientHeight || 44}px`
          }}
        >
          <div className="spinner spinner-primary"></div>
        </div>
      </div>
      <div className="pagination d-flex justify-content-between align-items-center mt-20px">
        <Pagination
          count={controlledPageCount}
          page={pageIndex + 1}
          siblingCount={1}
          boundaryCount={1}
          variant="outlined"
          shape="rounded"
          onChange={(event, value) => {
            gotoPage(value - 1)
            onPagesChange({
              Pi: value,
              Ps: pageSize
            })
          }}
        />
        {/* <button
          onClick={() => {
            previousPage()
            onPagesChange({
              Pi: pageIndex,
              Ps: pageSize
            })
          }}
          disabled={!canPreviousPage}
        >
          {'<'}
        </button>{' '}
        <button
          onClick={() => {
            nextPage()
            onPagesChange({
              Pi: pageIndex + 2,
              Ps: pageSize
            })
          }}
          disabled={!canNextPage}
        >
          {'>'}
        </button>{' '}
        <span>
          Page{' '}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{' '}
        </span>
        <span>
          | Go to page:{' '}
          <input
            type="number"
            defaultValue={pageIndex + 1}
            onChange={e => {
              if (!e.target.value) return
              const page = Number(e.target.value)
              gotoPage(page)
              onPagesChange({
                Pi: page,
                Ps: pageSize
              })
            }}
            style={{ width: '100px' }}
          />
        </span>{' '} */}
        <div className="d-flex align-items-center text-gray-500">
          Hiển thị
          <div className="px-8px">
            <DropdownButton
              as={ButtonGroup}
              key="secondary"
              id={`dropdown-variants-Secondary`}
              variant=" font-weight-boldest"
              title={pageSize}
            >
              {sizePerPageLists.map((item, index) => (
                <Dropdown.Item
                  key={index}
                  eventKey={index}
                  active={item === pageSize}
                  onClick={() => {
                    setPageSize(item)
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
    </>
  )
}

export default ReactTableV7Desktop
