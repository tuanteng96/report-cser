import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import ChartWidget2 from '../../components/ChartWidget2'
import IconMenuMobile from '../../components/IconMenuMobile'
import Chart2Column from '../../components/Chart2Column'
import LoadingSkeleton from './LoadingSkeleton'
import reportsApi from 'src/api/reports.api'
import ListCustomer from './ListCustomer'
import _ from 'lodash'

import moment from 'moment'
import 'moment/locale/vi'
import FilterList from 'src/components/Filter/FilterList'
import { useWindowSize } from 'src/hooks/useWindowSize'
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

function RPCustomer() {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    DateStart: new Date(), // Ngày bắt đầu
    DateEnd: new Date(), // Ngày kết thúc
    Pi: 1, // Trang hiện tại
    Ps: 10, // Số lượng item
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
  const [isFilter, setIsFilter] = useState(false)
  const [heightChart, setHeightChart] = useState(100)
  const elementListRef = useRef()
  const { width } = useWindowSize()

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
        isFilter && setIsFilter(false)
        callback && callback()
      })
      .catch(error => console.log(error))
  }

  const onFilter = values => {
    if (_.isEqual(values, filters)) {
      elementListRef?.current?.onRefresh(() => getOverviewCustomer())
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    elementListRef?.current?.onRefresh(() => getOverviewCustomer())
  }

  const onOpenFilter = () => {
    setIsFilter(true)
  }

  const onHideFilter = () => {
    setIsFilter(false)
  }

  const onPageChange = Pi => {
    setFilters({ ...filters, Pi: Pi })
  }

  const onSizePerPageChange = Ps => {
    setFilters({ ...filters, Ps: Ps })
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Khách hàng
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
      <ListCustomer
        onPageChange={onPageChange}
        onSizePerPageChange={onSizePerPageChange}
        filters={filters}
        ref={elementListRef}
      />
    </div>
  )
}

export default RPCustomer
