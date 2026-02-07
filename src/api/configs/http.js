import axios from 'axios'
import queryString from 'query-string'
import { DevHelpers } from 'src/helpers/DevHelpers'

let http = axios.create({
  withCredentials: true,
  baseURL: DevHelpers.isDevelopment()
    ? process.env.REACT_APP_API_URL
    : window.API || '',
  headers: {
    'content-type': 'text/plain'
  },
  paramsSerializer: params => queryString.stringify(params)
})

if (!window.isApp) {
  if (typeof window?.top?.rp28 !== 'undefined' && window?.top?.rp28?.enabled) {
    // Keep axios instance so interceptors continue to work
    http.get = url => window?.top?.rp28?.createGet(url)
    http.post = (url, data) => window?.top?.rp28?.createPost(url, data)
  }
}

export default http
