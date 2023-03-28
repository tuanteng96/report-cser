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
        ID: 8975,
        Title: 'Cser Hà Nội'
      },
      {
        ID: 10053,
        Title: 'Cser Hồ Chí Minh'
      }
    ],
    CrStockID: '',
    rightsSum: {
      report: {
        IsAllStock: false,
        hasRight: true,
        jdata: {
          groups: [
            [
              {
                group: 'Báo cáo ngày',
                items: [
                  {
                    text: 'Tổng quan',
                    checked: true,
                    stocks: '8975',
                    paths: ['/bao-cao-ngay/danh-sach'],
                    url: '/bao-cao-ngay/tong-quan'
                  },
                  {
                    text: 'Khách hàng',
                    checked: true,
                    stocks: '8975',
                    paths: ['/khach-hang/chi-tiet-ngay'],
                    url: '/bao-cao-ngay/khach-hang'
                  }
                ]
              },
              {
                group: 'Báo cáo ngày',
                items: [
                  {
                    text: 'Tổng quan KH',
                    checked: true,
                    stocks: '8975',
                    paths: ['/khach-hang/danh-sach', '/khach-hang/tong-quan'],
                    url: '/khach-hang/tong-quan'
                  }
                ]
              },
              {
                group: 'Dịch vụ',
                items: [
                  {
                    text: 'Tổng quan - Doanh số',
                    checked: true,
                    stocks: '8975',
                    paths: ['/dich-vu/tong-quan', '/dich-vu/danh-sach'],
                    url: '/dich-vu/tong-quan'
                  },
                  {
                    text: 'Báo cáo Nghiệp vụ',
                    checked: true,
                    stocks: '8975',
                    paths: ['/khach-hang/chinh-sua-the'],
                    url: '/dich-vu/bao-cao-nghiep-vu'
                  },
                  {
                    text: 'Dịch vụ sử dụng khác điểm',
                    checked: true,
                    stocks: '8975',
                    paths: ['/dich-vu/dich-vu-kh-khac-diem'],
                    url: '/dich-vu/dv-diem-sd-diem-khac'
                  }
                ]
              },
              {
                group: 'Bán hàng',
                items: [
                  {
                    text: 'Doanh số',
                    checked: true,
                    stocks: '8975',
                    paths: [
                      '/ban-hang/doanh-so-tong-quan',
                      '/ban-hang/doanh-so-danh-sach'
                    ],
                    url: '/ban-hang/doanh-so'
                  },
                  {
                    text: 'Sản phẩm - dịch vụ bán ra',
                    checked: true,
                    stocks: '8975',
                    paths: ['/ban-hang/doanh-so-chi-tiet'],
                    url: '/ban-hang/sp-dv-ban-ra'
                  },
                  {
                    text: 'Trả hàng',
                    checked: true,
                    stocks: '8975',
                    paths: ['/ban-hang/tra-hang'],
                    url: '/ban-hang/tra-hang'
                  },
                  {
                    text: 'Thanh toán trả nợ',
                    checked: true,
                    stocks: '8975',
                    paths: ['/ban-hang/thanh-toan-tra-no'],
                    url: '/ban-hang/thanh-toan-tra-no'
                  },
                  {
                    text: 'Top bán hàng - doanh số',
                    checked: true,
                    stocks: '8975',
                    paths: ['/ban-hang/top-ban-hang-doanh-so'],
                    url: '/ban-hang/top-ban-hang-doanh-so'
                  },
                  {
                    text: 'Doanh số giảm trừ',
                    checked: true,
                    stocks: '8975',
                    paths: ['/ban-hang/doanh-so-giam-tru'],
                    url: '/ban-hang/doanh-so-giam-tru'
                  },
                  {
                    text: 'Bảng giá',
                    checked: true,
                    stocks: '8975',
                    paths: ['/ban-hang/gia-ban-san-pham-dich-vu'],
                    url: '/ban-hang/bang-gia'
                  },
                  {
                    text: 'Lợi nhuận',
                    checked: true,
                    stocks: '8975',
                    paths: ['/loi-nhuan/danh-sach'],
                    url: '/ban-hang/loi-nhuan'
                  },
                  {
                    text: 'Doanh số thực thu',
                    checked: true,
                    stocks: '8975',
                    paths: ['/ban-hang/bao-cao-thuc-thu'],
                    url: '/ban-hang/doanh-so-thuc-thu'
                  }
                ]
              },
              {
                group: 'Thu chi & Sổ quỹ',
                items: [
                  {
                    text: 'Tổng quan TC',
                    checked: true,
                    stocks: '8975',
                    paths: [
                      '/bao-cao-thu-chi/tong-quan',
                      '/bao-cao-thu-chi/danh-sach'
                    ],
                    url: '/thu-chi-va-so-quy'
                  }
                ]
              },
              {
                group: 'Công nợ',
                items: [
                  {
                    text: 'Công nợ',
                    checked: true,
                    stocks: '8975',
                    paths: ['/cong-no/danh-sach'],
                    url: '/cong-no/danh-sach'
                  },
                  {
                    text: 'Báo cáo khóa nợ',
                    checked: true,
                    stocks: '8975',
                    paths: ['/cong-no/khoa-no'],
                    url: '/cong-no/khoa-no'
                  },
                  {
                    text: 'Báo cáo Tặng',
                    checked: true,
                    stocks: '8975',
                    paths: ['/cong-no/tang'],
                    url: '/cong-no/tang'
                  }
                ]
              },
              {
                group: 'Nhân viên',
                items: [
                  {
                    text: 'Lương ca dịch vụ',
                    checked: true,
                    stocks: '8975',
                    paths: ['/nhan-vien/luong-ca-dich-vu'],
                    url: '/nhan-vien/luong-ca-dich-vu'
                  },
                  {
                    text: 'Hoa hồng',
                    checked: true,
                    stocks: '8975',
                    paths: ['/nhan-vien/hoa-hong'],
                    url: '/nhan-vien/hoa-hong'
                  },
                  {
                    text: 'Doanh số',
                    checked: true,
                    stocks: '8975',
                    paths: ['/nhan-vien/doanh-so'],
                    url: '/nhan-vien/doanh-so'
                  },
                  {
                    text: 'Bảng lương',
                    checked: true,
                    stocks: '8975',
                    paths: ['/nhan-vien/bang-luong'],
                    url: '/nhan-vien/bang-luong'
                  }
                ]
              },
              {
                group: 'Tồn kho',
                items: [
                  {
                    text: 'Tồn kho',
                    checked: true,
                    stocks: '8975',
                    paths: ['/ton-kho/danh-sach'],
                    url: '/ton-kho/danh-sach'
                  },
                  {
                    text: 'Tiêu hao',
                    checked: true,
                    stocks: '8975',
                    paths: ['/ton-kho/tieu-hao'],
                    url: '/ton-kho/tieu-hao'
                  },
                  {
                    text: 'Nguyên vật liệu dự kiến',
                    checked: true,
                    stocks: '8975',
                    paths: ['/ton-kho/du-kien-nvl'],
                    url: '/ton-kho/du-kien-nvl'
                  }
                ]
              },
              {
                group: 'Khác',
                items: [
                  {
                    text: 'Báo cáo ví',
                    checked: true,
                    stocks: '8975',
                    paths: ['/khac/tong-tien-vi-khach-hang'],
                    url: '/khac/bao-cao-vi'
                  },
                  {
                    text: 'Báo cáo thẻ tiền',
                    checked: true,
                    stocks: '8975',
                    paths: ['/khac/bao-cao-the-tien'],
                    url: '/khac/bao-cao-the-tien'
                  },
                  {
                    text: 'Báo cáo sử dụng thẻ tiền',
                    checked: true,
                    stocks: '8975',
                    paths: ['/khac/bao-cao-su-dung-the-tien'],
                    url: '/khac/bao-cao-su-dung-the-tien'
                  }
                ]
              }
            ]
          ]
        }
      }
    }
  }
  window.token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBdXRoMlR5cGUiOiJVc2VyRW50IiwiSUQiOiIxIiwiVG9rZW5JZCI6IjEwMjAxMDMwMTAyMDI1ODciLCJuYmYiOjE2Nzk5MDQ4NDUsImV4cCI6MTY4MDUwOTY0NSwiaWF0IjoxNjc5OTA0ODQ1fQ.mxGgieprfhYjGgzWajad4c-mgqagETtlS7MV986JL3g'
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
