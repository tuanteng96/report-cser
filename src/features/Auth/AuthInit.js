import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DevHelpers } from 'src/helpers/DevHelpers'
import { LayoutSplashScreen } from 'src/layout/_core/SplashScreen'
import { setGlobalConfig, setProfile } from './AuthSlice'

function AuthInit(props) {
  const [showSplashScreen, setShowSplashScreen] = useState(true)
  const { Token } = useSelector(({ auth }) => ({
    Token: auth.Token
  }))
  const dispatch = useDispatch()
  // We should request user by authToken before rendering the application

  function checkInfo(fn) {
    if (!window.Info || !window.token) {
      setTimeout(() => {
        checkInfo(fn)
      }, 50)
    } else {
      fn()
    }
  }
  useEffect(() => {
    async function requestUser() {
      await axios
        .get(
          `${
            DevHelpers.isDevelopment()
              ? process.env.REACT_APP_API_URL
              : window.API || ''
          }/brand/global/Global.json`
        )
        .then(({ data }) => {
          dispatch(
            setGlobalConfig({
              GlobalConfig: data
            })
          )
        })
        .catch(err => console.log(err))
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
