import React, { useState } from 'react'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import moment from 'moment'
import { PriceHelper } from 'src/helpers/PriceHelper'

export default function PayrollDetailTooltip({
  id,
  title,
  groups = [],
  dailySalary,
  total,
  totalLabel = 'Tổng trừ',
  children
}) {
  const [pinned, setPinned] = useState(false)

  if (!Number.isFinite(Number(total)) || Number(total) === 0) return null

  return (
    <OverlayTrigger
      rootClose
      trigger={[]}
      show={pinned}
      onToggle={setPinned}
      placement="left"
      overlay={
        <Popover
          id={id}
          className="shadow-lg"
          style={{ width: 320, maxWidth: 'calc(100vw - 32px)' }}
        >
          <Popover.Body
            className="text-left"
            style={{ maxHeight: 300, overflowY: 'auto' }}
          >
            <div className="mb-3 fw-600">{title}</div>
            {children ||
              groups.map(({ title, dates, multiplier }) => (
                <div key={title} className="pb-3 mb-3 border-bottom">
                  <div className="fw-500">
                    {title}: {dates.length} ngày
                  </div>
                  <div className="mt-1 text-break">
                    {dates.length
                      ? dates
                          .map(item => moment(item.Date).format('DD/MM/YYYY'))
                          .join(', ')
                      : 'Không có ngày nghỉ'}
                  </div>
                  <div className="mt-1">
                    {dates.length} × {PriceHelper.formatVND(dailySalary || 0)} ×{' '}
                    {multiplier} ={' '}
                    {PriceHelper.formatVND(
                      dates.length * (dailySalary || 0) * multiplier
                    )}
                  </div>
                </div>
              ))}
            <div className="gap-2 d-flex justify-content-between fw-600">
              <span>{totalLabel}</span>
              <span>{PriceHelper.formatVND(total || 0)}</span>
            </div>
          </Popover.Body>
        </Popover>
      }
    >
      <button
        type="button"
        onClick={() => setPinned(value => !value)}
        aria-label={`Chi tiết ${title.toLowerCase()}`}
        aria-expanded={pinned}
        aria-controls={pinned ? id : undefined}
        onKeyDown={event => {
          if (event.key === 'Escape') setPinned(false)
        }}
        className="inline-flex items-center justify-center p-0 bg-transparent border-0 rounded cursor-pointer w-7 h-7 shrink-0 text-warning"
      >
        <i className="fa-solid fa-circle-info text-warning" aria-hidden="true"></i>
      </button>
    </OverlayTrigger>
  )
}
