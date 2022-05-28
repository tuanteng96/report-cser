import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import RPCustomer from 'src/features/Reports/pages/RP-Customer'
import RPDay from 'src/features/Reports/pages/RP-Day'
import RPSell from 'src/features/Reports/pages/RP-Sell'
import RPServices from 'src/features/Reports/pages/RP-Services'
import PayDebt from 'src/features/Reports/pages/RP-Services/pages/PayDebt'
import Sales from 'src/features/Reports/pages/RP-Services/pages/Sales'
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
      <Route
        path="/dich-vu"
        element={
          <LayoutReport>
            <RPServices />
          </LayoutReport>
        }
      ></Route>
      <Route
        path="/ban-hang"
        element={
          <LayoutReport>
            <RPSell />
          </LayoutReport>
        }
      >
        <Route index element={<Navigate to="doanh-so" replace />} />
        <Route path="doanh-so" element={<Sales />} />
        <Route path="tra-hang" element={<PayDebt />} />
      </Route>
      <Route path="/app23/index.html" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default RouterPage
