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
  },
  getOverviewServices: data => {
    return http.post(`${SubApi}/dich-vu/tong-quan`, JSON.stringify(data))
  },
  getListServices: data => {
    return http.post(`${SubApi}/dich-vu/danh-sach`, JSON.stringify(data))
  },
  getOverviewSell: data => {
    return http.post(
      `${SubApi}/ban-hang/doanh-so-tong-quan`,
      JSON.stringify(data)
    )
  },
  getListSell: data => {
    return http.post(
      `${SubApi}/ban-hang/doanh-so-danh-sach`,
      JSON.stringify(data)
    )
  },
  getListSalesDetail: data => {
    return http.post(
      `${SubApi}/ban-hang/doanh-so-chi-tiet`,
      JSON.stringify(data)
    )
  },
  getListReturns: data => {
    return http.post(`${SubApi}/ban-hang/tra-hang`, JSON.stringify(data))
  }
}
export default reportsApi
