import { DatetimeHelpers } from 'src/helpers/DatetimeHelpers'

// Công thức tính các khoản chấm công trên phiếu lương cá nhân.
export const calculateAttendanceSalary = salary => {
  const newObj = { ...salary }
  let WorksListRatio = newObj?.TrackValue?.List || []

  let WorksList = WorksListRatio.map(item => {
    const info = item?.Info
    const ratio = Number(info?.Ratio?.ratio)
    if (!Number.isFinite(ratio) || ratio <= 0) return item

    const divideValues = (values, keys) => {
      const result = { ...values }
      for (const key of keys) {
        if (values[key]) {
          result[key] = {
            ...values[key],
            Value: Number(values[key].Value || 0) / ratio
          }
        }
      }
      return result
    }

    const newInfo = divideValues(info, ['WorkToday', 'DI_MUON', 'DI_SOM'])
    if (info.CheckOut) {
      newInfo.CheckOut = divideValues(info.CheckOut, ['VE_MUON', 'VE_SOM'])
    }

    return { ...item, Info: newInfo }
  }).filter(
    item =>
      !(
        item?.Info?.WorkToday?.Title?.includes('CTV:') ||
        item?.Info?.WorkToday?.value?.includes('CTV-THEO-GIO') ||
        item?.Info?.WorkToday?.SubTitle?.includes('CTV:') ||
        item?.Info?.WorkToday?.label?.includes('CTV:')
      )
  )

  newObj.TrackValue = { ...newObj.TrackValue }
  newObj.TrackValue['DI_MUON_DS'] = WorksList.filter(
    x => typeof x?.Info?.['DI_MUON']?.Value !== 'undefined'
  )
  newObj.TrackValue['DI_SOM_DS'] = WorksList.filter(
    x => typeof x?.Info?.['DI_SOM']?.Value !== 'undefined'
  )
  newObj.TrackValue['VE_MUON_DS'] = WorksList.filter(
    x => typeof x?.Info?.CheckOut?.['VE_MUON']?.Value !== 'undefined'
  )
  newObj.TrackValue['VE_SOM_DS'] = WorksList.filter(
    x => typeof x?.Info?.CheckOut?.['VE_SOM']?.Value !== 'undefined'
  )

  const sumTrackValue = key =>
    (newObj.TrackValue?.[`${key}_DS`] || []).reduce((sum, item) => {
      const info = key.startsWith('VE_') ? item?.Info?.CheckOut : item?.Info
      return sum + Math.abs(Number(info?.[key]?.Value || 0))
    }, 0)

  newObj.TrackValue['DI_MUON'] = sumTrackValue('DI_MUON')
  newObj.TrackValue['VE_SOM'] = sumTrackValue('VE_SOM')
  newObj.TrackValue['DI_SOM'] = sumTrackValue('DI_SOM')
  newObj.TrackValue['VE_MUON'] = sumTrackValue('VE_MUON')

  newObj['DI_MUON_VE_SOM'] =
    newObj.TrackValue['DI_MUON'] + newObj.TrackValue['VE_SOM']
  newObj['DI_SOM_VE_MUON'] =
    newObj.TrackValue['DI_SOM'] + newObj.TrackValue['VE_MUON']

  newObj['NGHI_TRU_LUONG'] = 0
  newObj['NGHI_TRU_LUONG_NOT_PHEP'] = 0

  if (newObj?.WorkTrackDates) {
    newObj['NGHI_TRU_LUONG'] =
      (newObj?.WorkTrackDates?.weekdayLeave?.length || 0) *
        newObj['LUONG_NGAY_CONG'] +
      (newObj?.WorkTrackDates?.weekendLeave?.length || 0) *
        newObj['LUONG_NGAY_CONG'] *
        2 +
      (newObj?.WorkTrackDates?.weekdayPermittedLeave?.length || 0) *
        newObj['LUONG_NGAY_CONG'] +
      (newObj?.WorkTrackDates?.weekendPermittedLeave?.length || 0) *
        newObj['LUONG_NGAY_CONG']

    newObj['NGHI_TRU_LUONG_NOT_PHEP'] =
      (newObj?.WorkTrackDates?.weekdayNoLeave?.length || 0) *
        newObj['LUONG_NGAY_CONG'] *
        2 +
      (newObj?.WorkTrackDates?.weekendNoLeave?.length || 0) *
        newObj['LUONG_NGAY_CONG'] *
        4
  }

  let TOTAL_TIME_CTV =
    DatetimeHelpers.getTotalWorkingMinutes(newObj?.TrackValue?.CTV || []) * 2

  newObj['TANG_CA_OFF'] = 0
  newObj['LUONG_GIO_TANG_CA_OFF'] = 0

  if (newObj?.User?.WorkTimeSetting) {
    let WorkTimeSetting = JSON.parse(newObj?.User?.WorkTimeSetting)
    if (Number(WorkTimeSetting?.SalaryHours) > 0) {
      newObj['LUONG_GIO_TANG_CA_OFF'] = Number(WorkTimeSetting.SalaryHours)
      newObj['TANG_CA_OFF'] =
        (TOTAL_TIME_CTV / 60) * WorkTimeSetting?.SalaryHours
    }
  }

  newObj['TANG_CA_LE_DS'] = newObj?.TrackValue?.List
    ? newObj?.TrackValue?.List?.filter(x => x?.Info?.Ratio).map(item => ({
        ...item,
        HolidayOvertimeValue: 0
      }))
    : []

  newObj['TANG_CA_LE'] = 0

  for (let item of newObj['TANG_CA_LE_DS']) {
    if (item?.Info?.Ratio?.ratio) {
      let Ratio = Number(item?.Info?.WorkToday?.Value || 0)
      if (!Number.isFinite(Ratio) || Ratio <= 0) continue
      if (
        item?.Info?.WorkToday?.Title?.includes('CTV:') ||
        item?.Info?.WorkToday?.value?.includes('CTV-THEO-GIO') ||
        item?.Info?.WorkToday?.SubTitle?.includes('CTV:') ||
        item?.Info?.WorkToday?.label?.includes('CTV:')
      ) {
        item.HolidayOvertimeValue +=
          (DatetimeHelpers.getTotalWorkingMinutes([item]) / 60) *
          (newObj['LUONG_GIO_TANG_CA_OFF'] || 0) *
          Ratio
      } else {
        item.HolidayOvertimeValue +=
          (Ratio - Number(item?.Info?.WorkToday?.Value || 0) / Ratio) *
          newObj['LUONG_NGAY_CONG']

        if (item?.Info?.['DI_SOM']?.Value) {
          item.HolidayOvertimeValue += Number(
            item?.Info?.['DI_SOM']?.Value / Ratio
          )
        }
        if (item?.Info?.CheckOut?.['VE_MUON']?.Value) {
          item.HolidayOvertimeValue += Number(
            item?.Info?.CheckOut?.['VE_MUON']?.Value / Ratio
          )
        }
      }
      newObj['TANG_CA_LE'] += item.HolidayOvertimeValue
    }
  }

  return newObj
}
