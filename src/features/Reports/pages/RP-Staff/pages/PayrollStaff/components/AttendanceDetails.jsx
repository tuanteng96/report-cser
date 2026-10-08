import React from 'react'
import moment from 'moment'
import { PriceHelper } from 'src/helpers/PriceHelper'
import PayrollDetailTooltip from './PayrollDetailTooltip'

const formatDate = (value, format) =>
  value && moment(value).isValid() ? moment(value).format(format) : '--'

export default function AttendanceDetails({ trackValue, groups, ...props }) {
  return (
    <PayrollDetailTooltip {...props}>
      {groups.map(({ key, title }) => {
        const items = trackValue?.[`${key}_DS`] || []
        return (
          <div key={key} className="pb-3 mb-3 border-bottom">
            <div className="mb-2 fw-600">
              {title}: {items.length} lượt
            </div>
            {!items.length && <div>Không có lượt chấm công</div>}
            {items.map((item, index) => {
              const info = key.startsWith('VE_')
                ? item?.Info?.CheckOut
                : item?.Info
              const value =
                key === 'TANG_CA_LE'
                  ? item.HolidayOvertimeValue
                  : Math.abs(Number(info?.[key]?.Value || 0))
              return (
                <div key={index} className="mt-2">
                  <div className="d-flex justify-content-between gap-2 fw-500">
                    <span>{formatDate(item.CheckIn, 'DD/MM/YYYY')}</span>
                    <span>{PriceHelper.formatVND(value)} đ</span>
                  </div>
                  <div>
                    IN: {formatDate(item.CheckIn, 'HH:mm')} - OUT:{' '}
                    {formatDate(item.CheckOut, 'HH:mm')}
                  </div>
                  {info?.[key]?.Title && <div>{info[key].Title}</div>}
                  {key === 'TANG_CA_LE' && (
                    <div>
                      Hệ số lễ: {item?.Info?.Ratio?.ratio || 0}
                      {item?.Info?.WorkToday?.Title && (
                        <div>{item.Info.WorkToday.Title}</div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}
    </PayrollDetailTooltip>
  )
}
