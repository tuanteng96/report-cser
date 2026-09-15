import React, { useEffect, useMemo, useState, Fragment } from 'react'
import { useSelector } from 'react-redux'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import FilterList from 'src/components/Filter/FilterList'
import { PriceHelper } from 'src/helpers/PriceHelper'
import reportsApi from 'src/api/reports.api'
import ModalViewMobile from './ModalViewMobile'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'
import Text from 'react-texty'

import moment from 'moment'
import 'moment/locale/vi'

moment.locale('vi')

function ServiceNoImage(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    DateStart: new Date(), // Ngày bắt đầu
    DateEnd: new Date(), // Ngày kết thúc
    Pi: 1, // Trang hiện tại
    Ps: 15 // Số lượng item
  })
  const [ListData, setListData] = useState([])
  const [ListDataMobile, setListDataMobile] = useState([])
  const [pageCount, setPageCount] = useState(0)
  const [StockName, setStockName] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [isFilter, setIsFilter] = useState(false)
  const [PageTotal, setPageTotal] = useState(1)
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
    getListServiceNoImage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListServiceNoImage = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    let newFilters = {
      From: filters.DateStart
        ? moment(filters.DateStart).format('YYYY-MM-DD')
        : null,
      To: filters.DateEnd ? moment(filters.DateEnd).format('YYYY-MM-DD') : null,
      StockID: filters.StockID,
      Pi: filters.Pi,
      Ps: filters.Ps
    }
    reportsApi
      .getListServiceNoImage(newFilters)
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const { Items, Total, PCount } = {
            Items: data?.Lst || [],
            Total: data?.Total || 0,
            PCount: data?.PCount || 0
          }
          setListData(Items)
          setListDataMobile(Items)
          setLoading(false)
          setPageTotal(Total)
          setPageCount(PCount)
          isFilter && setIsFilter(false)
          callback && callback()
          PermissionHelpers.HideErrorAccess()
        }
      })
      .catch(error => console.log(error))
  }

  const onFilter = values => {
    if (_.isEqual(values, filters)) {
      getListServiceNoImage()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onExport = () => {
    let newFilters = {
      From: filters.DateStart,
      To: filters.DateEnd,
      Pi: filters.Pi,
      Ps: filters.Ps,
      StockID: filters.StockID
    }
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getListServiceNoImage(
          BrowserHelpers.getRequestParamsList(newFilters, {
            Total: PageTotal
          })
        ),
      UrlName: '/dich-vu/dich-vu-chua-upload-anh',
      params: filters
    })
  }

  const onPagesChange = ({ Pi, Ps }) => {
    setFilters({ ...filters, Pi, Ps })
  }

  const columns = useMemo(
    () => [
      {
        key: '',
        title: 'STT',
        dataKey: 'index',
        cellRenderer: ({ rowIndex, rowData }) => (
          <Fragment>
            <span className="font-number position-relative zindex-10">
              {filters.Ps * (filters.Pi - 1) + (rowIndex + 1)}
            </span>
          </Fragment>
        ),
        width: 60,
        sortable: false,
        align: 'center',
        className: 'position-relative',
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Id',
        title: 'ID',
        dataKey: 'Id',
        cellRenderer: ({ rowData }) => <div>#{rowData.ID}</div>,
        width: 100,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'OrderID',
        title: 'ID đơn hàng',
        dataKey: 'OrderID',
        cellRenderer: ({ rowData }) => <div>#{rowData.OrderID}</div>,
        width: 120,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'CreateDate',
        title: 'Ngày bán',
        dataKey: 'CreateDate',
        cellRenderer: ({ rowData }) =>
          rowData.CreateDate
            ? moment(rowData.CreateDate).format('HH:mm DD/MM/YYYY')
            : 'Chưa xác định',
        width: 150,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'BookDate',
        title: 'Ngày đặt lịch',
        dataKey: 'BookDate',
        cellRenderer: ({ rowData }) =>
          rowData.BookDate
            ? moment(rowData.BookDate).format('HH:mm DD/MM/YYYY')
            : 'Chưa xác định',
        width: 150,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'StockName',
        title: 'Cơ sở',
        dataKey: 'StockName',
        cellRenderer: ({ rowData }) => {
          return (
            Stocks?.find(x => x.ID === rowData?.StockID)?.Title || 'Chưa có'
          )
        },
        width: 200,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'MemberName',
        title: 'Khách hàng',
        dataKey: 'MemberName',
        cellRenderer: ({ rowData }) => {
          let Member = rowData?.MemberInfo
            ? JSON.parse(rowData?.MemberInfo)
            : null
          return (
            <Text tooltipMaxWidth={300}>{Member?.FullName || 'Chưa có'}</Text>
          )
        },
        width: 200,
        sortable: false
      },
      {
        key: 'MemberPhone',
        title: 'Số điện thoại',
        dataKey: 'MemberPhone',
        cellRenderer: ({ rowData }) => {
          let Member = rowData?.MemberInfo
            ? JSON.parse(rowData?.MemberInfo)
            : null
          return (
            <Text tooltipMaxWidth={300}>
              {Member?.MobilePhone || 'Chưa có'}
            </Text>
          )
        },
        width: 200,
        sortable: false
      },
      {
        key: 'RootTitle',
        title: 'Dịch vụ',
        dataKey: 'RootTitle',
        width: 220,
        sortable: false
      },
      {
        key: 'OrderTitle',
        title: 'Dịch vụ thẻ',
        dataKey: 'OrderTitle',
        width: 250,
        sortable: false
      },
      {
        key: 'SalaryJSON',
        title: 'Nhân viên thực hiện',
        dataKey: 'SalaryJSON',
        cellRenderer: ({ rowData }) => {
          let SalaryJSON = rowData?.SalaryJSON
            ? JSON.parse(rowData?.SalaryJSON)
            : null

          return (
            <Text tooltipMaxWidth={300}>
              {SalaryJSON?.salaryList && SalaryJSON?.salaryList.length > 0
                ? SalaryJSON?.salaryList
                    .map(
                      item =>
                        `${item.StaffName} (${PriceHelper.formatVND(
                          item.Value
                        )})`
                    )
                    .join(', ')
                : 'Chưa xác định'}
            </Text>
          )
        },
        width: 350,
        sortable: false
      }
    ],
    [filters, Stocks]
  )

  const onRefresh = () => {
    getListServiceNoImage()
  }

  const onOpenFilter = () => {
    setIsFilter(true)
  }

  const onHideFilter = () => {
    setIsFilter(false)
  }

  const OpenModalMobile = value => {
    setInitialValuesMobile(value)
    setIsModalMobile(true)
  }

  const HideModalMobile = () => {
    setInitialValuesMobile(null)
    setIsModalMobile(false)
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase font-size-xl fw-600">
            Dịch vụ chưa upload ảnh
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
        <div className="border-gray-200 px-20px py-15px border-bottom d-flex align-items-md-center justify-content-between flex-column flex-md-row">
          <div className="fw-500 font-size-lg">
            Danh sách dịch vụ chưa upload ảnh
          </div>
          <div className="fw-500"></div>
        </div>
        <div className="p-20px">
          <ReactTableV7
            rowKey="ID"
            overscanRowCount={50}
            useIsScrolling
            filters={filters}
            columns={columns}
            data={ListData}
            dataMobile={ListDataMobile}
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
          Stocks={Stocks}
        />
      </div>
    </div>
  )
}

export default ServiceNoImage
