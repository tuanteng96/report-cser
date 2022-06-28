import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { LayoutSplashScreen } from 'src/layout/_core/SplashScreen'
import { setProfile } from './AuthSlice'

window.token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBdXRoMlR5cGUiOiJVc2VyRW50IiwiSUQiOiIxIiwiVG9rZW5JZCI6IjUyMjU3MzUyMjYyNyIsIm5iZiI6MTY1NjM4NTE0NiwiZXhwIjoxNjU2OTg5OTQ2LCJpYXQiOjE2NTYzODUxNDZ9.21T8o4sfJiFrtTmqdpd3c7qwxdCwwCbuN2O5-ZV7QIw'

function AuthInit(props) {
  const [showSplashScreen, setShowSplashScreen] = useState(true)
  const { Token } = useSelector(({ auth }) => ({
    Token: auth.Token
  }))
  const dispatch = useDispatch()
  // We should request user by authToken before rendering the application

  function checkInfo(fn) {
    if (!window.Info && !window.token) {
      setTimeout(() => {
        checkInfo(fn)
      }, 50)
    } else {
      fn()
    }
  }

  useEffect(() => {
    async function requestUser() {
      checkInfo(() => {
        dispatch(
          setProfile({
            Info: window.Info,
            token: window.token
          })
        )
        setShowSplashScreen(false)
      })
    }

    if (!Token) {
      requestUser()
    } else {
      setShowSplashScreen(false)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return showSplashScreen ? <LayoutSplashScreen /> : <>{props.children}</>
}

export default AuthInit
