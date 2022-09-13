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
    if ('SourceName' in filters) {
      params.SourceName = filters.SourceName ? filters.SourceName.value : ''
    }
    if ('ProvincesID' in filters) {
      params.ProvincesID = filters.ProvincesID ? filters.ProvincesID.value : ''
    }
    if ('DistrictsID' in filters) {
      params.DistrictsID = filters.DistrictsID ? filters.DistrictsID.value : ''
    }
    return params
  }
}
