import moment from 'moment'

/* Đọc báo cáo bằng giọng nói — chuyển từ TextToSpeech() của trang mẫu (cser-report-preview).
   Dữ liệu vào: kết quả 5 khối đã gộp (parseDailyGroups). */

// "Thanh toán TM/CK/QT*" -> "THANH_TOAN_TM_CK_QT_" (giống formatString.convertViToEnKey của bản mẫu)
export const toKeyID = str => {
  let s = String(str || '').toLowerCase()
  s = s.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
  s = s.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
  s = s.replace(/ì|í|ị|ỉ|ĩ/g, 'i')
  s = s.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
  s = s.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
  s = s.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
  s = s.replace(/đ/g, 'd')
  s = s.replace(/̀|́|̃|̉|̣/g, '')
  s = s.replace(/ˆ|̆|̛/g, '')
  s = s.replace(/\W+/g, ' ')
  s = s.replace(/\s/g, '_')
  return s.toUpperCase()
}

// Thứ tự tìm khóa giống Store của bản mẫu: Customers, Incomes, Sells, Services, Members
const ORDER = ['khach-hang', 'thu-chi', 'ban-hang', 'dich-vu', 'nhan-vien']

/* Bảng giá trị theo KeyID: nhóm -> GroupValue, chỉ số -> Value. Gặp trước thì giữ. */
export const buildValueMap = data => {
  const map = {}
  for (const type of ORDER) {
    for (const g of data?.[type]?.groups || []) {
      const gk = toKeyID(g.GroupTitle)
      if (!(gk in map)) map[gk] = g.GroupValue || 0
      for (const k of g.Keys || []) {
        const kk = toKeyID(k.Key)
        if (!(kk in map)) map[kk] = k.Value || 0
      }
    }
  }
  return map
}

const abs = n => Math.abs(Number(n) || 0)

export const buildSpeechText = ({ data, date, stockNames }) => {
  const map = buildValueMap(data)
  const val = key => abs(map[key])
  // cộng giá trị gốc rồi lấy trị tuyệt đối (giống SumKey)
  const sum = keys => abs(keys.reduce((a, k) => a + (Number(map[k]) || 0), 0))

  let text =
    'Xin chào, Báo cáo ' +
    moment(date).format('[ngày] DD [tháng] MM [Năm] YYYY') +
    ' tại ' +
    (stockNames && stockNames.length
      ? stockNames.join(', ')
      : 'Toàn hệ thống') +
    ' .'

  text += `Về khách hàng. ${
    sum(['KHACH_TAO_MOI']) > 0
      ? 'Có [KHACH_TAO_MOI] khách được tạo mới trong đó [KHACH_DANG_KY_TU_WEB_APP] khách đăng ký qua web và app'
      : 'Không có khách hàng được tạo mới'
  }. ${
    sum(['KHACH_TAI_APP']) > 0
      ? '[KHACH_TAI_APP] khách tải app gồm [KHACH_CU_TAI_APP] khách cũ và [KHACH_MOI_TAI_APP] khách mới'
      : 'Không có khách hàng tải APP'
  }. `

  text += `Về doanh thu. ${
    sum(['DON_HANG_MOI']) > 0
      ? `Bán mới Đạt [DON_HANG_MOI] đồng, chi phí giảm giá [GIAM_GIA] đồng, khách thanh toán thực tế là [THANH_TOAN_TM_CK_QT] đồng, thanh toán ${sum(
          ['THANH_TOAN_VI', 'THANH_TOAN_THE_TIEN']
        )} đồng đến từ ví và thẻ tiền, còn nợ lại [CON_NO_LAI] đồng`
      : 'Không phát sinh doanh thu bán mới'
  }. ${
    sum(['THU_NO']) > 0
      ? 'Thu nợ cũ đạt [THU_NO] đồng trong đó gồm [THANH_TOAN_TM_CK_QT_] đồng, [THANH_TOAN_VI_] đồng từ ví và [THANH_TOAN_THE_TIEN_] đồng từ thẻ tiền.'
      : 'Không phát sinh thu nợ.'
  } `

  // Tỉ lệ doanh thu bán mới: lấy từ nhóm "Chi tiết bán hàng" (bản mẫu lấy từ biểu đồ)
  const sp = abs(map[toKeyID('Sản phẩm / NVL')])
  const dv = abs(map[toKeyID('Dịch vụ / Phụ phí')])
  const tt = abs(map[toKeyID('Thẻ tiền')])
  const total = sp + dv + tt
  if (total > 0) {
    const pct = v => Math.round((v / total) * 100)
    text += `Doanh thu bán mới theo tỉ lệ gồm ${pct(dv)}% dịch vụ, ${pct(
      sp
    )}% sản phẩm, ${pct(tt)}% thẻ tiền. `
  }

  text += `Về đặt lịch & dịch vụ. ${
    sum(['DAT_LICH']) > 0
      ? 'Có [DAT_LICH] đặt lịch, [KHACH_CO_DEN] khách đến theo lịch đặt, số khách đặt lịch không đến là [KHACH_KHONG_DEN], Hủy lịch [KHACH_HUY_LICH]'
      : 'Không có đặt lịch mới'
  }. Có [DA_XONG] dịch vụ đã được thực hiện xong, [DANG_THUC_HIEN] dịch vụ đang thực hiện. `

  text +=
    'Có [NHAN_VIEN_DI_LAM] nhân viên đi làm, đã về [DA_VE], còn lại [DANG_LAM_VIEC] người. Tổng lương ca dự kiến phải trả [TONG_LUONG_TOUR], Hoa hồng tư vấn bán sản phẩm, dịch vụ là [TONG_HOA_HONG].'

  // thay [KHOA] bằng số (không có thì 0)
  return text.replace(/\[([^\][]*)]/g, (_, key) => String(val(key)))
}

/* Body gọi UrlAction@invoke — y như bản mẫu */
export const buildSpeechRequest = (provider, text) => {
  const p = String(provider || '').toUpperCase()
  if (p === 'GOOGLE') {
    return {
      url: 'https://texttospeech.googleapis.com/v1/text:synthesize',
      headers: {},
      param: { key: '{KEY_API_TEXT_TO_SPEECH}' },
      method: 'POST',
      include: 'ENV',
      body: {
        audioConfig: {
          audioEncoding: 'LINEAR16',
          effectsProfileId: ['small-bluetooth-speaker-class-device'],
          pitch: 0,
          speakingRate: 1
        },
        input: { text },
        voice: { languageCode: 'vi-VN', name: 'vi-VN-Wavenet-D' }
      },
      resultType: 'json'
    }
  }
  if (p === 'ZALO') {
    return {
      url: 'https://api.zalo.ai/v1/tts/synthesize',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        apikey: '[KEY_API_TEXT_TO_SPEECH_ZALO]'
      },
      method: 'POST',
      include: 'ENV',
      body: { speaker_id: '4', speed: '1', input: text },
      resultType: 'json'
    }
  }
  return null
}

/* Lấy nguồn âm thanh từ kết quả */
export const speechSrc = (provider, data) => {
  const p = String(provider || '').toUpperCase()
  if (p === 'GOOGLE' && data?.result?.audioContent)
    return 'data:audio/mp3;base64,' + data.result.audioContent
  if (p === 'ZALO' && data?.result?.data?.url)
    return data.result.data.url + '.mp3'
  return ''
}
