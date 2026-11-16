import moment from 'moment'

/* Chuẩn bị dữ liệu cho popup chi tiết (/hang-ngay/danh-sach):
   - bỏ cột trống / toàn 0 / cột kỹ thuật, cột giống nhau ở mọi dòng đưa lên tiêu đề
   - gộp cột: Tên + SĐT -> Khách hàng; các cột tiền đơn hàng -> Phải thu / Đã thanh toán;
     Tiền mặt + CK + Quẹt thẻ -> Số tiền (dòng phụ ghi phương thức)
   - tổng theo cột tiền, các cách gom nhóm (theo khách, ngày, cơ sở, loại...) */

export const DATE_COLS = ['Ngày Sinh', 'Ngày Tạo', 'Ngày tạo đặt lịch', 'Ngày']
export const DATETIME_COLS = ['NGày', 'GIờ đặt lịch', 'Giờ làm']
export const TIME_COLS = ['Giờ checkin', 'Giờ checkout']
export const MONEY_COLS = [
  'Nguyên giá',
  'Tăng / giảm',
  'Tổng tiền',
  'Còn lại',
  'Giảm giá cả đơn',
  'Cần Thanh toán',
  'Khấu trừ trả hàng',
  'Tổng thanh toán',
  'Còn nợ',
  'TM,CK,QT',
  'Ví',
  'Thẻ Tiền',
  'Tổng Giá bán',
  'Tổng Đã thanh toán ( TM,CK,QT, VI, TT )',
  'Giá buổi',
  'Tổng lương',
  'Số tiền thanh toán nợ',
  'Tiền mặt',
  'Chuyển khoản',
  'Quẹt thẻ',
  'Giá trị',
  'Số tiền'
]
// cột tiền đặt tên ngắn hơn khi hiển thị
const MONEY_LABELS = {
  'Tổng Đã thanh toán ( TM,CK,QT, VI, TT )': 'Đã thanh toán',
  'Số tiền thanh toán nợ': 'Số tiền trả nợ',
  'Thẻ Tiền': 'Thẻ tiền',
  'Khấu trừ trả hàng': 'Khấu trừ',
  'TM,CK,QT': 'TM/CK/QT'
}
const NAME_KEYS = ['Tên Khách', 'Tên khách', 'Khách hàng', 'Tên KH']
const PHONE_KEYS = ['SĐT', 'Điện thoại', 'Số điện thoại']
const ID_KEYS = ['ID khách', 'ID Đơn', 'ID đơn hàng', 'ID SP/DV', 'ID đặt lịch']
// 'Cài app', 'Giao dịch': cột bổ sung cho danh sách khách (enrichCustomers)
const TAG_KEYS = [
  'Tags',
  'Loại',
  'Trạng thái',
  'Giới tính',
  'Phương thức',
  'Cài app',
  'Giao dịch',
  'Loại phiếu' // Tồn ngày: Thu / Chi
]
const ITEMS_KEYS = ['Chi tiết đơn']
const LONG_KEYS = [
  'Nội dung',
  'Ghi chú',
  'Địa chỉ',
  'Thanh toán',
  'Phụ phí',
  'Nội dung đánh giá'
]
// cột chính (đậm, dùng để xếp hạng / tỉ trọng), theo thứ tự ưu tiên
const PRIMARY = [
  '__value',
  '__amount',
  'Tổng Giá bán',
  'Số tiền thanh toán nợ',
  'Giá trị',
  'Số tiền',
  'Tổng lương',
  'Giá buổi'
]

const isEmpty = v => v === null || v === undefined || String(v).trim() === ''
const num = v => Number(v) || 0
export const fmtMoney = v =>
  new Intl.NumberFormat('vi-VN').format(Math.round(Math.abs(num(v))))
const dayOf = v => (isEmpty(v) ? '' : moment(v).format('DD-MM-YYYY'))
export const norm = s =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()

const WALKIN = /\s*\(\s*vãng lai\s*\)\s*$/i

/* "A(1),B (Buổi lẻ)(2)" hoặc "A</br>x1" -> [{name, qty}] */
export const splitItems = s => {
  if (isEmpty(s)) return []
  return String(s)
    .replace(/<\/?br\s*\/?>/gi, '\n')
    .split(/\n|(?<=\))\s*,\s*/)
    .map(x => x.trim())
    .filter(Boolean)
    .map(x => {
      const m = x.match(/^(.*?)\s*\((\d+)\)$/)
      return m ? { name: m[1], qty: Number(m[2]) } : { name: x, qty: null }
    })
}

