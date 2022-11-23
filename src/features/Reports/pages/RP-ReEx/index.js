import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import IconMenuMobile from '../../components/IconMenuMobile'
import _ from 'lodash'
import FilterList from 'src/components/Filter/FilterList'
import Chart2Column from '../../components/Chart2Column'
import reportsApi from 'src/api/reports.api'
import { PriceHelper } from 'src/helpers/PriceHelper'
import { AssetsHelpers } from 'src/helpers/AssetsHelpers'
import LoadingSkeleton from './LoadingSkeleton'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import { JsonFilter } from 'src/Json/JsonFilter'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import ModalViewMobile from './ModalViewMobile'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'

import moment from 'moment'
import 'moment/locale/vi'

moment.locale('vi')

const optionsObj = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top'
    },
    title: {
      display: false,
      text: 'Biểu đồ khách hàng'
    }
  }
}

const labels = []
const objData = {
  labels,
  datasets: [
    {
      label: `Thu`,
      data: [],
      backgroundColor: 'rgba(53, 162, 235, 0.5)'
    },
    {
      label: `Chi`,
      data: [],
      backgroundColor: 'rgba(255, 99, 132, 0.5)'
    }
  ]
}

function RPReEx(props) {
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
    PaymentMethods: '', // TM, CK, QT
    TypeTC: '', // Thu hay chi
    TagsTC: '' // ID nhân viên
  })
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [loadingList, setLoadingList] = useState(false)
  const [dataChart, setDataChart] = useState(objData)
  const [OverviewData, setOverviewData] = useState(null)

  //
  const [Data, setData] = useState([])
  const [PageTotal, setPageTotal] = useState(0)
  const [Total, setTotal] = useState({
    TONG_CHI: 0,
    CHI_CKL: 0,
    CHI_QT: 0,
    CHI_TM: 0,
    TONG_THU: 0,
    THU_TM: 0,
    THU_QT: 0,
    THU_CK: 0
  })
  const [pageCount, setPageCount] = useState(0)
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
    getOverviewReEx()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.StockID, filters.DateStart, filters.DateEnd])

  const getOverviewReEx = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    const newFilters = {
      StockID: filters.StockID,
      DateStart: moment(filters.DateStart).format('DD/MM/yyyy'),
      DateEnd: moment(filters.DateEnd).format('DD/MM/yyyy')
    }
    reportsApi
      .getOverviewReEx(newFilters)
      .then(({ data }) => {
        if (data.isRight) {
          //PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          setDataChart(prevState => ({
            ...prevState,
            labels: data.result?.DS
              ? data.result?.DS.map(item => item.Text)
              : [],
            datasets: [
              {
                label: `Thu`,
                data: data.result?.DS
                  ? data.result?.DS.map(item => item.THU)
                  : [],
                backgroundColor: 'rgba(53, 162, 235, 0.5)'
              },
              {
                label: `Chi`,
                data: data.result?.DS
                  ? data.result?.DS.map(item => Math.abs(item.CHI))
                  : [],
                backgroundColor: 'rgba(255, 99, 132, 0.5)'
              }
            ]
          }))
          setOverviewData(data.result)
          setLoading(false)
          !loadingList && isFilter && setIsFilter(false)
          callback && callback()
          //PermissionHelpers.HideErrorAccess()
        }
      })
      .catch(error => console.log(error))
  }

  useEffect(() => {
    getListReEx()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListReEx = (isLoading = true, callback) => {
    isLoading && setLoadingList(true)
    reportsApi
      .getListReEx(BrowserHelpers.getRequestParamsList(filters))
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoadingList(false)
        } else {
          const {
            Items,
            PCount,
            Total,
            TONG_CHI,
            CHI_CK,
            CHI_QT,
            CHI_TM,
            TONG_THU,
            THU_TM,
            THU_QT,
            THU_CK
          } = {
            Items: data?.result?.Items || [],
            PCount: data?.result?.PCount || 0,
            TotalOnline: data?.result?.TotalOnline || 0,
            Total: data?.result?.Total || 0,
            TONG_CHI: data?.result?.TONG_CHI || 0,
            CHI_CK: data?.result?.CHI_CK || 0,
            CHI_QT: data?.result?.CHI_QT || 0,
            CHI_TM: data?.result?.CHI_TM || 0,
            TONG_THU: data?.result?.TONG_THU || 0,
            THU_TM: data?.result?.THU_TM || 0,
            THU_QT: data?.result?.THU_QT || 0,
            THU_CK: data?.result?.THU_CK || 0
          }
          setData(Items)
          setTotal({
            TONG_CHI,
            CHI_CK,
            CHI_QT,
            CHI_TM,
            TONG_THU,
            THU_TM,
            THU_QT,
            THU_CK
          })
          setPageTotal(Total)
          setPageCount(PCount)
          setLoadingList(false)
          !loading && isFilter && setIsFilter(false)
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

  const onPagesChange = ({ Pi, Ps }) => {
    setFilters({ ...filters, Pi, Ps })
  }

  const onExport = () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getListReEx(
          BrowserHelpers.getRequestParamsList(filters, {
            Total: PageTotal
          })
        ),
      UrlName: '/thu-chi-va-so-quy'
    })
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
        key: 'TM',
        title: 'Tiền mặt',
        dataKey: 'TM',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVNDPositive(rowData.TM),
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'CK',
        title: 'Chuyển khoản',
        dataKey: 'CK',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVNDPositive(rowData.CK),
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'QT',
        title: 'Quẹt thẻ',
        dataKey: 'QT',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVNDPositive(rowData.QT),
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Tag',
        title: 'Tag',
        dataKey: 'Tag',
        cellRenderer: ({ rowData }) => `${TransferTags(rowData.Tag)}`,
        width: 180,
        sortable: false
      },
      {
        key: 'Content',
        title: 'Nội dung',
        dataKey: 'Content',
        width: 350,
        sortable: false
      },
      {
        key: 'StockName',
        title: 'Cơ sở',
        dataKey: 'StockName',
        width: 200,
        sortable: false
      },
      {
        key: 'Member.FullName',
        title: 'Khách hàng',
        dataKey: 'Member.FullName',
        width: 250,
        sortable: false
      },
      {
        key: 'Staff.FullName',
        title: 'Nhân viên tạo',
        dataKey: 'Staff.FullName',
        width: 250,
        sortable: false
      }
    ],
    [filters]
  )

  const onRefresh = () => {
    getOverviewReEx()
    getListReEx()
  }

  const OpenModalMobile = value => {
    setInitialValuesMobile(value)
    setIsModalMobile(true)
  }

  const HideModalMobile = () => {
    setInitialValuesMobile(null)
    setIsModalMobile(false)
  }

  const rowClassName = ({ rowData, rowIndex, cells, columns }) => {
    if (!rowData.Tag) return ''
    const index = JsonFilter.TagsTCList.findIndex(
      item => item.value === rowData.Tag
    )
    if (index > -1 && JsonFilter.TagsTCList[index].type === 1) {
      return 'bg-danger-o-90'
    }
  }

  const TransferTags = value => {
    const index = JsonFilter.TagsTCList.findIndex(item => item.value === value)
    if (index > -1) {
      return JsonFilter.TagsTCList[index].label
    }
    return value
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Thu chi & Sổ quỹ
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
        <div className="col-lg-5 col-xl-6">
          {loading && <LoadingSkeleton />}
          {!loading && (
            <div className="d-flex flex-column h-100">
              <div
                className="bg-white rounded px-20px py-30px text-center flex-grow-1 d-flex flex-column justify-content-center"
                style={{
                  backgroundPosition: 'right top',
                  backgroundSize: '30% auto',
                  backgroundRepeat: 'no-repeat',
                  backgroundImage: `url(${AssetsHelpers.toAbsoluteUrl(
                    '/assets/media/svg/shapes/abstract-4.svg'
                  )})`
                }}
              >
                <div className="font-number font-size-35 fw-600 line-height-xxl text-primary">
                  {PriceHelper.formatVND(OverviewData?.TonTienDauKy)}
                </div>
                <div className="fw-600 text-uppercase text-muted font-size-smm mt-5px">
                  Tồn tiền đầu kỳ
                </div>
              </div>
              <div className="bg-white rounded px-20px py-30px d-flex my-20px flex-column flex-xl-row flex-grow-1">
                <div className="flex-1 text-center d-flex flex-column justify-content-center">
                  <div className="font-number font-size-30 font-md-size-25 font-xxl-size-30 fw-600 line-height-xxl">
                    {PriceHelper.formatVND(OverviewData?.ThuTrongKy)}
                  </div>
                  <div className="fw-600 text-uppercase text-muted font-size-smm mt-5px">
                    Thu trong kỳ
                  </div>
                </div>
                <div className="flex-1 d-flex flex-column justify-content-center text-center border-left border-left-0 border-xl-left-1  border-right border-right-0 border-xl-right-1 border-gray-200 border-bottom border-xl-bottom-0 border-top border-xl-top-0 py-20px my-20px py-xl-0 my-xl-0">
                  <div className="font-number font-size-30 font-md-size-25 font-xxl-size-30 fw-600 line-height-xxl text-danger">
                    {PriceHelper.formatVNDPositive(OverviewData?.ChiTrongKy)}
                  </div>
                  <div className="fw-600 text-uppercase text-muted font-size-smm mt-5px">
                    Chi trong kỳ
                  </div>
                </div>
                <div className="flex-1 text-center d-flex flex-column justify-content-center">
                  <div className="font-number font-size-30 font-md-size-25 font-xxl-size-30 fw-600 line-height-xxl">
                    {PriceHelper.formatVND(OverviewData?.ThuChiTrongKy)}
                  </div>
                  <div className="fw-600 text-uppercase text-muted font-size-smm mt-5px">
                    Tồn kỳ
                  </div>
                </div>
              </div>
              <div
                className="bg-white rounded px-20px py-30px mb-20px mb-md-0 text-center flex-grow-1 d-flex flex-column justify-content-center"
                style={{
                  backgroundPosition: 'right top',
                  backgroundSize: '30% auto',
                  backgroundRepeat: 'no-repeat',
                  backgroundImage: `url(${AssetsHelpers.toAbsoluteUrl(
                    '/assets/media/svg/shapes/abstract-4.svg'
                  )})`
                }}
              >
                <div className="font-number font-size-35 fw-600 line-height-xxl text-success">
                  {PriceHelper.formatVND(OverviewData?.ThuChiHienTai)}
                </div>
                <div className="fw-600 text-uppercase text-muted font-size-smm mt-5px">
                  Tồn tiền hiện tại
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="col-lg-7 col-xl-6">
          <div className="bg-white rounded p-20px h-100 d-flex align-items-center justify-content-center">
            <Chart2Column options={optionsObj} data={dataChart} />
          </div>
        </div>
      </div>
      <div className="bg-white rounded mt-25px">
        <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between flex-column flex-md-row">
          <div className="fw-500 font-size-lg">Danh sách thu chi & sổ quỹ</div>
          <div className="d-flex">
            <div className="fw-500 d-flex align-items-center">
              Tổng thu
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
                      Chi tiết tổng thu
                    </Popover.Header>
                    <Popover.Body className="p-0">
                      <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                        <span>Tiền mặt</span>
                        <span>
                          {PriceHelper.formatVNDPositive(Total.THU_TM)}
                        </span>
                      </div>
                      <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                        <span>Chuyển khoản</span>
                        <span>
                          {PriceHelper.formatVNDPositive(Total.THU_CK)}
                        </span>
                      </div>
                      <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                        <span>Quẹt thẻ</span>
                        <span>
                          {PriceHelper.formatVNDPositive(Total.THU_QT)}
                        </span>
                      </div>
                    </Popover.Body>
                  </Popover>
                }
              >
                <div className="d-flex justify-content-between align-items-center">
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {PriceHelper.formatVNDPositive(Total.TONG_THU)}
                  </span>
                  <i className="fa-solid fa-circle-exclamation cursor-pointer text-success ml-5px"></i>
                </div>
              </OverlayTrigger>
            </div>
            <div className="fw-500 d-flex align-items-center ml-25px">
              Tổng chi
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
                      Chi tiết tổng chi
                    </Popover.Header>
                    <Popover.Body className="p-0">
                      <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                        <span>Tiền mặt</span>
                        <span>
                          {PriceHelper.formatVNDPositive(Total.CHI_TM)}
                        </span>
                      </div>
                      <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                        <span>Chuyển khoản</span>
                        <span>
                          {PriceHelper.formatVNDPositive(Total.CHI_CK)}
                        </span>
                      </div>
                      <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                        <span>Quẹt thẻ</span>
                        <span>
                          {PriceHelper.formatVNDPositive(Total.CHI_QT)}
                        </span>
                      </div>
                    </Popover.Body>
                  </Popover>
                }
              >
                <div className="d-flex justify-content-between align-items-center">
                  <span className="font-size-xl fw-600 text-danger pl-5px font-number">
                    {PriceHelper.formatVNDPositive(Total.TONG_CHI)}
                  </span>
                  <i className="fa-solid fa-circle-exclamation cursor-pointer text-danger ml-5px"></i>
                </div>
              </OverlayTrigger>
            </div>
          </div>
        </div>
        <div className="p-20px">
          <ReactTableV7
            rowKey="Id"
            filters={filters}
            columns={columns}
            data={Data}
            loading={loadingList}
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
          TransferTags={TransferTags}
        />
      </div>
    </div>
  )
}

export default RPReEx
