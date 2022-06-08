export const ArrayHeplers = {
  getItemSize: (List, Size) => {
    if (!Size) return []
    return List.slice(0, Size)
  }
}
