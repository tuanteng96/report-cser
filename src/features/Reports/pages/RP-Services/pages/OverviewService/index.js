import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import _ from 'lodash'
import reportsApi from 'src/api/reports.api'
import { ColorsHelpers } from 'src/helpers/ColorsHelpers'
import ElementEmpty from 'src/components/Empty/ElementEmpty'
import LoadingChart from 'src/components/Loading/LoadingChart'
import { TextHelper } from 'src/helpers/TextHelpers'
import { useWindowSize } from 'src/hooks/useWindowSize'
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
import FilterListAdvancedSv from 'src/components/Filter/FilterListAdvancedSv'

import moment from 'moment'
import 'moment/locale/vi'
import { uuidv4 } from '@nikitababko/id-generator'

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

function roundToDecimalPlaces(num, decimalPlaces) {
  const factor = Math.pow(10, decimalPlaces)
  return Math.round(num * factor) / factor
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
    StarRating: '', // Đánh giá sao
    Dich_vu_chuyen_doi_khong_hop_le: 0,
    IsMemberSet: '',
    CardServiceID: '',
    ServiceOriginalID: '',
    TransfUserID: '',
    ShowsX: '2',
    MemberGroupID: ''
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
  const [heightWrap, setHeightWrap] = useState(0)
  const elementRef = useRef(null)
  const elementWrap = useRef(null)

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
    setHeightWrap(elementWrap?.current?.clientHeight || 0)
  }, [elementWrap, width, loading])

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
    if (filters.ShowsX === '1') {
      reportsApi
        .getListServicesAndPayed(
          BrowserHelpers.getRequestParamsList({
            From: filters.DateStart,
            To: filters.DateEnd,
            StockIDs: filters.StockID, //filters.StockID
            Pi: filters.Pi,
            Ps: filters.Ps
          })
        )
        .then(({ data }) => {
          if (data?.isRight) {
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
              Totalrequest,
              TotalGiabuoi
            } = {
              Items: data?.lst || [],
              Total: data?.total || 0,
              Totalbuoicuoi: 0,
              Totalbuoidau: 0,
              Totalisfirst: 0,
              Totalrequest: 0,
              TotalGiabuoi: 0,
              PCount: data?.pCount || 0
            }
            setListData(Items)
            setTotal({
              Totalbuoicuoi,
              Totalbuoidau,
              Totalisfirst,
              Totalrequest,
              TotalGiabuoi
            })
            setPageCount(PCount)
            setLoadingTable(false)
            setPageTotal(Total)
            !loading && isFilter && setIsFilter(false)
            callback && callback()
            PermissionHelpers.HideErrorAccess()
          }
        })
        .catch(error => console.log(error))
    } else if (filters.ShowsX === '3') {
      reportsApi
        .getAccordingTimeService({
          _Path_: '/api/v3/r23/dich-vu/danh-sach-2',
          StockID: filters.StockID,
          DateStart: moment(filters.DateStart).format('DD/MM/YYYY'),
          DateEnd: moment(filters.DateEnd).format('DD/MM/YYYY'),
          Pi: 1,
          Ps: 100,
          CardServiceID: '',
          ServiceOriginalID: ''
        })
        .then(({ data }) => {
          if (data.isRight) {
            PermissionHelpers.ErrorAccess(data.error)
            setLoadingTable(false)
          } else {
            const { Items } = {
              Items:
                data.result?.items && data.result?.items.length > 0
                  ? data.result?.items.map(x => {
                      let obj = { ...x, ID: uuidv4() }
                      let total = data.result?.items.reduce(
                        (accumulator, object) => {
                          return accumulator + object.Data.Done
                        },
                        0
                      )
                      obj.Percentage = roundToDecimalPlaces(
                        (x?.Data?.Done / total) * 100,
                        2
                      )
                      return obj
                    })
                  : []
            }
            setListData(Items)
            setLoadingTable(false)
            !loading && isFilter && setIsFilter(false)
            callback && callback()
            PermissionHelpers.HideErrorAccess()
          }
        })
    } else {
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
              Totalrequest,
              TotalGiabuoi
            } = {
              Items: data.result?.Items || [],
              Total: data.result?.Total || 0,
              Totalbuoicuoi: Math.round(data.result?.Totalbuoicuoi || 0),
              Totalbuoidau: Math.round(data.result?.Totalbuoidau || 0),
              Totalisfirst: Math.round(data.result?.Totalisfirst || 0),
              Totalrequest: Math.round(data.result?.Totalrequest || 0),
              TotalGiabuoi: Math.round(data.result?.TotalGiabuoi || 0),
              PCount: data?.result?.PCount || 0
            }
            setListData(Items)
            setTotal({
              Totalbuoicuoi,
              Totalbuoidau,
              Totalisfirst,
              Totalrequest,
              TotalGiabuoi
            })
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
  }

  const onPagesChange = ({ Pi, Ps }) => {
    setFilters({ ...filters, Pi, Ps })
  }

  const checkPriceCost = item => {
    if (!item) return ''
    let { CostMerthod, Cost1, Cost2, Cost3 } = item
    if (CostMerthod === 1) {
      return PriceHelper.formatVND(Cost1)
    }
    if (CostMerthod === 2) {
      return PriceHelper.formatVND(Cost2)
    }
    if (CostMerthod === 3) {
      return PriceHelper.formatVND(Cost3)
    }
  }

  const checkFCostCost = item => {
    if (!item) return ''
    let { FCostMethod, FCost1, FCost2, FCost3 } = item
    if (FCostMethod === 1) {
      return PriceHelper.formatVND(FCost1)
    }
    if (FCostMethod === 2) {
      return PriceHelper.formatVND(FCost2)
    }
    if (FCostMethod === 3) {
      return PriceHelper.formatVND(FCost3)
    }
  }

  const columns = useMemo(() => {
    if (filters.ShowsX === '3') {
      return [
        {
          key: 'From/To',
          title: 'Thời gian',
          dataKey: 'From/To',
          cellRenderer: ({ rowData }) => (
            <>
              {rowData.From} - {rowData.To}
            </>
          ),
          width: 300,
          sortable: false,
          mobileOptions: {
            visible: true
          }
        },
        {
          key: 'Data',
          title: 'Tổng số ca',
          dataKey: 'Data',
          cellRenderer: ({ rowData }) => <>{rowData?.Data?.Done} Ca</>,
          width: 300,
          sortable: false,
          mobileOptions: {
            visible: true
          }
        },
        {
          key: 'Percentage',
          title: 'Tỉ lệ',
          dataKey: 'Percentage',
          cellRenderer: ({ rowData }) => <>{rowData?.Percentage} %</>,
          width: 300,
          sortable: false,
          mobileOptions: {
            visible: true
          }
        }
      ]
    } else if (filters.ShowsX !== '1') {
      return [
        {
          key: '',
          title: 'STT',
          dataKey: 'index',
          cellRenderer: ({ rowIndex, rowData }) => (
            <Fragment>
              <span className="font-number position-relative zindex-10">
                {filters.Ps * (filters.Pi - 1) + (rowIndex + 1)}
              </span>
              <div className="top-0 left-0 position-absolute w-100 h-100 d-flex">
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
          key: 'OrderID',
          title: 'ID đơn hàng',
          dataKey: 'OrderID',
          cellRenderer: ({ rowData }) => <div>#{rowData.OrderID}</div>,
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
            <Text tooltipMaxWidth={300}>
              {rowData.MemberPhone || 'Chưa có'}
            </Text>
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
          sortable: false,
          hidden: filters.ShowsX === '2'
        },
        {
          key: 'Warranty',
          title: 'Bảo hành',
          dataKey: 'Warranty',
          cellRenderer: ({ rowData }) =>
            rowData.Warranty ? 'Bảo hành' : 'Không có',
          width: 120,
          sortable: false,
          hidden: filters.ShowsX === '2'
        },
        {
          key: 'Loai',
          title: 'Loại',
          dataKey: 'Loai',
          width: 180,
          sortable: false,
          hidden: filters.ShowsX !== '2'
        },
        {
          key: 'AddFeeTitles',
          title: 'Phụ phí',
          dataKey: 'AddFeeTitles',
          cellRenderer: ({ rowData }) =>
            rowData.AddFeeTitles && rowData.AddFeeTitles.length > 0
              ? rowData.AddFeeTitles.toString()
              : 'Không có',
          width: 200,
          sortable: false
        },
        {
          key: 'FCost',
          title: 'Tổng phụ phí',
          dataKey: 'FCost',
          cellRenderer: ({ rowData }) => checkFCostCost(rowData),
          width: 200,
          sortable: false
        },
        {
          key: 'ProServiceType',
          title: 'Nhóm dịch vụ',
          dataKey: 'ProServiceType',
          width: 200,
          sortable: false,
          hidden: filters.ShowsX !== '0'
        },
        {
          key: 'UserFullName',
          title: 'Nhân viên chuyển ca',
          dataKey: 'UserFullName',
          width: 250,
          sortable: false,
          hidden: filters.ShowsX !== '2'
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
          //cellRenderer: ({ rowData }) => rowData.RateNote || 'Chưa có',
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
      ]
    } else {
      return [
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
          key: 'User.FullName',
          title: 'Nhân viên',
          dataKey: 'User.FullName',
          cellRenderer: ({ rowData }) => rowData?.User?.FullName,
          width: 300,
          sortable: false,
          mobileOptions: {
            visible: true
          }
        },
        {
          key: 'Stock.Title',
          title: 'Cơ sở',
          dataKey: 'Stock.Title',
          cellRenderer: ({ rowData }) => rowData?.Stock?.Title,
          width: 300,
          sortable: false,
          mobileOptions: {
            visible: true
          }
        },
        {
          key: 'Qty',
          title: 'Số lượng',
          dataKey: 'Qty',
          width: 200,
          sortable: false,
          mobileOptions: {
            visible: true
          }
        },
        {
          key: 'TM/CK/QT',
          title: 'TM/CK/QT',
          dataKey: 'TM/CK/QT',
          width: 200,
          sortable: false,
          cellRenderer: ({ rowData }) => (
            <div className="w-100 d-flex justify-content-between align-items-center">
              {PriceHelper.formatVND(rowData.CK + rowData.QT + rowData.TM)}
              <OverlayTrigger
                rootClose
                trigger="click"
                key="top"
                placement="auto"
                overlay={
                  <Popover id={`popover-positioned-top`}>
                    <Popover.Body className="p-0">
                      <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                        <span className="w-60">Tiền mặt</span>
                        <span className="flex-1 text-end">
                          {PriceHelper.formatVNDPositive(rowData.TM)}
                        </span>
                      </div>
                      <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                        <span className="w-60">Chuyển khoản</span>
                        <span className="flex-1 text-end">
                          {PriceHelper.formatVNDPositive(rowData.CK)}
                        </span>
                      </div>
                      <div className="border-gray-200 py-10px px-15px fw-600 font-size-md d-flex justify-content-between">
                        <span className="w-60">Quẹt thẻ</span>
                        <span className="flex-1 text-end">
                          {PriceHelper.formatVNDPositive(rowData.QT)}
                        </span>
                      </div>
                    </Popover.Body>
                  </Popover>
                }
              >
                <div className="d-flex justify-content-between align-items-center">
                  <i className="cursor-pointer fa-solid fa-circle-exclamation text-warning ml-5px"></i>
                </div>
              </OverlayTrigger>
            </div>
          )
        },
        {
          key: 'VI/TT',
          title: 'Ví / Thẻ tiền',
          dataKey: 'VI/TT',
          width: 200,
          sortable: false,
          cellRenderer: ({ rowData }) => (
            <div className="w-100 d-flex justify-content-between align-items-center">
              {PriceHelper.formatVND(rowData.VI + rowData.TT)}
              <OverlayTrigger
                rootClose
                trigger="click"
                key="top"
                placement="auto"
                overlay={
                  <Popover id={`popover-positioned-top`}>
                    <Popover.Body className="p-0">
                      <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                        <span className="w-60">Ví</span>
                        <span className="flex-1 text-end">
                          {PriceHelper.formatVNDPositive(rowData.VI)}
                        </span>
                      </div>
                      <div className="border-gray-200 py-10px px-15px fw-600 font-size-md d-flex justify-content-between">
                        <span className="w-60">Thẻ tiền</span>
                        <span className="flex-1 text-end">
                          {PriceHelper.formatVNDPositive(rowData.TT)}
                        </span>
                      </div>
                    </Popover.Body>
                  </Popover>
                }
              >
                <div className="d-flex justify-content-between align-items-center">
                  <i className="cursor-pointer fa-solid fa-circle-exclamation text-warning ml-5px"></i>
                </div>
              </OverlayTrigger>
            </div>
          )
        }
      ]
    }
  }, [filters])

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
      FuncApi: () => {
        if (filters.ShowsX === '1') {
          return reportsApi.getListServicesAndPayed(
            BrowserHelpers.getRequestParamsList(
              {
                From: filters.DateStart,
                To: filters.DateEnd,
                StockIDs: filters.StockID, //filters.StockID
                Pi: filters.Pi,
                Ps: filters.Ps,
                ShowsX: filters.ShowsX
              },
              {
                Total: PageTotal
              }
            )
          )
        } else if (filters.ShowsX === '3') {
          return reportsApi.getAccordingTimeService({
            _Path_: '/api/v3/r23/dich-vu/danh-sach-2',
            StockID: filters.StockID,
            DateStart: moment(filters.DateStart).format('DD/MM/YYYY'),
            DateEnd: moment(filters.DateEnd).format('DD/MM/YYYY'),
            Pi: 1,
            Ps: 100,
            CardServiceID: '',
            ServiceOriginalID: '',
            ShowsX: filters.ShowsX
          })
        } else {
          return reportsApi.getListServices(
            BrowserHelpers.getRequestParamsList(filters, {
              Total: PageTotal
            })
          )
        }
      },
      params: filters.ShowsX === '1' ? filters : null,
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

  // const removeName = name => {
  //   if (!name) return ''
  //   const index = name.lastIndexOf('-')
  //   if (index > -1) {
  //     return name.slice(index + 1, name.length)
  //   }
  // }

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
          <span className="text-uppercase font-size-xl fw-600">
            Báo cáo dịch vụ
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
      <FilterListAdvancedSv
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
            label: 'Nhân viên',
            value: '1'
          },
          {
            label: 'Theo khung giờ',
            value: '3'
          }
        ]}
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
                className="p-4 mt-4 bg-white rounded p-lg-5 w-100 mt-lg-0"
                style={{ height: heightElm > 0 ? `${heightElm}px` : 'auto' }}
              >
                <div className="h-100" ref={elementWrap}>
                  {loading && <LoadingChart />}
                  {!loading && (
                    <>
                      {dataChart.labels.length > 0 ? (
                        <ChartPie
                          data={dataChart}
                          options={optionsChart}
                          height={heightWrap > 0 ? `${heightWrap}px` : 'auto'}
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
      </div>
      <div className="bg-white rounded mt-25px">
        <div className="border-gray-200 px-20px py-15px border-bottom d-flex align-items-center justify-content-between">
          <div className="fw-500 font-size-lg">Danh sách dịch vụ</div>
          {filters.ShowsX !== '1' && filters.ShowsX !== '3' && (
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
                          <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                            <span>Tổng giá buổi</span>
                            <span>
                              {PriceHelper.formatVND(Total.TotalGiabuoi)}
                            </span>
                          </div>
                          {filters.ShowsX !== '2' && (
                            <>
                              <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                <span>KH buổi đầu thẻ</span>
                                <span>{Total.Totalbuoidau}</span>
                              </div>
                              <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                <span>KH buổi cuối thẻ</span>
                                <span>{Total.Totalbuoicuoi}</span>
                              </div>
                              <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                <span>KH buổi đầu</span>
                                <span>{Total.Totalisfirst}</span>
                              </div>
                              <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                                <span>KH cần thanh toán</span>
                                <span>{Total.Totalrequest}</span>
                              </div>
                            </>
                          )}
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
                    Tổng giá buổi{' '}
                    <span className="font-size-xl fw-600 text-success pl-5px font-number">
                      {PriceHelper.formatVND(Total.TotalGiabuoi)}
                    </span>
                  </div>

                  {filters.ShowsX !== '2' && (
                    <>
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
                    </>
                  )}
                </Fragment>
              )}
            </div>
          )}
        </div>
        <div className="p-20px">
          {filters.ShowsX !== '2' &&
            filters.ShowsX !== '1' &&
            filters.ShowsX !== '3' && (
              <div className="d-flex mb-15px">
                <div className="d-flex mr-20px">
                  <OverlayTrigger
                    rootClose
                    trigger="click"
                    key="top"
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-top`}>Khách buổi đầu</Tooltip>
                    }
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
            )}

          <ReactTableV7
            rowKey="ID"
            filters={filters.ShowsX === '3' ? null : filters}
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
          checkFCostCost={checkFCostCost}
          checkPriceCost={checkPriceCost}
          filters={filters}
        />
      </div>
    </div>
  )
}

export default OverviewService
