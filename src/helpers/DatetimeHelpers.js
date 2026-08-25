import moment from 'moment'

const countWeekdaysInMonth = (month, weekdays) => {
  if (!month) return 0

  weekdays = String(weekdays ?? '').trim()

  if (!weekdays) return 0

  const weekMap = {
    CN: 0,
    T2: 1,
    T3: 2,
    T4: 3,
    T5: 4,
    T6: 5,
    T7: 6
  }

  const targets = weekdays
    .split('.')
    .map(x => weekMap[x.trim().toUpperCase()])
    .filter(x => x !== undefined)

  if (!targets.length) return 0

  const start = moment(month, 'MM/YYYY', true)

  if (!start.isValid()) return 0

  const daysInMonth = start.daysInMonth()

  let count = 0

  for (let day = 1; day <= daysInMonth; day++) {
    const current = start.clone().date(day)

    if (targets.includes(current.day())) {
      count++
    }
  }

  return count
}

const getContractLeaveStats = contractMonth => {
  if (!contractMonth) {
    return {
      total: 0,
      used: 0,
      remaining: 0
    }
  }

  const start = moment(contractMonth, ['MM/YYYY', 'M.YYYY'], true)

  if (!start.isValid()) {
    return {
      total: 0,
      used: 0,
      remaining: 0
    }
  }

  const year = start.year()
  const startMonth = start.month() + 1

  const now = moment()

  // Tổng số ngày nghỉ từ tháng ký đến hết năm
  const total = 12 - startMonth + 1

  let used = 0

  // Chỉ tính đã nghỉ nếu đang cùng năm hợp đồng
  if (now.year() === year) {
    const currentMonth = now.month() + 1

    if (currentMonth >= startMonth) {
      used = currentMonth - startMonth + 1
    }
  } else if (now.year() > year) {
    used = total
  }

  return {
    total,
    used,
    remaining: Math.max(total - used, 0)
  }
}

const getTotalWorkingMinutes = list => {
  return list.reduce((total, item) => {
    if (!item.CheckIn || !item.CheckOut) return total

    const checkIn = moment(item.CheckIn)
    const checkOut = moment(item.CheckOut)

    if (!checkIn.isValid() || !checkOut.isValid()) return total

    return total + checkOut.diff(checkIn, 'minutes')
  }, 0)
}

const splitWorkTrackDates = (Dates = [], dayoffs = '', onlyPassed = false) => {
  const weekMap = {
    CN: 0,
    T2: 1,
    T3: 2,
    T4: 3,
    T5: 4,
    T6: 5,
    T7: 6
  }

  const dayoffNumbers = String(dayoffs || '')
    .split('.')
    .map(x => weekMap[x.trim().toUpperCase()])
    .filter(x => x !== undefined)

  const isApproved = workOff => {
    return (
      !!workOff?.Status &&
      workOff.Status !== 'CHO_DUYET' &&
      workOff.Status !== 'TU_CHOI'
    )
  }

  // Có WorkTrack
  const hasWorkTrack = Dates.filter(item => !!item.WorkTrack)

  // Không WorkTrack
  let noWorkTrack = Dates.filter(item => !item.WorkTrack)

  // Chỉ lấy ngày đã qua, không tính hôm nay
  if (onlyPassed) {
    const today = moment().startOf('day')

    noWorkTrack = noWorkTrack.filter(item => moment(item.Date).isBefore(today))
  }

  // Không WorkTrack + bỏ ngày nghỉ cố định
  const noWorkTrackExcludeDayoffs = noWorkTrack.filter(item => {
    const day = moment(item.Date).day()

    return !dayoffNumbers.includes(day)
  })

  /*
   * Type = 1 + đã duyệt
   * => loại bỏ hoàn toàn khỏi tính nghỉ
   */
  const validDates = noWorkTrackExcludeDayoffs.filter(item => {
    const hasApprovedPaidLeave = item.WorkOffs?.some(
      x => x.Type === 1 && isApproved(x)
    )

    return !hasApprovedPaidLeave
  })

  // Cuối tuần T7/CN
  const weekend = validDates.filter(item => {
    const day = moment(item.Date).day()

    return day === 0 || day === 6
  })

  // Ngày thường T2-T6
  const weekday = validDates.filter(item => {
    const day = moment(item.Date).day()

    return day >= 1 && day <= 5
  })

  /*
   * Type = 0 + đã duyệt
   * => nghỉ thường hợp lệ
   */
  const hasApprovedNormalLeave = item => {
    return item.WorkOffs?.some(x => x.Type === 0 && isApproved(x))
  }

  /*
   * Type = 2 + đã duyệt
   * => nghỉ thường có phép
   */
  const hasApprovedPermittedLeave = item => {
    return item.WorkOffs?.some(x => x.Type === 2 && isApproved(x))
  }

  return {
    hasWorkTrack,

    noWorkTrack,

    noWorkTrackExcludeDayoffs,

    // Cuối tuần
    weekendLeave: weekend.filter(hasApprovedNormalLeave),

    weekendPermittedLeave: weekend.filter(hasApprovedPermittedLeave),

    weekendNoLeave: weekend.filter(
      item => !hasApprovedNormalLeave(item) && !hasApprovedPermittedLeave(item)
    ),

    // Ngày thường
    weekdayLeave: weekday.filter(hasApprovedNormalLeave),

    weekdayPermittedLeave: weekday.filter(hasApprovedPermittedLeave),

    weekdayNoLeave: weekday.filter(
      item => !hasApprovedNormalLeave(item) && !hasApprovedPermittedLeave(item)
    )
  }
}

export const DatetimeHelpers = {
  countWeekdaysInMonth,
  getContractLeaveStats,
  getTotalWorkingMinutes,
  splitWorkTrackDates
}
