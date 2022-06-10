import http from './configs/http'

const SubApi = '/api/v3/r23'

const moreApi = {
  getAllProvinces: data => {
    return http.post(`${SubApi}/more/tinh-thanh`, JSON.stringify(data))
  },
  getAllDistricts: data => {
    return http.post(`${SubApi}/more/quan-huyen`, JSON.stringify(data))
  },
  getAllGroupCustomer: data => {
    return http.post(`${SubApi}/more/nhom-khach-hang`, JSON.stringify(data))
  },
  getAllSource: data => {
    return http.post(`${SubApi}/more/nguon-khach-hang`, JSON.stringify(data))
  },
  getAllStaff: data => {
    return http.post(`${SubApi}/more/danh-sach-nhan-vien`, JSON.stringify(data))
  },
  getAllMember: data => {
    return http.post(
      `${SubApi}/more/danh-sach-khach-hang`,
      JSON.stringify(data)
    )
  }
}
export default moreApi
