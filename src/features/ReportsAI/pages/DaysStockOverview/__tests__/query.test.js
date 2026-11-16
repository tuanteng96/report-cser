import {
  buildDailyBody,
  parseDailyGroups,
  parseStocks,
  resolveStockIDs
} from '../query'

// Rút gọn từ kết quả thật của /hang-ngay/tong#ban-hang (14/11/2026)
const RES = {
  result: {
    Type: 'ban-hang',
    Items: [
      {
        From: '14/11/2026',
        Groups: [
          {
            GroupTitle: 'Đơn hàng mới',
            GroupValue: 21330000,
            GroupCount: 3,
            GroupQty: 0,
            Keys: [
              {
                Key: 'Nguyên giá',
                Values: [
                  {
                    StockID: 12746,
                    StockTitle: 'Cơ sở Hà Nội',
                    Value: 20000000
                  },
                  { StockID: 12768, StockTitle: 'Cơ sở HCM', Value: 1330000 }
                ]
              },
              {
                Key: 'Thanh toán Ví',
                Values: [
                  { StockID: 12746, StockTitle: 'Cơ sở Hà Nội', Value: -100000 }
                ]
              }
            ]
          }
        ]
      },
      {
        From: '15/11/2026',
        Groups: [
          {
            GroupTitle: 'Đơn hàng mới',
            GroupValue: 1000000,
            GroupCount: 1,
            Keys: [
              {
                Key: 'Nguyên giá',
                Values: [
                  { StockID: 12746, StockTitle: 'Cơ sở Hà Nội', Value: 1000000 }
                ]
              }
            ]
          }
        ]
      }
    ],
    Stocks: [{ ID: 12746, Title: 'Cơ sở Hà Nội' }]
  }
}

describe('Tổng quan cơ sở – query', () => {
  it('cơ sở: chọn thì gửi cơ sở đã chọn (được xem), trống thì gửi mọi cơ sở được xem', () => {
    expect(resolveStockIDs([12746], [12746, 12768])).toEqual([12746])
    expect(resolveStockIDs([], [12746, 12768, 12746])).toEqual([12746, 12768])
    // chọn cơ sở không được xem -> coi như trống
    expect(resolveStockIDs([999], [12746])).toEqual([12746])
  })

  it('body giống trang mẫu: Type, StockID mảng, ngày DD/MM/YYYY', () => {
    expect(
      buildDailyBody(
        'khach-hang',
        { Date: new Date(2026, 10, 14), StockIDs: [] },
        [12746, 12768]
      )
    ).toEqual({
      Type: 'khach-hang',
      StockID: [12746, 12768],
      DateStart: '14/11/2026',
      DateEnd: '14/11/2026'
    })
  })

  it('gộp nhiều Items và nhiều cơ sở, giữ chi tiết theo cơ sở', () => {
    const [g] = parseDailyGroups(RES)
    expect(g.GroupTitle).toBe('Đơn hàng mới')
    expect(g.GroupValue).toBe(22330000)
    expect(g.GroupCount).toBe(4)
    expect(g.Keys.map(k => k.Key)).toEqual(['Nguyên giá', 'Thanh toán Ví'])
    const goc = g.Keys[0]
    expect(goc.Value).toBe(22330000)
    expect(goc.ByStock).toEqual([
      {
        StockID: 12746,
        StockTitle: 'Cơ sở Hà Nội',
        Value: 21000000,
        Count: 0,
        Qty: 0
      },
      {
        StockID: 12768,
        StockTitle: 'Cơ sở HCM',
        Value: 1330000,
        Count: 0,
        Qty: 0
      }
    ])
    expect(g.Keys[1].Value).toBe(-100000)
    expect(parseStocks(RES)).toEqual([{ ID: 12746, Title: 'Cơ sở Hà Nội' }])
  })

  it('không có dữ liệu: trả mảng rỗng, không lỗi', () => {
    expect(parseDailyGroups({ result: { Items: [] } })).toEqual([])
    expect(parseDailyGroups(null)).toEqual([])
  })
})
