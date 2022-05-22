import { createSlice } from '@reduxjs/toolkit'

const Layout = createSlice({
  name: 'layout',
  initialState: {
    aside: {
      isShowMobile: false
    }
  },
  reducers: {
    ToggleAside: (state, action) => {
      return {
        ...state,
        aside: {
          isShowMobile: action.payload
        }
      }
    }
  }
})

const { reducer, actions } = Layout
export const { ToggleAside } = actions
export default reducer
