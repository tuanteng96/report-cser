import React, { useEffect, useState, useRef, useMemo, Fragment } from 'react'
import { useSelector } from 'react-redux'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import reportsApi from 'src/api/reports.api'
import ChartYear from './ChartYear'
import ChartWeek from './ChartWeek'
import LoadingSkeleton from './LoadingSkeleton'
import { PriceHelper } from 'src/helpers/PriceHelper'
import ChartCircle from './ChartCircle'
import { useWindowSize } from 'src/hooks/useWindowSize'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import Text from 'react-texty'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import ModalViewMobile from './ModalViewMobile'
import clsx from 'clsx'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'
import FilterListAdvanced from 'src/components/Filter/FilterListAdvanced'

import moment from 'moment'
import 'moment/locale/vi'

moment.locale('vi')

function Sales(props) {
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
    Voucher: '', // Trạng thái
    Payment: '', // Bảo hành
    IsMember: '', // Loại khách hàng
    MemberID: '', // ID khách hàng
    SourceName: '',
    ShipCode: '',
    ShowsX: '2',
    DebtFrom: '',
    DebtTo: '',
    no: ''
  })
  const [StockName, setStockName] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [isFilter, setIsFilter] = useState(false)
  const [dataSell, setDataSell] = useState({})
  const [loadingTable, setLoadingTable] = useState(false)
  const [ListData, setListData] = useState([])
  const [PageTotal, setPageTotal] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [Total, setTotal] = useState({
    ConNo: 0,
    DaThToan: 0,
    DaThToan_CK: 0,
    DaThToan_QT: 0,
    DaThToan_TM: 0,
    DaThToan_ThTien: 0,
    DaThToan_Vi: 0,
    ReducedValue: 0,
    ToPay: 0,
    TotalValue: 0,
    Value: 0
  })
  const [initialValuesMobile, setInitialValuesMobile] = useState(null)
  const [isModalMobile, setIsModalMobile] = useState(false)
  const [heightElm, setHeightElm] = useState(0)
  const elementRef = useRef(null)
  const { width } = useWindowSize()

  useEffect(() => {
    if (width > 767) {
      setHeightElm(elementRef?.current?.clientHeight || 0)
    } else {
      setHeightElm(350)
    }
  }, [elementRef, width])

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
    getOverviewSell()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.DateStart, filters.DateEnd, filters.StockID])

  useEffect(() => {
    getListServices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getOverviewSell = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    const newFilters = {
      StockID: filters.StockID,
      DateStart: filters.DateStart
        ? moment(filters.DateStart).format('DD/MM/yyyy')
        : null,
      DateEnd: filters.DateEnd
        ? moment(filters.DateEnd).format('DD/MM/yyyy')
        : null
    }

    reportsApi
      .getOverviewSell(newFilters)
      .then(({ data }) => {
        if (data.isRight) {
          //PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          setDataSell({
            ...data.result,
            SellWeek: data?.result
              ? [
                  data?.result?.DSo_ThisMonday,
                  data?.result?.DSo_ThisTuesday,
                  data?.result?.DSo_ThisWednesday,
                  data?.result?.DSo_ThisThursday,
                  data?.result?.DSo_ThisFriday,
                  data?.result?.DSo_ThisSaturday,
                  data?.result?.DSo_ThisSunday
                ]
              : [],
            SellYear: data?.result
              ? [
                  data?.result?.DSo_ThisJanuary,
                  data?.result?.DSo_ThisFebruary,
                  data?.result?.DSo_ThisMarch,
                  data?.result?.DSo_ThisApril,
                  data?.result?.DSo_ThisMay,
                  data?.result?.DSo_ThisJune,
                  data?.result?.DSo_ThisJuly,
                  data?.result?.DSo_ThisAugust,
                  data?.result?.DSo_ThisSeptember,
                  data?.result?.DSo_ThisOctober,
                  data?.result?.DSo_ThisNovember,
                  data?.result?.DSo_ThisDecember
                ]
              : []
          })
          setLoading(false)
          !loadingTable && isFilter && setIsFilter(false)
          callback && callback()
          //PermissionHelpers.HideErrorAccess()
        }
      })
      .catch(error => console.log(error))
  }

  const getListServices = (isLoading = true, callback) => {
    isLoading && setLoadingTable(true)
    reportsApi
      .getListSell({
        ...BrowserHelpers.getRequestParamsList(filters),
        ShowsX: filters.ShowsX === '11' ? '1' : filters.ShowsX
      })
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoadingTable(false)
        } else {
          const {
            Items,
            Total,
            PCount,
            ConNo,
            DaThToan,
            DaThToan_CK,
            DaThToan_QT,
            DaThToan_TM,
            DaThToan_ThTien,
            DaThToan_Vi,
            ReducedValue,
            ToPay,
            TotalValue,
            Value
          } = {
            Items: data.result?.Items || [],
            Total: data.result?.Total || 0,
            PCount: data?.result?.PCount || 0,
            ConNo: data.result?.ConNo || 0,
            DaThToan: data.result?.DaThToan || 0,
            DaThToan_CK: data.result?.DaThToan_CK || 0,
            DaThToan_QT: data.result?.DaThToan_QT || 0,
            DaThToan_TM: data.result?.DaThToan_TM || 0,
            DaThToan_ThTien: data.result?.DaThToan_ThTien || 0,
            DaThToan_Vi: data.result?.DaThToan_Vi || 0,
            ReducedValue: data.result?.ReducedValue || 0,
            ToPay: data.result?.ToPay || 0,
            TotalValue: data.result?.TotalValue || 0,
            Value: data.result?.Value || 0
          }
          setListData(Items)
          setTotal({
            ConNo,
            DaThToan,
            DaThToan_CK,
            DaThToan_QT,
            DaThToan_TM,
            DaThToan_ThTien,
            DaThToan_Vi,
            ReducedValue,
            ToPay,
            TotalValue,
            Value
          })
          setLoadingTable(false)
          setPageTotal(Total)
          setPageCount(PCount)
          !loading && isFilter && setIsFilter(false)
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

  const onRefresh = () => {
    getOverviewSell()
    getListServices()
  }

  const onOpenFilter = () => {
    setIsFilter(true)
  }

  const onHideFilter = () => {
    setIsFilter(false)
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
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'CreateDate',
        title: 'Ngày',
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
        key: 'MemberID',
        title: 'Mã khách hàng',
        dataKey: 'MemberID',
        cellRenderer: ({ rowData }) => <div>#{rowData.MemberID}</div>,
        width: 140,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'MemberName',
        title: 'Khách hàng',
        dataKey: 'MemberName',
        cellRenderer: ({ rowData }) => rowData.MemberName || 'Không có tên',
        width: 200,
        sortable: false
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
        key: 'MemberSource',
        title: 'Nguồn khách hàng',
        dataKey: 'MemberSource',
        cellRenderer: ({ rowData }) => rowData.MemberSource || 'Không xác định',
        width: 200,
        sortable: false,
        hidden: filters.ShowsX === '2'
      },
      {
        key: 'Value',
        title: 'Nguyên giá',
        dataKey: 'Value',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.Value),
        width: 180,
        sortable: false
      },
      {
        key: 'ReducedValue',
        title: 'Giảm / Tăng giá',
        dataKey: 'ReducedValue',
        cellRenderer: ({ rowData }) => (
          <span
            className={`${clsx({
              'text-danger fw-500': rowData.ReducedValue < 0
            })}`}
          >
            {PriceHelper.formatValueVoucher(rowData.ReducedValue)}
          </span>
        ),
        width: 200,
        sortable: false
      },
      {
        key: 'TotalValue',
        title: 'Tổng tiền',
        dataKey: 'TotalValue',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.TotalValue),
        width: 180,
        sortable: false
      },
      {
        key: 'VoucherCode',
        title: 'Voucher',
        dataKey: 'VoucherCode',
        cellRenderer: ({ rowData }) => rowData.VoucherCode || 'Chưa có',
        width: 200,
        sortable: false
      },
      {
        key: 'ToMoney',
        title: 'Còn lại',
        dataKey: 'ToMoney',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.ToMoney),
        width: 200,
        sortable: false
      },
      {
        key: 'CustomeDiscount',
        title: 'Giảm giá cả đơn',
        dataKey: 'CustomeDiscount',
        cellRenderer: ({ rowData }) =>
          rowData.CustomeDiscount > 100
            ? PriceHelper.formatVND(rowData.CustomeDiscount)
            : `${rowData.CustomeDiscount}%`,
        width: 200,
        sortable: false
      },
      {
        key: 'ToMoneyToPay',
        title: 'Giá trị giảm cả đơn',
        dataKey: 'ToMoneyToPay',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.ToMoney - rowData.ToPay),
        width: 200,
        sortable: false
      },
      {
        key: 'ToPay',
        title: 'Cần thanh toán',
        dataKey: 'ToPay',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.ToPay),
        width: 180,
        sortable: false
      },
      {
        key: 'Khau_tru',
        title: 'Khấu trừ Trả hàng - KT',
        dataKey: 'Khau_tru',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.Khau_tru),
        width: 180,
        sortable: false
      },
      {
        key: 'Tong_TToan',
        title: 'Tổng đã thanh toán',
        dataKey: 'Tong_TToan',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(
            rowData.DaThToan +
              Math.abs(rowData.DaThToan_ThTien) +
              Math.abs(rowData.DaThToan_Vi)
          ),
        width: 180,
        sortable: false
      },
      {
        key: 'DaThToan',
        title: 'TM+CK+QT',
        dataKey: 'DaThToan',
        cellRenderer: ({ rowData }) => (
          <OverlayTrigger
            rootClose
            trigger="click"
            key="top"
            placement="top"
            overlay={
              <Popover id={`popover-positioned-top`}>
                <Popover.Header
                  className="py-10px text-uppercase fw-600"
                  as="h3"
                >
                  Chi tiết thanh toán #{rowData.Id}
                </Popover.Header>
                <Popover.Body className="p-0">
                  <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                    <span>Tiền mặt</span>
                    <span>{PriceHelper.formatVND(rowData.DaThToan_TM)}</span>
                  </div>
                  <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                    <span>Chuyển khoản</span>
                    <span>{PriceHelper.formatVND(rowData.DaThToan_CK)}</span>
                  </div>
                  <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                    <span>Quẹt thẻ</span>
                    <span>{PriceHelper.formatVND(rowData.DaThToan_QT)}</span>
                  </div>
                </Popover.Body>
              </Popover>
            }
          >
            <div className="d-flex justify-content-between align-items-center w-100">
              {PriceHelper.formatVND(rowData.DaThToan)}
              <i className="cursor-pointer fa-solid fa-circle-exclamation text-warning"></i>
            </div>
          </OverlayTrigger>
        ),
        width: 180,
        sortable: false
      },
      {
        key: 'DaThToan_Vi',
        title: 'Ví',
        dataKey: 'DaThToan_Vi',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.DaThToan_Vi),
        width: 180,
        sortable: false
      },
      {
        key: 'DaThToan_ThTien',
        title: 'Thẻ tiền',
        dataKey: 'DaThToan_ThTien',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.DaThToan_ThTien),
        width: 180,
        sortable: false
      },
      {
        key: 'ConNo',
        title: 'Còn nợ',
        dataKey: 'ConNo',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.ConNo),
        width: 180,
        sortable: false
      },
      {
        key: 'DayToPay',
        title: 'Ngày hẹn thanh toán',
        dataKey: 'DayToPay',
        cellRenderer: ({ rowData }) =>
          rowData.DayToPay ? moment(rowData.DayToPay).format('DD-MM-YYYY') : '',
        width: 180,
        sortable: false
      },
      {
        key: 'IsNewMember',
        title: 'Loại',
        dataKey: 'IsNewMember',
        cellRenderer: ({ rowData }) => (
          <span
            className={`${clsx({
              'text-success': rowData.IsNewMember === 1
            })} fw-500`}
          >
            Khách {rowData.IsNewMember === 0 ? 'Cũ' : 'Mới'}
          </span>
        ),
        width: 150,
        sortable: false,
        hidden: filters.ShowsX === '2'
      },
      {
        key: 'ShipCode',
        title: 'Ship Code',
        dataKey: 'ShipCode',
        width: 180,
        sortable: false,
        hidden: filters.ShowsX === '2'
      },
      {
        key: 'Desc',
        title: 'Ghi chú',
        dataKey: 'Desc',
        width: 250,
        sortable: false
      },
      {
        key: 'Prod',
        title: 'Chi tiết',
        dataKey: 'Prod',
        cellRenderer: ({ rowData }) => (
          <Text tooltipMaxWidth={300}>
            {[rowData?.Prod || '', rowData?.Svr || '', rowData?.PP || '']
              .filter(x => x)
              .join('; ')}
          </Text>
        ),
        width: 300,
        sortable: false
      }
    ],
    [filters]
  )

  const onPagesChange = ({ Pi, Ps }) => {
    setFilters({ ...filters, Pi, Ps })
  }

  const onExport = async () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getListSell(
          BrowserHelpers.getRequestParamsList(
            {
              ...filters,
              ShowsX: filters.ShowsX === '11' ? '1' : filters.ShowsX,
              ShowsX2: filters.ShowsX === '11'
            },
            {
              Total: PageTotal
            }
          )
        ),
      UrlName: '/ban-hang/doanh-so'
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

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase font-size-xl fw-600">Doanh số</span>
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
      <FilterListAdvanced
        show={isFilter}
        filters={filters}
        onHide={onHideFilter}
        onSubmit={onFilter}
        onRefresh={onRefresh}
        loading={loading}
        loadingExport={loadingExport}
        onExport={onExport}
        regimes={[
          {
            label: 'Nhanh',
            value: '2'
          },
          {
            label: 'Tiêu Chuẩn',
            value: '0'
          },
          {
            label: 'Tách dòng',
            value: '1'
          },
          {
            label: 'Tách dòng 2',
            value: '11'
          }
        ]}
      />
      <div className="row">
        <div className="col-md-12 col-lg-5" ref={elementRef}>
          {loading && <LoadingSkeleton filters={filters} />}
          {!loading && (
            <div className="bg-white rounded report-sell-overview">
              <div
                className="text-white rounded p-30px elm-top"
                style={{ backgroundColor: '#f54e60' }}
              >
                <div className="mb-15px d-flex justify-content-between align-items-end">
                  <span className="text-uppercase fw-600 font-size-xl">
                    Doanh số bán hàng
                  </span>
                  {/* <span className="date">
                    {moment(filters.Date).format('ddd, ll')}
                  </span> */}
                </div>
                <div className="py-3 text-center font-number py-md-5 fw-600 total">
                  +{PriceHelper.formatVND(dataSell.DSo_Ngay)}
                </div>
              </div>
              <div className="p-25px" style={{ marginTop: '-60px' }}>
                <div className="row">
                  <div className="col-md-6">
                    <div
                      className="p-4 rounded mb-20px"
                      style={{ backgroundColor: '#E1F0FF', color: '#3699FF' }}
                    >
                      <i className="fa-solid fa-money-bill-wave font-size-30"></i>
                      <div className="font-number fw-600 mt-10px d-flex align-items-center">
                        <span className="total-2">
                          {PriceHelper.formatVND(dataSell.DSo_TToan)}
                        </span>
                        <OverlayTrigger
                          rootClose
                          trigger="click"
                          key="top"
                          placement="top"
                          overlay={
                            <Popover id={`popover-positioned-top`}>
                              <Popover.Header
                                className="py-10px text-uppercase fw-600"
                                as="h3"
                              >
                                Chi tiết thanh toán
                              </Popover.Header>
                              <Popover.Body className="p-0">
                                <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                  <span>Tiền mặt</span>
                                  <span>
                                    {PriceHelper.formatVND(
                                      dataSell.DSo_TToan_TMat
                                    )}
                                  </span>
                                </div>
                                <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                  <span>Chuyển khoản</span>
                                  <span>
                                    {PriceHelper.formatVND(
                                      dataSell.DSo_TToan_CKhoan
                                    )}
                                  </span>
                                </div>
                                <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                                  <span>Quẹt thẻ</span>
                                  <span>
                                    {PriceHelper.formatVND(
                                      dataSell.DSo_TToan_QThe
                                    )}
                                  </span>
                                </div>
                              </Popover.Body>
                            </Popover>
                          }
                        >
                          <i className="cursor-pointer fa-solid fa-circle-exclamation font-size-xl pl-5px"></i>
                        </OverlayTrigger>
                      </div>
                      <div className="">Thanh toán</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div
                      className="p-4 rounded mb-20px"
                      style={{ backgroundColor: '#FFF4DE', color: '#FFA800' }}
                    >
                      <i className="fa-solid fa-wallet font-size-30"></i>
                      <div className="font-number total-2 fw-600 mt-10px">
                        {PriceHelper.formatVNDPositive(dataSell.DSo_TToan_Vi)}
                      </div>
                      <div className="">Thanh toán từ ví</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div
                      className="p-4 mb-4 rounded mb-md-0"
                      style={{ backgroundColor: '#C9F7F5', color: '#1BC5BD' }}
                    >
                      <i className="fa-solid fa-id-card font-size-30"></i>
                      <div className="font-number total-2 fw-600 mt-10px">
                        {PriceHelper.formatVNDPositive(
                          dataSell.DSo_TToan_ThTien
                        )}
                      </div>
                      <div className="">Từ thẻ tiền</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div
                      className="p-4 rounded"
                      style={{ backgroundColor: '#FFE2E5', color: '#F64E60' }}
                    >
                      <i className="fa-solid fa-credit-card-blank font-size-30"></i>
                      <div className="font-number total-2 fw-600 mt-10px">
                        {PriceHelper.formatVNDPositive(dataSell.DSo_No_PSinh)}
                      </div>
                      <div className="">Nợ phát sinh</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="col-md-12 col-lg-7">
          <div className="row">
            <div className="col-md-12">
              <div
                className="p-4 mt-4 bg-white rounded w-100 mt-lg-0"
                style={{ height: heightElm > 0 ? `${heightElm}px` : 'auto' }}
              >
                <ChartCircle
                  loading={loading}
                  height={heightElm > 0 ? `${heightElm}px` : 'auto'}
                  data={dataSell.product1Days}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded mt-25px">
        <div className="border-gray-200 px-20px py-15px border-bottom d-flex align-items-center justify-content-between">
          <div className="fw-500 font-size-lg">Danh sách đơn hàng</div>
          <div className="d-flex">
            <div className="fw-500 pr-sm-15px d-flex align-items-center">
              <div className="fw-500 pl-15px">
                Tổng ĐH{' '}
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
                        <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                          <span>Nguyên giá</span>
                          <span>{PriceHelper.formatVND(Total.Value)}</span>
                        </div>
                        <div className="border-gray-200 py-10px px-15px fw-600 font-size-md d-flex justify-content-between">
                          <span>Giảm giá</span>
                          <span>
                            {PriceHelper.formatVND(Total.ReducedValue)}
                          </span>
                        </div>
                      </Popover.Body>
                    </Popover>
                  }
                >
                  <i className="cursor-pointer fa-solid fa-circle-exclamation text-warning ml-5px font-size-h6 vertical-align-text-top d-none d-sm-inline-block"></i>
                </OverlayTrigger>
              </div>
              {width <= 1200 && (
                <OverlayTrigger
                  rootClose
                  trigger="click"
                  key="top"
                  placement="top"
                  overlay={
                    <Popover id={`popover-positioned-top`}>
                      <Popover.Body className="p-0">
                        <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between d-md-none">
                          <span>Cần thanh toán</span>
                          <span>{PriceHelper.formatVND(Total.ToPay)}</span>
                        </div>
                        <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                          <span>TM+CK+QT</span>
                          <span>{PriceHelper.formatVND(Total.DaThToan)}</span>
                        </div>
                        <div className="border-gray-200 py-10px px-15px fw-400 font-size-md border-bottom d-flex justify-content-between">
                          <span>Đã thanh toán TM</span>
                          <span>
                            {PriceHelper.formatVND(Total.DaThToan_TM)}
                          </span>
                        </div>
                        <div className="border-gray-200 py-10px px-15px fw-400 font-size-md border-bottom d-flex justify-content-between">
                          <span>Đã thanh toán CK</span>
                          <span>
                            {PriceHelper.formatVND(Total.DaThToan_CK)}
                          </span>
                        </div>
                        <div className="border-gray-200 py-10px px-15px fw-400 font-size-md border-bottom d-flex justify-content-between">
                          <span>Đã thanh toán QT</span>
                          <span>
                            {PriceHelper.formatVND(Total.DaThToan_QT)}
                          </span>
                        </div>
                        <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                          <span>Ví</span>
                          <span>
                            {PriceHelper.formatVNDPositive(Total.DaThToan_Vi)}
                          </span>
                        </div>
                        <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                          <span>Thẻ tiền</span>
                          <span>
                            {PriceHelper.formatVNDPositive(
                              Total.DaThToan_ThTien
                            )}
                          </span>
                        </div>
                        <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                          <span>Còn nợ</span>
                          <span>
                            {PriceHelper.formatVNDPositive(Total.ConNo)}
                          </span>
                        </div>
                      </Popover.Body>
                    </Popover>
                  }
                >
                  <i className="cursor-pointer fa-solid fa-circle-exclamation text-warning ml-5px font-size-h5"></i>
                </OverlayTrigger>
              )}
            </div>
            {width >= 1200 && (
              <Fragment>
                <div className="fw-500 pr-15px">
                  Tổng tiền{' '}
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {PriceHelper.formatVND(Total.TotalValue)}
                  </span>
                </div>
                <div className="fw-500 pr-15px">
                  Cần T.Toán{' '}
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {PriceHelper.formatVND(Total.ToPay)}
                  </span>
                </div>
                <div className="fw-500 pr-15px">
                  TM+CK+QT{' '}
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {PriceHelper.formatVND(Total.DaThToan)}
                  </span>
                  <OverlayTrigger
                    rootClose
                    trigger="click"
                    key="top"
                    placement="top"
                    overlay={
                      <Popover id={`popover-positioned-top`}>
                        <Popover.Body className="p-0">
                          <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                            <span>Tiền mặt</span>
                            <span>
                              {PriceHelper.formatVND(Total.DaThToan_TM)}
                            </span>
                          </div>
                          <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                            <span>Chuyển khoản</span>
                            <span>
                              {PriceHelper.formatVND(Total.DaThToan_CK)}
                            </span>
                          </div>
                          <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                            <span>Quẹt thẻ</span>
                            <span>
                              {PriceHelper.formatVND(Total.DaThToan_QT)}
                            </span>
                          </div>
                        </Popover.Body>
                      </Popover>
                    }
                  >
                    <i className="cursor-pointer fa-solid fa-circle-exclamation text-warning ml-5px font-size-h6 vertical-align-text-top"></i>
                  </OverlayTrigger>
                </div>
                <div className="fw-500 pr-15px">
                  Ví{' '}
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {PriceHelper.formatVNDPositive(Total.DaThToan_Vi)}
                  </span>
                </div>
                <div className="fw-500 pr-15px">
                  Thẻ tiền{' '}
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {PriceHelper.formatVNDPositive(Total.DaThToan_ThTien)}
                  </span>
                </div>
                <div className="fw-500">
                  Nợ{' '}
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {PriceHelper.formatVNDPositive(Total.ConNo)}
                  </span>
                </div>
              </Fragment>
            )}
          </div>
        </div>
        <div className="p-20px">
          <ReactTableV7
            rowKey="Id"
            filters={filters}
            columns={columns}
            data={ListData}
            loading={loadingTable}
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
      <div className="row">
        <div className="col-md-6">
          <div className="bg-white rounded mt-20px">
            <div className="border-gray-200 px-20px py-15px border-bottom d-flex align-items-center justify-content-between">
              <div className="fw-500 font-size-lg">Doanh số theo tuần</div>
            </div>
            <div className="p-20px">
              <ChartWeek loading={loading} data={dataSell.SellWeek} />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="bg-white rounded mt-20px">
            <div className="border-gray-200 px-20px py-15px border-bottom d-flex align-items-center justify-content-between">
              <div className="fw-500 font-size-lg">Doanh số theo năm</div>
            </div>
            <div className="p-20px">
              <ChartYear loading={loading} data={dataSell.SellYear} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sales
