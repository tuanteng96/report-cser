import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import _ from 'lodash'
import reportsApi from 'src/api/reports.api'
import { ColorsHelpers } from 'src/helpers/ColorsHelpers'
import ElementEmpty from 'src/components/Empty/ElementEmpty'
import LoadingChart from 'src/components/Loading/LoadingChart'
import { TextHelper } from 'src/helpers/TextHelpers'
import { useWindowSize } from 'src/hooks/useWindowSize'
import FilterList from 'src/components/Filter/FilterList'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import LoadingSkeleton from './LoadingSkeleton'
import ChartWidget2 from 'src/features/Reports/components/ChartWidget2'
import ChartPie from 'src/features/Reports/components/ChartPie'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import Text from 'react-texty'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'
import ModalViewMobile from './ModalViewMobile'
import { PriceHelper } from 'src/helpers/PriceHelper'
import { OverlayTrigger, Popover, Tooltip } from 'react-bootstrap'

import moment from 'moment'
import 'moment/locale/vi'

moment.locale('vi')

const optionsObj = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right'
    },
    title: {
      display: false,
      text: 'Biểu đồ dịch vụ'
    }
  }
}

const objData = {
  labels: [],
  datasets: [
    {
      label: '# of Votes',
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1
    }
  ]
}

function OverviewService(props) {
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
    Status: '', // Trạng thái
    Warranty: '', // Bảo hành
    StaffID: '', // ID nhân viên
    StarRating: '' // Đánh giá sao
  })
  const [dataChart, setDataChart] = useState(objData)
  const [optionsChart, setOptionsChart] = useState(optionsObj)
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [OverviewData, setOverviewData] = useState(null)
  //
  const [ListData, setListData] = useState([])
  const [loadingTable, setLoadingTable] = useState(false)
  const [PageTotal, setPageTotal] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [initialValuesMobile, setInitialValuesMobile] = useState(null)
  const [isModalMobile, setIsModalMobile] = useState(false)
  const [Total, setTotal] = useState({
    Totalbuoicuoi: 0,
    Totalbuoidau: 0,
    Totalisfirst: 0,
    Totalrequest: 0
  })
  const [heightElm, setHeightElm] = useState(0)
  const elementRef = useRef(null)
  const { width } = useWindowSize()

  useEffect(() => {
    if (width > 767) {
      setOptionsChart(prevState => ({
        ...prevState,
        plugins: {
          ...prevState.plugins,
          legend: {
            position: 'right'
          }
        }
      }))
    } else {
      setOptionsChart(prevState => ({
        ...prevState,
        plugins: {
          ...prevState.plugins,
          legend: {
            position: 'bottom'
          }
        }
      }))
    }
  }, [width])

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
    getOverviewService()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.DateStart, filters.DateEnd, filters.StockID])

  useEffect(() => {
    getListServices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getOverviewService = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    const newFilters = {
      StockID: filters.StockID,
      DateStart: moment(filters.DateStart).format('DD/MM/yyyy'),
      DateEnd: moment(filters.DateEnd).format('DD/MM/yyyy')
    }
    reportsApi
      .getOverviewServices(newFilters)
      .then(({ data }) => {
        if (data.isRight) {
          //PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          setDataChart(prevState => ({
            ...prevState,
            labels:
              data.result?.Items?.map(
                sets =>
                  `${sets.ProServiceName} (${TextHelper.NumberFixed(
                    sets.CasesPercent,
                    2
                  )}%)`
              ) || [],
            datasets: prevState.datasets.map(sets => ({
              ...sets,
              data: data.result?.Items?.map(item => item.CasesNum) || [],
              backgroundColor: data.result?.Items
                ? ColorsHelpers.getColorSize(data.result.Items.length)
                : [],
              borderColor: data.result?.Items
                ? ColorsHelpers.getBorderSize(data.result.Items.length)
                : []
            }))
          }))
          setOverviewData(data.result)
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
      .getListServices(BrowserHelpers.getRequestParamsList(filters))
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoadingTable(false)
        } else {
          const {
            Items,
            Total,
            PCount,
            Totalbuoicuoi,
            Totalbuoidau,
            Totalisfirst,
            Totalrequest
          } = {
            Items: data.result?.Items || [],
            Total: data.result?.Total || 0,
            Totalbuoicuoi: data.result?.Totalbuoicuoi || 0,
            Totalbuoidau: data.result?.Totalbuoidau || 0,
            Totalisfirst: data.result?.Totalisfirst || 0,
            Totalrequest: data.result?.Totalrequest || 0,
            PCount: data?.result?.PCount || 0
          }
          setListData(Items)
          setTotal({ Totalbuoicuoi, Totalbuoidau, Totalisfirst, Totalrequest })
          setPageCount(PCount)
          setLoadingTable(false)
          setPageTotal(Total)
          !loading && isFilter && setIsFilter(false)
          callback && callback()
          PermissionHelpers.HideErrorAccess()
        }
      })
      .catch(error => console.log(error))
  }

  const onPagesChange = ({ Pi, Ps }) => {
    setFilters({ ...filters, Pi, Ps })
  }

  const checkPriceCost = ({ CostMerthod, Cost1, Cost2, Cost3 }) => {
    if (CostMerthod === 1) {
      return PriceHelper.formatVND(Cost1)
    }
    if (CostMerthod === 2) {
      return PriceHelper.formatVND(Cost1)
    }
    if (CostMerthod === 3) {
      return PriceHelper.formatVND(Cost3)
    }
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
            <div className="position-absolute top-0 left-0 w-100 h-100 d-flex">
              {renderStatusColor(rowData)}
            </div>
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
        cellRenderer: ({ rowData }) => <div>#{rowData.Id}</div>,
        width: 100,
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
        cellRenderer: ({ rowData }) => rowData.StockName || 'Chưa có',
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
        cellRenderer: ({ rowData }) => (
          <Text tooltipMaxWidth={300}>{rowData.MemberName || 'Chưa có'}</Text>
        ),
        width: 200,
        sortable: false
      },
      {
        key: 'MemberPhone',
        title: 'Số điện thoại',
        dataKey: 'MemberPhone',
        cellRenderer: ({ rowData }) => (
          <Text tooltipMaxWidth={300}>{rowData.MemberPhone || 'Chưa có'}</Text>
        ),
        width: 200,
        sortable: false
      },
      {
        key: 'ProServiceName',
        title: 'Dịch vụ gốc',
        dataKey: 'ProServiceName',
        cellRenderer: ({ rowData }) => (
          <Text tooltipMaxWidth={300}>
            {rowData.ProServiceName || 'Không có dịch vụ gốc'}
          </Text>
        ),
        width: 220,
        sortable: false
      },
      {
        key: 'Card',
        title: 'Thẻ',
        dataKey: 'Card',
        cellRenderer: ({ rowData }) => rowData.Card || 'Không có thẻ',
        width: 250,
        sortable: false
      },
      {
        key: 'SessionPrice',
        title: 'Giá buổi',
        dataKey: 'SessionPrice',
        cellRenderer: ({ rowData }) => checkPriceCost(rowData), //SessionCost
        width: 180,
        sortable: false
      },
      // {
      //   key: 'SessionCostExceptGift',
      //   title: 'Giá buổi (Tặng)',
      //   dataKey: 'SessionCostExceptGift',
      //   cellRenderer: ({ rowData }) =>
      //     PriceHelper.formatVND(rowData.SessionCostExceptGift),
      //   width: 180,
      //   sortable: false
      // },
      {
        key: 'SessionIndex',
        title: 'Buổi',
        dataKey: 'SessionIndex',
        cellRenderer: ({ rowData }) =>
          rowData.Warranty
            ? rowData.SessionWarrantyIndex
            : rowData.SessionIndex,
        width: 100,
        sortable: false
      },
      {
        key: 'Warranty',
        title: 'Bảo hành',
        dataKey: 'Warranty',
        cellRenderer: ({ rowData }) =>
          rowData.Warranty ? 'Bảo hành' : 'Không có',
        width: 120,
        sortable: false
      },
      {
        key: 'AddFeeTitles',
        title: 'Phụ phí',
        dataKey: 'AddFeeTitles',
        cellRenderer: ({ rowData }) =>
          rowData.AddFeeTitles && rowData.AddFeeTitles.length > 0
            ? rowData.AddFeeTitles.map((item, index) => (
                <div key={index}>{removeName(item)} </div>
              ))
            : 'Không có',
        width: 200,
        sortable: false
      },
      {
        key: 'StaffSalaries',
        title: 'Nhân viên thực hiện',
        dataKey: 'StaffSalaries',
        cellRenderer: ({ rowData }) => (
          <Text tooltipMaxWidth={300}>
            {rowData.StaffSalaries && rowData.StaffSalaries.length > 0
              ? rowData.StaffSalaries.map(
                  item =>
                    `${item.FullName} (${PriceHelper.formatVND(item.Salary)})`
                ).join(', ')
              : 'Chưa xác định'}
          </Text>
        ),
        width: 250,
        sortable: false
      },
      {
        key: 'TotalSalary',
        title: 'Tổng lương nhân viên',
        dataKey: 'TotalSalary',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.TotalSalary),
        width: 180,
        sortable: false
      },
      {
        key: 'Status',
        title: 'Trạng thái',
        dataKey: 'Status',
        cellRenderer: ({ rowData }) =>
          rowData.Status === 'done' ? (
            <span className="badge bg-success">Hoàn thành</span>
          ) : (
            <span className="badge bg-warning">Đang thực hiện</span>
          ),
        width: 150,
        sortable: false
      },
      {
        key: 'Rate',
        title: 'Đánh giá sao',
        dataKey: 'Rate',
        cellRenderer: ({ rowData }) => rowData.Rate || 'Chưa đánh giá',
        width: 150,
        sortable: false
      },
      {
        key: 'RateNote',
        title: 'Nội dung đánh giá',
        dataKey: 'RateNote',
        cellRenderer: ({ rowData }) => rowData.RateNote || 'Chưa có',
        width: 180,
        sortable: false
      },
      {
        key: 'Desc',
        title: 'Mô tả',
        dataKey: 'Desc',
        cellRenderer: ({ rowData }) => rowData.Desc || 'Chưa có',
        width: 220,
        sortable: false
      }
    ],
    [filters]
  )

  const onFilter = values => {
    if (_.isEqual(values, filters)) {
      onRefresh()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    getOverviewService()
    getListServices()
  }

  const onOpenFilter = () => {
    setIsFilter(true)
  }

  const onHideFilter = () => {
    setIsFilter(false)
  }

  const onExport = async () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getListServices(
          BrowserHelpers.getRequestParamsList(filters, {
            Total: PageTotal
          })
        ),
      UrlName: '/dich-vu'
    })
  }

  const OpenModalMobile = cell => {
    setInitialValuesMobile(cell)
    setIsModalMobile(true)
  }

  const HideModalMobile = () => {
    setInitialValuesMobile(null)
    setIsModalMobile(false)
  }

  const removeName = name => {
    if (!name) return ''
    const index = name.lastIndexOf('-')
    if (index > -1) {
      return name.slice(index + 1, name.length)
    }
  }

  const renderStatusColor = row => {
    const colors = []
    const { SessionCost, SessionIndex, isfirst, Warranty, payment } = row
    if (isfirst) {
      colors.push('rgb(144 189 86)')
    }
    if (SessionIndex) {
      const { CurentIndex, TotalIndex } = {
        CurentIndex: Number(SessionIndex.split('/')[0]),
        TotalIndex: Number(SessionIndex.split('/')[1])
      }
      if (Number(payment) < CurentIndex * SessionCost) {
        colors.push('rgb(231, 195, 84)')
      }
      if (CurentIndex === 1 && TotalIndex > 1) {
        colors.push('rgb(146 224 224)')
      }
      if (CurentIndex === TotalIndex && TotalIndex > 1 && Warranty === '') {
        colors.push('rgb(255, 190, 211)')
      }
    }
    return colors.map((item, index) => (
      <div
        className="flex-grow-1"
        style={{ backgroundColor: item }}
        key={index}
      ></div>
    ))
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Báo cáo dịch vụ
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
      <div className="row">
        <div className="col-lg-4">
          {loading && <LoadingSkeleton />}
          {!loading && (
            <div className="row" ref={elementRef}>
              <div className="col-12 mb-20px">
                <div
                  className="rounded p-20px"
                  style={{ backgroundColor: '#ffbed3' }}
                >
                  <div className="font-size-md fw-600 text-uppercase">
                    Tổng dịch vụ
                  </div>
                  <ChartWidget2
                    colors={{
                      labelColor: '#343a40',
                      strokeColor: '#fff',
                      color: '#0d6efd',
                      borderColor: '#f1fafe'
                    }}
                    height={30}
                    data={[15, 25, 15, 40, 20, 50]}
                  />
                  <div className="mt-30px d-flex align-items-baseline">
                    <div className="font-size-50 line-height-xxl fw-500 font-number">
                      +{OverviewData?.TotalCasesInDay || 0}
                    </div>
                    <div className="fw-500 ml-10px font-size-md">dịch vụ</div>
                  </div>
                </div>
              </div>
              <div className="col-12 mb-20px">
                <div
                  className="rounded p-20px"
                  style={{ backgroundColor: '#e7c354' }}
                >
                  <div className="font-size-md fw-600 text-uppercase">
                    Dịch vụ đang thực hiện
                  </div>
                  <ChartWidget2
                    colors={{
                      labelColor: '#343a40',
                      strokeColor: '#fff',
                      color: '#8fbd56',
                      borderColor: '#f1fafe'
                    }}
                    height={30}
                    data={[15, 25, 15, 40, 20, 50]}
                  />
                  <div className="mt-30px d-flex align-items-baseline">
                    <div className="font-size-50 line-height-xxl fw-500 font-number">
                      {OverviewData?.DoingCases || 0}
                    </div>
                    <div className="fw-500 ml-10px font-size-md">dịch vụ</div>
                  </div>
                </div>
              </div>
              <div className="col-12">
                <div
                  className="rounded p-20px"
                  style={{ backgroundColor: '#8fbd56' }}
                >
                  <div className="font-size-md fw-600 text-uppercase">
                    Dịch vụ hoàn thành
                  </div>
                  <ChartWidget2
                    colors={{
                      labelColor: '#343a40',
                      strokeColor: '#fff',
                      color: '#8fbd56',
                      borderColor: '#f1fafe'
                    }}
                    height={30}
                    data={[15, 25, 15, 40, 20, 50]}
                  />
                  <div className="mt-30px d-flex align-items-baseline">
                    <div className="font-size-50 line-height-xxl fw-500 font-number">
                      {OverviewData?.DoneCases || 0}
                    </div>
                    <div className="fw-500 ml-10px font-size-md">dịch vụ</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="col-lg-8">
          <div className="row">
            <div className="col-md-12">
              <div
                className="bg-white rounded p-4 p-lg-5 w-100 mt-4 mt-lg-0"
                style={{ height: heightElm > 0 ? `${heightElm}px` : 'auto' }}
              >
                {loading && <LoadingChart />}
                {!loading && (
                  <>
                    {dataChart.labels.length > 0 ? (
                      <ChartPie
                        data={dataChart}
                        options={optionsChart}
                        height={heightElm > 0 ? `${heightElm}px` : 'auto'}
                      />
                    ) : (
                      <ElementEmpty />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded mt-25px">
        <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between">
          <div className="fw-500 font-size-lg">Danh sách dịch vụ</div>
          <div className="d-flex">
            <div className="fw-500 pr-10px">
              Tổng dịch vụ{' '}
              <span className="font-size-xl fw-600 text-success pl-5px font-number">
                {PageTotal}
              </span>
              {width <= 1200 && (
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
                        Chi tiết dịch vụ
                      </Popover.Header>
                      <Popover.Body className="p-0">
                        <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                          <span>KH buổi đầu thẻ</span>
                          <span>{Total.Totalbuoidau}</span>
                        </div>
                        <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                          <span>KH buổi cuối thẻ</span>
                          <span>{Total.Totalbuoicuoi}</span>
                        </div>
                        <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                          <span>KH buổi đầu</span>
                          <span>{Total.Totalisfirst}</span>
                        </div>
                        <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                          <span>KH cần thanh toán</span>
                          <span>{Total.Totalrequest}</span>
                        </div>
                      </Popover.Body>
                    </Popover>
                  }
                >
                  <i className="fa-solid fa-circle-exclamation cursor-pointer text-warning ml-5px font-size-h5"></i>
                </OverlayTrigger>
              )}
            </div>
            {width >= 1200 && (
              <Fragment>
                <div className="fw-500 pr-15px">
                  KH buổi đầu thẻ{' '}
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {Total.Totalbuoidau}
                  </span>
                </div>
                <div className="fw-500 pr-15px">
                  KH buổi cuối thẻ{' '}
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {Total.Totalbuoicuoi}
                  </span>
                </div>
                <div className="fw-500 pr-15px">
                  KH buổi đầu{' '}
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {Total.Totalisfirst}
                  </span>
                </div>
                <div className="fw-500">
                  KH cần thanh toán{' '}
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {Total.Totalrequest}
                  </span>
                </div>
              </Fragment>
            )}
          </div>
        </div>
        <div className="p-20px">
          <div className="d-flex mb-15px">
            <div className="d-flex mr-20px">
              <OverlayTrigger
                rootClose
                trigger="click"
                key="top"
                placement="top"
                overlay={<Tooltip id={`tooltip-top`}>Khách buổi đầu</Tooltip>}
              >
                <div
                  className="w-40px h-15px"
                  style={{ backgroundColor: 'rgb(144 189 86)' }}
                ></div>
              </OverlayTrigger>
              {width > 992 && (
                <div className="fw-500 pl-8px line-height-xs">
                  Khách buổi đầu
                </div>
              )}
            </div>
            <div className="d-flex mr-20px">
              <OverlayTrigger
                rootClose
                trigger="click"
                key="top"
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-top`}>Cần thanh toán thêm</Tooltip>
                }
              >
                <div
                  className="w-40px h-15px"
                  style={{ backgroundColor: 'rgb(231, 195, 84)' }}
                ></div>
              </OverlayTrigger>
              {width > 992 && (
                <div className="fw-500 pl-8px line-height-xs">
                  Cần thanh toán thêm
                </div>
              )}
            </div>
            <div className="d-flex mr-20px">
              <OverlayTrigger
                rootClose
                trigger="click"
                key="top"
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-top`}>Khách thẻ buổi đầu</Tooltip>
                }
              >
                <div
                  className="w-40px h-15px"
                  style={{ backgroundColor: 'rgb(146 224 224)' }}
                ></div>
              </OverlayTrigger>
              {width > 992 && (
                <div className="fw-500 pl-8px line-height-xs">
                  Khách thẻ buổi đầu
                </div>
              )}
            </div>
            <div className="d-flex">
              <OverlayTrigger
                rootClose
                trigger="click"
                key="top"
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-top`}>Khách thẻ buổi cuối</Tooltip>
                }
              >
                <div
                  className="w-40px h-15px"
                  style={{ backgroundColor: 'rgb(255, 190, 211)' }}
                ></div>
              </OverlayTrigger>
              {width > 992 && (
                <div className="fw-500 pl-8px line-height-xs">
                  Khách thẻ buổi cuối
                </div>
              )}
            </div>
          </div>
          <ReactTableV7
            rowKey="ID"
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
    </div>
  )
}

export default OverviewService
