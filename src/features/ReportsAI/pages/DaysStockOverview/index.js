import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import _ from 'lodash'
import Filter from 'src/components/Filter/Filter'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import reportsApi from 'src/api/reports.api'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import {
  BLOCKS,
  buildDailyBody,
  buildOrdersBody,
  buildWeekBody,
  parseDailyGroups,
  parseHourly,
  parseListRows,
  parseWeekCustomers,
  resolveStockIDs
} from './query'
import SpeechButton from './SpeechButton'
import { CompareStocksButton } from './CompareStocks'
import StockOverviewView from './StockOverviewView'
import './DaysStockOverview.css'

import moment from 'moment'
import 'moment/locale/vi'

moment.locale('vi')

const emptyData = loading => ({
  ...BLOCKS.reduce(
    (acc, b) => ({ ...acc, [b.type]: { loading, groups: [] } }),
    {}
  ),
  orders: { loading, rows: [], slots: [] }, // đơn hàng mới: danh sách + theo khung 2 giờ
  debts: { loading, rows: [] }, // danh sách khách trả nợ
  services: { loading, rows: [] }, // danh sách buổi dịch vụ (biểu đồ theo dịch vụ)
  week: { loading, days: [] } // khách hàng 7 ngày
})

// Báo cáo ngày / Tổng quan cơ sở — gọi API giống trang mẫu act20=daily (cser-report-preview):
// 5 khối Khách hàng, Bán hàng, Dịch vụ, Thu chi, Nhân viên; lọc theo Ngày + nhiều Cơ sở.
function DaysStockOverview(props) {
  const { CrStockID, Stocks, TextToSpeech, showOldUI } = useSelector(
    ({ auth }) => ({
      // nút xem giao diện tổng quan cũ (global.json -> Admin.giao_dien_bc_tong_quan_cu)
      showOldUI: auth?.GlobalConfig?.Admin?.giao_dien_bc_tong_quan_cu === true,
      CrStockID: auth?.Info?.CrStockID || '',
      Stocks: auth?.Info?.Stocks || [],
      // 'google' | 'zalo' — bật nút đọc báo cáo (giống trang mẫu)
      TextToSpeech: auth?.GlobalConfig?.Admin?.TextToSpeech || ''
    })
  )
  // Bộ lọc: Ngày, Cơ sở (chọn nhiều), nút Làm mới — không có Xuất Excel.
  // Thứ tự field trong Filter: Ngày rồi Cơ sở (StockIDs); [] = mọi cơ sở được xem.
  const [filters, setFilters] = useState({
    Date: new Date(), // Ngày
    StockIDs: CrStockID ? [Number(CrStockID)] : [] // Cơ sở
  })
  // Id các cơ sở được xem (bộ lọc báo về, đã lọc theo quyền). null = chưa biết.
  const [visibleStockIds, setVisibleStockIds] = useState(null)
  const [hasAllStocks, setHasAllStocks] = useState(false) // quyền xem tất cả cơ sở
  const navigate = useNavigate()
  // Xem lại giao diện tổng quan cũ: trong admin mở trang act20=daily, trong app mở route cũ
  const openOldUI = () => {
    if (window.isApp) navigate('/bao-cao-ngay/tong-quan')
    else window.top.location.href = '/admin/?mdl20=R23&act20=daily'
  }
  const [StockName, setStockName] = useState('')
  const [stockNames, setStockNames] = useState([]) // tên cơ sở đã chọn ([] = toàn hệ thống)
  const [isFilter, setIsFilter] = useState(false)
  const [data, setData] = useState(() => emptyData(true))
  const loading = BLOCKS.some(b => data[b.type]?.loading)

  useEffect(() => {
    const names = Stocks.filter(item =>
      (filters.StockIDs || []).includes(Number(item.ID))
    ).map(item => item.Title)
    setStockNames(_.uniq(names))
    setStockName(names.length ? _.uniq(names).join(', ') : 'Tất cả cơ sở')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  useEffect(() => {
    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, visibleStockIds])

  const onStocksListChange = list => {
    // có mục "Tất cả cơ sở" (value '') = được xem toàn bộ cơ sở -> hiện nút so sánh
    setHasAllStocks((list || []).some(item => item.value === ''))
    setVisibleStockIds(
      _.uniq(
        (list || [])
          .map(item => Number(item.value))
          .filter(id => Number.isInteger(id) && id > 0)
      )
    )
  }

  // Chống gọi trùng (React.StrictMode chạy effect 2 lần) + chỉ nhận kết quả của lần gọi mới nhất
  const requestRef = useRef({ id: 0, pendingKey: '' })

  const getData = ({ force = false } = {}) => {
    if (visibleStockIds === null) return // chờ bộ lọc báo danh sách cơ sở
    if (!visibleStockIds.length) {
      // không được xem cơ sở nào: không gọi API
      requestRef.current.id++
      requestRef.current.pendingKey = ''
      setData(emptyData(false))
      return
    }
    // 5 khối + 2 nguồn cho biểu đồ (đơn theo giờ, khách 7 ngày)
    const jobs = [
      ...BLOCKS.map(b => {
        const body = buildDailyBody(b.type, filters, visibleStockIds)
        return {
          key: b.type,
          body,
          call: () => reportsApi.getDailyGroups(b.type, body),
          parse: res => ({ groups: parseDailyGroups(res) })
        }
      }),
      (() => {
        const body = buildOrdersBody(filters, visibleStockIds)
        return {
          key: 'orders',
          body,
          call: () => reportsApi.getDailyList('ban-hang', body),
          // rows: danh sách đơn (dùng cho popup chi tiết), slots: theo khung giờ (biểu đồ)
          parse: res => {
            const rows = parseListRows(res)
            return { rows, slots: parseHourly(rows) }
          }
        }
      })(),
      (() => {
        const body = {
          ...buildDailyBody('ban-hang', filters, visibleStockIds),
          GroupTitle: 'Thu nợ'
        }
        return {
          key: 'debts',
          body,
          call: () => reportsApi.getDailyList('ban-hang', body),
          parse: res => ({ rows: parseListRows(res) })
        }
      })(),
      (() => {
        const body = {
          ...buildDailyBody('dich-vu', filters, visibleStockIds),
          GroupTitle: 'Dịch vụ'
        }
        return {
          key: 'services',
          body,
          call: () => reportsApi.getDailyList('dich-vu', body),
          parse: res => ({ rows: parseListRows(res) })
        }
      })(),
      (() => {
        const body = buildWeekBody(filters, visibleStockIds)
        const date = filters.Date
        return {
          key: 'week',
          body,
          call: () => reportsApi.getDailyGroups('khach-hang', body),
          parse: res => ({ days: parseWeekCustomers(res, date) })
        }
      })()
    ]
    const key = JSON.stringify(jobs.map(j => j.body))
    if (!force && requestRef.current.pendingKey === key) return

    const id = ++requestRef.current.id
    requestRef.current.pendingKey = key
    const isLatest = () => id === requestRef.current.id
    let remaining = jobs.length
    const doneOne = () => {
      remaining--
      if (!remaining && isLatest()) {
        requestRef.current.pendingKey = ''
        isFilter && setIsFilter(false)
      }
    }
    const setPart = (k, value) => setData(prev => ({ ...prev, [k]: value }))
    const failed = { loading: false, error: 'Không tải được dữ liệu' }

    setData(prev =>
      jobs.reduce(
        (acc, j) => ({ ...acc, [j.key]: { ...prev[j.key], loading: true } }),
        {}
      )
    )

    jobs.forEach(j => {
      j.call()
        .then(({ data: res }) => {
          if (!isLatest()) return
          if (res?.isRight) {
            PermissionHelpers.ErrorAccess(res.error)
            setPart(j.key, { loading: false })
            return
          }
          if (res?.error) {
            setPart(j.key, failed)
            return
          }
          setPart(j.key, { loading: false, ...j.parse(res) })
          PermissionHelpers.HideErrorAccess()
        })
        .catch(error => {
          console.log(error)
          if (!isLatest()) return
          setPart(j.key, failed)
        })
        .finally(doneOne)
    })
  }

  // Lấy danh sách chi tiết khi bấm (popup), cùng bộ lọc ngày + cơ sở đang xem
  const fetchList = (type, GroupTitle, Key) =>
    reportsApi
      .getDailyList(type, {
        ...buildDailyBody(type, filters, visibleStockIds || []),
        GroupTitle,
        ...(Key ? { Key } : {})
      })
      .then(({ data: res }) => {
        if (res?.isRight || res?.error) throw new Error(res.error)
        return parseListRows(res)
      })

  // Biểu đồ dịch vụ theo 4 nhóm (popup) — gọi khi mở
  const fetchServiceGroups = () => {
    const day = moment(filters.Date).format('YYYY-MM-DD')
    return reportsApi
      .getServiceGroups({
        From: day,
        To: day,
        StockIDs: resolveStockIDs(filters.StockIDs, visibleStockIds || []).join(
          ','
        ),
        Status: 'done'
      })
      .then(({ data: res }) => {
        if (res?.isRight || res?.error) throw new Error(res.error)
        return res || {}
      })
  }

  const onFilter = values => {
    if (_.isEqual(values, filters)) {
      onRefresh()
    } else {
      setFilters({ ...values })
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

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase font-size-xl fw-600">
            Tổng quan cơ sở
          </span>
          <span className="ps-0 ps-lg-3 text-muted d-block d-lg-inline-block">
            {StockName}
            {filters.Date && ` · ${moment(filters.Date).format('DD/MM/YYYY')}`}
          </span>
        </div>
        <div className="d-flex justify-content-end">
          {/* Nút đọc báo cáo (Play) cạnh nút bộ lọc — như trang mẫu */}
          <SpeechButton
            provider={TextToSpeech}
            data={data}
            date={filters.Date}
            stockNames={stockNames}
            disabled={loading}
          />
          {/* xem giao diện cũ: chỉ khi global.json có Admin.giao_dien_bc_tong_quan_cu = true */}
          {showOldUI && (
            <button
              type="button"
              className="btn p-0 w-40px h-35px me-2 so-hbtn"
              onClick={openOldUI}
              aria-label="Xem giao diện tổng quan cũ"
              title="Xem giao diện tổng quan cũ"
            >
              <i
                className="fa-regular fa-clock-rotate-left font-size-lg"
                aria-hidden="true"
              ></i>
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary p-0 w-40px h-35px"
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
      <Filter
        show={isFilter}
        filters={filters}
        onHide={onHideFilter}
        onSubmit={onFilter}
        onRefresh={onRefresh}
        loading={loading}
        onStocksListChange={onStocksListChange}
      />
      {/* Nội dung: menu dính (cuộn tới đâu sáng tới đó) + 6 ô tổng quan + các phần (làm sau) */}
      <div aria-busy={loading}>
        <StockOverviewView
          data={data}
          fetchList={fetchList}
          fetchServiceGroups={fetchServiceGroups}
          // nút "So sánh giữa các cơ sở" bên phải menu — chỉ khi có quyền xem tất cả cơ sở
          menuAction={
            hasAllStocks && visibleStockIds?.length > 1 ? (
              <CompareStocksButton
                date={filters.Date}
                stockIds={visibleStockIds}
              />
            ) : null
          }
        />
      </div>
    </div>
  )
}

export default DaysStockOverview
