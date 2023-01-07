import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import Chart2Column from 'src/features/Reports/components/Chart2Column'
import ChartWidget2 from 'src/features/Reports/components/ChartWidget2'
import reportsApi from 'src/api/reports.api'
import LoadingSkeleton from './LoadingSkeleton'
import _ from 'lodash'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import FilterList from 'src/components/Filter/FilterList'
import { useWindowSize } from 'src/hooks/useWindowSize'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'
import { PriceHelper } from 'src/helpers/PriceHelper'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import ModalViewMobile from './ModalViewMobile'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import Text from 'react-texty'

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
      display: true,
      text: 'Biểu đồ khách hàng'
    }
  }
}

const labels = [
  'T1',
  'T2',
  'T3',
  'T4',
  'T5',
  'T6',
  'T7',
  'T8',
  'T9',
  'T10',
  'T11',
  'T12'
]
const objData = {
  labels,
  datasets: [
    {
      label: `Năm ${moment().subtract(1, 'year').format('YYYY')}`,
      data: [],
      backgroundColor: 'rgba(255, 99, 132, 0.5)'
    },
    {
      label: `Năm ${moment().format('YYYY')}`,
      data: [],
      backgroundColor: 'rgba(53, 162, 235, 0.5)'
    }
  ]
}

function OverviewCustomer() {
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
    GroupCustomerID: '', // ID Nhóm khách hàng
    ProvincesID: '', // ID Thành phố
    DistrictsID: '', //ID Huyện
    SourceName: '', // ID Nguồn
    StaffID: ''
  })
  const [StockName, setStockName] = useState('')
  const [OverviewData, setOverviewData] = useState(null)
  const [dataChart, setDataChart] = useState(objData)
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [PageTotal, setPageTotal] = useState({
    Total: 0,
    TotalOnline: 0
  })
  const [isFilter, setIsFilter] = useState(false)
  const [heightChart, setHeightChart] = useState(100)
  const [initialValuesMobile, setInitialValuesMobile] = useState(null)
  const [isModalMobile, setIsModalMobile] = useState(false)
  const { width } = useWindowSize()

  //
  const [data, setData] = useState([])
  const [loadingTable, setLoadingTable] = useState(false)
  const [pageCount, setPageCount] = useState(0)

  useEffect(() => {
    if (width < 1430) {
      setHeightChart(50)
    } else {
      setHeightChart(100)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width])

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
    getOverviewCustomer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    getListCustomer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getOverviewCustomer = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    const newFilters = {
      StockID: filters.StockID,
      Date: moment().format('DD/MM/yyyy')
    }
    reportsApi
      .getOverviewCustomer(newFilters)
      .then(({ data }) => {
        if (data.isRight) {
          //PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          setDataChart(prevState => ({
            ...prevState,
            datasets: [
              {
                label: `Năm ${moment().subtract(1, 'year').format('YYYY')}`,
                data: data?.result?.SoKHs_ByMonth_LastYear || [],
                backgroundColor: 'rgba(255, 99, 132, 0.5)'
              },
              {
                label: `Năm ${moment().format('YYYY')}`,
                data: data?.result?.SoKHs_ByMonth_ThisYear || [],
                backgroundColor: 'rgba(53, 162, 235, 0.5)'
              }
            ]
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

  const onFilter = values => {
    if (_.isEqual(values, filters)) {
      getListCustomer()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onExport = async () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getListCustomer(
          BrowserHelpers.getRequestParamsList(filters, {
            Total: PageTotal.Total
          })
        ),
      UrlName: '/khach-hang/tong-quan'
    })
  }

  const onRefresh = () => {
    getOverviewCustomer()
    getListCustomer()
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
        key: 'FullName',
        title: 'Tên khách hàng',
        dataKey: 'FullName',
        width: 220,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Id',
        title: 'ID',
        dataKey: 'Id',
        cellRenderer: ({ rowData }) => `#${rowData.Id}`,
        width: 120,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'MobilePhone',
        title: 'Số điện thoại',
        dataKey: 'MobilePhone',
        width: 150,
        sortable: false
      },
      {
        key: 'Email',
        title: 'Email',
        dataKey: 'Email',
        cellRenderer: ({ rowData }) => rowData.Email || 'Chưa có',
        width: 200,
        sortable: false
      },
      {
        key: 'BirthDate',
        title: 'Ngày sinh',
        dataKey: 'BirthDate',
        cellRenderer: ({ rowData }) =>
          rowData.BirthDate
            ? moment(rowData.BirthDate).format('DD/MM/YYYY')
            : 'Chưa có',
        width: 150,
        sortable: false
      },
      {
        key: 'Gender',
        title: 'Giới tính',
        dataKey: 'Gender',
        width: 120,
        sortable: false
      },
      {
        key: 'HomeAddress',
        title: 'Địa chỉ',
        dataKey: 'HomeAddress',
        width: 250,
        sortable: false,
        cellRenderer: ({ rowData }) => (
          <Text tooltipMaxWidth={300}>{rowData.HomeAddress || 'Chưa có'}</Text>
        )
      },
      {
        key: 'DistrictsName',
        title: 'Quận huyện',
        dataKey: 'DistrictsName',
        width: 250,
        sortable: false,
        cellRenderer: ({ rowData }) => (
          <Text tooltipMaxWidth={300}>
            {rowData.DistrictsName || 'Chưa có'}
          </Text>
        )
      },
      {
        key: 'ProvincesName',
        title: 'Tỉnh / Thành phố',
        dataKey: 'ProvincesName',
        width: 250,
        sortable: false,
        cellRenderer: ({ rowData }) => (
          <Text tooltipMaxWidth={300}>
            {rowData.ProvincesName || 'Chưa có'}
          </Text>
        )
      },
      {
        key: 'ByStockName',
        title: 'Cơ sở',
        dataKey: 'ByStockName',
        width: 220,
        sortable: false
      },
      {
        key: 'GroupCustomerName',
        title: 'Nhóm khách hàng',
        dataKey: 'GroupCustomerName',
        width: 200,
        sortable: false,
        cellRenderer: ({ rowData }) => (
          <Text tooltipMaxWidth={300}>
            {rowData.GroupCustomerName || 'Chưa có'}
          </Text>
        )
      },
      {
        key: 'Source',
        title: 'Nguồn',
        dataKey: 'Source',
        width: 150,
        sortable: false,
        cellRenderer: ({ rowData }) => (
          <Text tooltipMaxWidth={300}>
            {rowData.Source || 'Không xác định'}
          </Text>
        )
      },
      {
        key: 'HandCardID',
        title: 'Mã thẻ',
        dataKey: 'HandCardID',
        width: 150,
        sortable: false,
        cellRenderer: ({ rowData }) => (
          <Text tooltipMaxWidth={300}>{rowData.HandCardID || 'Chưa có'}</Text>
        )
      },
      {
        key: 'ByUserName',
        title: 'Nhân viên chăm sóc',
        dataKey: 'ByUserName',
        width: 200,
        sortable: false,
        cellRenderer: ({ rowData }) => (
          <Text tooltipMaxWidth={300}>{rowData.ByUserName || 'Chưa có'}</Text>
        )
      },
      {
        key: 'vi_dien_tu',
        title: 'Ví',
        dataKey: 'vi_dien_tu',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.vi_dien_tu),
        width: 120,
        sortable: false
      },
      {
        key: 'cong_no',
        title: 'Công nợ',
        dataKey: 'cong_no',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.cong_no),
        width: 120,
        sortable: false
      },
      {
        key: 'the_tien',
        title: 'Thẻ tiền',
        dataKey: 'the_tien',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.the_tien),
        width: 120,
        sortable: false
      }
    ],
    [filters]
  )

  const getListCustomer = callback => {
    setLoadingTable(true)
    reportsApi
      .getListCustomer(BrowserHelpers.getRequestParamsList(filters))
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoadingTable(false)
        } else {
          const { Members, PCount, TotalOnline, Total } = {
            Members: data?.result?.Members || [],
            PCount: data?.result?.PCount || 0,
            TotalOnline: data?.result?.TotalOnline || 0,
            Total: data?.result?.Total || 0
          }
          setData(Members)
          setPageTotal({
            Total: Total,
            TotalOnline: TotalOnline
          })
          setPageCount(PCount)
          setLoadingTable(false)
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

  const OpenModalMobile = cell => {
    setInitialValuesMobile(cell)
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
            Khách hàng tổng quan
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
        loading={loading || loadingTable}
        loadingExport={loadingExport}
        onExport={onExport}
      />
      {loading && <LoadingSkeleton />}
      {!loading && (
        <div className="row">
          <div className="col-lg-7 col-xl-6">
            <div className="row">
              <div className="col-md-6 col-lg-6">
                <div
                  className="rounded p-20px mb-20px"
                  style={{ backgroundColor: '#ffbed3' }}
                >
                  <div className="font-size-md fw-600 text-uppercase">
                    Tổng khách hàng
                  </div>
                  <ChartWidget2
                    colors={{
                      labelColor: '#343a40',
                      strokeColor: '#fff',
                      color: '#0d6efd',
                      borderColor: '#f1fafe'
                    }}
                    height={heightChart}
                    data={[15, 25, 15, 40, 20, 50]}
                  />
                  <div className="mt-30px d-flex align-items-baseline">
                    <div className="font-size-50 line-height-xxl fw-500 font-number">
                      {OverviewData?.TSo || 0}
                    </div>
                    <div className="fw-500 ml-10px font-size-md">
                      + {OverviewData?.TSo_Onl || 0} Khách từ Online
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-6">
                <div
                  className="rounded p-20px mb-20px"
                  style={{ backgroundColor: '#b9eff5' }}
                >
                  <div className="font-size-md fw-600 text-uppercase">
                    Mới trong ngày
                  </div>
                  <ChartWidget2
                    colors={{
                      labelColor: '#343a40',
                      strokeColor: '#fff',
                      color: '#0d6efd',
                      borderColor: '#f1fafe'
                    }}
                    height={heightChart}
                    data={[10, 10, 45, 10, 40, 50]}
                  />
                  <div className="mt-30px d-flex align-items-baseline">
                    <div className="font-size-50 line-height-xxl fw-500 font-number">
                      +{OverviewData?.Today || 0}
                    </div>
                    <div className="fw-500 ml-10px font-size-md">
                      {OverviewData?.Today_Onl || 0} Khách từ Online
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-6">
                <div
                  className="rounded p-20px mb-20px mb-md-0"
                  style={{ backgroundColor: '#bbc8f5' }}
                >
                  <div className="font-size-md fw-600 text-uppercase">
                    Mới trong tuần
                  </div>
                  <ChartWidget2
                    colors={{
                      labelColor: '#343a40',
                      strokeColor: '#fff',
                      color: '#0d6efd',
                      borderColor: '#f1fafe'
                    }}
                    height={heightChart}
                    data={[45, 15, 15, 40, 10, 50]}
                  />
                  <div className="mt-30px d-flex align-items-baseline">
                    <div className="font-size-50 line-height-xxl fw-500 font-number">
                      +{OverviewData?.ThisWeek || 0}
                    </div>
                    <div className="fw-500 ml-10px font-size-md">
                      {OverviewData?.ThisWeek_Onl || 0} Khách từ Online
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-6">
                <div
                  className="rounded p-20px"
                  style={{ backgroundColor: '#9abef1' }}
                >
                  <div className="font-size-md fw-600 text-uppercase">
                    Mới trong tháng
                  </div>
                  <ChartWidget2
                    colors={{
                      labelColor: '#343a40',
                      strokeColor: '#fff',
                      color: '#0d6efd',
                      borderColor: '#f1fafe'
                    }}
                    height={heightChart}
                    data={[15, 45, 25, 10, 40, 30]}
                  />
                  <div className="mt-30px d-flex align-items-baseline">
                    <div className="font-size-50 line-height-xxl fw-500 font-number">
                      +{OverviewData?.ThisMonth || 0}
                    </div>
                    <div className="fw-500 ml-10px font-size-md">
                      {OverviewData?.ThisMonth_Onl || 0} Khách từ Online
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-5 col-xl-6">
            <div className="bg-white rounded p-20px h-100 d-flex align-items-center justify-content-center mt-20px mt-lg-0">
              <Chart2Column options={optionsObj} data={dataChart} />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded mt-25px">
        <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between">
          <div className="fw-500 font-size-lg">Danh sách khách hàng</div>
          {width > 1200 ? (
            <div className="d-flex">
              <div className="fw-500">
                Tổng KH
                <span className="font-size-xl fw-600 text-success pl-5px font-number">
                  {PageTotal.Total}
                </span>
              </div>
              <div className="fw-500 pl-20px">
                KH đến từ Online
                <span className="font-size-xl fw-600 text-success pl-5px font-number">
                  {PageTotal.TotalOnline}
                </span>
              </div>
            </div>
          ) : (
            <div className="fw-500 d-flex align-items-center">
              Tổng KH
              <OverlayTrigger
                rootClose
                trigger="click"
                key="bottom"
                placement="bottom"
                overlay={
                  <Popover id={`popover-positioned-top`}>
                    <Popover.Body className="p-0">
                      <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                        <span>Tổng KH</span>
                        <span>{PageTotal.Total}</span>
                      </div>
                      <div className="py-10px px-15px fw-600 font-size-md d-flex justify-content-between">
                        <span>KH đến từ Online</span>
                        <span>{PageTotal.TotalOnline}</span>
                      </div>
                    </Popover.Body>
                  </Popover>
                }
              >
                <div className="d-flex justify-content-between align-items-center">
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {PageTotal.Total}
                  </span>
                  <i className="fa-solid fa-circle-exclamation cursor-pointer text-success ml-5px"></i>
                </div>
              </OverlayTrigger>
            </div>
          )}
        </div>
        <div className="p-20px">
          <ReactTableV7
            rowKey="MobilePhone"
            filters={filters}
            columns={columns}
            data={data}
            loading={loadingTable}
            pageCount={pageCount}
            onPagesChange={onPagesChange}
            optionMobile={{
              CellModal: cell => OpenModalMobile(cell)
            }}
          />
          <ModalViewMobile
            show={isModalMobile}
            onHide={HideModalMobile}
            data={initialValuesMobile}
          />
        </div>
      </div>
    </div>
  )
}

export default OverviewCustomer
