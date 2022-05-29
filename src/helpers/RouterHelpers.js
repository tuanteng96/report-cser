export const RouterHeplers = {
  getCurrentUrl: location => {
    return location.pathname.split(/[?#]/)[0]
  },
  checkIsActive: (location, url) => {
    const current = RouterHeplers.getCurrentUrl(location)
    if (!current || !url) {
      return false
    }

    if (current === url) {
      return true
    }

    if (current.indexOf(url) > -1) {
      return true
    }

    return false
  }
}
