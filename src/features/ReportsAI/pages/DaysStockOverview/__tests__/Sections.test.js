import React from 'react'
import {
  render,
  screen,
  fireEvent,
  within,
  waitFor
} from '@testing-library/react'
import {
  CustomerSection,
  CustomerTrendSection,
  HourSection,
  IncomeSection,
  SalesSection,
  ServiceSection,
  StaffSection
} from '../Sections'
import { niceScale } from '../Charts'
import { buildShare } from '../DetailPopup'
import { parseHourly, parseWeekCustomers, weekRange } from '../query'

const fmt = n => new Intl.NumberFormat('vi-VN').format(n)
const k = (Key, Value) => ({ Key, Value, Count: 0, Qty: 0, ByStock: [] })
const g = (GroupTitle, GroupValue, Keys, GroupCount = 0) => ({
  GroupTitle,
  GroupValue,
  GroupCount,
  Keys
})

// Số liệu thật ngày 14/11/2026 (Cơ sở Hà Nội)
const SALES = {
  loading: false,
  groups: [
    g(
      'Đơn hàng mới',
      21330000,
      [
        k('Nguyên giá', 21330000),
        k('Giảm giá', 0),
        k('Thanh toán TM/CK/QT', 9030000),
        k('Thanh toán Ví', -100000),
        k('Thanh toán thẻ tiền', -3000000),
        k('Khấu hao KTT, Hoàn trả', 0),
        k('Còn nợ lại', 9200000)
      ],
      3
    ),
    g('Chi tiết bán hàng', 21330000, [
      k('Sản phẩm / NVL', 6000000),
      k('Dịch vụ / Phụ phí', 10330000),
      k('Thẻ tiền', 5000000)
    ]),
    g('Thu nợ', 1500000, [
      k('Thanh toán TM/CK/QT*', 1500000),
      k('Thanh toán Ví*', 0),
      k('Thanh toán thẻ tiền*', 0)
    ])
  ]
}
// 3 đơn thật: 00:12 (5.000.000), 00:13 (14.030.000), 00:23 (2.300.000)
const ORDERS = {
  loading: false,
  slots: parseHourly([
    { NGày: '2026-11-14T00:12:42', 'Cần Thanh toán': 5000000 },
    { NGày: '2026-11-14T00:13:28', 'Cần Thanh toán': 14030000 },
    { NGày: '2026-11-14T00:23:02', 'Cần Thanh toán': 2300000 }
  ])
}

describe('Tổng quan cơ sở – dữ liệu biểu đồ', () => {
  it('đơn theo khung 2 giờ', () => {
    expect(ORDERS.slots).toHaveLength(12)
    expect(ORDERS.slots[0]).toEqual({
      label: '00-02',
      orders: 3,
      revenue: 21330000
    })
    expect(ORDERS.slots[11].label).toBe('22-24')
  })

  it('tuần thứ Hai -> Chủ nhật, đánh dấu ngày đang xem / tương lai', () => {
    const { start, end } = weekRange(new Date(2026, 10, 14))
    expect(start.format('DD/MM/YYYY')).toBe('09/11/2026')
    expect(end.format('DD/MM/YYYY')).toBe('15/11/2026')
    const res = {
      result: {
        Items: [
          {
            From: '12/11/2026',
            Groups: [
              {
                GroupTitle: 'Khách tạo mới',
                Keys: [{ Key: 'Khách tạo từ phần mềm', Values: [{ Value: 6 }] }]
              }
            ]
          }
        ]
      }
    }
    const days = parseWeekCustomers(
      res,
      new Date(2026, 10, 14),
      new Date(2026, 10, 14)
    )
    expect(days.map(d => d.dow)).toEqual([
      'T2',
      'T3',
      'T4',
      'T5',
      'T6',
      'T7',
      'CN'
    ])
    expect(days[3]).toMatchObject({ short: '12/11', a: [6, 0], b: [0, 0] })
    expect(days[5]).toMatchObject({ selected: true, isToday: true })
    expect(days[6].future).toBe(true)
  })

  it('trục đẹp', () => {
    expect(niceScale(21330000, 5)).toEqual({ max: 25000000, step: 5000000 })
    expect(niceScale(3, 4, true)).toEqual({ max: 3, step: 1 })
    expect(niceScale(0, 4, true)).toEqual({ max: 4, step: 1 })
  })
})

