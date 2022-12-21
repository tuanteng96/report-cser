import { setStocks } from 'src/features/Auth/AuthSlice'

export default function setupAxios(axios, store) {
  // Request interceptor for API calls
  axios.interceptors.request.use(
    config => {
      console.log(config)
      console.log(store.getState())
      const {
        auth: { Token }
      } = store.getState()

      if (Token) {
        config.headers.Authorization = `Bearer ${Token}`
      }

      store.dispatch(setStocks('adad'))

      return config
    },
    err => Promise.reject(err)
  )

  // Response interceptor for API calls
  axios.interceptors.response.use(
    response => {
      const result = {
        data: response.data,
        status: response.status
      }
      return result
    },
    error => {
      return Promise.reject(error)
    }
  )
}
