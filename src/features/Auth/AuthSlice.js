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
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBdXRoMlR5cGUiOiJVc2VyRW50IiwiSUQiOiIxIiwiVG9rZW5JZCI6IjEwMjAxMDMwMTAyMDEyNjMiLCJuYmYiOjE2NjE4MzM4MDgsImV4cCI6MTY2MjQzODYwOCwiaWF0IjoxNjYxODMzODA4fQ.vtS2ODk8GaGO_pRBjCRfoOXtENxd5fvcXBPKulbrJcQ'
}

const Auth = createSlice({
  name: 'auth',
  initialState: {
    Info: null,
    Token: null
  },
  reducers: {
    setProfile: (state, { payload }) => {
      return {
        ...state,
        Token: payload.token,
        Info: payload.Info
      }
    }
  },
  extraReducers: {}
})

const { reducer, actions } = Auth
export const { setProfile } = actions
export default reducer
