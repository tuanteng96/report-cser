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
  },
  getListDebtPayment: data => {
    return http.post(
      `${SubApi}/ban-hang/thanh-toan-tra-no`,
      JSON.stringify(data)
    )
  },
  getOverviewReEx: data => {
    return http.post(
      `${SubApi}/bao-cao-thu-chi/tong-quan`,
      JSON.stringify(data)
    )
  },
  getListReEx: data => {
    return http.post(
      `${SubApi}/bao-cao-thu-chi/danh-sach`,
      JSON.stringify(data)
    )
  },
  getListDebt: data => {
    return http.post(`${SubApi}/cong-no/danh-sach`, JSON.stringify(data))
  },
  getListDebtLock: data => {
    return http.post(`${SubApi}/cong-no/khoa-no`, JSON.stringify(data))
  },
  getListDebtGift: data => {
    return http.post(`${SubApi}/cong-no/tang`, JSON.stringify(data))
  },
  getListStaffSalarySV: data => {
    return http.post(
      `${SubApi}/nhan-vien/luong-ca-dich-vu`,
      JSON.stringify(data)
    )
  },
  getListStaffRose: data => {
    return http.post(`${SubApi}/nhan-vien/hoa-hong`, JSON.stringify(data))
  },
  getListStaffSales: data => {
    return http.post(`${SubApi}/nhan-vien/doanh-so`, JSON.stringify(data))
  },
  getListStaffPayroll: data => {
    return http.post(`${SubApi}/nhan-vien/bang-luong`, JSON.stringify(data))
  },
  getListInventory: data => {
    return http.post(`${SubApi}/ton-kho/danh-sach`, JSON.stringify(data))
  },
  getInventoryAttrition: data => {
    return http.post(`${SubApi}/ton-kho/tieu-hao`, JSON.stringify(data))
  },
  getInventoryWarning: data => {
    return http.post(`${SubApi}/ton-kho/du-kien-nvl`, JSON.stringify(data))
  }
}
export default reportsApi
