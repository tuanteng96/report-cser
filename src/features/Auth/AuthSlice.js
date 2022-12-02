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
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBdXRoMlR5cGUiOiJVc2VyRW50IiwiSUQiOiIxIiwiVG9rZW5JZCI6IjEwMjAxMDMwMTAyMDE4NzQiLCJuYmYiOjE2Njk5NjkwMzEsImV4cCI6MTY3MDU3MzgzMSwiaWF0IjoxNjY5OTY5MDMxfQ.gI2O3PiKmsghez4NurXp5DKpyP1kTs6ebYZZU4NgAlU'
}

const Auth = createSlice({
  name: 'auth',
  initialState: {
    Info: null,
    Token: null,
    GlobalConfig: null
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
