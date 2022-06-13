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
  getAllMember: key => {
    return http.get(`/api/gl/select2?cmd=member&q=${key}`)
  },
  getAllServicePP: key => {
    return http.get(
      `/api/gl/select2?cmd=prod&combo=0&fee=0&ignore_all=1&srv=1&q=${key}`
    )
  }
}
export default moreApi
