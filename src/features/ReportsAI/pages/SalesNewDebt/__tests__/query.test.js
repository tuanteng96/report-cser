import {
  buildSalesPaymentParams,
  parseSalesPayment,
  resolveStockIDs
} from '../query'

const base = {
  StockIDs: [],
  DateStart: new Date(2026, 10, 10),
  DateEnd: new Date(2026, 10, 14),
  PayType: 'MOI,NO',
  Pi: 1,
  Ps: 15
}
const visible = [11, 22, 33]

describe('resolveStockIDs', () => {
  it('có chọn cơ sở: gửi các cơ sở đã chọn', () => {
    expect(resolveStockIDs([22, 33], visible)).toBe('22,33')
    expect(resolveStockIDs(['22'], visible)).toBe('22')
  })

  it('để trống: gửi tất cả cơ sở đang hiển thị', () => {
    expect(resolveStockIDs([], visible)).toBe('11,22,33')
    expect(resolveStockIDs(undefined, visible)).toBe('11,22,33')
    expect(resolveStockIDs('', visible)).toBe('11,22,33')
  })

  it('bỏ id không hợp lệ và trùng lặp', () => {
    expect(resolveStockIDs([22, 22, '', 0, 'x', "1'--"], visible)).toBe('22')
    expect(resolveStockIDs(['', 0], [11, 11, 'abc'])).toBe('11')
  })
})

describe('buildSalesPaymentParams', () => {
  it('tạo đúng object JSON, ngày a - b -> From = a, To = b', () => {
    expect(buildSalesPaymentParams(base, visible)).toEqual({
      StockIDs: '11,22,33',
      From: '2026-11-10',
      To: '2026-11-14',
      PayType: 'MOI,NO',
      PageIndex: 1,
      PageSize: 15
    })
  })

  it('JSON gửi lên', () => {
    const json = JSON.stringify(
      buildSalesPaymentParams({ ...base, StockIDs: [11, 33] }, visible)
    )
    expect(json).toBe(
      '{"StockIDs":"11,33","From":"2026-11-10","To":"2026-11-14","PayType":"MOI,NO","PageIndex":1,"PageSize":15}'
    )
  })

  it('một ngày: From = To = ngày đó', () => {
    const d = new Date(2026, 10, 30)
    const p = buildSalesPaymentParams({ ...base, DateStart: d, DateEnd: d })
    expect(p.From).toBe('2026-11-30')
    expect(p.To).toBe('2026-11-30')
  })

  it('loại bỏ giá trị lạ', () => {
    const p = buildSalesPaymentParams(
      {
        ...base,
        StockIDs: ["1'; DROP TABLE x;--"],
        PayType: "MOI'; DELETE--,no,khau_tru,ABC",
        Pi: '2; DROP',
        Ps: 'abc'
      },
      visible
    )
    expect(p.StockIDs).toBe('11,22,33')
    expect(p.PayType).toBe('NO,KHAU_TRU')
    expect(p.PageIndex).toBe(2)
    expect(p.PageSize).toBe(15)
  })
})

describe('parseSalesPayment', () => {
  it('tách dòng tổng hợp và danh sách', () => {
    const res = {
      data: [
        [{ TotalRows: 12, TotalPages: 2.4, Moi_TienMat: 100 }],
        [{ ID: 1 }, { ID: 2 }]
      ]
    }
    const r = parseSalesPayment(res)
    expect(r.total).toBe(12)
    expect(r.pageCount).toBe(3)
    expect(r.items).toHaveLength(2)
    expect(r.summary.Moi_TienMat).toBe(100)
  })

  it('phản hồi rỗng (như khi không có dữ liệu)', () => {
    const r = parseSalesPayment({
      data: [[{ TotalRows: 0, TotalPages: 0.0 }], []]
    })
    expect(r).toEqual({
      items: [],
      summary: { TotalRows: 0, TotalPages: 0 },
      total: 0,
      pageCount: 0
    })
  })
})
