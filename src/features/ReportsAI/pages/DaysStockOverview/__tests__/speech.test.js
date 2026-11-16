import {
  buildSpeechRequest,
  buildSpeechText,
  speechSrc,
  toKeyID
} from '../speech'

const k = (Key, Value) => ({ Key, Value, Count: 0, Qty: 0, ByStock: [] })
const g = (GroupTitle, GroupValue, Keys) => ({ GroupTitle, GroupValue, Keys })

// Số liệu thật ngày 14/11/2026 – Cơ sở Hà Nội (đã gộp)
const DATA = {
  'khach-hang': {
    groups: [
      g('Khách tạo mới', 2, [
        k('Khách tạo từ phần mềm', 2),
        k('Khách đăng ký từ web / app', 0)
      ]),
      g('Khách tải App', 0, [
        k('Khách mới tải app', 0),
        k('Khách cũ tải app', 0)
      ])
    ]
  },
  'ban-hang': {
    groups: [
      g('Đơn hàng mới', 21330000, [
        k('Nguyên giá', 21330000),
        k('Giảm giá', 0),
        k('Thanh toán TM/CK/QT', 9030000),
        k('Thanh toán Ví', -100000),
        k('Thanh toán thẻ tiền', -3000000),
        k('Còn nợ lại', 9200000)
      ]),
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
  },
  'dich-vu': {
    groups: [
      g('Đặt lịch', 2, [
        k('Khách có đến', 0),
        k('Khách không đến', 0),
        k('Khách hủy lịch', 0)
      ]),
      g('Dịch vụ', 2, [k('Đang thực hiện', 0), k('Đã xong', 2)])
    ]
  },
  'thu-chi': { groups: [] },
  'nhan-vien': {
    groups: [
      g('Nhân viên đi làm', 0, [k('Đang làm việc', 0), k('Đã về', 0)]),
      g('Tiền tour / HH / DS', -2567000, [
        k('Tổng Lương tour', 153000),
        k('Tổng Hoa hồng', -2320000)
      ])
    ]
  }
}

describe('Tổng quan cơ sở – đọc báo cáo', () => {
  it('khóa giống bản mẫu (convertViToEnKey)', () => {
    expect(toKeyID('Thanh toán TM/CK/QT*')).toBe('THANH_TOAN_TM_CK_QT_')
    expect(toKeyID('Khách đăng ký từ web / app')).toBe(
      'KHACH_DANG_KY_TU_WEB_APP'
    )
    expect(toKeyID('Tổng Lương tour')).toBe('TONG_LUONG_TOUR')
  })

  it('ghép câu đọc từ số liệu, số âm đọc thành dương, thiếu khóa đọc 0', () => {
    const text = buildSpeechText({
      data: DATA,
      date: new Date(2026, 10, 14),
      stockNames: ['Cơ sở Hà Nội']
    })
    expect(text).toContain(
      'Xin chào, Báo cáo ngày 14 tháng 11 Năm 2026 tại Cơ sở Hà Nội .'
    )
    expect(text).toContain(
      'Có 2 khách được tạo mới trong đó 0 khách đăng ký qua web và app'
    )
    expect(text).toContain('Không có khách hàng tải APP')
    expect(text).toContain(
      'Bán mới Đạt 21330000 đồng, chi phí giảm giá 0 đồng, khách thanh toán thực tế là 9030000 đồng, thanh toán 3100000 đồng đến từ ví và thẻ tiền, còn nợ lại 9200000 đồng'
    )
    expect(text).toContain(
      'Thu nợ cũ đạt 1500000 đồng trong đó gồm 1500000 đồng'
    )
    expect(text).toContain(
      'Doanh thu bán mới theo tỉ lệ gồm 48% dịch vụ, 28% sản phẩm, 23% thẻ tiền.'
    )
    expect(text).toContain('Có 2 đặt lịch, 0 khách đến theo lịch đặt')
    expect(text).toContain('Có 2 dịch vụ đã được thực hiện xong')
    expect(text).toContain(
      'Tổng lương ca dự kiến phải trả 153000, Hoa hồng tư vấn bán sản phẩm, dịch vụ là 2320000.'
    )
    expect(text).not.toMatch(/\[[A-Z_]+\]/)
  })

  it('không chọn cơ sở: đọc "Toàn hệ thống"', () => {
    const text = buildSpeechText({
      data: {},
      date: new Date(2026, 10, 14),
      stockNames: []
    })
    expect(text).toContain('tại Toàn hệ thống .')
    expect(text).toContain('Không phát sinh doanh thu bán mới')
  })

  it('body và nguồn âm thanh cho Google / Zalo', () => {
    const gg = buildSpeechRequest('google', 'abc')
    expect(gg.url).toBe(
      'https://texttospeech.googleapis.com/v1/text:synthesize'
    )
    expect(gg.body.input.text).toBe('abc')
    expect(gg.include).toBe('ENV')
    expect(buildSpeechRequest('zalo', 'abc').body.input).toBe('abc')
    expect(buildSpeechRequest('', 'abc')).toBeNull()
    expect(speechSrc('GOOGLE', { result: { audioContent: 'QQ==' } })).toBe(
      'data:audio/mp3;base64,QQ=='
    )
    expect(
      speechSrc('ZALO', { result: { data: { url: 'https://x/a' } } })
    ).toBe('https://x/a.mp3')
    expect(speechSrc('GOOGLE', {})).toBe('')
  })
})
