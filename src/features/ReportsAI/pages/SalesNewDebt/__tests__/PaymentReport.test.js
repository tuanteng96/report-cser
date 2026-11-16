import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import PaymentReport from '../PaymentReport'

const fmt = n => Number(n).toLocaleString('vi-VN')

const SUMMARY = {
  TotalRows: 3,
  TotalPages: 1,
  Moi_TienMat: 7000000,
  Moi_ChuyenKhoan: 600000,
  Moi_QuetThe: 30000,
  No_TienMat: 500000,
  No_ChuyenKhoan: 0,
  No_QuetThe: 0,
  KhauTru: 1000000
}

const base = {
  OrderStockID: 12746,
  PayStockID: 12746,
  TienMat: 0,
  ChuyenKhoan: 0,
  QuetThe: 0,
  Vi: 0,
  TheTien: 0,
  KetThucThe: 0,
  TraHang: 0,
  Tang: 0,
  KhoaNo: 0,
  Khac: 0,
  VoucherDiscount: 0,
  VoucherFix: 0,
  VoucherSamePrice: null,
  CustomeDiscount: 0,
  DayToPay: null,
  VCode: null,
  Desc: null
}

const ROWS = [
  {
    ...base,
    RowNo: 1,
    OrderID: 65032,
    OrderDay: '2026-10-13',
    PayDay: '2026-10-13',
    PayCode: 'MOI',
    TienMat: 7000000,
    ChuyenKhoan: 600000,
    NoCuoiNgay: 30000,
    ChiTietJSON: JSON.stringify([
      { id: 23857, pcode: 'TT1', name: 'Thẻ ưu đãi', qty: 1, tp: 5000000 },
      {
        id: 23874,
        pcode: 'DV9',
        name: 'Massage cổ vai gáy',
        qty: 1,
        tp: 1000000
      },
      {
        id: 23854,
        pcode: 'PP1',
        name: 'Phụ phí chuyển đổi',
        qty: 1,
        tp: 100000
      },
      { id: 23856, pcode: 'PP2', name: 'Phụ phí xăng xe', qty: 1, tp: 30000 },
      { id: 23851, pcode: 'SP3', name: 'Son', qty: 1, tp: 1500000 }
    ]),
    TotalProdValue: 7630000,
    TotalValue: 7630000,
    ToMoney: 7630000,
    ToPay: 7630000,
    SenderID: 45732,
    SenderName: 'Nguyễn Minh Xám',
    SenderPhone: '972072515'
  },
  {
    ...base,
    RowNo: 2,
    OrderID: 65041,
    OrderDay: '2026-10-13',
    PayDay: '2026-10-24',
    PayCode: 'KHAU_TRU',
    Tang: 1000000,
    NoCuoiNgay: 0,
    ChiTietJSON: JSON.stringify([
      {
        id: 23883,
        pcode: 'DV14',
        name: 'Liệu trình trị mụn',
        qty: 1,
        tp: 6000000
      }
    ]),
    TotalProdValue: 6000000,
    TotalValue: 6000000,
    ToMoney: 5400000,
    ToPay: 2700000,
    SenderID: 45735,
    SenderName: 'Khách vãng lai',
    SenderPhone: '45735',
    VCode: '4BH5',
    VoucherDiscount: 10,
    CustomeDiscount: 50,
    Desc: 'tặng đơn hàng - kết thúc nợ'
  },
  {
    ...base,
    RowNo: 3,
    OrderID: 65062,
    OrderDay: '2026-10-15',
    PayDay: '2026-10-24',
    PayCode: 'NO',
    TienMat: 500000,
    NoCuoiNgay: 0,
    ChiTietJSON: '',
    TotalProdValue: 12600000,
    TotalValue: 12600000,
    ToMoney: 12600000,
    ToPay: 12600000,
    SenderName: 'Trần A Dũng',
    SenderPhone: '45745'
  }
]

const renderReport = props =>
  render(
    <PaymentReport
      summary={SUMMARY}
      rows={ROWS}
      loading={false}
      from="2026-10-13"
      to="2026-11-13"
      payTypes={['MOI', 'NO']}
      pageStart={0}
      total={3}
      pagination={<div>PAGER</div>}
      {...props}
    />
  )

const rowOf = id => screen.getByText(`#${id}`).closest('.sp-row')