describe('Tổng quan cơ sở – tỉ lệ phân chia trong popup', () => {
  const cfg = { labelKey: 'Tên', valueKey: 'Tổng Giá bán' }
  it('gộp theo tên, xếp giảm dần, tính tổng', () => {
    const { items, total } = buildShare(
      [
        { Tên: 'Toner Pro', 'Tổng Giá bán': 5000000 },
        { Tên: 'Phụ phí xăng xe', 'Tổng Giá bán': 30000 },
        { Tên: 'Toner Pro', 'Tổng Giá bán': 3500000 },
        { Tên: 'Không bán', 'Tổng Giá bán': 0 }
      ],
      cfg
    )
    expect(items.map(x => [x.label, x.value])).toEqual([
      ['Toner Pro', 8500000],
      ['Phụ phí xăng xe', 30000]
    ])
    expect(total).toBe(8530000)
  })

  it('quá 8 thành phần: gộp phần còn lại vào "Khác"', () => {
    const rows = Array.from({ length: 11 }, (_, i) => ({
      Tên: `SP ${i + 1}`,
      'Tổng Giá bán': (11 - i) * 1000
    }))
    const { items, total } = buildShare(rows, cfg)
    expect(items).toHaveLength(8)
    expect(items[7]).toMatchObject({
      label: 'Khác (4)',
      value: 10000,
      other: true
    })
    expect(total).toBe(66000)
  })
})

