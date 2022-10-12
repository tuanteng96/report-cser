import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterList from 'src/components/Filter/FilterList'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import { PriceHelper } from 'src/helpers/PriceHelper'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import ModalViewMobile from './ModalViewMobile'
import reportsApi from 'src/api/reports.api'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import Text from 'react-texty'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'

import moment from 'moment'
import 'moment/locale/vi'

moment.locale('vi')

function Returns(props) {
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
  const [StockName, setStockName] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [isFilter, setIsFilter] = useState(false)
  const [ListData, setListData] = useState([])
  const [Total, setTotal] = useState({ ToPay: 0 })
  const [pageCount, setPageCount] = useState(0)
  const [PageTotal, setPageTotal] = useState(0)
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
    getListReturns()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListReturns = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    reportsApi
      .getListReturns(BrowserHelpers.getRequestParamsList(filters))
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const { Items, Total, ToPay, PCount } = {
            Items: data.result?.Items || [],
            Total: data.result?.Total || 0,
            PCount: data?.result?.PCount || 0,
            ToPay: data.result?.ToPay || 0
          }
          setListData(Items)
          setPageCount(PCount)
          setTotal({ ToPay })
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
      getListReturns()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onExport = () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getListReturns(
          BrowserHelpers.getRequestParamsList(filters, {
            Total: PageTotal
          })
        ),
      UrlName: '/ban-hang/tra-hang'
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
        key: 'Id',
        title: 'Mã đơn hàng',
        dataKey: 'Id',
        cellRenderer: ({ rowData }) => <div>#{rowData.Id}</div>,
        width: 120,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'StockName',
        title: 'Cơ sở',
        dataKey: 'StockName',
        cellRenderer: ({ rowData }) => rowData.StockName || 'Chưa có',
        width: 200,
        sortable: false
      },
      {
        key: 'CreateDate',
        title: 'Ngày tạo',
        dataKey: 'CreateDate',
        cellRenderer: ({ rowData }) =>
          moment(rowData.CreateDate).format('HH:mm DD/MM/YYYY'),
        width: 150,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'MemberName',
        title: 'Tên khách hàng',
        dataKey: 'MemberName',
        width: 200,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'MemberPhone',
        title: 'Số điện thoại',
        dataKey: 'MemberPhone',
        cellRenderer: ({ rowData }) => rowData.MemberPhone || 'Không có',
        width: 200,
        sortable: false
      },
      {
        key: 'ToPay',
        title: 'Giá trị',
        dataKey: 'ToPay',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.ToPay),
        width: 180,
        sortable: false
      },
      {
        key: 'Prod',
        title: 'Đơn hàng trả lại',
        dataKey: 'Prod',
        cellRenderer: ({ rowData }) => (
          <Text tooltipMaxWidth={300}>{`${
            rowData.Prod ? `${rowData.Prod} ` : ''
          }${rowData.Svr ? ',' : ''}${rowData.Svr || ''}`}</Text>
        ),
        width: 300,
        sortable: false,
        className: 'flex-fill'
      }
    ],
    [filters]
  )

  const onRefresh = () => {
    getListReturns()
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
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Trả hàng
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
          <div className="fw-500 font-size-lg">Danh sách trả hàng</div>
          <div className="d-flex align-items-center">
            <div className="fw-500 pr-5px pr-md-15px">
              Tổng đơn trả
              <span className="font-size-xl fw-600 text-danger pl-5px font-number">
                {PriceHelper.formatVND(PageTotal)}
              </span>
            </div>
            <div className="fw-500 d-none d-md-block">
              Tổng giá trị
              <span className="font-size-xl fw-600 text-success pl-5px font-number">
                {PriceHelper.formatVND(Total.ToPay)}
              </span>
            </div>
            <OverlayTrigger
              rootClose
              trigger="click"
              key="top"
              placement="top"
              overlay={
                <Popover id={`popover-positioned-top`}>
                  <Popover.Body className="p-0">
                    <div className="py-10px px-15px fw-600 font-size-md border-gray-200 d-flex justify-content-between">
                      <span>Tổng giá trị</span>
                      <span>{PriceHelper.formatVND(Total.ToPay)}</span>
                    </div>
                  </Popover.Body>
                </Popover>
              }
            >
              <i className="fa-solid fa-circle-exclamation cursor-pointer text-warning ml-5px font-size-h5 d-md-none"></i>
            </OverlayTrigger>
          </div>
        </div>
        <div className="p-20px">
          <ReactTableV7
            rowKey="Id"
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

export default Returns
