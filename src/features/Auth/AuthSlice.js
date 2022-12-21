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
    CrStockID: ''
  }
  window.token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBdXRoMlR5cGUiOiJVc2VyRW50IiwiSUQiOiIxIiwiVG9rZW5JZCI6IjEwMjAxMDMwMTAyMDIwODAiLCJuYmYiOjE2NzE2MTQyNzQsImV4cCI6MTY3MjIxOTA3NCwiaWF0IjoxNjcxNjE0Mjc0fQ.x2G65Ah5GTGyVhmpJYemkICaw6-Y6RyM4nzNmoFlv8A'
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
    },
    setStocks: (state, { payload }) => {
      console.log(payload)
      return {
        ...state
      }
    }
  },
  extraReducers: {}
})

const { reducer, actions } = Auth
export const { setProfile, setGlobalConfig, setStocks } = actions
export default reducer
