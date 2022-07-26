export const ArrayHeplers = {
  getItemSize: (List, Size) => {
    if (!Size) return []
    return List.slice(0, Size)
  },
  totalKeyArray: (List, key) => {
    if (!List || List.length === 0) return 0
    return List.map(item => item[key]).reduce((prev, curr) => prev + curr, 0)
  }
}
