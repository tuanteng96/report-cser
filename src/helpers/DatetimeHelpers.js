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

export const DatetimeHelpers = { countWeekdaysInMonth }
