import { combineReducers } from 'redux'
import authReducer from '../features/Auth/AuthSlice'
import layoutReducer from '../layout/LayoutSlice'

export const rootReducer = combineReducers({
  auth: authReducer,
  layout: layoutReducer
})
