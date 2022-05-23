import http from './configs/http'

const SubApi = '/api/v3/r23'

const reportsApi = {
  getAllDay: data => {
    return http.post(`${SubApi}/bao-cao-ngay/danh-sach`, JSON.stringify(data))
  },
  getOverviewCustomer: data => {
    return http.post(`${SubApi}/khach-hang/tong-quan`, JSON.stringify(data))
  },
  getListCustomer: data => {
    return http.post(`${SubApi}/khach-hang/danh-sach`, JSON.stringify(data))
  }
}
export default reportsApi
