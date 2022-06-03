import React from 'react'
import NavBar from 'src/components/NavBar/NavBar'
import PerfectScrollbar from 'react-perfect-scrollbar'

const perfectScrollbarOptions = {
  wheelSpeed: 2,
  wheelPropagation: false
}

function LayoutReport({ children }) {
  return (
    <PerfectScrollbar
      options={perfectScrollbarOptions}
      className="scroll"
      style={{ position: 'relative', height: '100%' }}
    >
      <div className="px-main pt-55px position-relative">
        <NavBar />
        <div className="container-fluid p-0">{children}</div>
      </div>
    </PerfectScrollbar>
  )
}

export default LayoutReport
