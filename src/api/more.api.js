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
  getAllStaffStock: key => {
    return http.get(`/api/gl/select2?cmd=user&q=${key}`)
  },
  getAllMember: key => {
    return http.get(`/api/gl/select2?cmd=member&q=${key}`)
  },
  getAllCategories: key => {
    return http.get(
      `/api/gl/select2?cmd=cate&app=type&ignore_root=1&roots=794,795&q=${key}`
    )
  },
  getAllCategoriesSV: key => {
    return http.get(
      `/api/gl/select2?cmd=cate&app=type&ignore_root=1&roots=795&q=${key}`
    )
  },
  getAllCategoriesFull: key => {
    return http.get(
      `/api/gl/select2?cmd=cate&app=type&ignore_root=1&roots=794,795,890,3298,10106&q=${key}`
    )
  },
  getAllBrands: key => {
    return http.get(
      `/api/gl/select2?cmd=cate&app=manu&ignore_root=1&ignore_pid0=1&roots=4&q=${key}`
    )
  },
  getAllService: key => {
    return http.get(`/api/gl/select2?cmd=prod&ignore_all=1&srv=1&q=${key}`)
  },
  getAllServicePP: key => {
    return http.get(
      `/api/gl/select2?cmd=prod&combo=0&fee=0&ignore_all=1&srv=1&q=${key}`
    )
  },
  getAllServiceCard: key => {
    return http.get(
      `/api/gl/select2?cmd=prod&fee=0&ignore_all=1&srv=1&q&no_root=1&q=${key}`
    )
  },
  getAllCardMoney: key => {
    return http.get(
      `/api/gl/select2?cmd=prod&cate_name=the_tien&ignore_all=1&q=${key}`
    )
  },
  getAllProducts: key => {
    return http.get(`/api/gl/select2?cmd=prod&no_root=1&ignore_all=1&q=${key}`)
  },
  getAllProduct: key => {
    return http.get(
      `/api/gl/select2?cmd=prod&cate_name=san_pham&ignore_all=1&q=${key}`
    )
  },
  getAllProductNVL: data => {
    return http.post(`${SubApi}/more/danh-sach-sp-nvl`, JSON.stringify(data))
  },
  getNameConfig: name =>
    http.get(`/api/v3/config?cmd=getnames&names=${name}&ignore_root=1`)
}
export default moreApi
