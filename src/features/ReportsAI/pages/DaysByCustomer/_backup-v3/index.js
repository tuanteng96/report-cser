import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import _ from 'lodash'
import TablePagination from 'src/components/Tables/TablePagination'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import FilterList from 'src/components/Filter/FilterList'
import { JsonFilter } from 'src/Json/JsonFilter'
import reportsApi from 'src/api/reports.api'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import CustomerTimeline from './CustomerTimeline'
import './DaysByCustomer.css'

import moment from 'moment'
import 'moment/locale/vi'

moment.locale('vi')

const sizePerPageLists = [15, 25, 50, 100]

// Báo cáo ngày theo khách hàng — dùng chung API với Báo cáo ngày / Khách hàng
function DaysByCustomer(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [StockName, setStockName] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [ListData, setListData] = useState([])
  const [pageCount, setPageCount] = useState(0)
  const [PageTotal, setPageTotal] = useState(0)
  const [isFilter, setIsFilter] = useState(false)
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    Pi: 1, // Trang hiện tại
    Ps: 15, // Số lượng item
    Date: new Date(),
    ViewType: [
      JsonFilter.ViewTypeList[0].value,
      JsonFilter.ViewTypeList[1].value,
      JsonFilter.ViewTypeList[2].value,
      JsonFilter.ViewTypeList[3].value
    ]
  })

  useEffect(() => {
    const index = Stocks.findIndex(
      item => Number(item.ID) === Number(filters.StockID)
    )
    if (index > -1) {
      setStockName(Stocks[index].Title)
    } else {
      setStockName('Tất cả cơ sở')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  useEffect(() => {
    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getData = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    const newFilters = {
      ...filters,
      DateStart: filters.Date ? moment(filters.Date).format('DD/MM/yyyy') : '',
      DateEnd: filters.Date ? moment(filters.Date).format('DD/MM/yyyy') : '',
      ViewType: filters.ViewType ? filters.ViewType.join(',') : ''
    }
    delete newFilters.Date
    reportsApi
      .getMemberDay(newFilters)
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          setListData(data.result?.Items || [])
          setPageCount(data.result?.PCount || 0)
          setPageTotal(data.result?.Total || 0)
          setLoading(false)
          isFilter && setIsFilter(false)
          callback && callback()
          PermissionHelpers.HideErrorAccess()
        }
      })
      .catch(error => {
        console.log(error)
        setLoading(false)
      })
  }

  const onOpenFilter = () => {
    setIsFilter(true)
  }

  const onHideFilter = () => {
    setIsFilter(false)
  }

  const onFilter = values => {
    if (_.isEqual(values, filters)) {
      getData()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    getData()
  }

  const onExport = () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getMemberDay(
          BrowserHelpers.getRequestParamsList(filters, { Total: PageTotal })
        ),
      UrlName: '/bao-cao-ngay/khach-hang'
    })
  }

  const onPagesChange = ({ Pi, Ps }) => {
    setFilters({ ...filters, Pi, Ps })
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase font-size-xl fw-600">
            Báo cáo theo khách hàng
          </span>
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
      <FilterList
        show={isFilter}
        filters={filters}
        onHide={onHideFilter}
        onSubmit={onFilter}
        onRefresh={onRefresh}
        loading={loading}
        loadingExport={loadingExport}
        onExport={onExport}
      />
      {/* mỗi khách là một thẻ trắng đặt trên nền trang */}
      <div className="bc" aria-busy={loading}>
        {loading ? (
          <div className="bg-white rounded d-flex justify-content-center py-40px">
            <div className="spinner spinner-primary"></div>
          </div>
        ) : (
          <CustomerTimeline data={ListData} />
        )}
        <TablePagination
          className="mt-20px bg-white rounded px-15px py-10px"
          pageCount={pageCount}
          filters={filters}
          onPagesChange={onPagesChange}
          sizes={sizePerPageLists}
        />
      </div>
    </div>
  )
}

export default DaysByCustomer
