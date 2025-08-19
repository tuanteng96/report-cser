import clsx from 'clsx'
import React from 'react'
import { useLocation } from 'react-router-dom'
import NavBar from 'src/components/NavBar/NavBar'

function LayoutReport({ children }) {
  let { pathname } = useLocation()

  return (
    <div
      className={clsx(
        'pt-110px position-relative h-100',
        pathname.includes('bao-cao-thong-tin-pos') ? '' : 'px-main'
      )}
    >
      <NavBar />
      <div className="p-0 container-fluid h-100">{children}</div>
    </div>
  )
}

export default LayoutReport
