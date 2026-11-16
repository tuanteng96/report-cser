import moment from 'moment'

// Loại thanh toán API hỗ trợ: MOI = bán mới, NO = thanh toán nợ, KHAU_TRU = khấu trừ
const PAY_TYPES = ['MOI', 'NO', 'KHAU_TRU']

// Chuẩn hoá giá trị trước khi gửi: server dùng các tham số này để truy vấn SQL.
const uniq = arr => arr.filter((x, i) => arr.indexOf(x) === i)

// Nhận mảng [1, 2] hoặc chuỗi '1,2' -> mảng id hợp lệ (số nguyên dương, không trùng)
const toIdList = ids =>
  uniq(
    (Array.isArray(ids) ? ids : String(ids ?? '').split(','))
      .map(x => String(x ?? '').trim())
      .filter(x => /^\d+$/.test(x) && Number(x) > 0)
  )

/**
 * Cơ sở gửi lên: các cơ sở đã chọn; để trống = tất cả cơ sở đang hiển thị trong bộ lọc.
 * Danh sách hiển thị đã lọc theo quyền nên không bao giờ gửi '' (tức "mọi cơ sở" phía server).
 */
export const resolveStockIDs = (selected, visible) => {
  const picked = toIdList(selected)
  return (picked.length ? picked : toIdList(visible)).join(',')
}

// Nhận mảng ['MOI', 'NO'] hoặc chuỗi 'MOI,NO'; '' = tất cả loại
const toPayType = PayType =>
  uniq(
    (Array.isArray(PayType) ? PayType : String(PayType ?? '').split(','))
      .map(x =>
        String(x ?? '')
          .trim()
          .toUpperCase()
      )
      .filter(x => PAY_TYPES.includes(x))
  ).join(',')

const toInt = (n, fallback) => {
  const v = parseInt(n, 10)
  return Number.isFinite(v) && v > 0 ? v : fallback
}

/**
 * Tạo body JSON cho /api/v6/dQuery@BaoCaoThanhToanDonHang từ bộ lọc.
 * Ngày a - b -> From = a, To = b (phía SQL tính To đến 23:59 của ngày b).
 * @param visibleStockIds id các cơ sở đang hiển thị, dùng khi không chọn cơ sở nào
 */
export const buildSalesPaymentParams = (
  { StockIDs, DateStart, DateEnd, PayType, Pi, Ps },
  visibleStockIds = []
) => {
  const from = moment(DateStart || new Date()).format('YYYY-MM-DD')
  const to = moment(DateEnd || DateStart || new Date()).format('YYYY-MM-DD')

  return {
    StockIDs: resolveStockIDs(StockIDs, visibleStockIds),
    From: from,
    To: to,
    PayType: toPayType(PayType),
    PageIndex: toInt(Pi, 1),
    PageSize: toInt(Ps, 15)
  }
}

/**
 * Tách phản hồi: data[0][0] = dòng tổng hợp, data[1] = danh sách của trang hiện tại.
 */
export const parseSalesPayment = res => {
  const summary = res?.data?.[0]?.[0] || {}
  const items = res?.data?.[1] || []
  return {
    items,
    summary,
    total: summary.TotalRows || 0,
    pageCount: Math.ceil(summary.TotalPages || 0)
  }
}
