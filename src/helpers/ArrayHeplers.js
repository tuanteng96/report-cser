import moment from 'moment'

export const ArrayHeplers = {
  getItemSize: (List, Size) => {
    if (!Size) return []
    return List.slice(0, Size)
  },
  totalKeyArray: (List, key) => {
    if (!List || List.length === 0) return 0
    return List.map(item => item[key]).reduce((prev, curr) => prev + curr, 0)
  },
  getFilterExport: (obj, total) => {
    const newObj = { ...obj }
    if (total < 1500) {
      newObj.Pi = 1
      newObj.Ps = 1500
    }
    return newObj
  },
  useInfiniteQuery: (page, key = 'data') => {
    let newPages = []
    if (!page || !page[0]) return newPages
    for (let items of page) {
      for (let x of items[key]) {
        newPages.push(x)
      }
    }
    return newPages
  },
  getDateLimit: ({
    Auth,
    Action,
    Type = 'THEO_NGAY',
    noMaximum = false,
    limitEndMonth = false
  }) => {
    let MaximumDate = 0 // Tối đa
    if (Auth?.Info?.Groups && Auth?.Info?.Groups.length > 0) {
      let index = Auth?.Info?.Groups.findIndex(
        x => x.Title && x.Title.indexOf('Báo cáo') > -1
      )
      if (index > -1) {
        MaximumDate = parseInt(
          Auth?.Info?.Groups[index].Title.trim().match(/(\d+)$/)?.[1] || 0
        )
      }
    }
    if (MaximumDate && !noMaximum) {
      if (Action === 'maxDate') {
        if (limitEndMonth) {
          return moment().endOf('months').toDate()
        }
        return moment().toDate()
      }
      if (Action === 'minDate') {
        if (Type === 'THEO_NGAY') {
          return moment()
            .subtract(MaximumDate - 1, 'days')
            .toDate()
        }
        if (Type === 'THEO_THANG') {
          return moment()
            .subtract(MaximumDate - 1, 'months')
            .toDate()
        }
      }
    }

    return null
  }
}
