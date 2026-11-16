import moment from 'moment'

/* Tổng quan cơ sở — gọi giống trang mẫu (cser-report-preview, act20=daily):
   POST /api/v3/r23/hang-ngay/tong#<type>
   body { Type, StockID: [ids], DateStart: 'DD/MM/YYYY', DateEnd: 'DD/MM/YYYY' }
   Kết quả: result.Items[] (mỗi khoảng thời gian) -> Groups[] -> Keys[] -> Values[] (từng cơ sở) */

export const BLOCKS = [
  { type: 'khach-hang', title: 'Khách hàng', unit: 'count' },
  { type: 'ban-hang', title: 'Bán hàng', unit: 'money' },
  { type: 'dich-vu', title: 'Dịch vụ', unit: 'count' },
  { type: 'thu-chi', title: 'Thu chi', unit: 'money' },
  { type: 'nhan-vien', title: 'Nhân viên', unit: 'money' }
]

const uniq = list => [...new Set(list)]
const toIds = list =>
  uniq((list || []).map(Number).filter(id => Number.isInteger(id) && id > 0))

/* Cơ sở gửi lên: các cơ sở đã chọn (chỉ giữ cơ sở được xem); để trống = mọi cơ sở được xem */
export const resolveStockIDs = (selected, visible) => {
  const vis = toIds(visible)
  const sel = toIds(selected).filter(id => !vis.length || vis.includes(id))
  return sel.length ? sel : vis
}

export const buildDailyBody = (type, { Date, StockIDs }, visibleStockIds) => {
  const day = Date ? moment(Date).format('DD/MM/YYYY') : null
  return {
    Type: type,
    StockID: resolveStockIDs(StockIDs, visibleStockIds),
    DateStart: day,
    DateEnd: day
  }
}

const num = v => Number(v) || 0

/* Gộp mọi Items (nhiều khoảng thời gian) và mọi cơ sở thành:
   [{ GroupTitle, GroupValue, GroupCount, GroupQty,
      Keys: [{ Key, Value, Count, Qty, ByStock: [{ StockID, StockTitle, Value, Count, Qty }] }] }]
   Giữ thứ tự nhóm / key theo lần xuất hiện đầu tiên. An toàn khi Items rỗng. */
export const parseDailyGroups = res => {
  const items = res?.result?.Items || []
  const groups = []
  const gIndex = {}

  for (const item of items) {
    for (const g of item?.Groups || []) {
      let G = gIndex[g.GroupTitle]
      if (!G) {
        G = {
          GroupTitle: g.GroupTitle,
          GroupValue: 0,
          GroupCount: 0,
          GroupQty: 0,
          Keys: [],
          _k: {}
        }
        gIndex[g.GroupTitle] = G
        groups.push(G)
      }
      G.GroupValue += num(g.GroupValue)
      G.GroupCount += num(g.GroupCount)
      G.GroupQty += num(g.GroupQty)

      for (const k of g.Keys || []) {
        let K = G._k[k.Key]
        if (!K) {
          K = { Key: k.Key, Value: 0, Count: 0, Qty: 0, ByStock: [], _s: {} }
          G._k[k.Key] = K
          G.Keys.push(K)
        }
        for (const v of k.Values || []) {
          K.Value += num(v.Value)
          K.Count += num(v.Count)
          K.Qty += num(v.Qty)
          let S = K._s[v.StockID]
          if (!S) {
            S = {
              StockID: v.StockID,
              StockTitle: v.StockTitle,
              Value: 0,
              Count: 0,
              Qty: 0
            }
            K._s[v.StockID] = S
            K.ByStock.push(S)
          }
          S.Value += num(v.Value)
          S.Count += num(v.Count)
          S.Qty += num(v.Qty)
        }
      }
    }
  }

  // bỏ chỉ mục tạm
  return groups.map(({ _k, ...G }) => ({
    ...G,
    Keys: G.Keys.map(({ _s, ...K }) => K)
  }))
}

