import React, { Suspense, lazy } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import TopBarProgress from 'react-topbar-progress-indicator'

const LayoutReport = lazy(() => import('src/layout/LayoutReport'))
const RPCustomer = lazy(() => import('src/features/Reports/pages/RP-Customer'))
const RPDay = lazy(() => import('src/features/Reports/pages/RP-Day'))
const RPSell = lazy(() => import('src/features/Reports/pages/RP-Sell'))
const Returns = lazy(() =>
  import('src/features/Reports/pages/RP-Sell/pages/Returns')
)
const Sales = lazy(() =>
  import('src/features/Reports/pages/RP-Sell/pages/Sales')
)
const Sales2 = lazy(() =>
  import('src/features/Reports/pages/RP-Sell/pages/Sales2')
)
const SaleDetails = lazy(() =>
  import('src/features/Reports/pages/RP-Sell/pages/SaleDetails')
)
const DebtPayment = lazy(() =>
  import('src/features/Reports/pages/RP-Sell/pages/DebtPayment')
)
const RPMore = lazy(() => import('src/features/Reports/pages/RP-More'))
const TopProducts = lazy(() =>
  import('src/features/Reports/pages/RP-More/pages/TopProducts')
)
const RPReEx = lazy(() => import('src/features/Reports/pages/RP-ReEx'))
const RPDebt = lazy(() => import('src/features/Reports/pages/RP-Debt'))
const DebtLock = lazy(() =>
  import('src/features/Reports/pages/RP-Debt/pages/DebtLock')
)
const DebtGift = lazy(() =>
  import('src/features/Reports/pages/RP-Debt/pages/Gift')
)
const DebtHome = lazy(() =>
  import('src/features/Reports/pages/RP-Debt/pages/Home')
)
const RPStaff = lazy(() => import('src/features/Reports/pages/RP-Staff'))
const SalaryServices = lazy(() =>
  import('src/features/Reports/pages/RP-Staff/pages/SalaryServices')
)
const RoseStaff = lazy(() =>
  import('src/features/Reports/pages/RP-Staff/pages/RoseStaff')
)
const SalesStaff = lazy(() =>
  import('src/features/Reports/pages/RP-Staff/pages/SalesStaff')
)
const PayrollStaff = lazy(() =>
  import('src/features/Reports/pages/RP-Staff/pages/PayrollStaff')
)
const RPInventory = lazy(() =>
  import('src/features/Reports/pages/RP-Inventory')
)
const InventoryHome = lazy(() =>
  import('src/features/Reports/pages/RP-Inventory/pages/Home')
)
const InventoryAttrition = lazy(() =>
  import('src/features/Reports/pages/RP-Inventory/pages/Attrition')
)
const WarningMaterials = lazy(() =>
  import('src/features/Reports/pages/RP-Inventory/pages/WarningMaterials')
)
const BirthdayCustomer = lazy(() =>
  import('src/features/Reports/pages/RP-CSKH/pages/BirthdayCustomer')
)
const RPCSKH = lazy(() => import('src/features/Reports/pages/RP-CSKH'))
const TotalWallet = lazy(() =>
  import('src/features/Reports/pages/RP-More/pages/TotalWallet')
)
const TotalCard = lazy(() =>
  import('src/features/Reports/pages/RP-More/pages/TotalCard')
)
const UseCardMoney = lazy(() =>
  import('src/features/Reports/pages/RP-More/pages/UseCardMoney')
)
const GeneralCustomer = lazy(() =>
  import('src/features/Reports/pages/RP-Customer/pages/GeneralCustomer')
)
const OverviewCustomer = lazy(() =>
  import('src/features/Reports/pages/RP-Customer/pages/OverviewCustomer')
)
const ExpenseCustomer = lazy(() =>
  import('src/features/Reports/pages/RP-Customer/pages/ExpenseCustomer')
)
const UseServiceCustomer = lazy(() =>
  import('src/features/Reports/pages/RP-Customer/pages/UseServiceCustomer')
)
const ExpectedCustomer = lazy(() =>
  import('src/features/Reports/pages/RP-Customer/pages/ExpectedCustomer')
)
const FrequencyUseCustomer = lazy(() =>
  import('src/features/Reports/pages/RP-Customer/pages/FrequencyUseCustomer')
)
const CustomerUseApp = lazy(() =>
  import('src/features/Reports/pages/RP-CSKH/pages/CustomerUseApp')
)
const PriceList = lazy(() =>
  import('src/features/Reports/pages/RP-Sell/pages/PriceList')
)
const OverviewService = lazy(() =>
  import('src/features/Reports/pages/RP-Services/pages/OverviewService')
)
const RPServices = lazy(() => import('src/features/Reports/pages/RP-Services'))
const OddCardService = lazy(() =>
  import('src/features/Reports/pages/RP-Services/pages/OddCardService')
)
const SaleReduced = lazy(() =>
  import('src/features/Reports/pages/RP-Sell/pages/SaleReduced')
)
const UsedElsewhere = lazy(() =>
  import('src/features/Reports/pages/RP-Services/pages/UsedElsewhere')
)
const ConvertCustomer = lazy(() =>
  import('src/features/Reports/pages/RP-Customer/pages/ConvertCustomer')
)
const SellProfit = lazy(() =>
  import('src/features/Reports/pages/RP-Sell/pages/SellProfit')
)
const DaysCustomer = lazy(() =>
  import('src/features/Reports/pages/RP-Day/pages/DaysCustomer')
)
const DaysOverview = lazy(() =>
  import('src/features/Reports/pages/RP-Day/pages/DaysOverview')
)
const ActualSell = lazy(() =>
  import('src/features/Reports/pages/RP-Sell/pages/ActualSell')
)
const InventoryService = lazy(() =>
  import(
    'src/features/Reports/pages/RP-Services/pages/InventoryService/InventoryService'
  )
)
const BookService = lazy(() =>
  import('src/features/Reports/pages/RP-Services/pages/BookService')
)
const BanksOrders = lazy(() =>
  import('src/features/Reports/pages/RP-ReEx/pages/BanksOrders')
)
const ReExs = lazy(() =>
  import('src/features/Reports/pages/RP-ReEx/pages/ReExs')
)

