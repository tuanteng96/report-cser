// Định dạng & tính toán hiển thị — giữ đúng logic của BaoCaoThanhToan.html

export const TYPE_LABEL = { MOI: 'Mới', NO: 'Thu nợ', KHAU_TRU: 'Khấu trừ' }

export const money = n => Number(n || 0).toLocaleString('vi-VN')
export const cell = n => (n ? Number(n).toLocaleString('vi-VN') : '–')
export const qty = n =>
  Number(n || 0).toLocaleString('vi-VN', { maximumFractionDigits: 2 })

// 'yyyy-mm-dd...' -> 'dd/mm/yyyy'
export const vnDate = s => {
  if (!s) return '–'
  const [y, m, d] = String(s).slice(0, 10).split('-')
  return d && m && y ? `${d}/${m}/${y}` : String(s)
}

/* Số điện thoại: bù số 0 đầu cho đủ 10 số (45945 -> 0000045945);
   chỉ hiện nếu không bắt đầu bằng "0000" (SĐT ảo của khách vãng lai) */
export const normPhone = p => {
  const s = String(p ?? '').trim()
  return /^\d+$/.test(s) && s.length < 10 ? s.padStart(10, '0') : s
}
export const showPhone = p => {
  const s = normPhone(p)
  return !!s && !s.startsWith('0000')
}

export const customerText = r =>
  [r.SenderName, showPhone(r.SenderPhone) ? normPhone(r.SenderPhone) : null]
    .filter(Boolean)
    .join(' - ') || '–'

/* Chi tiết đơn – cột ChiTietJSON: [{id, pcode, name, qty, tp}]
   Mới / Khấu trừ: toàn bộ thành phần; Nợ: chỉ thành phần được trả nợ */
export const orderItems = r => {
  try {
    const list = JSON.parse(r?.ChiTietJSON || '[]')
    return Array.isArray(list) ? list : []
  } catch (e) {
    return []
  }
}

// Khấu trừ: tổng + nhãn các loại có giá trị
export const ktOf = r => {
  const parts = [
    ['Kết thúc thẻ', r.KetThucThe],
    ['Trả hàng', r.TraHang],
    ['Đơn tặng', r.Tang],
    ['Khóa nợ', r.KhoaNo],
    ['Khác', r.Khac]
  ].filter(([, v]) => v)
  return {
    value: parts.reduce((a, [, v]) => a + Number(v || 0), 0),
    label: parts.map(([l]) => l).join(', ')
  }
}

/* Giá trị mã giảm giá: VoucherDiscount (%) | VoucherFix (đ) | VoucherSamePrice (đồng giá) */
export const voucherValue = r => {
  const p = []
  if (r.VoucherDiscount)
    p.push(`${Number(r.VoucherDiscount).toLocaleString('vi-VN')}%`)
  if (r.VoucherFix) p.push(money(r.VoucherFix))
  if (r.VoucherSamePrice) p.push(`Đồng giá ${money(r.VoucherSamePrice)}`)
  return p.length ? p.join(' + ') : '–'
}

/* Giảm giá cả đơn: CustomeDiscount <= 100 -> %, > 100 -> đồng */
export const orderDiscount = r => {
  const v = Number(r.CustomeDiscount || 0)
  return !v ? '–' : v <= 100 ? `${v.toLocaleString('vi-VN')}%` : money(v)
}

const n = v => Number(v || 0)
export const sumCash = r => n(r.TienMat) + n(r.ChuyenKhoan) + n(r.QuetThe)
export const sumMoneyCard = r => n(r.Vi) + n(r.TheTien)

export const rowKey = r =>
  `${r.OrderID}|${r.PayDay}|${r.PayCode}|${r.PayStockID}`
