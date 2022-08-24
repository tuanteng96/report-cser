import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import LayoutReport from 'src/layout/LayoutReport'
import RPCustomer from 'src/features/Reports/pages/RP-Customer'
import RPDay from 'src/features/Reports/pages/RP-Day'
import RPSell from 'src/features/Reports/pages/RP-Sell'
import Returns from 'src/features/Reports/pages/RP-Sell/pages/Returns'
import Sales from 'src/features/Reports/pages/RP-Sell/pages/Sales'
import SaleDetails from 'src/features/Reports/pages/RP-Sell/pages/SaleDetails'
import DebtPayment from 'src/features/Reports/pages/RP-Sell/pages/DebtPayment'
import RPMore from 'src/features/Reports/pages/RP-More'
import TopProducts from 'src/features/Reports/pages/RP-More/pages/TopProducts'
import RPReEx from 'src/features/Reports/pages/RP-ReEx'
import RPDebt from 'src/features/Reports/pages/RP-Debt'
import DebtLock from 'src/features/Reports/pages/RP-Debt/pages/DebtLock'
import DebtGift from 'src/features/Reports/pages/RP-Debt/pages/Gift'
import DebtHome from 'src/features/Reports/pages/RP-Debt/pages/Home'
import RPStaff from 'src/features/Reports/pages/RP-Staff'
import SalaryServices from 'src/features/Reports/pages/RP-Staff/pages/SalaryServices'
import RoseStaff from 'src/features/Reports/pages/RP-Staff/pages/RoseStaff'
import SalesStaff from 'src/features/Reports/pages/RP-Staff/pages/SalesStaff'
import PayrollStaff from 'src/features/Reports/pages/RP-Staff/pages/PayrollStaff'
import RPInventory from 'src/features/Reports/pages/RP-Inventory'
import InventoryHome from 'src/features/Reports/pages/RP-Inventory/pages/Home'
import InventoryAttrition from 'src/features/Reports/pages/RP-Inventory/pages/Attrition'
import WarningMaterials from 'src/features/Reports/pages/RP-Inventory/pages/WarningMaterials'
import BirthdayCustomer from 'src/features/Reports/pages/RP-CSKH/pages/BirthdayCustomer'
import RPCSKH from 'src/features/Reports/pages/RP-CSKH'
import TotalWallet from 'src/features/Reports/pages/RP-More/pages/TotalWallet'
import TotalCard from 'src/features/Reports/pages/RP-More/pages/TotalCard'
import UseCardMoney from 'src/features/Reports/pages/RP-More/pages/UseCardMoney'
import GeneralCustomer from 'src/features/Reports/pages/RP-Customer/pages/GeneralCustomer'
import OverviewCustomer from 'src/features/Reports/pages/RP-Customer/pages/OverviewCustomer'
import ExpenseCustomer from 'src/features/Reports/pages/RP-Customer/pages/ExpenseCustomer'
import UseServiceCustomer from 'src/features/Reports/pages/RP-Customer/pages/UseServiceCustomer'
import ExpectedCustomer from 'src/features/Reports/pages/RP-Customer/pages/ExpectedCustomer'
import FrequencyUseCustomer from 'src/features/Reports/pages/RP-Customer/pages/FrequencyUseCustomer'
import CustomerUseApp from 'src/features/Reports/pages/RP-CSKH/pages/CustomerUseApp'
import PriceList from 'src/features/Reports/pages/RP-Sell/pages/PriceList'
import OverviewService from 'src/features/Reports/pages/RP-Services/pages/OverviewService'
import RPServices from 'src/features/Reports/pages/RP-Services'
import OddCardService from 'src/features/Reports/pages/RP-Services/pages/OddCardService'

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
      >
        <Route index element={<Navigate to="tong-quan" replace />} />
        <Route path="tong-quan" element={<OverviewCustomer />} />
        <Route path="tong-hop" element={<GeneralCustomer />} />
        <Route path="chi-tieu" element={<ExpenseCustomer />} />
        <Route path="su-dung-dich-vu" element={<UseServiceCustomer />} />
        <Route path="du-kien" element={<ExpectedCustomer />} />
        <Route path="tan-suat-su-dung" element={<FrequencyUseCustomer />} />
      </Route>
      <Route
        path="/dich-vu"
        element={
          <LayoutReport>
            <RPServices />
          </LayoutReport>
        }
      >
        <Route index element={<Navigate to="tong-quan" replace />} />
        <Route path="tong-quan" element={<OverviewService />} />
        <Route path="bao-cao-nghiep-vu" element={<OddCardService />} />
      </Route>
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
        <Route path="sp-dv-ban-ra" element={<SaleDetails />} />
        <Route path="thanh-toan-tra-no" element={<DebtPayment />} />
        <Route path="tra-hang" element={<Returns />} />
        <Route path="top-ban-hang-doanh-so" element={<TopProducts />} />
        <Route path="bang-gia" element={<PriceList />} />
      </Route>
      <Route
        path="/thu-chi-va-so-quy"
        element={
          <LayoutReport>
            <RPReEx />
          </LayoutReport>
        }
      ></Route>
      <Route
        path="/cong-no"
        element={
          <LayoutReport>
            <RPDebt />
          </LayoutReport>
        }
      >
        <Route index element={<Navigate to="danh-sach" replace />} />
        <Route path="danh-sach" element={<DebtHome />} />
        <Route path="khoa-no" element={<DebtLock />} />
        <Route path="tang" element={<DebtGift />} />
      </Route>
      <Route
        path="/nhan-vien"
        element={
          <LayoutReport>
            <RPStaff />
          </LayoutReport>
        }
      >
        <Route index element={<Navigate to="luong-ca-dich-vu" replace />} />
        <Route path="luong-ca-dich-vu" element={<SalaryServices />} />
        <Route path="hoa-hong" element={<RoseStaff />} />
        <Route path="doanh-so" element={<SalesStaff />} />
        <Route path="bang-luong" element={<PayrollStaff />} />
      </Route>
      <Route
        path="/ton-kho"
        element={
          <LayoutReport>
            <RPInventory />
          </LayoutReport>
        }
      >
        <Route index element={<Navigate to="danh-sach" replace />} />
        <Route path="danh-sach" element={<InventoryHome />} />
        <Route path="tieu-hao" element={<InventoryAttrition />} />
        <Route path="du-kien-nvl" element={<WarningMaterials />} />
      </Route>
      <Route
        path="/cskh"
        element={
          <LayoutReport>
            <RPCSKH />
          </LayoutReport>
        }
      >
        <Route index element={<Navigate to="khach-hang-sinh-nhat" replace />} />
        <Route path="khach-hang-sinh-nhat" element={<BirthdayCustomer />} />
        <Route path="bao-cao-cai-dat-app" element={<CustomerUseApp />} />
      </Route>
      <Route
        path="/khac"
        element={
          <LayoutReport>
            <RPMore />
          </LayoutReport>
        }
      >
        <Route index element={<Navigate to="bao-cao-vi" replace />} />
        <Route path="bao-cao-vi" element={<TotalWallet />} />
        <Route path="bao-cao-the-tien" element={<TotalCard />} />
        <Route path="bao-cao-su-dung-the-tien" element={<UseCardMoney />} />
      </Route>
      <Route path="/app23/index.html" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default RouterPage
