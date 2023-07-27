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
    CrStockID: 8975,
    rightsSum: {
      report: {
        IsAllStock: true,
        hasRight: true,
        stocks: [
          {
            ID: 8975,
            Title: 'Cser Hà Nội'
          },
          { ID: 10053, Title: 'Cser Hồ Chí Minh' },
          { ID: 11210, Title: 'Cser Tuyên Quang' }
        ],
        jdata: {
          groups: [
            [
              {
                group: 'Dịch vụ',
                items: [
                  {
                    text: 'Báo cáo đặt lịch',
                    checked: true,
                    stocks: '8975',
                    paths: ['/bao-cao-ngay/danh-sach'],
                    url: '/dich-vu/bao-cao-dat-lich'
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
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBdXRoMlR5cGUiOiJVc2VyRW50IiwiSUQiOiIxIiwiVG9rZW5JZCI6IjEwMzExNDEwMzk0MyIsIm5iZiI6MTY5MDQ0NTc4NiwiZXhwIjoxNjkxMDUwNTg2LCJpYXQiOjE2OTA0NDU3ODZ9.SdesP26mRsB32ztbKbP0tIX_W4LSWj4l-LP5tkMJZDQ'
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
