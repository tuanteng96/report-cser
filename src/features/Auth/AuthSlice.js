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
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBdXRoMlR5cGUiOiJVc2VyRW50IiwiSUQiOiIxIiwiVG9rZW5JZCI6IjEwMzExNDEwNTA2NCIsIm5iZiI6MTY5ODg4Nzg0NywiZXhwIjoxNzg1Mjg3ODQ3LCJpYXQiOjE2OTg4ODc4NDd9.z8z8VCaiYt85anOLETd13G_afsg2vlBGodcBNbv13kM'
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
