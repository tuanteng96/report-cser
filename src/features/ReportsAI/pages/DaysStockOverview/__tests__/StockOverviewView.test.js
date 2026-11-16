import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import StockOverviewView, { SECTIONS } from '../StockOverviewView'
import { buildKpis } from '../query'

const fmt = n => new Intl.NumberFormat('vi-VN').format(n)
const k = (Key, Value) => ({ Key, Value, Count: 0, Qty: 0, ByStock: [] })
const g = (GroupTitle, GroupValue, Keys, GroupCount = 0) => ({
  GroupTitle,
  GroupValue,
  GroupCount,
  Keys
})

// Số liệu thật ngày 14/11/2026 (Cơ sở Hà Nội), đã gộp
const DATA = {
  'khach-hang': {
    loading: false,
    groups: [
      g('Khách tạo mới', 3, [
        k('Khách tạo từ phần mềm', 1),
        k('Khách đăng ký từ web / app', 2)
      ]),
      g('Khách có giao dịch', 3, [
        k('Khách chỉ làm dịch vụ', 1),
        k('Khách chỉ phát sinh mua', 1),
        k('Khách phát sinh mua & làm dịch vụ', 1)
      ])
    ]
  },
  'ban-hang': {
    loading: false,
    groups: [
      g(
        'Đơn hàng mới',
        21330000,
        [
          k('Thanh toán TM/CK/QT', 9030000),
          k('Thanh toán Ví', -100000),
          k('Thanh toán thẻ tiền', -3000000),
          k('Khấu hao KTT, Hoàn trả', 0),
          k('Còn nợ lại', 9200000)
        ],
        3
      ),
      g('Thu nợ', 1500000, [{ ...k('Thanh toán TM/CK/QT*', 1500000), Qty: 1 }])
    ]
  },
  'dich-vu': {
    loading: false,
    groups: [
      g('Đặt lịch', 17, [
        k('Đã xác nhận(Tự động)', 2),
        k('Khách có đến', 5),
        k('Khách không đến', 7),
        k('Khách hủy lịch', 3)
      ]),
      g('Dịch vụ', 2, [k('Đang thực hiện', 0), k('Đã xong', 2)])
    ]
  },
  'thu-chi': {
    loading: false,
    groups: [
      g('Tổng Thu', 11530000, [k('Thu bán hàng', 10530000)]),
      g('Tổng Chi', 1000000, [k('Chi', 1000000), k('Chi trả ví', 0)]),
      g('Tồn ngày', 10530000, [k('Tồn trong ngày', 10530000)])
    ]
  },
  'nhan-vien': { loading: false, groups: [] }
}

describe('Tổng quan cơ sở – 6 ô tổng quan', () => {
  it('tính đúng giá trị và dòng phụ từ 5 API', () => {
    const kp = buildKpis(DATA)
    expect(kp.map(x => [x.label, x.value, x.sub])).toEqual([
      // 9.030.000 (TM/CK/QT đơn mới) + 1.500.000 (TM/CK/QT thu nợ); không tính ví
      ['Thực thu bán hàng', 10530000, 'Thanh toán đơn mới và thu nợ'],
      ['Thực thu 3 đơn mới', 9030000, `Ví & Thẻ tiền: ${fmt(3100000)}`],
      ['Thu nợ', 1500000, '1 đơn hàng'],
      ['Còn nợ từ đơn mới', 9200000, 'Khấu trừ: 0'],
      // 2 = 1 chỉ mua + 1 mua & làm dịch vụ (không tính 1 khách chỉ làm dịch vụ)
      // không đến = 7 không đến + 3 hủy lịch
      ['Dịch vụ thực hiện', 2, 'Đặt lịch: 17 [ Không đến: 10 ]'],
      ['Khách mới', 3, '2 khách phát sinh giao dịch']
    ])
    expect(kp.find(x => x.id === 'dich-vu').tone).toBe('vio')
    expect(kp.find(x => x.id === 'khach-moi').extra).toBe('[ 2 đến từ online ]')
  })

  it('khối đang tải thì ô tương ứng hiện khung chờ', () => {
    const kp = buildKpis({
      ...DATA,
      'khach-hang': { loading: true, groups: [] }
    })
    expect(kp.find(x => x.id === 'khach-moi').loading).toBe(true)
    expect(kp.find(x => x.id === 'thuc-thu').loading).toBe(false)
  })
})

describe('Tổng quan cơ sở – menu và các phần', () => {
  const realRect = Element.prototype.getBoundingClientRect
  beforeEach(() => {
    window.scrollTo = jest.fn()
    // vừa mở trang: các phần nằm bên dưới menu
    Element.prototype.getBoundingClientRect = function () {
      return { top: this.id === 'so-sec-tong-quan' ? 400 : 1000 }
    }
  })
  afterEach(() => {
    Element.prototype.getBoundingClientRect = realRect
  })

  it('menu đủ 6 mục, mục đầu đang sáng; ô tiền có ký hiệu ₫', () => {
    render(<StockOverviewView data={DATA} />)
    const menu = screen.getByRole('navigation', { name: 'Các phần báo cáo' })
    const items = within(menu).getAllByRole('button')
    expect(items.map(b => b.textContent)).toEqual(SECTIONS.map(s => s.title))
    expect(items[0]).toHaveAttribute('aria-current', 'true')

    const kpis = screen.getByRole('region', { name: 'Chỉ số chính' })
    const ton = within(kpis).getByText('Thực thu bán hàng').closest('.so-kpi')
    expect(ton).toHaveClass('so-kpi--primary')
    expect(ton.querySelector('.so-kpi__value').textContent).toBe(
      `${fmt(10530000)}₫`
    )
    const khach = within(kpis).getByText('Khách mới').closest('.so-kpi')
    expect(khach.querySelector('.so-kpi__value i')).toBeNull()
    expect(khach.querySelector('.so-kpi__value').textContent).toBe(
      '3[ 2 đến từ online ]'
    )
    expect(kpis.querySelectorAll('.so-kpi')).toHaveLength(6)
    // 5 phần nội dung theo thứ tự
    expect(
      screen.getAllByRole('heading', { level: 2 }).map(h => h.textContent)
    ).toEqual([
      'Doanh số bán hàng',
      'Khách hàng',
      'Theo khung giờ',
      'Thu chi',
      'Khách hàng 7 ngày',
      'Dịch vụ',
      'Nhân viên'
    ])
  })

  it('bấm mục menu: sáng mục đó và cuộn tới phần tương ứng', () => {
    render(<StockOverviewView data={DATA} />)
    const btn = screen.getByRole('button', { name: 'Thu chi' })
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-current', 'true')
    expect(window.scrollTo).toHaveBeenCalled()
  })
})