/* Cách hiển thị gốc của 1 ô (chế độ "Đủ cột" + chuỗi tìm kiếm) */
export const formatCell = (key, value) => {
  if (isEmpty(value)) return ''
  if (DATE_COLS.includes(key)) return moment(value).format('DD-MM-YYYY')
  if (DATETIME_COLS.includes(key))
    return moment(value).format('DD-MM-YYYY HH:mm')
  if (TIME_COLS.includes(key)) return moment(value).format('HH:mm')
  if (MONEY_COLS.includes(key)) return fmtMoney(value)
  return String(value)
    .replaceAll('</br>', ', ')
    .replaceAll('<br>', ', ')
    .replaceAll('\n', ' | ')
}

const typeOf = key => {
  if (key === 'Đánh giá sao') return 'stars'
  if (key === 'Nhân viên thực hiện') return 'staff'
  if (MONEY_COLS.includes(key)) return 'money'
  if (DATETIME_COLS.includes(key)) return 'datetime'
  if (DATE_COLS.includes(key)) return 'date'
  if (TIME_COLS.includes(key)) return 'time'
  if (ID_KEYS.includes(key)) return 'id'
  if (TAG_KEYS.includes(key)) return 'tag'
  if (ITEMS_KEYS.includes(key)) return 'items'
  if (LONG_KEYS.includes(key)) return 'long'
  return 'text'
}

// sửa chữ hoa sai trong tên cột của API
const LABELS = {
  ...MONEY_LABELS,
  NGày: 'Ngày',
  'GIờ đặt lịch': 'Giờ đặt lịch'
}

const rawCol = key => ({
  key,
  label: LABELS[key] || key,
  type: typeOf(key),
  get: r => r[key]
})

/* Các phần (phương thức...) khác 0 của 1 dòng -> "TM/CK/QT 7.600.000 · Ví 30.000" */
const partsNote = (r, parts, total) => {
  const nz = parts.filter(([k]) => num(r[k]) !== 0)
  if (!nz.length) return ''
  if (nz.length === 1 && Math.abs(num(r[nz[0][0]])) === Math.abs(total))
    return nz[0][1]
  return nz.map(([k, l]) => `${l} ${fmtMoney(r[k])}`).join(' · ')
}

/* Cột gộp: có đủ cột nguồn thì thay các cột đó bằng 1 cột */
const COMPOSITES = [
  {
    key: '__value',
    label: 'Phải thu',
    needs: ['Cần Thanh toán'],
    hides: [
      'Nguyên giá',
      'Tăng / giảm',
      'Tổng tiền',
      'Còn lại',
      'Giảm giá cả đơn',
      'Cần Thanh toán',
      'Voucher'
    ],
    get: r => num(r['Cần Thanh toán']),
    note: r => {
      const goc = num(r['Nguyên giá'])
      const giam = goc - num(r['Cần Thanh toán'])
      const out = []
      if (giam > 0)
        out.push(`Giá gốc ${fmtMoney(goc)} · giảm ${fmtMoney(giam)}`)
      if (!isEmpty(r.Voucher)) out.push(`Voucher ${r.Voucher}`)
      return out.join(' · ')
    }
  },
  {
    key: '__amount',
    label: 'Số tiền',
    needs: ['Tiền mặt', 'Chuyển khoản', 'Quẹt thẻ'],
    any: true,
    hides: ['Tiền mặt', 'Chuyển khoản', 'Quẹt thẻ'],
    get: r => num(r['Tiền mặt']) + num(r['Chuyển khoản']) + num(r['Quẹt thẻ']),
    note: r =>
      partsNote(
        r,
        [
          ['Tiền mặt', 'Tiền mặt'],
          ['Chuyển khoản', 'Chuyển khoản'],
          ['Quẹt thẻ', 'Quẹt thẻ']
        ],
        num(r['Tiền mặt']) + num(r['Chuyển khoản']) + num(r['Quẹt thẻ'])
      )
  }
]

const allEmpty = (rows, col) =>
  rows.every(r => {
    const v = col.get(r)
    return col.type === 'money' ? num(v) === 0 : isEmpty(v)
  })

// cột kỹ thuật kiểu TANG_DH_KET_THUC_NO
const isTechnical = key => /^[A-Z0-9_]+$/.test(key) && key.includes('_')

