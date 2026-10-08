import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AttendanceDetails from 'src/features/Reports/pages/RP-Staff/pages/PayrollStaff/components/AttendanceDetails'
import PayrollDetailTooltip from 'src/features/Reports/pages/RP-Staff/pages/PayrollStaff/components/PayrollDetailTooltip'

test.each([
  ['DI_MUON', 'Đi muộn', { Info: { DI_MUON: { Value: -10000 } } }],
  ['VE_SOM', 'Về sớm', { Info: { CheckOut: { VE_SOM: { Value: -10000 } } } }],
  ['TANG_CA_LE', 'Tăng ca lễ', { HolidayOvertimeValue: 10000 }]
])(
  'nút i mở đúng chi tiết %s và đóng bằng Escape',
  async (key, title, item) => {
    render(
      <AttendanceDetails
        id="attendance-detail"
        title={title}
        total={10000}
        trackValue={{
          [`${key}_DS`]: [
            {
              ...item,
              CheckIn: '2026-09-02T08:00:00',
              CheckOut: '2026-09-02T17:00:00'
            }
          ]
        }}
        groups={[{ key, title }]}
      />
    )
    const button = screen.getByRole('button', {
      name: `Chi tiết ${title.toLowerCase()}`
    })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(button)
    expect(await screen.findByText('02/09/2026')).toBeInTheDocument()
    expect(screen.getByText('10.000 đ')).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-expanded', 'true')
    fireEvent.keyDown(button, { key: 'Escape' })
    await waitFor(() =>
      expect(screen.queryByText('02/09/2026')).not.toBeInTheDocument()
    )
  }
)

test.each([0, '0', null, undefined, '', NaN])(
  'ẩn nút i khi không có giá trị: %s',
  total => {
    render(
      <PayrollDetailTooltip id="empty-detail" title="Đi muộn" total={total} />
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  }
)

test('bấm ngoài đóng chi tiết nghỉ có giá trị', async () => {
  render(
    <PayrollDetailTooltip
      id="leave-detail"
      title="Nghỉ trừ lương có phép"
      total={300000}
      dailySalary={300000}
      groups={[
        {
          title: 'Ngày thường',
          dates: [{ Date: '2026-09-02' }],
          multiplier: 1
        }
      ]}
    />
  )
  const button = screen.getByRole('button', {
    name: 'Chi tiết nghỉ trừ lương có phép'
  })
  fireEvent.click(button)
  expect(await screen.findByText('02/09/2026')).toBeInTheDocument()
  fireEvent.click(document.body)
  await waitFor(() =>
    expect(screen.queryByText('02/09/2026')).not.toBeInTheDocument()
  )
})
