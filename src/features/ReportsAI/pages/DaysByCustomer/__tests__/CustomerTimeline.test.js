import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import CustomerTimeline from '../CustomerTimeline'

// Dữ liệu mẫu lấy từ bao-cao-ngay.html (cùng cấu trúc API /khach-hang/chi-tiet-ngay)
const DATA = [
  {
    MemberID: 45949,
    CreateDate: '2026-11-14T00:25:34',
    FullName: 'Nguyễn Hùng Huy',
    Phone: '0977629598',
    TongThanhToan: 10530000,
    No: 6900000,
    CheckIn: null,
    CheckOut: null,
    children: [
      {
        MajorList: [
          {
            Order: null,
            PayDebt: {
              ID: 65412,
              Prods: [{ Title: 'triệt lông chân bh 1 năm', Qty: 1 }],
              ThanhToan: 1500000,
              ThanhToan_TienMat: 0,
              ThanhToan_CK: 1500000,
              ThanhToan_QT: 0,
              Vi: 0,
              TheTien: 0,
              No: 0,
              HoaHong: [{ FullName: 'Nguyễn Thu Hương', Bonus: 150000 }],
              DoanhSo: [{ FullName: 'Nguyễn Thu Hương', Bonus: 1500000 }]
            },
            Returns: null,
            Services: null
          },
          {
            Order: null,
            PayDebt: null,
            Returns: {
              Prods: [{ Title: 'Workshop vẽ cốc', Qty: 1 }],
              ID: 65410,
              GiaTriDonTra: 4000000,
              HoanTienMat: 1000000,
              HoanVi: 3000000,
              HoanTheTien: 0,
              HoaHongGiam: [
                { FullName: 'Nguyễn Thục Phương', Bonus: -976000 },
                { FullName: 'Phạm Quang Hùng', Bonus: -1704000 }
              ],
              DoanhSoGiam: [
                { FullName: 'Nguyễn Thục Phương', Bonus: -1600000 },
                { FullName: 'Phạm Quang Hùng', Bonus: -2400000 }
              ]
            },
            Services: null
          },
          {
            Order: null,
            PayDebt: null,
            Returns: null,
            Services: [
              {
                Type: 'Thực hiện dịch vụ',
                Title: 'Lớp tập tô',
                PhuPhi: [{ Title: 'Phụ phí xăng xe - dưới 5km(Gốc)' }],
                HoaHong: [
                  { FullName: 'Hà Minh Ánh', Bonus: 51500 },
                  { FullName: 'Nguyễn Thục Phương', Bonus: 51500 }
                ]
              }
            ]
          },
          {
            Order: {
              Prods: [
                { Title: 'Toner Pro', Qty: 2 },
                { Title: 'Lớp tập tô 10b', Qty: 1 },
                { Title: 'Phụ phí xăng xe - dưới 5km', Qty: 1 }
              ],
              ID: 65408,
              GiaBanDonHang: 14030000,
              ThanhToan: 4030000,
              ThanhToan_TienMat: 1030000,
              ThanhToan_CK: 3000000,
              ThanhToan_QT: 0,
              Vi: -100000,
              TheTien: -3000000,
              No: 6900000,
              HoaHong: [
                { FullName: 'Trần Mai Linh', Bonus: 120000 },
                { FullName: 'Lý Hồng Chuyên', Bonus: 90000 }
              ],
              DoanhSo: [
                { FullName: 'Trần Mai Linh', Bonus: 1200000 },
                { FullName: 'Lý Hồng Chuyên', Bonus: 900000 }
              ]
            },
            PayDebt: null,
            Returns: null,
            Services: null
          },
          {
            Order: {
              Prods: [{ Title: 'Thẻ ưu đãi mua 5 triệu tặng 2 triệu', Qty: 1 }],
              ID: 65407,
              GiaBanDonHang: 5000000,
              ThanhToan: 5000000,
              ThanhToan_TienMat: 5000000,
              ThanhToan_CK: 0,
              ThanhToan_QT: 0,
              No: 0
            },
            PayDebt: null,
            Returns: null,
            Services: null
          }
        ],
        More: [
          {
            Title: 'Trả hàng hoàn ví',
            Value: 3000000,
            Desc: '(Trả hàng)Hoàn ví sản phẩm/dịch vụ:DV25',
            KhongTinh: 1
          },
          {
            Title: 'Trả hàng hoàn tiền',
            Value: -1000000,
            Desc: '(Trả hàng)Hoàn tiền sản phẩm/dịch vụ:Workshop vẽ cốc.'
          },
          { Title: 'Nạp ví', Value: 1000000, Desc: '', KhongTinh: 0 }
        ],
        Booking: []
      }
    ]
  },
  {
    MemberID: 45950,
    CreateDate: '2026-11-14T00:23:02',
    FullName: '0000(Vãng lai)',
    Phone: '0000045950',
    TongThanhToan: 0,
    No: 2300000,
    CheckIn: '2026-11-14T00:23:02',
    CheckOut: '2026-11-14T00:23:04',
    children: [
      {
        MajorList: [
          {
            Order: {
              Prods: [
                { Title: 'Toner Pro', Qty: 1 },
                { Title: 'Lớp tập tô (Buổi lẻ)', Qty: 1 }
              ],
              ID: 65411,
              GiaBanDonHang: 2300000,
              No: 2300000
            },
            PayDebt: null,
            Returns: null,
            Services: null
          }
        ],
        More: [],
        Booking: []
      }
    ]
  }
]