const ORDER = {
  id: 0,
  datetime: 1,
  date: 1,
  time: 2,
  customer: 3,
  name: 4,
  stack: 5,
  stars: 5,
  staff: 5,
  text: 5,
  tag: 6,
  items: 7,
  long: 8, // nội dung / ghi chú trước, cột tiền sát phải
  money: 9
}
// vài cột đặt theo tên (ngày sinh ngay sau tên khách)
const KEY_ORDER = {
  'Ngày Sinh': 4,
  // đặt lịch: Khách -> Tạo lúc -> Lịch hẹn·Cơ sở -> Dịch vụ·Tại -> Nhân viên -> Trạng thái
  __created: 3.1,
  __booked: 3.2,
  __svc: 3.3,
  'Nhân viên': 3.4,
  'Trạng thái': 3.5,
  // dịch vụ: Khách -> Dịch vụ·Thẻ -> Nhân viên -> Trạng thái -> Đánh giá
  __svcCard: 3.1,
  'Giá buổi': 3.15, // tiền ngay sau dịch vụ (bảng nhiều cột, không bị khuất)
  'Tổng lương': 3.16,
  'Nhân viên thực hiện': 3.4,
  'Đánh giá sao': 3.6,
  'Nội dung đánh giá': 3.7
}

/* Danh sách khách: thêm cột "Cài app" và "Giao dịch" từ các danh sách khác của
   báo cáo khách hàng (Khách tải App, Khách có giao dịch), so khớp theo ID khách.
   app: Set ID khách đã tải app; tx: { buy, svc, both }: Set ID theo loại giao dịch.
   Thiếu dữ liệu (null) -> không thêm cột đó. */
export const enrichCustomers = (rows, { app, tx } = {}) =>
  (rows || []).map(r => {
    const id = r['ID khách']
    const out = { ...r }
    if (app) out['Cài app'] = app.has(id) ? 'Đã cài' : 'Chưa'
    if (tx)
      out['Giao dịch'] = tx.both.has(id)
        ? 'Mua & dùng dịch vụ'
        : tx.buy.has(id)
        ? 'Chỉ mua'
        : tx.svc.has(id)
        ? 'Chỉ dùng dịch vụ'
        : 'Chưa phát sinh'
    return out
  })

// thứ tự trong nhóm cột tiền: phải thu -> từng phương thức thanh toán -> còn nợ
const MONEY_ORDER = [
  '__value',
  '__amount',
  'Tổng Giá bán',
  'Tổng Đã thanh toán ( TM,CK,QT, VI, TT )',
  'TM,CK,QT',
  'Ví',
  'Thẻ Tiền',
  'Khấu trừ trả hàng',
  'Còn nợ'
]
const moneyRank = k => {
  const i = MONEY_ORDER.indexOf(k)
  return i < 0 ? MONEY_ORDER.length : i
}

/* Loại danh sách -> cách hiển thị popup */
export const listKind = rows => {
  const keys = rows && rows.length ? Object.keys(rows[0]) : []
  if (keys.includes('ID Đơn')) return 'orders'
  if (keys.includes('ID SP/DV')) return 'products'
  if (keys.includes('Số tiền thanh toán nợ')) return 'debts'
  if (keys.includes('ID đặt lịch')) return 'bookings'
  if (keys.includes('Dịch vụ gốc')) return 'services'
  if (keys.includes('Tiền mặt') && keys.includes('Nội dung')) return 'cash'
  if (
    NAME_KEYS.some(k => keys.includes(k)) &&
    !keys.some(k => MONEY_COLS.includes(k))
  )
    return 'customers'
  return 'other'
}

// cột dùng để tìm kiếm theo loại danh sách (không có: tìm mọi cột)
export const SEARCH_KEYS = {
  orders: ['ID Đơn', ...NAME_KEYS, ...PHONE_KEYS, 'Chi tiết đơn'],
  products: ['ID SP/DV', 'Tên'],
  debts: ['ID khách', 'ID đơn hàng', ...NAME_KEYS, ...PHONE_KEYS],
  bookings: [...NAME_KEYS, ...PHONE_KEYS]
}

const dt = v => (isEmpty(v) ? '' : moment(v).format('DD-MM-YYYY HH:mm'))

/* Khung 2 giờ của giờ đặt lịch: "08:00 – 10:00" */
export const slotOf = v => {
  if (isEmpty(v)) return '(Không có giờ)'
  const h = Math.floor(moment(v).hours() / 2) * 2
  const p = n => String(n).padStart(2, '0')
  return `${p(h)}:00 – ${p(h + 2)}:00`
}

/* Đặt lịch: gộp cột thành các cột 2 tầng / 1 dòng (type 'stack').
   get -> { main, note, badge, inline } */