describe('PaymentReport', () => {
  it('thẻ tổng: thực thu = mới + nợ, khấu trừ riêng', () => {
    const { container } = renderReport()
    const cards = container.querySelectorAll('.sp-card')
    expect(cards).toHaveLength(4)
    expect(cards[0].querySelector('.sp-big').textContent).toBe(fmt(8130000))
    expect(cards[1].querySelector('.sp-big').textContent).toBe(fmt(7630000))
    expect(cards[2].querySelector('.sp-big').textContent).toBe(fmt(500000))
    expect(cards[3].querySelector('.sp-big').textContent).toBe(fmt(1000000))
    expect(screen.getByText(/13\/10\/2026 – 13\/11\/2026/)).toBeInTheDocument()
  })

  it('tiêu đề bảng có nhóm cột và chip kiểu thanh toán đang lọc', () => {
    const { container } = renderReport()
    expect(screen.getByText('TM / CK / QT')).toBeInTheDocument()
    expect(screen.getByText('Ví / Thẻ tiền')).toBeInTheDocument()
    const chips = container.querySelector('.sp-chips')
    expect(within(chips).getByText('Mới')).toBeInTheDocument()
    expect(within(chips).getByText('Thu nợ')).toBeInTheDocument()
    expect(within(chips).queryByText('Khấu trừ')).toBeNull()
    expect(screen.getByText('PAGER')).toBeInTheDocument()
    expect(screen.getByText('Hiển thị 1–3 trong 3 dòng')).toBeInTheDocument()
  })

  it('dòng bán mới: khách + SĐT đủ 10 số, tối đa 3 thành phần, nợ còn lại', () => {
    renderReport()
    const row = rowOf(65032)
    expect(
      within(row).getByText('Nguyễn Minh Xám - 0972072515')
    ).toBeInTheDocument()
    expect(within(row).getByText('Mới')).toHaveClass('sp-pill', 'MOI')
    expect(row.querySelectorAll('.sp-item')).toHaveLength(3)
    expect(within(row).getByText('+2 thành phần khác')).toBeInTheDocument()
    expect(within(row).getByText(fmt(7600000))).toBeInTheDocument() // tổng TM/CK/QT
    expect(row.querySelector('.sp-debt').textContent).toBe(fmt(30000))
  })

  it('dòng khấu trừ: ẩn SĐT khách vãng lai, nhãn khấu trừ, đã đủ', () => {
    renderReport()
    const row = rowOf(65041)
    expect(within(row).getByText('Khách vãng lai')).toBeInTheDocument()
    expect(within(row).getByText('Đơn tặng')).toHaveClass('sp-kt-label')
    expect(within(row).getByText('4BH5')).toBeInTheDocument()
    expect(row.querySelector('.sp-debt')).toHaveClass('sp-ok')
    expect(row.querySelector('.sp-debt').textContent).toBe('Đã đủ')
  })

  it('dòng không có chi tiết đơn hiện "–"', () => {
    renderReport()
    const row = rowOf(65062)
    expect(row.querySelector('.sp-items').textContent).toBe('–')
  })

  it('bấm vào đơn mở popup chi tiết', () => {
    renderReport()
    fireEvent.click(
      within(rowOf(65041)).getByLabelText('Xem chi tiết đơn 65041', {
        selector: 'button'
      })
    )
    const dlg = screen.getByRole('dialog')
    expect(within(dlg).getByText('Đơn #65041')).toBeInTheDocument()
    expect(within(dlg).getByText('0000045735')).toBeInTheDocument()
    expect(within(dlg).getByText('Liệu trình trị mụn')).toBeInTheDocument()
    expect(within(dlg).getByText('10%')).toBeInTheDocument() // giá trị mã giảm giá
    expect(within(dlg).getByText('50%')).toBeInTheDocument() // giảm giá cả đơn
    expect(within(dlg).getByText(fmt(2700000))).toBeInTheDocument() // thanh toán
  })

  it('không có dữ liệu / đang tải', () => {
    const { rerender } = renderReport({ rows: [], total: 0 })
    expect(
      screen.getByText('Không có thanh toán nào khớp bộ lọc.')
    ).toBeInTheDocument()
    rerender(
      <PaymentReport
        summary={{}}
        rows={[]}
        loading
        from="2026-10-13"
        to="2026-11-13"
        pageStart={0}
        total={0}
      />
    )
    expect(document.querySelector('.sp-loading')).not.toBeNull()
    // không chọn kiểu thanh toán = hiện cả 3 chip
    expect(document.querySelectorAll('.sp-chips .sp-pill')).toHaveLength(3)
  })
})