const fmt = n => new Intl.NumberFormat('vi-VN').format(n)
const getItem = name => screen.getByText(name).closest('article')
const orderRow = id => screen.getByText(`#${id}`).closest('.bc-o')

describe('CustomerTimeline', () => {
  it('hiện thông báo khi không có dữ liệu', () => {
    render(<CustomerTimeline data={[]} />)
    expect(
      screen.getByText('Không có khách nào trong bộ lọc đã chọn.')
    ).toBeInTheDocument()
  })

  it('đầu thẻ: chữ viết tắt, SĐT, giờ check-in, tổng thanh toán', () => {
    render(<CustomerTimeline data={DATA} />)
    const a = getItem('Nguyễn Hùng Huy')
    expect(a.querySelector('.bc-av').textContent).toBe('NH')
    expect(within(a).getByText('0977629598')).toBeInTheDocument()
    expect(a.querySelector('.bc-tot-v').textContent).toBe(fmt(10530000))
    expect(within(a).getByText('VND')).toBeInTheDocument()
    // không có giờ check-in thì không hiện
    expect(a.querySelector('[title="Giờ check-in"]')).toBeNull()

    // khách vãng lai: tên chung, SĐT ảo cạnh tên, nền xám, không có tổng khi = 0
    const b = getItem('Khách vãng lai')
    expect(b).toHaveClass('bc-walk')
    expect(within(b).getByText('0000045950')).toHaveClass('bc-ph-in')
    expect(within(b).getByText('00:23')).toBeInTheDocument()
    expect(b.querySelector('.bc-tot')).toBeNull()
  })

  it('đơn nhiều phương thức: khung thực thu, số gọn, còn nợ', () => {
    render(<CustomerTimeline data={DATA} />)
    const row = orderRow(65408)
    expect(within(row).getByTitle('Bán mới')).toHaveTextContent('Mới')
    expect(row.querySelector('.bc-gv').textContent).toBe(
      `Tổng giá trị: ${fmt(14030000)}`
    )
    // nhiều thành phần: danh sách gạch đầu dòng, [x2] khi SL > 1
    expect(row.querySelectorAll('.bc-list li')).toHaveLength(3)
    expect(within(row).getByText('[x2]')).toBeInTheDocument()

    // nhiều phương thức: không khung, liệt kê đủ số bên dưới
    expect(row.querySelector('.bc-lab').textContent).toBe('Thực thu')
    expect(row.querySelector('.bc-amt').textContent).toBe(fmt(4030000))
    // dòng 1: TM / CK / QT — dòng 2: Ví / Thẻ tiền
    const lines = [...row.querySelectorAll('.bc-mths')].map(x => x.textContent)
    expect(lines).toEqual([
      `TM ${fmt(1030000)} • CK ${fmt(3000000)}`,
      `Ví ${fmt(100000)} • TT ${fmt(3000000)}`
    ])
    expect(row.querySelector('.bc-debt').textContent).toBe(
      `Nợ${fmt(6900000)}`
    )
    // chip nhân viên: số gọn, tên đầy đủ trong chú thích
    expect(row.querySelector('.bc-chips').textContent).toContain(
      'HH:LinhTM (+120k), ChuyenLH (+90k)'
    )
    const nm = within(row).getAllByText('LinhTM')[0]
    expect(nm).toHaveAttribute('data-tip', 'Trần Mai Linh')
  })

  it('một phương thức: "Thực thu TM", số tiền bên dưới, không có khung', () => {
    render(<CustomerTimeline data={DATA} />)
    const row = orderRow(65407)
    expect(row.querySelector('.bc-lab').textContent).toBe('Thực thu TM')
    expect(row.querySelector('.bc-mth')).toHaveAttribute('title', 'Tiền mặt')
    expect(row.querySelector('.bc-mths')).toBeNull()
    expect(row.querySelector('.bc-chips')).toBeNull()
    // một thành phần: một dòng, không gạch đầu dòng
    expect(row.querySelector('.bc-list')).toBeNull()
  })

  it('thanh toán nợ và trả hàng', () => {
    render(<CustomerTimeline data={DATA} />)
    const debt = orderRow(65412)
    expect(within(debt).getByTitle('Thanh toán nợ')).toHaveTextContent('TT nợ')
    expect(debt.querySelector('.bc-lab').textContent).toBe('Thực thu CK')
    // thanh toán nợ / trả hàng: 1 thành phần vẫn có dấu đầu dòng
    expect(debt.querySelectorAll('.bc-list li')).toHaveLength(1)

    const ret = orderRow(65410)
    expect(within(ret).getByTitle('Trả hàng')).toBeInTheDocument()
    expect(ret.querySelector('.bc-lab')).toHaveClass('bc-neg')
    expect(within(ret).getByText(fmt(4000000))).toHaveClass('bc-neg')
    expect(
      [...ret.querySelectorAll('.bc-mths')].map(x => x.textContent)
    ).toEqual([`TM ${fmt(1000000)}`, `Ví ${fmt(3000000)}`])
    expect(within(ret).getByLabelText('Khấu trừ hoa hồng')).toBeInTheDocument()
    expect(ret.textContent).toContain('(-976k)')
  })

  it('đơn chưa thanh toán: hiện "Nợ" màu cảnh báo', () => {
    render(<CustomerTimeline data={DATA} />)
    const row = orderRow(65411)
    expect(row.querySelector('.bc-lab').textContent).toBe('Nợ')
    expect(row.querySelector('.bc-amt')).toHaveClass('bc-warn')
    expect(row.querySelector('.bc-amt').textContent).toBe(fmt(2300000))
    expect(row.querySelector('.bc-debt')).toBeNull()
  })

  it('cột phải: dịch vụ (lương tour), nghiệp vụ khác, khối trống', () => {
    render(<CustomerTimeline data={DATA} />)
    const a = getItem('Nguyễn Hùng Huy')
    expect(within(a).getByText('Danh sách đơn hàng (4)')).toBeInTheDocument()
    const svc = within(a).getByText('Lớp tập tô').closest('.bc-svc')
    expect(
      within(svc).getByText('Phụ phí xăng xe - dưới 5km(Gốc)')
    ).toBeInTheDocument()
    expect(within(svc).getByText('Lương tour')).toBeInTheDocument()
    expect(svc.textContent).toContain(`AnhHM (+${fmt(51500)})`)
    expect(within(a).getByText(`+${fmt(3000000)}`)).toHaveClass('bc-pos')
    expect(within(a).getByText(`-${fmt(1000000)}`)).toHaveClass('bc-neg')
    expect(within(a).getByText('Không tính vào DT')).toHaveAttribute(
      'title',
      'Không tính vào doanh thu'
    )

    const b = getItem('Khách vãng lai')
    expect(b.querySelector('.bc-ghost').textContent).toContain(
      'Không có nghiệp vụ'
    )
  })

  it('bấm đầu thẻ để thu gọn / mở lại', () => {
    render(<CustomerTimeline data={DATA} />)
    const a = getItem('Nguyễn Hùng Huy')
    const head = a.querySelector('.bc-head')
    expect(head).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(head)
    expect(head).toHaveAttribute('aria-expanded', 'false')
    expect(a.querySelector('.bc-body')).toBeNull()
    fireEvent.click(head)
    expect(a.querySelector('.bc-body')).not.toBeNull()
  })

  it('chạm tên nhân viên để hiện chú thích, chạm chỗ khác để ẩn', () => {
    render(<CustomerTimeline data={DATA} />)
    const nm = within(orderRow(65408)).getAllByText('LinhTM')[0]
    fireEvent.click(nm)
    expect(nm).toHaveClass('bc-show')
    fireEvent.click(document.body)
    expect(nm).not.toHaveClass('bc-show')
  })
})
