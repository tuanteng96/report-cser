import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import _ from 'lodash'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import FilterListAdvanced from 'src/components/Filter/FilterListAdvanced'
import reportsApi from 'src/api/reports.api'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import Swal from 'sweetalert2'
import TablePagination from 'src/components/Tables/TablePagination'
import { buildSalesPaymentParams, parseSalesPayment } from './query'
import PaymentReport from './PaymentReport'
import './SalesNewDebt.css'

import moment from 'moment'
import 'moment/locale/vi'

moment.locale('vi')

// Bán hàng (Bán mới, Thanh toán nợ) — API /api/v6/dQuery@BaoCaoThanhToanDonHang.
// Bộ lọc nhân bản từ Bán hàng / Doanh số (Sales). Giao diện theo BaoCaoThanhToan.html.
function SalesNewDebt(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  // Bộ lọc chỉ hiện các trường có trong object này (không có Chế độ, Dự kiến thu nợ)
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // như Doanh số: mặc định cơ sở đang active; '' = tất cả cơ sở hiển thị
    DateStart: new Date(), // Ngày bắt đầu
    DateEnd: new Date(), // Ngày kết thúc
    Pi: 1, // Trang hiện tại
    Ps: 15, // Số lượng item
    PayTypes: ['MOI', 'NO'] // MOI = mới, NO = thu nợ, KHAU_TRU = khấu trừ; [] = tất cả
  })
  // Id các cơ sở hiển thị trong bộ lọc (đã lọc theo quyền). null = chưa biết.
  const [visibleStockIds, setVisibleStockIds] = useState(null)
  const [StockName, setStockName] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingExport] = useState(false)
  const [isFilter, setIsFilter] = useState(false)
  const [ListData, setListData] = useState([])
  const [Summary, setSummary] = useState({})
  const [PageTotal, setPageTotal] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  // Tham số của lần tải gần nhất (hiển thị khoảng ngày, vị trí dòng)
  const [lastParams, setLastParams] = useState(null)

  // Cơ sở đã chọn (chỉ giữ nếu người dùng được phép xem); [] = tất cả cơ sở hiển thị
  const selectedStockIds = useMemo(() => {
    const id = Number(filters.StockID)
    if (!filters.StockID || !Number.isInteger(id) || id <= 0) return []
    if (visibleStockIds && !visibleStockIds.includes(id)) return []
    return [id]
  }, [filters.StockID, visibleStockIds])

  // Tên cơ sở trên tiêu đề — giống Doanh số
  useEffect(() => {
    const stock = Stocks.find(
      item => Number(item.ID) === Number(selectedStockIds[0])
    )
    setStockName(stock ? stock.Title : 'Tất cả cơ sở')
  }, [Stocks, selectedStockIds])

  useEffect(() => {
    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, visibleStockIds])

  const onStocksListChange = list => {
    setVisibleStockIds(
      (list || [])
        .map(item => Number(item.value))
        .filter(id => Number.isInteger(id) && id > 0)
    )
  }

  const clearData = () => {
    setListData([])
    setSummary({})
    setPageTotal(0)
    setPageCount(0)
  }

  // Chống gọi trùng: React.StrictMode (dev) chạy effect 2 lần khi vào trang.
  // - Đang có request cùng tham số chưa xong -> không gửi lại (trừ khi force).
  // - Chỉ nhận kết quả của request mới nhất (bỏ kết quả cũ khi bộ lọc đổi nhanh).
  const requestRef = useRef({ id: 0, pendingKey: '' })

  const getData = ({ isLoading = true, force = false } = {}) => {
    // Chờ bộ lọc báo danh sách cơ sở được xem
    if (visibleStockIds === null) return
    // Không được xem cơ sở nào: không gọi API (tránh gửi rỗng = mọi cơ sở)
    if (!visibleStockIds.length) {
      requestRef.current.id++
      requestRef.current.pendingKey = ''
      clearData()
      setLoading(false)
      return
    }
    const params = buildSalesPaymentParams(
      { ...filters, StockIDs: selectedStockIds, PayType: filters.PayTypes },
      visibleStockIds
    )
    const key = JSON.stringify(params)
    if (!force && requestRef.current.pendingKey === key) return

    const id = ++requestRef.current.id
    requestRef.current.pendingKey = key
    const isLatest = () => id === requestRef.current.id
    const done = () => {
      if (isLatest()) requestRef.current.pendingKey = ''
    }

    isLoading && setLoading(true)
    reportsApi
      .getSalesPayment(params)
      .then(({ data }) => {
        if (!isLatest()) return
        done()
        if (data?.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
          return
        }
        if (data?.error) {
          // Lỗi từ API (không phải lỗi quyền): báo lỗi, cho phép đóng
          Swal.fire({
            icon: 'error',
            title: 'Không tải được báo cáo',
            text: data.error
          })
          clearData()
          setLoading(false)
          return
        }
        const { items, summary, total, pageCount } = parseSalesPayment(data)
        setListData(items)
        setSummary(summary)
        setPageTotal(total)
        setPageCount(pageCount)
        setLastParams(params)
        setLoading(false)
        isFilter && setIsFilter(false)
        PermissionHelpers.HideErrorAccess()
      })
      .catch(error => {
        if (!isLatest()) return
        done()
        console.log(error)
        setLoading(false)
      })
  }

  const onFilter = values => {
    if (_.isEqual(values, filters)) {
      onRefresh()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  // Bấm làm mới: luôn gọi lại, kể cả khi tham số không đổi
  const onRefresh = () => {
    getData({ force: true })
  }

  const onOpenFilter = () => {
    setIsFilter(true)
  }

  const onHideFilter = () => {
    setIsFilter(false)
  }

  // TODO: xuất Excel khi có API mới
  const onExport = () => {}

  const onPagesChange = ({ Pi, Ps }) => {
    setFilters({ ...filters, Pi, Ps })
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase font-size-xl fw-600">Bán hàng</span>
          <span className="ps-0 ps-lg-3 text-muted d-block d-lg-inline-block">
            {StockName}
          </span>
        </div>
        <div className="w-85px d-flex justify-content-end">
          <button
            type="button"
            className="p-0 btn btn-primary w-40px h-35px"
            onClick={onOpenFilter}
            aria-label="Bộ lọc"
            title="Bộ lọc"
          >
            <i
              className="fa-regular fa-filters font-size-lg mt-5px"
              aria-hidden="true"
            ></i>
          </button>
          <IconMenuMobile />
        </div>
      </div>
      <FilterListAdvanced
        show={isFilter}
        filters={filters}
        onHide={onHideFilter}
        onSubmit={onFilter}
        onRefresh={onRefresh}
        loading={loading}
        loadingExport={loadingExport}
        onExport={onExport}
        onStocksListChange={onStocksListChange}
        showDebtStatus={false}
      />
      <PaymentReport
        summary={Summary}
        rows={ListData}
        loading={loading}
        from={
          lastParams?.From || moment(filters.DateStart).format('YYYY-MM-DD')
        }
        to={lastParams?.To || moment(filters.DateEnd).format('YYYY-MM-DD')}
        payTypes={filters.PayTypes}
        pageStart={
          ((lastParams?.PageIndex || 1) - 1) *
          (lastParams?.PageSize || filters.Ps)
        }
        total={PageTotal}
        pagination={
          <TablePagination
            pageCount={pageCount}
            filters={filters}
            onPagesChange={onPagesChange}
          />
        }
      />
    </div>
  )
}

export default SalesNewDebt