const BOOKING_COLS = [
  {
    key: '__created',
    label: 'Tạo lúc',
    hides: ['Ngày tạo đặt lịch', 'Người tạo đặt lịch'],
    get: r => ({
      main: dt(r['Ngày tạo đặt lịch']),
      note: isEmpty(r['Người tạo đặt lịch'])
        ? ''
        : `bởi ${r['Người tạo đặt lịch']}`
    }),
    sortBy: r => moment(r['Ngày tạo đặt lịch']).valueOf() || 0
  },
  {
    key: '__booked',
    label: 'Lịch hẹn · Cơ sở',
    hides: ['GIờ đặt lịch', 'Cơ sở'],
    get: r => ({
      main: dt(r['GIờ đặt lịch']),
      note: isEmpty(r['Cơ sở']) ? '' : String(r['Cơ sở'])
    }),
    sortBy: r => moment(r['GIờ đặt lịch']).valueOf() || 0
  },
  {
    key: '__svc',
    label: 'Dịch vụ · Tại',
    hides: ['Dịch vụ', 'Tại:(nhà/spa)'],
    get: r => ({
      main: isEmpty(r['Dịch vụ']) ? '' : String(r['Dịch vụ']),
      badge: isEmpty(r['Tại:(nhà/spa)']) ? '' : String(r['Tại:(nhà/spa)'])
    }),
    sortBy: r => norm(r['Dịch vụ'])
  }
]

/* Dịch vụ thực hiện: Dịch vụ gốc (đậm) trên, Thẻ (nhỏ, mờ) dưới */
const SERVICE_COLS = [
  {
    key: '__svcCard',
    label: 'Dịch vụ · Thẻ',
    hides: ['Dịch vụ gốc', 'Thẻ'],
    get: r => ({
      main: isEmpty(r['Dịch vụ gốc']) ? '' : String(r['Dịch vụ gốc']),
      note: isEmpty(r['Thẻ']) ? '' : String(r['Thẻ'])
    }),
    sortBy: r => norm(r['Dịch vụ gốc'])
  }
]

// "A,B" -> ['A', 'B'] (1 buổi có thể nhiều nhân viên)
export const splitStaff = v =>
  isEmpty(v)
    ? []
    : String(v)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)

const starLabel = v =>
  isEmpty(v) || !num(v) ? 'Chưa đánh giá' : `${num(v)} sao`

/* rows -> { cols, context, primary }.
   full = true: giữ nguyên mọi cột như API trả về (chế độ "Đủ cột").
   keepCustId: giữ cột ID khách (mặc định gộp vào Khách hàng).
   keepEmpty: giữ cả cột trống.
   contextKeys: chỉ các cột này (khi giống nhau ở mọi dòng) được đưa lên tiêu đề. */