const CourseReport = lazy(() =>
  import('src/features/Reports/pages/RP-More/pages/CourseReport')
)

const SuspensedView = ({ children }) => {
  TopBarProgress.config({
    barColors: {
      0: '#3699ff'
    },
    barThickness: 1,
    shadowBlur: 5
  })
  return <Suspense fallback={<TopBarProgress />}>{children}</Suspense>
}

function RouterPage(props) {
  return (
    <Routes>
      <Route
        index
        element={<Navigate to="/bao-cao-ngay/tong-quan" replace />}
      />
      <Route
        path="/bao-cao-ngay"
        element={
          <SuspensedView>
            <LayoutReport>
              <RPDay />
            </LayoutReport>
          </SuspensedView>
        }
      >
        <Route index element={<Navigate to="tong-quan" replace />} />
        <Route path="tong-quan" element={<DaysOverview />} />
        <Route path="khach-hang" element={<DaysCustomer />} />
      </Route>
      <Route
        path="/khach-hang"
        element={
          <SuspensedView>
            <LayoutReport>
              <RPCustomer />
            </LayoutReport>
          </SuspensedView>
        }
      >
        <Route index element={<Navigate to="tong-quan" replace />} />
        <Route path="tong-quan" element={<OverviewCustomer />} />
        <Route path="tong-hop" element={<GeneralCustomer />} />
        <Route path="chi-tieu" element={<ExpenseCustomer />} />
        <Route path="su-dung-dich-vu" element={<UseServiceCustomer />} />
        <Route path="du-kien" element={<ExpectedCustomer />} />
        <Route path="tan-suat-su-dung" element={<FrequencyUseCustomer />} />
        <Route path="chuyen-doi" element={<ConvertCustomer />} />
      </Route>
      <Route
        path="/dich-vu"
        element={
          <SuspensedView>
            <LayoutReport>
              <RPServices />
            </LayoutReport>
          </SuspensedView>
        }
      >
        <Route index element={<Navigate to="tong-quan" replace />} />
        <Route path="tong-quan" element={<OverviewService />} />
        <Route path="bao-cao-nghiep-vu" element={<OddCardService />} />
        <Route path="dv-diem-sd-diem-khac" element={<UsedElsewhere />} />
        <Route path="ton-dich-vu" element={<InventoryService />} />
        <Route path="bao-cao-dat-lich" element={<BookService />} />
      </Route>
      <Route
        path="/ban-hang"
        element={
          <SuspensedView>
            <LayoutReport>
              <RPSell />
            </LayoutReport>
          </SuspensedView>
        }
      >
        <Route index element={<Navigate to="doanh-so" replace />} />
        <Route path="doanh-so" element={<Sales />} />
        <Route path="ds-bc-2" element={<Sales2 />} />
        <Route path="sp-dv-ban-ra" element={<SaleDetails />} />
        <Route path="thanh-toan-tra-no" element={<DebtPayment />} />
        <Route path="tra-hang" element={<Returns />} />
        <Route path="top-ban-hang-doanh-so" element={<TopProducts />} />
        <Route path="bang-gia" element={<PriceList />} />
        <Route path="doanh-so-giam-tru" element={<SaleReduced />} />
        <Route path="loi-nhuan" element={<SellProfit />} />
        <Route path="doanh-so-thuc-thu" element={<ActualSell />} />
      </Route>
      <Route
        path="/bao-cao-thu-chi"
        element={
          <SuspensedView>
            <LayoutReport>
              <RPReEx />
            </LayoutReport>
          </SuspensedView>
        }
      >
        <Route index element={<Navigate to="tong-quan" replace />} />
        <Route path="tong-quan" element={<ReExs />} />
        <Route path="cac-phuong-thuc-thanh-toan" element={<BanksOrders />} />
      </Route>
      <Route
        path="/cong-no"
        element={
          <SuspensedView>
            <LayoutReport>
              <RPDebt />
            </LayoutReport>
          </SuspensedView>
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
          <SuspensedView>
            <LayoutReport>
              <RPStaff />
            </LayoutReport>
          </SuspensedView>
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
          <SuspensedView>
            <LayoutReport>
              <RPInventory />
            </LayoutReport>
          </SuspensedView>
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
          <SuspensedView>
            <LayoutReport>
              <RPCSKH />
            </LayoutReport>
          </SuspensedView>
        }
      >
        <Route index element={<Navigate to="bao-cao-cai-dat-app" replace />} />
        <Route path="khach-hang-sinh-nhat" element={<BirthdayCustomer />} />
        <Route path="bao-cao-cai-dat-app" element={<CustomerUseApp />} />
      </Route>
      <Route
        path="/khac"
        element={
          <SuspensedView>
            <LayoutReport>
              <RPMore />
            </LayoutReport>
          </SuspensedView>
        }
      >
        <Route index element={<Navigate to="bao-cao-vi" replace />} />
        <Route path="bao-cao-vi" element={<TotalWallet />} />
        <Route path="bao-cao-the-tien" element={<TotalCard />} />
        <Route path="bao-cao-su-dung-the-tien" element={<UseCardMoney />} />
        <Route path="bao-cao-khoa-hoc" element={<CourseReport />} />
      </Route>
      {!window?.isDesktop && (
        <Route path="/app23/index.html" element={<Navigate to="/" replace />} />
      )}
    </Routes>
  )
}

export default RouterPage
