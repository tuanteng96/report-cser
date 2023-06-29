import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'

const ScrollToTop = props => {
  const location = useLocation()
  let navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location])

  useEffect(() => {
    if (window.isDesktop) {
      if (location?.pathname === '/app23/index.html') {
        navigate('/', { replace: true })
      } else {
        window.top.location.hash = `rp:${location?.pathname}`
      }
    }

    if (location?.search === '?mdl20=R23&act20=index') {
      let urlRc = location?.hash.split('#rp:')[1]
      navigate(urlRc, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])

  useEffect(() => {
    if (window.isDesktop && window.top.location.hash) {
      const url = window.top.location.hash.slice(
        4,
        window.top.location.hash.length
      )
      navigate('/', { replace: true })
      navigate(url, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{props.children}</>
}

export default ScrollToTop
