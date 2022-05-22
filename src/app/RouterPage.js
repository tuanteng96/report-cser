import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import RPCustomer from 'src/features/Reports/pages/RP-Customer'
import RPDay from 'src/features/Reports/pages/RP-Day'
import LayoutReport from 'src/layout/LayoutReport'

function RouterPage(props) {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <LayoutReport>
            <RPDay />
          </LayoutReport>
        }
      ></Route>
      <Route
        path="/khach-hang"
        element={
          <LayoutReport>
            <RPCustomer />
          </LayoutReport>
        }
      ></Route>
      <Route path="/app23/index.html" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default RouterPage
