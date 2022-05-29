import { createSlice } from '@reduxjs/toolkit'

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
  CrStockID: 8975
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