export const prepareTable = (
  rows,
  {
    full = false,
    keepCustId = false,
    keepEmpty = false,
    contextKeys,
    custIdInCell = false,
    hideKeys = [],
    labels = {}
  } = {}
) => {
  const list = rows || []
  const keys = list.length ? Object.keys(list[0]) : []
  if (full) return { cols: keys.map(rawCol), context: [], primary: null }

  const has = k => keys.includes(k)
  let cols = []
  const used = new Set(hideKeys)

  // đặt lịch / dịch vụ: cột gộp 2 tầng / 1 dòng
  const stacks = has('ID đặt lịch')
    ? BOOKING_COLS
    : has('Dịch vụ gốc')
    ? SERVICE_COLS
    : []
  for (const c of stacks) {
    if (!c.hides.some(has)) continue
    c.hides.filter(has).forEach(k => used.add(k))
    cols.push({ ...c, type: 'stack' })
  }

  // cột gộp
  for (const c of COMPOSITES) {
    const ok = c.any ? c.needs.some(has) : c.needs.every(has)
    if (!ok) continue
    c.hides.filter(has).forEach(k => used.add(k))
    cols.push({
      key: c.key,
      label: c.label,
      type: 'money',
      get: c.get,
      note: c.note
    })
  }

  // đã tách theo phương thức (TM/CK/QT, Ví, Thẻ tiền) -> bỏ cột tổng
  if (has('TM,CK,QT')) used.add('Tổng thanh toán')

  // khách hàng = tên + điện thoại (+ ID khách để phân biệt trùng tên)
  const nameKey = NAME_KEYS.find(has)
  if (nameKey) {
    const phoneKey = PHONE_KEYS.find(has)
    ;[nameKey, phoneKey, (!keepCustId || custIdInCell) && 'ID khách']
      .filter(k => k && has(k))
      .forEach(k => used.add(k))
    cols.push({
      key: '__cust',
      label: 'Khách hàng',
      type: 'customer',
      get: r => {
        const raw = String(r[nameKey] ?? '').trim()
        return {
          name: raw.replace(WALKIN, '') || '(Không tên)',
          walkIn: WALKIN.test(raw),
          phone: phoneKey ? r[phoneKey] : '',
          // custIdInCell: ID khách ghi cùng ô (dòng phụ)
          id: custIdInCell ? r['ID khách'] : undefined
        }
      }
    })
  }

  // có Chi tiết đơn: Ghi chú ghi bên dưới các món, không thành cột riêng
  const itemsKey = ITEMS_KEYS.find(has)
  if (itemsKey && has('Ghi chú')) used.add('Ghi chú')

  for (const k of keys) {
    if (used.has(k) || isTechnical(k)) continue
    const c = rawCol(k)
    if (labels[k]) c.label = labels[k]
    if (k === 'Tên') c.type = 'name'
    if (k === itemsKey && has('Ghi chú'))
      c.note = r => (isEmpty(r['Ghi chú']) ? '' : `Ghi chú: ${r['Ghi chú']}`)
    cols.push(c)
  }

  cols = cols.filter(c =>
    c.type === 'customer'
      ? list.some(r => r[nameKey] !== undefined)
      : keepEmpty || !allEmpty(list, c)
  )

  // cột giống nhau ở mọi dòng -> đưa lên tiêu đề (Cơ sở, Ngày)
  const context = []
  if (contextKeys) {
    cols = cols.filter(c => {
      if (!contextKeys.includes(c.key)) return true
      const isDate = c.type === 'date' || c.type === 'datetime'
      const vals = new Set(
        list.map(r => (isDate ? dayOf(r[c.key]) : String(r[c.key] ?? '')))
      )
      if (vals.size !== 1 || vals.has('')) return true
      context.push({ label: c.label, value: [...vals][0] })
      return false
    })
  } else if (list.length > 1) {
    cols = cols.filter(c => {
      if (c.key === 'Cơ sở' || c.type === 'tag') {
        const vals = new Set(list.map(r => r[c.key]))
        if (vals.size === 1) {
          context.push({ label: c.label, value: String(list[0][c.key]) })
          return false
        }
      }
      if (c.type === 'date' || c.type === 'datetime') {
        const days = new Set(list.map(r => dayOf(r[c.key])))
        if (days.size === 1 && !days.has('')) {
          context.push({ label: c.label, value: [...days][0] })
          if (c.type === 'date') return false
          c.sameDay = true // chỉ hiện giờ
        }
      }
      return true
    })
  }

  const rank = c => KEY_ORDER[c.key] ?? ORDER[c.type]
  cols.sort(
    (a, b) =>
      rank(a) - rank(b) ||
      (a.type === 'money' ? moneyRank(a.key) - moneyRank(b.key) : 0)
  )
  const money = cols.filter(c => c.type === 'money')
  const primary =
    PRIMARY.map(k => money.find(c => c.key === k)).find(Boolean) ||
    money[0] ||
    null
  if (primary) primary.primary = true
  return { cols, context, primary }
}

/* Chuỗi để tìm kiếm trong 1 dòng (không dấu) */
// keys: chỉ tìm trong các cột này (nếu dòng có)
export const rowText = (row, keys) => {
  const only = keys && keys.filter(k => k in row)
  return norm(
    Object.entries(row)
      .filter(([k]) => !only || !only.length || only.includes(k))
      .map(([k, v]) => formatCell(k, v))
      .join(' ')
  )
}

export const sumBy = (rows, col) =>
  rows.reduce((a, r) => a + num(col.get(r)), 0)

/* Giá trị để sắp xếp */
export const sortValue = (col, r) => {
  const v = col.get(r)
  if (col.type === 'money') return num(v)
  if (['date', 'datetime', 'time'].includes(col.type))
    return isEmpty(v) ? 0 : moment(v).valueOf()
  if (col.type === 'customer') return norm(v.name)
  if (col.sortBy) return col.sortBy(r)
  if (col.type === 'id' || col.type === 'stars') return num(v)
  return norm(v)
}

