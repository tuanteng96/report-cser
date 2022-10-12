import React, { useEffect, useMemo, useState } from 'react'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import FilterList from 'src/components/Filter/FilterList'
import { useSelector } from 'react-redux'
import _ from 'lodash'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import reportsApi from 'src/api/reports.api'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import ModalViewMobile from './ModalViewMobile'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'

import moment from 'moment'
import 'moment/locale/vi'

moment.locale('vi')

function CustomerUseApp(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    DateStart: moment().startOf('month').toDate(),
    DateEnd: moment().endOf('month').toDate(),
    Pi: 1, // Trang hiện tại
    Ps: 15, // Số lượng item
    apptype: '',
    onoff: ''
  })
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [ListData, setListData] = useState([])
  const [loading, setLoading] = useState(false)
  const [PageTotal, setPageTotal] = useState(0)
  const [Total, setTotal] = useState({
    Android: 0,
    IOS: 0
  })
  const [pageCount, setPageCount] = useState(0)
  const [initialValuesMobile, setInitialValuesMobile] = useState(null)
  const [isModalMobile, setIsModalMobile] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)

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
    getListCustomer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListCustomer = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    reportsApi
      .getListUseCustomerApp(BrowserHelpers.getRequestParamsList(filters))
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const { Items, Total, PCount, Android, IOS } = {
            Items: data.result?.Items || [],
            Total: data.result?.Total || 0,
            Android: data.result?.Android || 0,
            IOS: data.result?.IOS || 0,
            PCount: data?.result?.PCount || 0
          }
          setListData(Items)
          setLoading(false)
          setPageTotal(Total)
          setPageCount(PCount)
          setTotal({ Android, IOS })
          isFilter && setIsFilter(false)
          callback && callback()
          PermissionHelpers.HideErrorAccess()
        }
      })
      .catch(error => console.log(error))
  }

  const onOpenFilter = () => {
    setIsFilter(true)
  }

  const onHideFilter = () => {
    setIsFilter(false)
  }

  const onFilter = values => {
    if (_.isEqual(values, filters)) {
      onRefresh()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    getListCustomer()
  }

  const onExport = () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getListUseCustomerApp(
          BrowserHelpers.getRequestParamsList(filters, {
            Total: PageTotal
          })
        ),
      UrlName: '/khach-hang/su-dung-app'
    })
  }

  const onPagesChange = ({ Pi, Ps }) => {
    setFilters({ ...filters, Pi, Ps })
  }

  const columns = useMemo(
    () => [
      {
        key: 'index',
        title: 'STT',
        dataKey: 'index',
        cellRenderer: ({ rowIndex }) =>
          filters.Ps * (filters.Pi - 1) + (rowIndex + 1),
        width: 60,
        sortable: false,
        align: 'center',
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'MemberID',
        title: 'ID',
        dataKey: 'MemberID',
        cellRenderer: ({ rowData }) =>
          rowData.MemberID ? `#${rowData.MemberID}` : 'Không xác định',
        width: 150,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'FullName',
        title: 'Tên khách hàng',
        dataKey: 'FullName',
        width: 250,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'MobilePhone',
        title: 'Số điện thoại',
        dataKey: 'MobilePhone',
        width: 200,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'App',
        title: 'Thiết bị cài đặt',
        dataKey: 'App',
        cellRenderer: ({ rowData }) =>
          BrowserHelpers.getOperatingSystem(rowData?.App?.app),
        width: 250,
        sortable: false
      },
      {
        key: 'Status',
        title: 'Trạng thái',
        dataKey: 'Status',
        cellRenderer: ({ rowData }) =>
          rowData?.LogoutDate ? (
            <span className="text-danger fw-700 text-italic">
              Offline - {moment(rowData?.LogoutDate).format('HH:mm DD-MM-YYYY')}
            </span>
          ) : (
            <span className="text-success fw-700 text-italic">Online</span>
          ),
        className: 'flex-fill',
        width: 250
      }
    ],
    [filters]
  )

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
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Báo cáo cài đặt APP
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
          <div className="fw-500 font-size-lg">Khách hàng cài đặt APP</div>
          <div>
            <div className="fw-500 pl-15px">
              Tổng khách hàng
              <span className="font-size-xl fw-600 text-success pl-5px font-number">
                {PageTotal}
              </span>
              <OverlayTrigger
                rootClose
                trigger="click"
                key="top"
                placement="top"
                overlay={
                  <Popover id={`popover-positioned-top`}>
                    <Popover.Body className="p-0">
                      <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                        <span>Cài Android</span>
                        <span>{Total.Android}</span>
                      </div>
                      <div className="py-10px px-15px fw-600 font-size-md border-gray-200 d-flex justify-content-between">
                        <span>Cài IOS</span>
                        <span>{Total.IOS}</span>
                      </div>
                    </Popover.Body>
                  </Popover>
                }
              >
                <i className="fa-solid fa-circle-exclamation cursor-pointer text-warning ml-5px font-size-h6 vertical-align-text-top d-none d-sm-inline-block"></i>
              </OverlayTrigger>
            </div>
          </div>
        </div>
        <div className="p-20px">
          <ReactTableV7
            rowKey="CreateDate"
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

export default CustomerUseApp
