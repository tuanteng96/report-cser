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
  useInfiniteQuery: (page, key = "data") => {
    let newPages = [];
    if (!page || !page[0]) return newPages;
    for (let items of page) {
      for (let x of items[key]) {
        newPages.push(x);
      }
    }
    return newPages;
  },
}