/* ===== Ô tổng quan ===== */
const findGroup = (data, type, title) =>
  (data?.[type]?.groups || []).find(g => g.GroupTitle === title)
const findKey = (data, type, key) => {
  for (const g of data?.[type]?.groups || []) {
    const k = g.Keys.find(x => x.Key === key)
    if (k) return k
  }
  return null
}

/* 6 ô ở phần Tổng quan. unit: money (₫) | count.
   tone: primary (nền xanh) | pos | neg | warn | (thường).
   loading: khối dữ liệu tương ứng đang tải. */
export const buildKpis = data => {
  const gv = (type, title) => findGroup(data, type, title)?.GroupValue || 0
  const kv = (type, key) => findKey(data, type, key)?.Value || 0
  const loading = type => !!data?.[type]?.loading
  const money = n =>
    new Intl.NumberFormat('vi-VN').format(Math.round(Math.abs(Number(n) || 0)))
  const orders = findGroup(data, 'ban-hang', 'Đơn hàng mới')?.GroupCount || 0

  // Thực thu = tiền TM/CK/QT (không tính ví, thẻ tiền)
  const newCash = Math.abs(kv('ban-hang', 'Thanh toán TM/CK/QT')) // đơn mới
  const debtKey = findKey(data, 'ban-hang', 'Thanh toán TM/CK/QT*') // thu nợ
  const debtCash = Math.abs(debtKey?.Value || 0)
  const debtOrders = Math.round(debtKey?.Qty || 0) // số đơn trả nợ bằng TM/CK/QT
  const actual = newCash + debtCash
  // Khách phát sinh giao dịch = khách chỉ phát sinh mua + khách phát sinh mua & làm dịch vụ
  // (không tính "Khách chỉ làm dịch vụ")
  const buyers = Math.round(
    kv('khach-hang', 'Khách chỉ phát sinh mua') +
      kv('khach-hang', 'Khách phát sinh mua & làm dịch vụ')
  )

  return [
    {
      id: 'thuc-thu',
      label: 'Thực thu bán hàng',
      value: actual,
      unit: 'money',
      sub: 'Thanh toán đơn mới và thu nợ',
      tone: 'primary',
      loading: loading('ban-hang')
    },
    {
      id: 'thuc-thu-moi',
      label: `Thực thu ${orders} đơn mới`,
      value: newCash,
      unit: 'money',
      // ví và thẻ tiền dùng để thanh toán đơn mới (API trả số âm)
      sub: `Ví & Thẻ tiền: ${money(
        Math.abs(kv('ban-hang', 'Thanh toán Ví')) +
          Math.abs(kv('ban-hang', 'Thanh toán thẻ tiền'))
      )}`,
      loading: loading('ban-hang')
    },
    {
      id: 'thu-no',
      label: 'Thu nợ',
      value: debtCash,
      unit: 'money',
      sub: `${debtOrders} đơn hàng`,
      tone: 'pos',
      loading: loading('ban-hang')
    },
    // Còn nợ đặt vào chỗ Tổng chi (Tổng chi vẫn xem ở khối Thu chi)
    {
      id: 'con-no',
      label: 'Còn nợ từ đơn mới',
      value: kv('ban-hang', 'Còn nợ lại'),
      unit: 'money',
      sub: `Khấu trừ: ${money(kv('ban-hang', 'Khấu hao KTT, Hoàn trả'))}`,
      tone: 'warn',
      loading: loading('ban-hang')
    },
    // Dịch vụ thực hiện: số buổi dịch vụ; đặt lịch: khách đến / khách không đến (gồm hủy lịch)
    {
      id: 'dich-vu',
      label: 'Dịch vụ thực hiện',
      value: gv('dich-vu', 'Dịch vụ'),
      unit: 'count',
      // "Đặt lịch: 2 [ Không đến: 0 ]" — không đến = khách không đến + khách hủy lịch
      sub: `Đặt lịch: ${Math.round(
        gv('dich-vu', 'Đặt lịch')
      )} [ Không đến: ${Math.round(
        kv('dich-vu', 'Khách không đến') + kv('dich-vu', 'Khách hủy lịch')
      )} ]`,
      tone: 'vio',
      loading: loading('dich-vu')
    },
    // Khách mới = khách tạo mới; kèm số khách đăng ký từ web / app (online)
    {
      id: 'khach-moi',
      label: 'Khách mới',
      value: gv('khach-hang', 'Khách tạo mới'),
      unit: 'count',
      extra: `[ ${Math.round(
        kv('khach-hang', 'Khách đăng ký từ web / app')
      )} đến từ online ]`,
      sub: `${buyers} khách phát sinh giao dịch`,
      loading: loading('khach-hang')
    }
  ]
}

