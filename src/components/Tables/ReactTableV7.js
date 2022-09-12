import React, { useEffect } from 'react'
import { useTable, usePagination, useBlockLayout } from 'react-table'
import { useSticky } from 'react-table-sticky'
import PropTypes from 'prop-types'
import clsx from 'clsx'

ReactTableV7.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  fetchData: PropTypes.func,
  loading: PropTypes.bool
}

function ReactTableV7({
  columns,
  data,
  onPagesChange,
  loading,
  pageCount: controlledPageCount
}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    // Get the state from the instance
    state: { pageIndex, pageSize }
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0 }, // Pass our hoisted table state
      manualPagination: true, // Tell the usePagination
      // hook that we'll handle our own data fetching
      // This means we'll also have to provide our own
      // pageCount.
      pageCount: controlledPageCount
    },
    useSticky,
    usePagination,
    useBlockLayout
  )

  return (
    <>
      <div
        className="table sticky table-tanstack"
        {...getTableProps()}
        style={{ width: '100%', height: 400 }}
      >
        <div className="table-tanstack__header">
          {headerGroups.map(headerGroup => (
            <div {...headerGroup.getHeaderGroupProps()} className="tr">
              {headerGroup.headers.map(column => (
                <div
                  {...column.getHeaderProps([{ style: column.style }])}
                  className="th flex-fill"
                >
                  {column.render('Header')}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div
          {...getTableBodyProps()}
          className={`table-tanstack__body ${clsx({ loading: loading })}`}
        >
          {page.map((row, i) => {
            prepareRow(row)
            return (
              <div {...row.getRowProps()} className="tr">
                {row.cells.map(cell => {
                  return (
                    <div
                      {...cell.getCellProps([{ style: cell.column.style }])}
                      className="td flex-fill"
                    >
                      {cell.render('Cell')}
                    </div>
                  )
                })}
              </div>
            )
          })}
          <div className="table-tanstack-loading">
            <div className="spinner spinner-primary"></div>
          </div>
        </div>
      </div>

      <div>
        Showing {page.length} of ~{controlledPageCount * pageSize} results
      </div>

      {/* 
        Pagination can be built however you'd like. 
        This is just a very basic UI implementation:
      */}
      <div className="pagination">
        <button
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
        </span>{' '}
        <select
          value={pageSize}
          onChange={e => {
            setPageSize(Number(e.target.value))
            onPagesChange({
              Pi: 1,
              Ps: Number(e.target.value)
            })
          }}
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </>
  )
}

export default ReactTableV7
