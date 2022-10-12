import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import FilterList from 'src/components/Filter/FilterList'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import reportsApi from 'src/api/reports.api'
import ModalViewMobile from './ModalViewMobile'
import { PriceHelper } from 'src/helpers/PriceHelper'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import { useWindowSize } from 'src/hooks/useWindowSize'
import Text from 'react-texty'
import clsx from 'clsx'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'

import moment from 'moment'
import 'moment/locale/vi'

moment.locale('vi')

function TotalCard(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    DateStart: new Date(), // Ngày bắt đầu
    DateEnd: new Date(), // Ngày kết thúc
    Pi: 1, // Trang hiện tại
    Ps: 15, // Số lượng item
    MemberID: '',
    MoneyCardID: '',
    StatusTT: ''
  })
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [ListData, setListData] = useState([])
  const [Total, setTotal] = useState({})
  const [PageTotal, setPageTotal] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [initialValuesMobile, setInitialValuesMobile] = useState(null)
  const [isModalMobile, setIsModalMobile] = useState(false)
  const { width } = useWindowSize()

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
    getListCardService()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListCardService = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    reportsApi
      .getListTotalCard(BrowserHelpers.getRequestParamsList(filters))
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const { Items, Total, PCount } = {
            Items: data.result?.Items || [],
            Total: data.result?.Total || 0,
            PCount: data.result?.PCount || 0
          }
          setTotal(data.result)
          setPageCount(PCount)
          setListData(Items)
          setLoading(false)
          setPageTotal(Total)
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
    getListCardService()
  }

  const onExport = () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getListTotalCard(
          BrowserHelpers.getRequestParamsList(filters, {
            Total: PageTotal
          })
        ),
      UrlName: '/khac/bao-cao-the-tien'
    })
  }

  const OpenModalMobile = value => {
    setInitialValuesMobile(value)
    setIsModalMobile(true)
  }

  const HideModalMobile = () => {
    setInitialValuesMobile(null)
    setIsModalMobile(false)
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
        title: 'ID',
        dataKey: 'Id',
        cellRenderer: ({ rowData }) => <div>#{rowData.Id}</div>,
        width: 100,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'TenTheTien',
        title: 'Tên thẻ tiền',
        dataKey: 'TenTheTien',
        cellRenderer: ({ rowData }) => (
          <Text tooltipMaxWidth={300}>
            <span className={clsx(rowData?.IsLock && 'text-danger')}>
              {rowData.TenTheTien} {rowData?.IsLock ? `- Đã khóa` : ''}
            </span>
          </Text>
        ),
        width: 220,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'CreateDate',
        title: 'Thời gian mua',
        dataKey: 'CreateDate',
        cellRenderer: ({ rowData }) =>
          moment(rowData.CreateDate).format('HH:mm DD/MM/YYYY'),
        width: 200,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'GiaBan',
        title: 'Giá bán',
        dataKey: 'GiaBan',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.GiaBan),
        width: 150,
        sortable: false
      },
      {
        key: 'TongGiaTri',
        title: 'Tổng giá trị',
        dataKey: 'TongGiaTri',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.TongGiaTri),
        width: 150,
        sortable: false
      },
      {
        key: 'GiaTriChiTieuSP',
        title: 'Giá trị chi tiêu SP',
        dataKey: 'GiaTriChiTieuSP',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.GiaTriChiTieuSP),
        width: 150,
        sortable: false
      },
      {
        key: 'GiaTriChiTieuDV',
        title: 'Giá trị chi tiêu DV',
        dataKey: 'GiaTriChiTieuDV',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.GiaTriChiTieuDV),
        width: 150,
        sortable: false
      },
      {
        key: 'TongChiTieu',
        title: 'Tổng chi tiêu',
        dataKey: 'TongChiTieu',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.TongChiTieu),
        width: 150,
        sortable: false
      },
      {
        key: 'DaChiTieuSP',
        title: 'Đã chi tiêu SP',
        dataKey: 'DaChiTieuSP',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.DaChiTieuSP),
        width: 150,
        sortable: false
      },
      {
        key: 'DaChiTieuDV',
        title: 'Đã chi tiêu DV',
        dataKey: 'DaChiTieuDV',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.DaChiTieuDV),
        width: 150,
        sortable: false
      },
      {
        key: 'TongConLai',
        title: 'Tổng còn lại',
        dataKey: 'TongConLai',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.TongConLai),
        width: 150,
        sortable: false
      },
      {
        key: 'ConLaiSP',
        title: 'Còn lại sản phẩm',
        dataKey: 'ConLaiSP',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.ConLaiSP),
        width: 150,
        sortable: false
      },
      {
        key: 'ConLaiDV',
        title: 'Còn lại dịch vụ',
        dataKey: 'ConLaiDV',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.ConLaiDV),
        width: 150,
        sortable: false
      },
      {
        key: 'Member.FullName',
        title: 'Tên khách hàng',
        dataKey: 'Member.FullName',
        width: 220,
        sortable: false
      },
      {
        key: 'Member.Phone',
        title: 'Tên khách hàng',
        dataKey: 'Member.Phone',
        width: 180,
        sortable: false
      }
    ],
    [filters]
  )

  const rowClassName = ({ rowData }) => {
    if (rowData?.IsExpired) {
      return 'bg-danger-o-90'
    }
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Báo cáo thẻ tiền
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
          <div className="fw-500 font-size-lg">Danh sách thẻ tiền</div>
          {width > 1200 ? (
            <div className="d-flex">
              <div className="fw-500">
                Tổng thu{' '}
                <span className="font-size-xl fw-600 text-success pl-5px font-number">
                  {PriceHelper.formatVND(Total?.TongThu)}
                </span>
              </div>
              <div className="fw-500 pl-20px">
                Tổng giá trị{' '}
                <span className="font-size-xl fw-600 text-success pl-5px font-number">
                  {PriceHelper.formatVND(Total?.TongGiaTri)}
                </span>
              </div>
              <div className="fw-500 pl-20px">
                Tổng chi{' '}
                <span className="font-size-xl fw-600 text-danger pl-5px font-number">
                  {PriceHelper.formatVND(Total?.TongChi)}
                </span>
              </div>
              <div className="fw-500 pl-20px">
                Còn lại{' '}
                <span className="font-size-xl fw-600 text-success pl-5px font-number">
                  {PriceHelper.formatVND(Total?.ConLai)}
                </span>
              </div>
            </div>
          ) : (
            <div className="fw-500 d-flex align-items-center">
              Còn lại
              <OverlayTrigger
                rootClose
                trigger="click"
                key="bottom"
                placement="bottom"
                overlay={
                  <Popover id={`popover-positioned-top`}>
                    <Popover.Header
                      className="py-10px text-uppercase fw-600"
                      as="h3"
                    >
                      Chi tiết thẻ tiền
                    </Popover.Header>
                    <Popover.Body className="p-0">
                      <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                        <span>Tổng thu</span>
                        <span>
                          {PriceHelper.formatVNDPositive(Total.TongThu)}
                        </span>
                      </div>
                      <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                        <span>Tổng giá trị</span>
                        <span>
                          {PriceHelper.formatVNDPositive(Total.TongGiaTri)}
                        </span>
                      </div>
                      <div className="py-10px px-15px fw-600 font-size-md border-gray-200 d-flex justify-content-between">
                        <span>Tổng chi</span>
                        <span>
                          {PriceHelper.formatVNDPositive(Total.TongChi)}
                        </span>
                      </div>
                    </Popover.Body>
                  </Popover>
                }
              >
                <div className="d-flex justify-content-between align-items-center">
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {PriceHelper.formatVNDPositive(Total.ConLai)}
                  </span>
                  <i className="fa-solid fa-circle-exclamation cursor-pointer text-success ml-5px"></i>
                </div>
              </OverlayTrigger>
            </div>
          )}
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
            rowClassName={rowClassName}
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

export default TotalCard
