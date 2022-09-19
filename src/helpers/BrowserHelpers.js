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
    return params
  },
  getRequestParamsList: (filters, config) => {
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
    if ('Mon' in filters) {
      params.Mon = filters.Mon ? moment(filters.Mon).format('MM/yyyy') : null
    }
    if ('StaffID' in filters) {
      params.StaffID = filters.StaffID ? filters.StaffID.value : ''
    }
    if ('CategoriesId' in filters) {
      params.CategoriesId = filters.CategoriesId
        ? filters.CategoriesId.value
        : ''
    }
    if ('CategoriesTK' in filters) {
      params.CategoriesTK = filters.CategoriesTK
        ? filters.CategoriesTK.value
        : ''
    }
    if ('BrandId' in filters) {
      params.BrandId = filters.BrandId ? filters.BrandId.value : ''
    }
    if ('ProductId' in filters) {
      params.ProductId = filters.ProductId ? filters.ProductId.value : ''
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
    if ('MoneyCardID' in filters) {
      params.MoneyCardID = filters.MoneyCardID ? filters.MoneyCardID.value : ''
    }
    if ('ServiceCardID' in filters) {
      params.ServiceCardID = filters.ServiceCardID
        ? filters.ServiceCardID.value
        : ''
    }
    if ('ten_nghiep_vu' in filters) {
      params.ten_nghiep_vu = filters.ten_nghiep_vu
        ? filters.ten_nghiep_vu.value
        : ''
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
    if ('ProdIDs' in filters) {
      params.ProdIDs = filters.ProdIDs
        ? filters.ProdIDs.map(item => item.value).join(',')
        : ''
    }
    if ('TypeOrder' in filters) {
      params.TypeOrder = filters.TypeOrder
        ? filters.TypeOrder.map(item => item.value).join(',')
        : ''
    }
    if ('StarRating' in filters) {
      params.StarRating = filters.StarRating
        ? filters.StarRating.map(item => item.value).join(',')
        : ''
    }
    if ('TypeTT' in filters) {
      params.TypeTT = filters.TypeTT
        ? filters.TypeTT.map(item => item.value).join(',')
        : ''
    }
    if ('StatusTT' in filters) {
      params.StatusTT = filters.StatusTT
        ? filters.StatusTT.map(item => item.value).join(',')
        : ''
    }
    if ('ProvincesID' in filters) {
      params.ProvincesID = filters.ProvincesID ? filters.ProvincesID.value : ''
    }
    if ('DistrictsID' in filters) {
      params.DistrictsID = filters.DistrictsID ? filters.DistrictsID.value : ''
    }
    if ('Status' in filters) {
      params.Status = filters.Status ? filters.Status.value : ''
    }
    if ('Warranty' in filters) {
      params.Warranty = filters.Warranty ? filters.Warranty.value : ''
    }
    if ('onoff' in filters) {
      params.onoff = filters.onoff ? filters.onoff.value : ''
    }
    if ('apptype' in filters) {
      params.apptype = filters.apptype ? filters.apptype.value : ''
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
    if ('TagWL' in filters) {
      params.TagWL = filters.TagWL
        ? filters.TagWL.map(item => item.value).join(',')
        : ''
    }
    if ('TagsTC' in filters) {
      params.TagsTC = filters.TagsTC
        ? filters.TagsTC.map(item => item.value).join(',')
        : ''
    }
    if ('TypeCN' in filters) {
      params.TypeCN = filters.TypeCN
        ? filters.TypeCN.map(item => item.value).join(',')
        : ''
    }
    if ('PaymentMethods' in filters) {
      params.PaymentMethods = filters.PaymentMethods
        ? filters.PaymentMethods.map(item => item.value).join(',')
        : ''
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
    if ('ten_nghiep_vu' in filters) {
      params.ten_nghiep_vu = filters.ten_nghiep_vu
        ? filters.ten_nghiep_vu.value
        : ''
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
  },
  getRequestParamsToggle: (filters, config) => {
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
