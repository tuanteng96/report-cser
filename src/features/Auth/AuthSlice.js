import { createSlice } from '@reduxjs/toolkit'

const FakeInfo = {
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
  CrStockID: 8975
}

const Auth = createSlice({
  name: 'auth',
  initialState: {
    Info: window.top.Info || FakeInfo,
    Token: window?.top?.token || 'adadad'
  },
  reducers: {
    setToken: (state, action) => {
      return {
        ...state,
        Token: action.payload
      }
    }
  },
  extraReducers: {}
})

const { reducer, actions } = Auth
export const { setToken } = actions
export default reducer
