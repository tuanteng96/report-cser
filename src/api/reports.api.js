import http from './configs/http'

const SubApi = '/api/v3/r23'

const reportsApi = {
  getAllDay: data => {
    return http.post(`${SubApi}/bao-cao-ngay/danh-sach`, JSON.stringify(data))
  },
  getMemberDay: data => {
    return http.post(`${SubApi}/khach-hang/chi-tiet-ngay`, JSON.stringify(data))
  },
  getOverviewCustomer: data => {
    return http.post(`${SubApi}/khach-hang/tong-quan`, JSON.stringify(data))
  },
  getListCustomer: data => {
    return http.post(`${SubApi}/khach-hang/danh-sach`, JSON.stringify(data))
  },
  getListCustomerGeneral: data => {
    return http.post(`${SubApi}/khach-hang/tong-hop`, JSON.stringify(data))
  },
  getListCustomerLevelUp: data => {
    return http.post(`/api/v3/r23/khach-hang/len-cap`, JSON.stringify(data))
  },
  getListCustomerConvert: data => {
    return http.post(`${SubApi}/khach-hang/chuyen-doi`, JSON.stringify(data))
  },
  getListCustomerExpense: data => {
    return http.post(`${SubApi}/khach-hang/chi-tieu`, JSON.stringify(data))
  },
  getListCustomerExpected: data => {
    return http.post(`${SubApi}/khach-hang/du-kien`, JSON.stringify(data))
  },
  getListCustomerUseService: data => {
    return http.post(
      `${SubApi}/khach-hang/su-dung-dich-vu`,
      JSON.stringify(data)
    )
  },
  getListCustomerFrequencyUse: data => {
    return http.post(
      `${SubApi}/khach-hang/tan-suat-su-dung`,
      JSON.stringify(data)
    )
  },
  getListOddService: data => {
    return http.post(`${SubApi}/khach-hang/chinh-sua-the`, JSON.stringify(data))
  },
  getListSaleReduced: data => {
    return http.post(
      `${SubApi}/ban-hang/doanh-so-giam-tru`,
      JSON.stringify(data)
    )
  },
  getListSale2: data => {
    return http.post(`/api/v3/MemberGroup27@Get`, JSON.stringify(data))
  },
  getOverviewServices: data => {
    return http.post(`${SubApi}/dich-vu/tong-quan`, JSON.stringify(data))
  },
  getListServices: data => {
    return http.post(`${SubApi}/dich-vu/danh-sach`, JSON.stringify(data))
  },
  getListServicesAndPayed: data => {
    return http.post(`/api/v3/user24@ServiceAndPayed`, JSON.stringify(data))
  },
  getListUsedElsewhere: data => {
    return http.post(
      `${SubApi}/dich-vu/dich-vu-kh-khac-diem`,
      JSON.stringify(data)
    )
  },
  getInventoryService: data => {
    return http.post(`${SubApi}/dich-vu/ton-dich-vu`, JSON.stringify(data))
  },
  getBookService: data => {
    return http.post(`${SubApi}/dich-vu/bao-cao-dat-lich`, JSON.stringify(data))
  },
  getListOllCardService: data => {
    return http.post(
      `${SubApi}/khac/chi-tiet-vi-khach-hang`,
      JSON.stringify(data)
    )
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
  getListSalesOnStock: data => {
    return http.post(`/api/v4/r27@OrderQtyByStock`, JSON.stringify(data))
  },
  getListTopSalesDetail: data => {
    return http.post(
      `${SubApi}/ban-hang/top-ban-hang-doanh-so`,
      JSON.stringify(data)
    )
  },
  getListReturns: data => {
    return http.post(`${SubApi}/ban-hang/tra-hang`, JSON.stringify(data))
  },
  getListProfit: data => {
    return http.post(`${SubApi}/loi-nhuan/danh-sach`, JSON.stringify(data))
  },
  getListDebtPayment: data => {
    return http.post(
      `${SubApi}/ban-hang/thanh-toan-tra-no`,
      JSON.stringify(data)
    )
  },
  getListPriceSell: data => {
    return http.post(
      `${SubApi}/ban-hang/gia-ban-san-pham-dich-vu`,
      JSON.stringify(data)
    )
  },
  getListActualSell: data => {
    return http.post(
      `${SubApi}/ban-hang/bao-cao-thuc-thu`,
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
    if (Number(data?.ShowsX) === 1) {
      return http.post(
        `${SubApi}/bao-cao-thu-chi/danh-sach-2`,
        JSON.stringify(data)
      )
    }
    return http.post(
      `${SubApi}/bao-cao-thu-chi/danh-sach`,
      JSON.stringify(data)
    )
  },
  getListDebt: data => {
    return http.post(`${SubApi}/cong-no/danh-sach`, JSON.stringify(data))
  },
  getListDebt2: data => {
    return http.post(`/api/v3/Member27@DebtInTimes`, JSON.stringify(data))
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
  },
  getListUseCustomerApp: data => {
    return http.post(`${SubApi}/khach-hang/su-dung-app`, JSON.stringify(data))
  },
  getListBirthdayCustomer: data => {
    return http.post(
      `${SubApi}/cskh/khach-hang-sinh-nhat`,
      JSON.stringify(data)
    )
  },
  getListTotalWallet: data => {
    return http.post(
      `${SubApi}/khac/tong-tien-vi-khach-hang`,
      JSON.stringify(data)
    )
  },
  getListTotalWalletDetail: data => {
    return http.post(
      `${SubApi}/khac/chi-tiet-vi-khach-hang`,
      JSON.stringify(data)
    )
  },
  getListTotalCard: data => {
    return http.post(`${SubApi}/khac/bao-cao-the-tien`, JSON.stringify(data))
  },
  getListTotalUseCard: data => {
    return http.post(
      `${SubApi}/khac/bao-cao-su-dung-the-tien`,
      JSON.stringify(data)
    )
  },
  getListBanksOrder: data =>
    http.post(
      `${SubApi}/bao-cao-thu-chi/cac-phuong-thuc-thanh-toan`,
      JSON.stringify(data)
    ),
  getCourse: data => http.post(`/api/v3/course@list`, JSON.stringify(data)),
  getListCourses: data =>
    http.post(`${SubApi}/khac/bao-cao-khoa-hoc`, JSON.stringify(data)),
  getDetailPayroll: (data, params) =>
    http.post(`/api/v3/r23detail@${params}`, JSON.stringify(data)),
  getViewSaleDetail: data => {
    return http.post(
      `/api/v3/r23/ban-hang/doanh-so-chi-tiet-2`,
      JSON.stringify(data)
    )
  },
  getBookID: id => http.get(`/api/v3/mbookadmin?cmd=getbooks&id=${id}`)
}
export default reportsApi
