import React from 'react'
import { Modal } from 'react-bootstrap'
import PerfectScrollbar from 'react-perfect-scrollbar'
import get from 'lodash/get'

const scrollbarOptions = { wheelSpeed: 2, wheelPropagation: false }

// Use the table's active columns so values, permissions and modes stay in sync.
export function TableRowDetails({ columns, data }) {
  if (!data) return null

  return columns
    .filter(column => !column.hidden && (column.title || column.text) !== 'STT')
    .map((column, index) => (
      <div
        key={`${column.key || column.dataKey || column.dataField}-${index}`}
        className="px-15px d-flex justify-content-between py-12px border-bottom-dashed line-height-sm"
        style={{ gap: 12 }}
      >
        <div
          className="fw-600 text-uppercase text-muted font-size-smm"
          style={{ flex: '0 1 40%', minWidth: 0, overflowWrap: 'anywhere' }}
        >
          {column.title || column.text}
        </div>
        <div
          className="fw-600 font-size-mdd text-end"
          style={{ flex: '1 1 60%', minWidth: 0, overflowWrap: 'anywhere' }}
        >
          {typeof column.cellRenderer === 'function'
            ? column.cellRenderer({
                rowData: data,
                cellData: get(data, column.dataKey || column.dataField),
                rowIndex: 0,
                column,
                columns,
                columnIndex: index
              })
            : typeof column.formatter === 'function'
            ? column.formatter(get(data, column.dataField), data, 0)
            : get(data, column.dataKey || column.dataField)}
        </div>
      </div>
    ))
}

export default function TableRowModal({
  show,
  onHide,
  data,
  columns,
  title,
  children
}) {
  return (
    <Modal className="modal-view-mobile" show={show} onHide={onHide} scrollable>
      <div className="modal-view-head align-items-baseline px-15px py-8px">
        <div className="flex-1 modal-view-title text-uppercase font-size-lg fw-500 pr-15px">
          {title || 'Chi tiết'}
        </div>
        <button
          type="button"
          aria-label="Đóng"
          className="p-0 text-center bg-transparent border-0 modal-view-close font-size-h3"
          style={{ minWidth: 44, minHeight: 44 }}
          onClick={onHide}
        >
          <i className="fa-light fa-xmark" aria-hidden="true"></i>
        </button>
      </div>
      <PerfectScrollbar
        options={scrollbarOptions}
        className="scroll modal-view-body"
        style={{ position: 'relative' }}
      >
        {children === undefined ? (
          <TableRowDetails columns={columns} data={data} />
        ) : (
          children
        )}
      </PerfectScrollbar>
    </Modal>
  )
}
