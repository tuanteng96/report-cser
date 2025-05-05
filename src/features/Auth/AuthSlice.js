import { createSlice } from '@reduxjs/toolkit'
import { DevHelpers } from 'src/helpers/DevHelpers'

if (DevHelpers.isDevelopment()) {
  window.Info = {
    User: {
      UserName: 'admin',
      ID: 1
    },
    Stocks: [
      {
        ID: 778,
        Title: 'Quản lý cơ sở'
      },
      {
        ID: 11541,
        Title: 'Cser Hà Nội'
      },
      {
        ID: 11542,
        Title: 'Cser HCM'
      }
    ],
    CrStockID: 11541,
    rightsSum: {
      report: {
        IsAllStock: true,
        hasRight: true,
        stocks: [
          {
            ID: 11541,
            Title: 'Tầng 4 - 30 Mai Hắc Đế, Hà Nội'
          },
          {
            ID: 11314,
            Title: 'TA Beauty - Linh Lang'
          }
        ],
        jdata: {
          groups: [
            {
              group: 'Báo cáo ngày',
              items: [
                {
                  text: 'Tổng quan',
                  stocks: '',
                  name: 'bao-cao-ngay-danh-sach',
                  paths: ['/bao-cao-ngay/danh-sach'],
                  url: '/bao-cao-ngay/tong-quan',
                  checked: true
                },
                {
                  paths: ['/khach-hang/chi-tiet-ngay'],
                  text: 'Khách hàng',
                  handler: 'Report1.Program.Main',
                  url: '/bao-cao-ngay/khach-hang',
                  checked: true
                }
              ]
            },
            {
              group: 'Khách hàng',
              items: [
                {
                  paths: ['/khach-hang/danh-sach', '/khach-hang/tong-quan'],
                  text: 'Tổng quan KH',
                  stocks: '',
                  url: '/khach-hang/tong-quan',
                  checked: true
                },
                {
                  paths: ['/khach-hang/tong-hop'],
                  text: 'Tổng hợp KH',
                  stocks: '',
                  url: '/khach-hang/tong-hop',
                  handler: 'Report1.Program.Main',
                  debug: 'Reports.Program.Main',
                  checked: true
                },
                {
                  paths: ['/khach-hang/chi-tieu'],
                  text: 'Chi tiêu',
                  stocks: '',
                  url: '/khach-hang/chi-tieu',
                  handler: 'Report1.Program.Main',
                  debug: 'Reports.Program.Main',
                  checked: true
                },
                {
                  paths: ['/khach-hang/su-dung-dich-vu'],
                  text: 'Sử dụng dịch vụ',
                  url: '/khach-hang/su-dung-dich-vu',
                  handler: 'Reports.Program.Main',
                  debug: 'Report1.Program.Main',
                  checked: true
                },
                {
                  paths: ['/khach-hang/du-kien'],
                  text: 'Dự kiến',
                  url: '/khach-hang/du-kien',
                  handler: 'Reports.Program.Main',
                  debug: 'Report1.Program.Main',
                  checked: true
                },
                {
                  paths: ['/khach-hang/tan-suat-su-dung'],
                  text: 'Tần suất sử dụng',
                  url: '/khach-hang/tan-suat-su-dung',
                  checked: true
                },
                {
                  paths: ['/khach-hang/chuyen-doi'],
                  text: 'Chuyển đổi',
                  handler: 'Report1.Program.Main',
                  url: '/khach-hang/chuyen-doi',
                  checked: true
                }
              ]
            },
            {
              group: 'Dịch vụ',
              items: [
                {
                  paths: ['/dich-vu/tong-quan', '/dich-vu/danh-sach'],
                  text: 'Tổng quan - Doanh số',
                  stocks: '',
                  url: '/dich-vu/tong-quan',
                  checked: true
                },
                {
                  paths: ['/khach-hang/chinh-sua-the'],
                  text: 'Báo cáo Nghiệp vụ',
                  stocks: '',
                  handler: 'Report1.Program.Main',
                  url: '/dich-vu/bao-cao-nghiep-vu',
                  checked: true
                },
                {
                  paths: ['/dich-vu/dich-vu-kh-khac-diem'],
                  text: 'Dịch vụ sử dụng khác điểm',
                  stocks: '',
                  handler: 'Report1.Program.Main',
                  url: '/dich-vu/dv-diem-sd-diem-khac',
                  checked: true
                },
                {
                  paths: ['/dich-vu/su-dung-dich-vu'],
                  text: 'Dịch vụ chưa sử dụng',
                  stocks: '',
                  handler: 'Report1.Program.Main',
                  url: '/dich-vu/su-dung-dich-vu',
                  checked: true
                },
                {
                  paths: ['/dich-vu/ton-dich-vu'],
                  text: 'Tồn Dịch vụ',
                  stocks: '',
                  handler: 'Report1.Program.Main',
                  url: '/dich-vu/ton-dich-vu',
                  checked: true
                },
                {
                  paths: ['/dich-vu/bao-cao-dat-lich'],
                  text: 'Báo cáo đặt lịch',
                  stocks: '',
                  handler: 'Report1.Program.Main',
                  url: '/dich-vu/bao-cao-dat-lich',
                  checked: true
                }
              ]
            },
            {
              group: 'Bán hàng',
              items: [
                {
                  paths: [
                    '/ban-hang/doanh-so-tong-quan',
                    '/ban-hang/doanh-so-danh-sach'
                  ],
                  text: 'Doanh số',
                  stocks: '',
                  url: '/ban-hang/doanh-so',
                  checked: true
                },
                {
                  paths: ['/ban-hang/doanh-so-chi-tiet'],
                  text: 'Sản phẩm - dịch vụ bán ra',
                  url: '/ban-hang/sp-dv-ban-ra',
                  checked: true
                },
                {
                  paths: ['/ban-hang/tra-hang'],
                  text: 'Trả hàng',
                  url: '/ban-hang/tra-hang',
                  checked: true
                },
                {
                  paths: ['/ban-hang/thanh-toan-tra-no'],
                  text: 'Thanh toán trả nợ',
                  url: '/ban-hang/thanh-toan-tra-no',
                  checked: true
                },
                {
                  paths: ['/ban-hang/top-ban-hang-doanh-so'],
                  text: 'Top bán hàng - doanh số',
                  url: '/ban-hang/top-ban-hang-doanh-so',
                  checked: true
                },
                {
                  paths: ['/ban-hang/doanh-so-giam-tru'],
                  text: 'Doanh số giảm trừ',
                  stocks: '',
                  handler: 'Report1.Program.Main',
                  url: '/ban-hang/doanh-so-giam-tru',
                  checked: true
                },
                {
                  paths: ['/ban-hang/gia-ban-san-pham-dich-vu'],
                  text: 'Bảng giá',
                  stocks: '',
                  handler: 'Report1.Program.Main',
                  url: '/ban-hang/bang-gia',
                  checked: true
                },
                {
                  paths: ['/loi-nhuan/danh-sach'],
                  text: 'Lợi nhuận',
                  stocks: '',
                  handler: 'Report1.Program.Main',
                  url: '/ban-hang/loi-nhuan',
                  checked: true
                },
                {
                  paths: ['/ban-hang/bao-cao-thuc-thu'],
                  text: 'Doanh số thực thu',
                  stocks: '',
                  handler: 'Report1.Program.Main',
                  url: '/ban-hang/doanh-so-thuc-thu',
                  checked: true
                }
              ]
            },
            {
              group: 'Thu chi & Sổ quỹ',
              items: [
                {
                  paths: [
                    '/bao-cao-thu-chi/tong-quan',
                    '/bao-cao-thu-chi/danh-sach'
                  ],
                  text: 'Tổng quan TC',
                  stocks: '',
                  handlers: [
                    {
                      path: '/bao-cao-thu-chi/tong-quan',
                      name: 'Report1.Program.Main'
                    },
                    {
                      path: '/bao-cao-thu-chi/danh-sach',
                      name: 'Report1.Program.Main',
                      export: {
                        listAsTablePath: 'Items'
                      }
                    }
                  ],
                  url: '/thu-chi-va-so-quy',
                  checked: true
                },
                {
                  paths: ['/bao-cao-thu-chi/cac-phuong-thuc-thanh-toan'],
                  text: 'Các phương thức thanh toán',
                  stocks: '',
                  handler: 'Report1.Program.Main',
                  url: '/bao-cao-thu-chi/cac-phuong-thuc-thanh-toan',
                  checked: true
                }
              ]
            },
            {
              group: 'Công nợ',
              items: [
                {
                  paths: ['/cong-no/danh-sach'],
                  text: 'Công nợ',
                  stocks: '',
                  handlers: [
                    {
                      path: '/cong-no/danh-sach',
                      name: 'Report1.Program.Main'
                    }
                  ],
                  outRights: '@memberid=',
                  url: '/cong-no/danh-sach',
                  checked: true
                },
                {
                  paths: ['/cong-no/khoa-no'],
                  text: 'Báo cáo khóa nợ',
                  stocks: '',
                  handlers: [
                    {
                      path: '/cong-no/khoa-no',
                      name: 'Report1.Program.Main',
                      export: {}
                    }
                  ],
                  url: '/cong-no/khoa-no',
                  checked: true
                },
                {
                  paths: ['/cong-no/tang'],
                  text: 'Báo cáo Tặng',
                  stocks: '',
                  handlers: [
                    {
                      path: '/cong-no/tang',
                      name: 'Report1.Program.Main'
                    }
                  ],
                  url: '/cong-no/tang',
                  checked: true
                }
              ]
            },
            {
              group: 'Nhân viên',
              items: [
                {
                  paths: ['/nhan-vien/luong-ca-dich-vu'],
                  text: 'Lương ca dịch vụ',
                  stocks: '',
                  handlers: [
                    {
                      path: '/nhan-vien/luong-ca-dich-vu',
                      name: 'Report1.Program.Main'
                    }
                  ],
                  url: '/nhan-vien/luong-ca-dich-vu',
                  checked: true
                },
                {
                  paths: ['/nhan-vien/hoa-hong'],
                  text: 'Hoa hồng',
                  stocks: '',
                  handler: 'Report1.Program.Main',
                  url: '/nhan-vien/hoa-hong',
                  checked: true
                },
                {
                  paths: ['/nhan-vien/doanh-so'],
                  text: 'Doanh số',
                  stocks: '',
                  handler: 'Report1.Program.Main',
                  url: '/nhan-vien/doanh-so',
                  checked: true
                },
                {
                  paths: ['/nhan-vien/bang-luong'],
                  text: 'Bảng lương',
                  stocks: '',
                  handler: 'Report1.Program.Main',
                  url: '/nhan-vien/bang-luong',
                  checked: true
                }
              ]
            },
            {
              group: 'Tồn kho',
              items: [
                {
                  paths: ['/ton-kho/danh-sach'],
                  text: 'Tồn kho',
                  url: '/ton-kho/danh-sach',
                  checked: true
                },
                {
                  paths: ['/ton-kho/tieu-hao'],
                  text: 'Tiêu hao',
                  url: '/ton-kho/tieu-hao',
                  checked: true
                },
                {
                  paths: ['/ton-kho/du-kien-nvl'],
                  text: 'Nguyên vật liệu dự kiến',
                  url: '/ton-kho/du-kien-nvl',
                  checked: true
                }
              ]
            },
            {
              group: 'CSKH',
              items: [
                {
                  paths: ['/khach-hang/su-dung-app'],
                  text: 'Sử dụng App',
                  stocks: '',
                  handler: 'Report1.Program.Main',
                  url: '/cskh/bao-cao-cai-dat-app',
                  checked: true
                }
              ]
            },
            {
              group: 'Khác',
              items: [
                {
                  paths: ['/khac/tong-tien-vi-khach-hang'],
                  text: 'Báo cáo ví',
                  url: '/khac/bao-cao-vi',
                  checked: true
                },
                {
                  paths: ['/khac/bao-cao-the-tien'],
                  text: 'Báo cáo thẻ tiền',
                  url: '/khac/bao-cao-the-tien',
                  checked: true
                },
                {
                  paths: ['/khac/bao-cao-su-dung-the-tien'],
                  text: 'Báo cáo sử dụng thẻ tiền',
                  url: '/khac/bao-cao-su-dung-the-tien',
                  checked: true
                }
              ]
            }
          ]
        }
      }
    }
  }
  window.token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBdXRoMlR5cGUiOiJVc2VyRW50IiwiSUQiOiIxIiwiVG9rZW5JZCI6IjEyMjEzMzEyMjgzOCIsIm5iZiI6MTc0NjAyNTY2NCwiZXhwIjoxODMyNDI1NjY0LCJpYXQiOjE3NDYwMjU2NjR9.tfiWbi8-qStws9qREs-n-ZQ9_NIYwkC7IYKX9Z9vz4c'
}
const Auth = createSlice({
  name: 'auth',
  initialState: {
    Info: null,
    Token: null,
    GlobalConfig: null,
    StocksPermission: []
  },
  reducers: {
    setProfile: (state, { payload }) => {
      return {
        ...state,
        Token: payload.token,
        Info: payload.Info
      }
    },
    setGlobalConfig: (state, { payload }) => {
      return {
        ...state,
        GlobalConfig: payload.GlobalConfig
      }
    }
  },
  extraReducers: {}
})

const { reducer, actions } = Auth
export const { setProfile, setGlobalConfig } = actions
export default reducer
