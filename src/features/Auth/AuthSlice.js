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
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBdXRoMlR5cGUiOiJVc2VyRW50IiwiSUQiOiIxIiwiVG9rZW5JZCI6IjEwMjAxMDMwMTAyMDE0MzgiLCJuYmYiOjE2NjQ1MDM5NTAsImV4cCI6MTY2NTEwODc1MCwiaWF0IjoxNjY0NTAzOTUwfQ.dPOWW5fo515grwZiLAdH7Wh6GI0QZu8J06HrHE2x-OE'
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