/* Tên gọi số dòng theo loại danh sách */
export const countNoun = cols => {
  const k = cols.map(c => c.key)
  if (k.includes('ID Đơn')) return 'Đơn hàng'
  if (k.includes('ID đặt lịch')) return 'Lịch hẹn'
  if (k.includes('__svcCard')) return 'Buổi dịch vụ'
  if (k.includes('__amount')) return 'Phiếu thu chi'
  if (k.includes('ID SP/DV') || k.includes('Tên')) return 'Mặt hàng'
  if (k.includes('__cust') && !cols.some(c => c.type === 'money'))
    return 'Khách hàng'
  return 'Số dòng'
}

/* Các cách gom nhóm dùng được với danh sách này */
export const groupOptions = (rows, cols) => {
  const opts = []
  const add = (id, label, get) => {
    const n = new Set(rows.map(get)).size
    if (n > 1 && n < rows.length) opts.push({ id, label, get })
  }
  for (const c of cols) {
    // đặt lịch: theo khung giờ hẹn (không theo ngày tạo)
    if (c.key === '__booked') {
      if (rows.length > 1)
        opts.push({
          id: 'slot',
          label: 'Khung giờ',
          get: r => slotOf(r['GIờ đặt lịch']),
          byLabel: true
        })
    } else if (c.key === 'Giờ làm') {
      // dịch vụ: theo khung giờ làm
      if (rows.length > 1)
        opts.push({
          id: 'slot',
          label: 'Khung giờ',
          get: r => slotOf(r['Giờ làm']),
          byLabel: true
        })
    } else if (c.key === 'Nhân viên thực hiện') {
      // 1 buổi nhiều nhân viên -> tính cho mỗi người; tiền không chia được -> chỉ đếm buổi
      if (rows.length > 1)
        opts.push({
          id: 'staff',
          label: 'Nhân viên',
          get: r => {
            const s = splitStaff(r[c.key])
            return s.length ? s : ['(Chưa có nhân viên)']
          },
          multi: true,
          noMoney: true
        })
    } else if (c.type === 'stars') {
      if (rows.length > 1)
        opts.push({
          id: 'stars',
          label: 'Đánh giá sao',
          get: r => starLabel(r[c.key]),
          byStars: true
        })
    } else if (c.type === 'customer')
      add('cust', 'Khách hàng', r => {
        const v = c.get(r)
        return v.phone ? `${v.name} · ${v.phone}` : v.name
      })
    else if ((c.type === 'datetime' || c.type === 'date') && !c.sameDay)
      add(`day:${c.key}`, 'Ngày', r => dayOf(c.get(r)) || '(Không có)')
    else if (c.key === 'Cơ sở' || c.type === 'name')
      add(c.key, c.label, r => String(c.get(r) ?? '') || '(Không có)')
    else if (c.type === 'tag' && c.key !== 'Giới tính')
      add(c.key, c.label, r => String(c.get(r) ?? '') || '(Không có)')
  }
  // mỗi nhãn 1 lần (vd. 2 cột ngày)
  return opts.filter((o, i) => opts.findIndex(x => x.label === o.label) === i)
}

/* Gom dòng theo opt: [{ label, count, sums: {key: tổng} }] */
export const groupRows = (rows, opt, moneyCols, primary) => {
  const map = new Map()
  for (const r of rows) {
    // multi: 1 dòng thuộc nhiều nhóm (vd. buổi có 2 nhân viên)
    const labels = opt.multi ? opt.get(r) : [opt.get(r)]
    for (const label of labels) {
      if (!map.has(label)) map.set(label, { label, count: 0, sums: {} })
      const g = map.get(label)
      g.count += 1
      if (opt.noMoney) continue
      for (const c of moneyCols)
        g.sums[c.key] = (g.sums[c.key] || 0) + num(c.get(r))
    }
  }
  const out = [...map.values()]
  if (opt.byLabel) return out.sort((a, b) => a.label.localeCompare(b.label))
  // 5 sao -> 1 sao, "Chưa đánh giá" cuối
  if (opt.byStars)
    return out.sort(
      (a, b) => (parseInt(b.label) || 0) - (parseInt(a.label) || 0)
    )
  if (opt.noMoney) return out.sort((a, b) => b.count - a.count)
  if (opt.id.startsWith('day:'))
    return out.sort(
      (a, b) =>
        moment(a.label, 'DD-MM-YYYY').valueOf() -
        moment(b.label, 'DD-MM-YYYY').valueOf()
    )
  return out.sort((a, b) =>
    primary
      ? Math.abs(b.sums[primary.key]) - Math.abs(a.sums[primary.key]) ||
        b.count - a.count
      : b.count - a.count
  )
}
