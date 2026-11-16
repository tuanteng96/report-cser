import {
  countNoun,
  enrichCustomers,
  groupOptions,
  groupRows,
  listKind,
  prepareTable,
  rowText,
  SEARCH_KEYS,
  splitItems,
  sumBy
} from '../popupTable'

// dòng thật của "Đơn hàng mới" (/hang-ngay/danh-sach#ban-hang)
const order = (o = {}) => ({
  'ID Đơn': 65032,
  'Cơ sở': 'Cơ sở Hà Nội',
  NGày: '2026-11-15T09:12:00',
  'ID khách': 45732,
  'Tên Khách': 'Nguyễn Minh Xám',
  SĐT: '0972072515',
  'Nguyên giá': 7630000,
  'Tăng / giảm': 0,
  'Tổng tiền': 7630000,
  Voucher: '',
  'Còn lại': 7630000,
  'Giảm giá cả đơn': 0,
  'Cần Thanh toán': 7630000,
  'Khấu trừ trả hàng': 0,
  'Tổng thanh toán': 7600000,
  'Còn nợ': 30000,
  'TM,CK,QT': 7600000,
  Ví: 0,
  'Thẻ Tiền': 0,
  'Chi tiết đơn':
    'Thẻ ưu đãi mua 5 triệu tặng 2 triệu(1),Massage chân (Buổi lẻ)(2)',
  'Ghi chú': '',
  TANG_DH_KET_THUC_NO: 0,
  ...o
})

