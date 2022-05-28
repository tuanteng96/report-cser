export const ArrayHeplers = {
  getItemSize: (List, Size) => {
    if (!Size) return List
    return List.slice(0, Size)
  }
}
