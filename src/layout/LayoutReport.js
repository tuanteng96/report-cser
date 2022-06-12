import React from 'react'
import NavBar from 'src/components/NavBar/NavBar'

function LayoutReport({ children }) {
  return (
    <div className="px-main pt-110px position-relative">
      <NavBar />
      <div className="container-fluid p-0">{children}</div>
    </div>
  )
}

export default LayoutReport
