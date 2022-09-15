import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

export const BrowserHelpers = {
  getOperatingSystem: app => {
    if (/windows phone/i.test(app)) {
      return 'Windows Phone'
    }

    if (/android/i.test(app)) {
      return 'Android'
    }
    if (/iPad|iPhone|iPod/.test(app)) {
      return 'iOS'
    }
    return ''
  },
  getRequestParams: (filters, config) => {
    let params = { ...filters }
    if (config) {
      if (config.Total < 1500) {
        params.Ps = 1500
      }
    }
    if ('DateStart' in filters) {
      params.DateStart = filters.DateStart
        ? moment(filters.DateStart).format('DD/MM/yyyy')
        : null
    }
    if ('DateEnd' in filters) {
      params.DateEnd = filters.DateEnd
        ? moment(filters.DateEnd).format('DD/MM/yyyy')
        : null
    }
    if ('StaffID' in filters) {
      params.StaffID = filters.StaffID ? filters.StaffID.value : ''
    }
    if ('GroupCustomerID' in filters) {
      params.GroupCustomerID = filters.GroupCustomerID
        ? filters.GroupCustomerID.value
        : ''
    }
    if ('StatusMonetCard' in filters) {
      params.StatusMonetCard = filters.StatusMonetCard
        ? filters.StatusMonetCard.value
        : ''
    }
    if ('StatusWallet' in filters) {
      params.StatusWallet = filters.StatusWallet
        ? filters.StatusWallet.value
        : ''
    }
    if ('SourceName' in filters) {
      params.SourceName = filters.SourceName ? filters.SourceName.value : ''
    }
    if ('LevelUp' in filters) {
      params.LevelUp = filters.LevelUp ? filters.LevelUp.value : ''
    }
    if ('MemberID' in filters) {
      params.MemberID = filters.MemberID ? filters.MemberID.value : ''
    }
    if ('BrandOrderID' in filters) {
      params.BrandOrderID = filters.BrandOrderID
        ? filters.BrandOrderID.value
        : ''
    }
    if ('ProductOrderID' in filters) {
      params.ProductOrderID = filters.ProductOrderID
        ? filters.ProductOrderID.value
        : ''
    }
    if ('TypeOrder' in filters) {
      params.TypeOrder = filters.TypeOrder
        ? filters.TypeOrder.map(item => item.value).join(',')
        : ''
    }
    if ('ProvincesID' in filters) {
      params.ProvincesID = filters.ProvincesID ? filters.ProvincesID.value : ''
    }
    if ('DistrictsID' in filters) {
      params.DistrictsID = filters.DistrictsID ? filters.DistrictsID.value : ''
    }
    if ('BirthDateStart' in filters) {
      params.BirthDateStart = filters.BirthDateStart
        ? moment(filters.BirthDateStart).format('DD/MM/yyyy')
        : null
    }
    if ('BirthDateEnd' in filters) {
      params.BirthDateEnd = filters.BirthDateEnd
        ? moment(filters.BirthDateEnd).format('DD/MM/yyyy')
        : null
    }
    if ('DateOrderStart' in filters) {
      params.DateOrderStart = filters.DateOrderStart
        ? moment(filters.DateOrderStart).format('DD/MM/yyyy')
        : null
    }
    if ('DateOrderEnd' in filters) {
      params.DateOrderEnd = filters.DateOrderEnd
        ? moment(filters.DateOrderEnd).format('DD/MM/yyyy')
        : filters.DateOrderStart
        ? moment(filters.DateOrderStart).format('DD/MM/yyyy')
        : null
    }
    if ('StatusServices' in filters) {
      params.StatusServices = filters.StatusServices
        ? filters.StatusServices.map(item => item.value).join(',')
        : ''
    }
    if ('TypeServices' in filters) {
      params.TypeServices = filters.TypeServices
        ? filters.TypeServices.map(item => item.value).join(',')
        : ''
    }
    if ('TypeService' in filters) {
      params.TypeService = filters.TypeService ? filters.TypeService.value : ''
    }
    if ('ServiceIDs' in filters) {
      params.ServiceIDs = filters.ServiceIDs
        ? filters.ServiceIDs.map(item => item.value).join(',')
        : ''
    }
    if ('ExpiryDateEnd' in filters) {
      params.ExpiryDateEnd = filters.ExpiryDateEnd
        ? moment(filters.ExpiryDateEnd).format('DD/MM/yyyy')
        : null
    }
    if ('ExpiryDateStart' in filters) {
      params.ExpiryDateStart = filters.ExpiryDateStart
        ? moment(filters.ExpiryDateStart).format('DD/MM/yyyy')
        : null
    }
    if ('UsedUpDateEnd' in filters) {
      params.UsedUpDateEnd = filters.UsedUpDateEnd
        ? moment(filters.UsedUpDateEnd).format('DD/MM/yyyy')
        : null
    }
    if ('UsedUpDateStart' in filters) {
      params.UsedUpDateStart = filters.UsedUpDateStart
        ? moment(filters.UsedUpDateStart).format('DD/MM/yyyy')
        : null
    }
    return params
  }
}
