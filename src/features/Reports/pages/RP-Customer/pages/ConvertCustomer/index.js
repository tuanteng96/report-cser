import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterList from 'src/components/Filter/FilterList'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import reportsApi from 'src/api/reports.api'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'

import moment from 'moment'
import 'moment/locale/vi'
import ModalViewMobile from './ModalViewMobile'

moment.locale('vi')

function ConvertCustomer(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    Pi: 1, // Trang hiện tại
    Ps: 1500 // Số lượng item
  })
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ListData, setListData] = useState([])
  const [ListStocks, setListStocks] = useState([])
  const [PageTotal, setPageTotal] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [loadingExport, setLoadingExport] = useState(false)
  const [initialValuesMobile, setInitialValuesMobile] = useState(null)
  const [isModalMobile, setIsModalMobile] = useState(false)

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
    getListConvert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListConvert = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    reportsApi
      .getListCustomerConvert(BrowserHelpers.getRequestParamsList(filters))
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const { Members, Total, PCount, LstStocks } = {
            Members: data?.result?.Items || [],
            Total: data?.result?.Total || 0,
            TotalOnline: data?.result?.TotalOnline || 0,
            PCount: data?.result?.PCount || 0,
            LstStocks: data?.result?.Stocks || []
          }
          setListData(Members)
          setListStocks(LstStocks)
          setPageCount(PCount)
          setLoading(false)
          setPageTotal(Total)
          isFilter && setIsFilter(false)
          callback && callback()
          PermissionHelpers.HideErrorAccess()
        }
      })
      .catch(error => console.log(error))
  }

  const onFilter = values => {
    if (_.isEqual(values, filters)) {
      onRefresh()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onExport = () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getListCustomerConvert(
          BrowserHelpers.getRequestParamsList(filters, { Total: PageTotal })
        ),
      UrlName: '/khach-hang/chuyen-doi'
    })
  }

  const onRefresh = () => {
    getListConvert()
  }

  const onOpenFilter = () => {
    setIsFilter(true)
  }

  const onHideFilter = () => {
    setIsFilter(false)
  }

  const onPagesChange = ({ Pi, Ps }) => {
    setFilters({ ...filters, Pi, Ps })
  }

  const OpenModalMobile = value => {
    setInitialValuesMobile(value)
    setIsModalMobile(true)
  }

  const HideModalMobile = () => {
    setInitialValuesMobile(null)
    setIsModalMobile(false)
  }

  const columns = useMemo(() => {
    const newColumns = [
      {
        key: 'UserName',
        title: 'Nhân viên',
        dataKey: 'UserName',
        width: 250,
        sortable: false,
        mobileOptions: {
          visible: true
        },
        frozen: 'left'
      },
      {
        key: 'Total',
        title: 'Tổng số đã chuyển đổi',
        dataKey: 'Total',
        width: 200,
        sortable: false,
        align: 'center',
        mobileOptions: {
          visible: true
        },
        frozen: 'left'
      }
    ]
    const Dates = ListData && ListData.length > 0 ? ListData[0].Dates : []
    for (const [index, item] of Dates.entries()) {
      const newObj = {
        key: moment(item.Date).format('DD-MM-YYYY'),
        title: `Ngày ${moment(item.Date).format('DD-MM-YYYY')}`,
        dataKey: moment(item.Date).format('DD-MM-YYYY'),
        cellRenderer: ({ rowData }) => rowData.Dates[index].Total,
        width: 200,
        sortable: false,
        align: 'center'
      }
      newColumns.push(newObj)
    }
    return newColumns
  }, [ListData])

  const getTotal = () => {
    const { StockID } = {
      StockID: filters.StockID === '' ? -1 : filters.StockID
    }
    const totalAll = ListStocks.reduce((n, { Total }) => n + Total, 0)
    const totalTransfer = ListStocks.reduce(
      (n, { TransferTotal }) => n + TransferTotal,
      0
    )
    const index = ListStocks.findIndex(x => x.ID === StockID)
    if (index > -1) {
      return (
        <>
          Đã chuyển đổi
          <span className="fw-600 font-number pl-5px">
            {ListStocks[index].TransferTotal}
          </span>
          <span className="px-3px">/</span>
          <span className="fw-600 font-number pr-5px">
            {ListStocks[index].Total}
          </span>
          khách hàng
        </>
      )
    }
    return (
      <>
        Đã chuyển đổi
        <span className="fw-600 font-number pl-5px">{totalTransfer}</span>
        <span className="px-3px">/</span>
        <span className="fw-600 font-number pr-5px">{totalAll}</span>
        khách hàng
      </>
    )
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Khách hàng chuyển đổi
          </span>
          <span className="ps-0 ps-lg-3 text-muted d-block d-lg-inline-block">
            {StockName}
          </span>
        </div>
        <div className="w-85px d-flex justify-content-end">
          <button
            type="button"
            className="btn btn-primary p-0 w-40px h-35px"
            onClick={onOpenFilter}
          >
            <i className="fa-regular fa-filters font-size-lg mt-5px"></i>
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
      <div className="bg-white rounded">
        <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between">
          <div className="fw-500 font-size-lg">Danh sách chuyển đổi</div>
          <div>{getTotal()}</div>
        </div>
        <div className="p-20px">
          <ReactTableV7
            className="p-not-first"
            rowKey="UserID"
            filters={filters}
            columns={columns}
            data={ListData}
            loading={loading}
            pageCount={pageCount}
            onPagesChange={onPagesChange}
            optionMobile={{
              CellModal: cell => OpenModalMobile(cell)
            }}
          />
        </div>
        <ModalViewMobile
          show={isModalMobile}
          onHide={HideModalMobile}
          data={initialValuesMobile}
        />
      </div>
    </div>
  )
}

export default ConvertCustomer