describe('Popup chi tiết – chuẩn bị bảng', () => {
  it('đơn hàng: gộp cột tiền + khách, bỏ cột trống/kỹ thuật, cơ sở & ngày lên tiêu đề', () => {
    const rows = [
      order(),
      order({
        'ID Đơn': 65033,
        NGày: '2026-11-15T13:00:00',
        'Tên Khách': 'Khách CHN 1013-1(Vãng lai)',
        SĐT: '0000045735',
        'Nguyên giá': 550000,
        'Cần Thanh toán': 247500,
        'Tổng thanh toán': 0,
        'TM,CK,QT': 0,
        'Còn nợ': 247500,
        Voucher: 'VC10'
      })
    ]
    const t = prepareTable(rows)
    expect(t.cols.map(c => c.label)).toEqual([
      'ID Đơn',
      'Ngày',
      'Khách hàng',
      'Chi tiết đơn',
      'Phải thu',
      'TM/CK/QT', // Ví, Thẻ tiền toàn 0 -> ẩn
      'Còn nợ'
    ])
    expect(t.context).toEqual([
      { label: 'Cơ sở', value: 'Cơ sở Hà Nội' },
      { label: 'Ngày', value: '15-11-2026' }
    ])
    expect(t.primary.key).toBe('__value')
    const cust = t.cols.find(c => c.type === 'customer')
    expect(cust.get(rows[1])).toEqual({
      name: 'Khách CHN 1013-1',
      walkIn: true,
      phone: '0000045735'
    })
    const value = t.cols.find(c => c.key === '__value')
    expect(value.note(rows[1])).toBe(
      'Giá gốc 550.000 · giảm 302.500 · Voucher VC10'
    )
    // Đã thanh toán tách theo phương thức, bỏ cột Tổng thanh toán
    expect(t.cols.some(c => c.key === 'Tổng thanh toán')).toBe(false)
    expect(listKind(rows)).toBe('orders')
    expect(
      listKind([{ 'ID khách': 1, 'Tên Khách': 'A', 'Giới tính': 'Nữ' }])
    ).toBe('customers')
    expect(listKind([{ 'ID SP/DV': 1, Tên: 'Toner', 'Tổng Giá bán': 1 }])).toBe(
      'products'
    )
    // tìm kiếm đơn hàng: chỉ ID đơn, tên, SĐT, SP/DV (không tìm theo ghi chú)
    const text = rowText({ ...rows[0], 'Ghi chú': 'zzz' }, SEARCH_KEYS.orders)
    expect(text).toContain('65032')
    expect(text).toContain('0972072515')
    expect(text).toContain('massage chan')
    expect(text).not.toContain('zzz')
    expect(
      sumBy(
        rows,
        t.cols.find(c => c.key === 'Còn nợ')
      )
    ).toBe(277500)
    expect(countNoun(t.cols)).toBe('Đơn hàng')
  })

  it('thu chi: Tiền mặt + CK + Quẹt thẻ -> Số tiền, ghi phương thức', () => {
    const rows = [
      {
        'Cơ sở': 'A',
        Ngày: '2026-11-15',
        'Tiền mặt': 1000000,
        'Chuyển khoản': 0,
        'Quẹt thẻ': 0,
        Tags: 'Thu giữ lương',
        'Nội dung': 'x'
      },
      {
        'Cơ sở': 'A',
        Ngày: '2026-11-15',
        'Tiền mặt': 500000,
        'Chuyển khoản': 200000,
        'Quẹt thẻ': 0,
        Tags: 'Thu bán hàng',
        'Nội dung': 'y'
      }
    ]
    const t = prepareTable(rows)
    expect(t.cols.map(c => c.label)).toEqual(['Tags', 'Nội dung', 'Số tiền'])
    // Tags giống nhau ở mọi dòng -> lên tiêu đề
    const same = rows.map(r => ({ ...r, Tags: 'Thu giữ lương' }))
    expect(prepareTable(same).context).toContainEqual({
      label: 'Tags',
      value: 'Thu giữ lương'
    })
    const amount = t.cols.find(c => c.key === '__amount')
    expect(amount.get(rows[1])).toBe(700000)
    expect(amount.note(rows[0])).toBe('Tiền mặt')
    expect(amount.note(rows[1])).toBe('Tiền mặt 500.000 · Chuyển khoản 200.000')
    expect(countNoun(t.cols)).toBe('Phiếu thu chi')
  })

  it('Đủ cột: giữ nguyên cột như API', () => {
    const t = prepareTable([order()], { full: true })
    expect(t.cols).toHaveLength(Object.keys(order()).length)
  })

  it('gom theo khách / ngày, cộng tiền, xếp theo cột chính', () => {
    const rows = [
      order(),
      order({
        'ID Đơn': 2,
        NGày: '2026-11-14T08:00:00',
        'Cần Thanh toán': 100
      }),
      order({
        'ID Đơn': 3,
        'Tên Khách': 'Lê Bảo Ngọc',
        SĐT: '0981',
        'Cần Thanh toán': 9000000
      })
    ]
    const t = prepareTable(rows)
    const opts = groupOptions(rows, t.cols)
    expect(opts.map(o => o.label)).toEqual(['Ngày', 'Khách hàng'])
    const money = t.cols.filter(c => c.type === 'money')
    const byCust = groupRows(rows, opts[1], money, t.primary)
    expect(byCust.map(g => [g.label, g.count, g.sums.__value])).toEqual([
      ['Lê Bảo Ngọc · 0981', 1, 9000000],
      ['Nguyễn Minh Xám · 0972072515', 2, 7630100]
    ])
    const byDay = groupRows(rows, opts[0], money, t.primary)
    expect(byDay.map(g => g.label)).toEqual(['14-11-2026', '15-11-2026'])
  })

  it('danh sách khách: Tên+ĐT 1 cột, giữ ID khách, Ngày tạo lên tiêu đề, thêm Cài app / Giao dịch', () => {
    const base = [
      {
        'ID khách': 1,
        'Tên Khách': 'A',
        'Điện thoại': '09',
        'Địa chỉ': '',
        'Cơ sở': 'HN',
        'Ngày Sinh': '',
        'Ngày Tạo': '2026-11-15T08:00:00',
        'Giới tính': 'Nữ'
      },
      {
        'ID khách': 2,
        'Tên Khách': 'B',
        'Điện thoại': '08',
        'Địa chỉ': '',
        'Cơ sở': 'HN',
        'Ngày Sinh': '',
        'Ngày Tạo': '2026-11-15T09:00:00',
        'Giới tính': 'Nữ'
      }
    ]
    const rows = enrichCustomers(base, {
      app: new Set([2]),
      tx: { buy: new Set([1]), svc: new Set(), both: new Set([2]) }
    })
    expect(rows.map(r => [r['Cài app'], r['Giao dịch']])).toEqual([
      ['Chưa', 'Chỉ mua'],
      ['Đã cài', 'Mua & dùng dịch vụ']
    ])
    expect(listKind(rows)).toBe('customers')
    const t = prepareTable(rows, {
      keepCustId: true,
      keepEmpty: true,
      contextKeys: ['Ngày Tạo']
    })
    expect(t.cols.map(c => c.label)).toEqual([
      'ID khách',
      'Khách hàng',
      'Ngày Sinh',
      'Cơ sở',
      'Giới tính',
      'Cài app',
      'Giao dịch',
      'Địa chỉ'
    ])
    expect(t.context).toEqual([{ label: 'Ngày Tạo', value: '15-11-2026' }])
    // thiếu dữ liệu tra cứu -> không thêm cột
    expect(
      Object.keys(enrichCustomers(base, { app: null, tx: null })[0])
    ).not.toContain('Cài app')
  })

  it('thu nợ: giữ ID khách, nhận đúng loại', () => {
    const rows = [
      {
        'ID khách': 45949,
        'Tên khách': 'Nguyễn Hùng Huy',
        SĐT: '0977',
        'ID đơn hàng': 65412,
        'Số tiền thanh toán nợ': 1500000,
        'Thanh toán': 'triệt lông'
      }
    ]
    expect(listKind(rows)).toBe('debts')
    const t = prepareTable(rows, { keepCustId: true })
    expect(t.cols.map(c => c.label)).toEqual([
      'ID khách',
      'ID đơn hàng',
      'Khách hàng',
      'Thanh toán',
      'Số tiền trả nợ'
    ])
  })

  it('đặt lịch: cột gộp, bỏ ghi chú, gom theo khung giờ hẹn (không có Ngày)', () => {
    const b = (id, gio, o = {}) => ({
      'ID khách': 45732,
      'Tên khách': 'Lê Thị Thành',
      SĐT: '0900045732',
      'ID đặt lịch': id,
      'Ngày tạo đặt lịch': '2026-11-12T09:19:50',
      'Người tạo đặt lịch': null,
      'GIờ đặt lịch': gio,
      'Cơ sở': 'Cơ sở Hà Nội',
      'Tại:(nhà/spa)': 'Spa',
      'Trạng thái': 'Xác nhận tự động',
      'Dịch vụ': 'Liệu trình mụn',
      'Nhân viên': null,
      'Ghi chú': 'Tự động đặt lịch',
      ...o
    })
    const rows = [
      b(1, '2026-11-16T09:19:43'),
      b(2, '2026-11-16T08:05:00', { 'Người tạo đặt lịch': 'Mai' }),
      b(3, '2026-11-16T14:00:00', { 'Tên khách': 'An', SĐT: '0911' })
    ]
    expect(listKind(rows)).toBe('bookings')
    const t = prepareTable(rows, {
      keepEmpty: true,
      custIdInCell: true,
      contextKeys: [],
      hideKeys: ['Ghi chú'],
      labels: { 'Nhân viên': 'Nhân viên thực hiện' }
    })
    expect(t.cols.map(c => c.label)).toEqual([
      'ID đặt lịch',
      'Khách hàng',
      'Tạo lúc',
      'Lịch hẹn · Cơ sở',
      'Dịch vụ · Tại',
      'Nhân viên thực hiện',
      'Trạng thái'
    ])
    const col = k => t.cols.find(c => c.key === k)
    expect(col('__cust').get(rows[0])).toMatchObject({
      id: 45732,
      phone: '0900045732'
    })
    expect(col('__created').get(rows[1])).toEqual({
      main: '12-11-2026 09:19',
      note: 'bởi Mai'
    })
    expect(col('__svc').get(rows[0])).toMatchObject({
      main: 'Liệu trình mụn',
      badge: 'Spa'
    })
    const opts = groupOptions(rows, t.cols)
    expect(opts.map(o => o.label)).toEqual(['Khách hàng', 'Khung giờ'])
    const slots = groupRows(rows, opts[1], [], null)
    expect(slots.map(g => [g.label, g.count])).toEqual([
      ['08:00 – 10:00', 2],
      ['14:00 – 16:00', 1]
    ])
  })

  it('dịch vụ: Dịch vụ gốc + Thẻ 1 cột, bỏ Loại, gom khung giờ / nhân viên (1 buổi 2 NV) / đánh giá sao', () => {
    const s = (gio, nv, sao, o = {}) => ({
      'ID khách': 45920,
      'Tên khách': 'EZS Huong',
      SĐT: '0386',
      'Cơ sở': 'HN',
      'Dịch vụ gốc': 'Gội đầu',
      Thẻ: 'Gói gội 10B',
      'Giá buổi': 90000,
      'Giờ làm': gio,
      Loại: 'Buổi dịch vụ',
      'Phụ phí': null,
      'Nhân viên thực hiện': nv,
      'Tổng lương': '50000',
      'Trạng thái': 'Hoàn thành',
      'Đánh giá sao': sao,
      'Nội dung đánh giá': '',
      'Ghi chú': '',
      ...o
    })
    const rows = [
      s('2026-11-14T14:34:48', 'Hà Minh Ánh', 5),
      s('2026-11-14T15:13:49', 'Hà Minh Ánh,Nguyễn Thục Phương', null, {
        'Tên khách': 'Huy',
        SĐT: '0977'
      }),
      s('2026-11-14T23:21:48', 'Hà Anh', 4)
    ]
    expect(listKind(rows)).toBe('services')
    const t = prepareTable(rows, {
      keepEmpty: true,
      custIdInCell: true,
      contextKeys: [],
      hideKeys: ['Loại']
    })
    const labels = t.cols.map(c => c.label)
    expect(labels).not.toContain('Loại')
    expect(labels).not.toContain('Thẻ')
    expect(labels.slice(0, 3)).toEqual([
      'Giờ làm',
      'Khách hàng',
      'Dịch vụ · Thẻ'
    ])
    expect(labels).toEqual(
      expect.arrayContaining([
        'Phụ phí',
        'Ghi chú',
        'Nội dung đánh giá',
        'Cơ sở'
      ])
    )
    expect(t.cols.find(c => c.key === '__svcCard').get(rows[0])).toEqual({
      main: 'Gội đầu',
      note: 'Gói gội 10B'
    })
    expect(countNoun(t.cols)).toBe('Buổi dịch vụ')
    const opts = groupOptions(rows, t.cols)
    expect(opts.map(o => o.label)).toEqual(
      expect.arrayContaining(['Khung giờ', 'Nhân viên', 'Đánh giá sao'])
    )
    const staff = groupRows(
      rows,
      opts.find(o => o.id === 'staff'),
      [],
      null
    )
    expect(staff.map(g => [g.label, g.count])).toEqual([
      ['Hà Minh Ánh', 2],
      ['Nguyễn Thục Phương', 1],
      ['Hà Anh', 1]
    ])
    const stars = groupRows(
      rows,
      opts.find(o => o.id === 'stars'),
      [],
      null
    )
    expect(stars.map(g => g.label)).toEqual(['5 sao', '4 sao', 'Chưa đánh giá'])
  })

  it('tách chi tiết đơn thành từng món', () => {
    expect(splitItems(order()['Chi tiết đơn'])).toEqual([
      { name: 'Thẻ ưu đãi mua 5 triệu tặng 2 triệu', qty: 1 },
      { name: 'Massage chân (Buổi lẻ)', qty: 2 }
    ])
    expect(splitItems('Thẻ ưu đãi</br>x1')).toEqual([
      { name: 'Thẻ ưu đãi', qty: null },
      { name: 'x1', qty: null }
    ])
  })
})
