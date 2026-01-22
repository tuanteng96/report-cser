export const PriceHelper = {
  countDecimals: value => {
    if (value === null || value === undefined) return 0
    const numberValue = Number(value)
    if (
      !Number.isFinite(numberValue) ||
      Math.floor(numberValue) === numberValue
    ) {
      return 0
    }
    const decimalPart = numberValue.toString().split('.')[1]
    return decimalPart ? decimalPart.length : 0
  },
  formatVND: price => {
    if (!price || price === 0) return '0'

    let decimals = PriceHelper.countDecimals(Number(price))
    let parts = Number(price).toFixed(decimals).split('.')

    // Thêm dấu chấm ngăn cách nghìn
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')

    // Nối lại phần thập phân nếu có
    return parts.length > 1 ? parts[0] + ',' + parts[1] : parts[0]
  },
  formatVNDPositive: price => {
    if (!price || price === 0) {
      return '0'
    } else {
      return Math.abs(price)
        .toFixed(0)
        .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.')
    }
  },
  formatValueVoucher: price => {
    if (!price || price === 0) {
      return '0'
    } else if (Math.abs(price) <= 100) {
      return `${price}%`
    } else {
      return Math.abs(price)
        .toFixed(0)
        .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.')
    }
  }
}
