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
    return 'Chưa xác định'
  }
}