/* ===== Biểu đồ bán hàng theo khung 2 giờ =====
   Nguồn: /hang-ngay/danh-sach#ban-hang, GroupTitle "Đơn hàng mới" -> mỗi dòng 1 đơn,
   giờ ở cột "NGày", tiền ở "Cần Thanh toán" (giống trang mẫu). */
export const buildOrdersBody = (filters, visibleStockIds) => ({
  ...buildDailyBody('ban-hang', filters, visibleStockIds),
  GroupTitle: 'Đơn hàng mới'
})

export const parseListRows = res =>
  (res?.result?.List || []).flatMap(x => (Array.isArray(x) ? x : []))

const pad = n => String(n).padStart(2, '0')

export const parseHourly = rows => {
  const slots = Array.from({ length: 12 }, (_, i) => ({
    label: `${pad(i * 2)}-${pad(i * 2 + 2)}`,
    orders: 0,
    revenue: 0
  }))
  for (const r of rows || []) {
    const t = moment(r['NGày'])
    if (!t.isValid()) continue
    const s = slots[Math.floor(t.hour() / 2)]
    s.orders += 1
    s.revenue += num(r['Cần Thanh toán'])
  }
  return slots
}

/* ===== Biểu đồ khách hàng 7 ngày (thứ Hai -> Chủ nhật của tuần đang xem) ===== */
export const weekRange = date => {
  const m = moment(date)
  return {
    start: m.clone().startOf('isoWeek'),
    end: m.clone().endOf('isoWeek')
  }
}

export const buildWeekBody = (filters, visibleStockIds) => {
  const { start, end } = weekRange(filters.Date)
  return {
    Type: 'khach-hang',
    StockID: resolveStockIDs(filters.StockIDs, visibleStockIds),
    DateStart: start.format('DD/MM/YYYY'),
    DateEnd: end.format('DD/MM/YYYY')
  }
}

const DOW = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

/* -> 7 ngày: { dow, short, a: [tạo từ phần mềm, đăng ký web/app], b: [mới tải app, cũ tải app],
   selected (ngày đang xem), isToday, future } */
export const parseWeekCustomers = (res, date, now = new Date()) => {
  const { start } = weekRange(date)
  const byDay = {}
  for (const it of res?.result?.Items || []) {
    const sum = key => {
      let s = 0
      for (const g of it.Groups || [])
        for (const k of g.Keys || [])
          if (k.Key === key) for (const v of k.Values || []) s += num(v.Value)
      return s
    }
    byDay[it.From] = {
      a: [sum('Khách tạo từ phần mềm'), sum('Khách đăng ký từ web / app')],
      b: [sum('Khách mới tải app'), sum('Khách cũ tải app')]
    }
  }
  return Array.from({ length: 7 }, (_, i) => {
    const d = start.clone().add(i, 'days')
    const v = byDay[d.format('DD/MM/YYYY')] || { a: [0, 0], b: [0, 0] }
    return {
      dow: DOW[d.day()],
      short: d.format('DD/MM'),
      a: v.a,
      b: v.b,
      selected: d.isSame(moment(date), 'day'),
      isToday: d.isSame(moment(now), 'day'),
      future: d.isAfter(moment(now), 'day')
    }
  })
}

/* Cơ sở có trong kết quả (để hiển thị) */
export const parseStocks = res =>
  (res?.result?.Stocks || []).map(s => ({ ID: s.ID, Title: s.Title }))