describe('Tổng quan cơ sở – các phần', () => {
  it('Bán hàng: tỉ lệ thanh toán, cơ cấu doanh thu, thu nợ, biểu đồ giờ', () => {
    render(<SalesSection state={SALES} orders={ORDERS} />)
    const sec = screen.getByRole('region', { name: 'Doanh số bán hàng' })
    // góc phải tiêu đề: 3 ô Nguyên giá - Giảm giá - Doanh số (chữ trên, giá trị dưới)
    const boxes = sec.querySelectorAll('.so-card-h .so-stat-btn')
    expect(
      [...boxes].map(c => [
        c.querySelector('small').textContent,
        c.querySelector('b').textContent
      ])
    ).toEqual([
      ['Nguyên giá', `${fmt(21330000)}₫`],
      ['Giảm giá', '0₫'],
      ['Doanh số', `${fmt(21330000)}₫`]
    ])
    expect(boxes[1]).toHaveClass('so-stat-btn--neg')
    // đã bỏ dòng Khấu hao KTT dưới phương thức thanh toán
    expect(within(sec).queryByText('Khấu hao KTT, hoàn trả')).toBeNull()
    expect(
      within(sec).getByText(
        'Giá trị đơn hàng mới, mức giảm giá và phương thức thanh toán'
      )
    ).toBeInTheDocument()
    // phần "Phương thức thanh toán" không có số bên phải
    const firstPay = sec.querySelector('.so-pay')
    expect(firstPay.querySelector('h3').textContent).toBe(
      'Phương thức thanh toán'
    )
    expect(firstPay.querySelector('.so-pay__h .so-chip')).toBeNull()
    const legend = sec.querySelector('.so-legend')
    expect(legend.textContent).toContain('TM / CK / QT42,3%9.030.000')
    expect(legend.textContent).toContain('Còn nợ lại43,1%9.200.000')
    // cơ cấu doanh số: biểu đồ tròn bên trái, 3 phần bên phải (xếp giảm dần)
    expect(within(sec).getByText('Cơ cấu doanh số')).toBeInTheDocument()
    expect(
      [...sec.querySelectorAll('.so-mix__legend .so-mix__name')].map(
        x => x.textContent
      )
    ).toEqual(['Dịch vụ / Phụ phí', 'Sản phẩm / NVL', 'Thẻ tiền'])
    const donut = sec.querySelector('.so-mix .so-donut svg')
    expect(donut.querySelectorAll('circle')).toHaveLength(4) // nền + 3 phần
    expect(donut.textContent).toContain(`Tổng doanh số${fmt(21330000)}`)
    expect(sec.querySelectorAll('.so-pay')).toHaveLength(1)
    // số 0 hiện nhạt
    expect(legend.querySelectorAll('b.zero')).toHaveLength(0)
    // Thu nợ nằm ở cuối khối (chỗ biểu đồ khung giờ cũ); biểu đồ đã chuyển ra khối riêng
    expect(sec.querySelector('.so-debt h3').textContent).toBe('Thu nợ')
    expect(sec.querySelector('.so-scroll')).toBeNull()
  })

  it('Theo khung giờ: khối riêng, chuyển Doanh thu / Số đơn', () => {
    render(<HourSection orders={ORDERS} />)
    const sec = screen.getByRole('region', { name: 'Theo khung giờ' })
    expect(sec).toHaveClass('so-span-12') // hàng riêng, hết chiều ngang
    expect(sec.querySelector('.so-note').textContent).toBe(
      'Cả 3 đơn trong ngày phát sinh ở khung 00-02h, doanh thu 21.330.000.'
    )
    fireEvent.click(within(sec).getByRole('button', { name: 'Số đơn' }))
    expect(within(sec).getByRole('button', { name: 'Số đơn' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(
      sec.querySelector('.so-scroll svg').getAttribute('aria-label')
    ).toContain('số đơn')
  })

  it('bấm ô Nguyên giá / Giảm giá / Doanh số: mở popup danh sách đơn hàng mới', () => {
    const rows = [
      {
        'ID Đơn': 65407,
        NGày: '2026-11-14T00:12:42',
        'Tên Khách': 'Nguyễn Hùng Huy',
        'Cần Thanh toán': 5000000,
        'Chi tiết đơn': 'Thẻ ưu đãi</br>x1'
      },
      {
        'ID Đơn': 65408,
        NGày: '2026-11-14T00:13:28',
        'Tên Khách': 'Nguyễn Hùng Huy',
        'Cần Thanh toán': 14030000,
        'Chi tiết đơn': ''
      }
    ]
    render(<SalesSection state={SALES} orders={{ ...ORDERS, rows }} />)
    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /Doanh số/ }))
    const dlg = screen.getByRole('dialog', { name: 'Đơn hàng mới' })
    expect(within(dlg).getByText('2 dòng')).toBeInTheDocument()
    const table = dlg.querySelector('.so-pop__table')
    // bảng gọn: Tên khách -> "Khách hàng", Cần Thanh toán -> "Phải thu", ngày chung lên tiêu đề
    expect([...table.querySelectorAll('th')].map(th => th.textContent)).toEqual(
      ['STT', 'ID Đơn', 'Ngày', 'Khách hàng', 'Chi tiết đơn', 'Phải thu']
    )
    const first = [...table.querySelectorAll('tbody tr')[0].children].map(
      td => td.textContent
    )
    expect(first).toEqual([
      '1',
      '#65407',
      '00:12',
      'Nguyễn Hùng Huy',
      'Thẻ ưu đãix1',
      fmt(5000000)
    ])
    expect(dlg.querySelector('.so-pop__meta').textContent).toContain(
      '14-11-2026'
    )
    // dòng tổng
    expect(table.querySelector('tfoot').textContent).toContain(fmt(19030000))
    // 1 khách, cùng ngày: không có gì để gom
    expect(dlg.querySelector('.so-dt__seg')).toBeNull()
    // Esc đóng popup
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    // ô Giảm giá cũng mở popup
    fireEvent.click(screen.getByRole('button', { name: /Giảm giá/ }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Đóng' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('bấm một phần của cơ cấu doanh số: gọi danh sách chi tiết và mở popup', async () => {
    const fetchList = jest.fn(() =>
      Promise.resolve([
        { 'ID SP/DV': 23964, Tên: 'Toner Pro', SL: 5, 'Tổng Giá bán': 8500000 }
      ])
    )
    render(<SalesSection state={SALES} orders={ORDERS} fetchList={fetchList} />)
    fireEvent.click(screen.getByRole('button', { name: /Sản phẩm \/ NVL/ }))
    expect(fetchList).toHaveBeenCalledWith(
      'ban-hang',
      'Chi tiết bán hàng',
      'Sản phẩm / NVL'
    )
    const dlg = screen.getByRole('dialog', { name: 'Sản phẩm / NVL' })
    // bảng (máy tính) — thẻ cho điện thoại cũng được vẽ, ẩn/hiện bằng CSS
    const table = await waitFor(() => {
      const t = dlg.querySelector('.so-pop__table')
      if (!t) throw new Error('chưa có bảng')
      return t
    })
    expect(within(table).getByText('Toner Pro')).toBeInTheDocument()
    expect(within(table).getByText(fmt(8500000))).toBeInTheDocument()
    // cột phải: biểu đồ phân chia + tên thành phần và tỉ lệ
    const chart = dlg.querySelector('.so-pop__chart')
    expect(chart.querySelector('svg')).not.toBeNull()
    expect(chart.querySelector('.so-pop__share').textContent).toBe(
      'Toner Pro100%'
    )
  })

  it('bấm vào biểu đồ tròn (tổng doanh số): popup toàn bộ chi tiết bán hàng', () => {
    const fetchList = jest.fn(() => Promise.resolve([]))
    render(<SalesSection state={SALES} orders={ORDERS} fetchList={fetchList} />)
    fireEvent.click(
      screen.getByRole('button', {
        name: /Xem tất cả chi tiết — Tổng doanh số/
      })
    )
    // không truyền Key = lấy tất cả (giống bấm tiêu đề nhóm ở trang mẫu)
    expect(fetchList).toHaveBeenCalledWith('ban-hang', 'Chi tiết bán hàng')
    expect(
      screen.getByRole('dialog', { name: 'Chi tiết bán hàng' })
    ).toBeInTheDocument()
  })

  it('Thu nợ: nhiều phương thức -> 4 ô TM/CK/QT, Ví, Thẻ tiền, Tổng', () => {
    const state = {
      loading: false,
      groups: [
        g('Thu nợ', 117300000, [
          k('Thanh toán TM/CK/QT*', 9700000),
          k('Thanh toán Ví*', 100000000),
          k('Thanh toán thẻ tiền*', 7600000)
        ])
      ]
    }
    render(
      <SalesSection
        state={{
          ...state,
          groups: [...SALES.groups.slice(0, 2), ...state.groups]
        }}
        orders={ORDERS}
        debts={{ loading: false, rows: [] }}
      />
    )
    const sec = document.getElementById('so-debt')
    const boxes = [...sec.querySelectorAll('.so-stat-btn')].map(c => [
      c.querySelector('small').textContent,
      c.querySelector('b').textContent
    ])
    expect(boxes).toEqual([
      ['TM/CK/QT', `${fmt(9700000)}₫`],
      ['Ví', `${fmt(100000000)}₫`],
      ['Thẻ tiền', `${fmt(7600000)}₫`],
      ['Tổng', `${fmt(117300000)}₫`]
    ])
  })

  it('Thu nợ: chỉ 1 phương thức có tiền -> chỉ ô Tổng, bấm mở danh sách', () => {
    const debts = {
      loading: false,
      rows: [
        {
          'ID khách': 45949,
          'Tên khách': 'Nguyễn Hùng Huy',
          SĐT: '0977629598',
          'ID đơn hàng': 65412,
          'Số tiền thanh toán nợ': 1500000,
          'Thanh toán': 'triệt lông chân bh 1 năm'
        }
      ]
    }
    render(<SalesSection state={SALES} orders={ORDERS} debts={debts} />)
    const sec = document.getElementById('so-debt')
    const boxes = [...sec.querySelectorAll('.so-stat-btn')].map(c => [
      c.querySelector('small').textContent,
      c.querySelector('b').textContent
    ])
    // 14/11: chỉ TM/CK/QT 1.500.000 -> chỉ hiện ô Tổng
    expect(boxes).toEqual([['Tổng', `${fmt(1500000)}₫`]])
    // bấm "Tổng" -> popup danh sách thu nợ
    fireEvent.click(within(sec).getByRole('button', { name: /Tổng/ }))
    const dlg = screen.getByRole('dialog', { name: 'Thu nợ' })
    expect(
      within(dlg.querySelector('.so-pop__table')).getByText('Số tiền trả nợ')
    ).toBeInTheDocument()
  })

  it('Thu chi: chỉ hiện dòng cần thiết + dòng khác 0, ô Tồn ngày', () => {
    render(
      <IncomeSection
        state={{
          loading: false,
          groups: [
            g('Tổng Thu', 11530000, [
              k('Thu', 0),
              k('Thu nạp ví', 1000000),
              k('Thu bán hàng', 10530000),
              k('Thu giữ lương', 0)
            ]),
            g('Tổng Chi', 1000000, [
              k('Chi', 1000000),
              k('Chi trả ví', 0),
              k('Chi lương', 0)
            ]),
            g('Tồn ngày', 10530000, [k('Tồn trong ngày', 10530000)])
          ]
        }}
      />
    )
    const sec = screen.getByRole('region', { name: 'Thu chi' })
    expect(within(sec).queryByText('Thu giữ lương')).toBeNull()
    expect(within(sec).queryByText('Chi lương')).toBeNull()
    expect(within(sec).getByText('Thu nạp ví')).toBeInTheDocument()
    expect(sec.querySelector('.so-net').textContent).toBe(
      `Tồn ngày${fmt(10530000)} ₫${fmt(11530000)} thu - ${fmt(1000000)} chi`
    )
  })

  it('Khách hàng: số liệu ngày và ghi chú ngày cao nhất', () => {
    const days = parseWeekCustomers(
      {
        result: {
          Items: [
            {
              From: '12/11/2026',
              Groups: [
                {
                  GroupTitle: 'x',
                  Keys: [
                    { Key: 'Khách tạo từ phần mềm', Values: [{ Value: 6 }] }
                  ]
                }
              ]
            }
          ]
        }
      },
      new Date(2026, 10, 14)
    )
    const state = {
      loading: false,
      groups: [
        g('Khách tạo mới', 2, [
          k('Khách tạo từ phần mềm', 2),
          k('Khách đăng ký từ web / app', 0)
        ]),
        g('Khách tải App', 0, [k('Khách mới tải app', 0)])
      ]
    }
    render(
      <>
        <CustomerSection state={state} />
        <CustomerTrendSection state={state} week={{ loading: false, days }} />
      </>
    )
    // khối số liệu (cột phải, cao 2 hàng)
    const sec = screen.getByRole('region', { name: 'Khách hàng' })
    // cùng hàng với Doanh số bán hàng (không còn cao 2 hàng), bỏ dòng "Tổng khách hàng"
    expect(sec).toHaveClass('so-span-4')
    expect(sec).not.toHaveClass('so-rowspan-2')
    expect(within(sec).queryByText('Tổng khách hàng')).toBeNull()
    expect(within(sec).getByText('Tạo từ phần mềm')).toBeInTheDocument()
    expect(sec.querySelectorAll('.so-stat__num.zero')).toHaveLength(1)
    expect(sec.querySelector('.so-scroll')).toBeNull()
    // khối xu hướng 7 ngày (riêng)
    const trend = screen.getByRole('region', { name: 'Khách hàng 7 ngày' })
    expect(within(trend).getByText('+2 khách mới')).toBeInTheDocument()
    expect(trend.querySelector('.so-note').textContent).toContain(
      'Ngày cao nhất là T5 12/11 với 6 khách.'
    )
  })

  it('Dịch vụ và Nhân viên: chip, nhãn dễ đọc, số dương', () => {
    render(
      <>
        <ServiceSection
          state={{
            loading: false,
            groups: [
              g('Đặt lịch', 2, [
                k('Đã xác nhận(Tự động)', 2),
                k('Khách có đến', 0)
              ]),
              g('Dịch vụ', 2, [k('Đang thực hiện', 0), k('Đã xong', 2)])
            ]
          }}
        />
        <StaffSection
          state={{
            loading: false,
            groups: [
              g('Nhân viên đi làm', 0, [k('Đang làm việc', 0), k('Đã về', 0)]),
              g('Tiền tour / HH / DS', -2567000, [
                k('Tổng Lương tour', 153000),
                k('Tổng Hoa hồng', -2320000),
                k('Tổng Doanh số', -400000)
              ]),
              g('Thưởng phạt', 0, [k('Tổng thưởng', 0), k('Tổng phạt', 0)])
            ]
          }}
        />
      </>
    )
    const dv = screen.getByRole('region', { name: 'Dịch vụ' })
    expect(within(dv).getByText('+2 lịch · +2 buổi')).toBeInTheDocument()
    expect(within(dv).getByText('Đã xác nhận (tự động)')).toBeInTheDocument()
    const nv = screen.getByRole('region', { name: 'Nhân viên' })
    expect(within(nv).getByText('0 đi làm')).toBeInTheDocument()
    expect(within(nv).getByText(fmt(2320000))).toBeInTheDocument()
    expect(within(nv).getByText('0 / 0')).toHaveClass('zero')
  })

  it('đang tải: hiện khung chờ, chưa hiện chip', () => {
    render(
      <SalesSection
        state={{ loading: true, groups: [] }}
        orders={{ loading: true }}
      />
    )
    const sec = screen.getByRole('region', { name: 'Doanh số bán hàng' })
    expect(sec).toHaveAttribute('aria-busy', 'true')
    expect(sec.querySelector('.so-chip')).toBeNull()
    expect(sec.querySelector('.so-skel')).not.toBeNull()
  })
})
