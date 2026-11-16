import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import reportsApi from 'src/api/reports.api'
import SalesNewDebt from '../index'

let mockCrStockID = 22
let mockVisibleStocks = []
let mockLastFilterProps = null

jest.mock('react-redux', () => ({
  useSelector: fn =>
    fn({
      auth: {
        Info: {
          CrStockID: mockCrStockID,
          Stocks: [
            { ID: 11, Title: 'Cơ sở A' },
            { ID: 22, Title: 'Cơ sở B' },
            { ID: 33, Title: 'Cơ sở C' }
          ]
        },
        GlobalConfig: {}
      }
    })
}))

jest.mock('src/api/reports.api', () => ({
  __esModule: true,
  default: { getSalesPayment: jest.fn() }
}))

jest.mock('src/features/Reports/components/IconMenuMobile', () => () => null)

// Bộ lọc giả: báo danh sách cơ sở hiển thị khi mount (giống bộ lọc thật),
// nút "refresh" gọi onRefresh, nút "clear-stocks" bỏ chọn cơ sở
jest.mock('src/components/Filter/FilterListAdvanced', () => props => {
  const mockReact = require('react')
  mockLastFilterProps = props
  // eslint-disable-next-line react-hooks/rules-of-hooks
  mockReact.useEffect(() => {
    props.onStocksListChange && props.onStocksListChange(mockVisibleStocks)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div>
      <button onClick={props.onRefresh}>refresh</button>
      <button onClick={() => props.onSubmit({ ...props.filters, StockID: '' })}>
        clear-stocks
      </button>
      <button onClick={() => props.onSubmit({ ...props.filters, StockID: 33 })}>
        pick-33
      </button>
      <button
        onClick={() =>
          props.onSubmit({ ...props.filters, DateStart: new Date(2026, 0, 1) })
        }
      >
        submit
      </button>
    </div>
  )
})

const okResponse = {
  data: { data: [[{ TotalRows: 0, TotalPages: 0 }], []] }
}
const lastCall = () =>
  reportsApi.getSalesPayment.mock.calls[
    reportsApi.getSalesPayment.mock.calls.length - 1
  ][0]

describe('SalesNewDebt', () => {
  beforeEach(() => {
    mockCrStockID = 22
    mockVisibleStocks = [
      { value: '', label: 'Tất cả cơ sở' },
      { value: 11, label: 'Cơ sở A' },
      { value: 22, label: 'Cơ sở B' },
      { value: 33, label: 'Cơ sở C' }
    ]
    reportsApi.getSalesPayment.mockReset()
    reportsApi.getSalesPayment.mockResolvedValue(okResponse)
  })

  it('bộ lọc không có Chế độ, Dự kiến thu nợ; cơ sở chọn một như Doanh số', async () => {
    render(<SalesNewDebt />)
    const f = mockLastFilterProps.filters
    expect(f).not.toHaveProperty('ShowsX')
    expect(f).not.toHaveProperty('DebtFrom')
    expect(f).not.toHaveProperty('DebtTo')
    expect(f).not.toHaveProperty('StockIDs')
    // các ô đã bỏ: Nợ, Khách hàng, Ship Code, Voucher, Thanh toán, Loại KH, Nguồn KH, Tag
    ;[
      'no',
      'MemberID',
      'ShipCode',
      'Voucher',
      'Payment',
      'IsMember',
      'SourceName',
      'TagsOrder'
    ].forEach(k => expect(f).not.toHaveProperty(k))
    expect(mockLastFilterProps.showDebtStatus).toBe(false)
    expect(f.PayTypes).toEqual(['MOI', 'NO'])
    expect(f.StockID).toBe(22) // mặc định cơ sở đang active
    expect(mockLastFilterProps.regimes).toBeUndefined()
    await waitFor(() => expect(reportsApi.getSalesPayment).toHaveBeenCalled())
  })

  it('vào trang trong React.StrictMode chỉ gọi API 1 lần, gửi cơ sở hiện tại', async () => {
    render(
      <React.StrictMode>
        <SalesNewDebt />
      </React.StrictMode>
    )
    await waitFor(() =>
      expect(reportsApi.getSalesPayment).toHaveBeenCalledTimes(1)
    )
    await act(() => new Promise(r => setTimeout(r, 50)))
    expect(reportsApi.getSalesPayment).toHaveBeenCalledTimes(1)
    expect(lastCall()).toMatchObject({
      StockIDs: '22',
      PayType: 'MOI,NO',
      PageIndex: 1,
      PageSize: 15
    })
    expect(screen.getByText('Cơ sở B')).toBeInTheDocument()
  })

  it('chọn cơ sở khác: gửi đúng id đó, tiêu đề đổi tên', async () => {
    render(<SalesNewDebt />)
    await waitFor(() =>
      expect(reportsApi.getSalesPayment).toHaveBeenCalledTimes(1)
    )
    fireEvent.click(screen.getByText('pick-33'))
    await waitFor(() =>
      expect(reportsApi.getSalesPayment).toHaveBeenCalledTimes(2)
    )
    expect(lastCall().StockIDs).toBe('33')
    expect(screen.getByText('Cơ sở C')).toBeInTheDocument()
  })

  it('chọn "Tất cả cơ sở": gửi id tất cả cơ sở đang hiển thị', async () => {
    render(<SalesNewDebt />)
    await waitFor(() =>
      expect(reportsApi.getSalesPayment).toHaveBeenCalledTimes(1)
    )
    fireEvent.click(screen.getByText('clear-stocks'))
    await waitFor(() =>
      expect(reportsApi.getSalesPayment).toHaveBeenCalledTimes(2)
    )
    expect(lastCall().StockIDs).toBe('11,22,33')
    expect(screen.getByText('Tất cả cơ sở')).toBeInTheDocument()
  })

  it('chỉ được xem một số cơ sở: để trống thì chỉ gửi các cơ sở đó', async () => {
    mockCrStockID = 22
    mockVisibleStocks = [
      { value: 11, label: 'Cơ sở A' },
      { value: 33, label: 'Cơ sở C' }
    ]
    render(<SalesNewDebt />)
    // cơ sở hiện tại (22) không được xem -> coi như để trống
    await waitFor(() =>
      expect(reportsApi.getSalesPayment).toHaveBeenCalledTimes(1)
    )
    expect(lastCall().StockIDs).toBe('11,33')
  })

  it('không được xem cơ sở nào: không gọi API', async () => {
    mockVisibleStocks = []
    render(<SalesNewDebt />)
    await act(() => new Promise(r => setTimeout(r, 50)))
    expect(reportsApi.getSalesPayment).not.toHaveBeenCalled()
  })

  it('bấm làm mới vẫn gọi lại dù tham số không đổi', async () => {
    render(<SalesNewDebt />)
    await waitFor(() =>
      expect(reportsApi.getSalesPayment).toHaveBeenCalledTimes(1)
    )
    fireEvent.click(screen.getByText('refresh'))
    await waitFor(() =>
      expect(reportsApi.getSalesPayment).toHaveBeenCalledTimes(2)
    )
  })

  it('đổi ngày: From = ngày bắt đầu, To = ngày kết thúc', async () => {
    render(<SalesNewDebt />)
    await waitFor(() =>
      expect(reportsApi.getSalesPayment).toHaveBeenCalledTimes(1)
    )
    fireEvent.click(screen.getByText('submit'))
    await waitFor(() =>
      expect(reportsApi.getSalesPayment).toHaveBeenCalledTimes(2)
    )
    expect(lastCall().From).toBe('2026-01-01')
  })
})
