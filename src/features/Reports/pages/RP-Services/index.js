import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import IconMenuMobile from '../../components/IconMenuMobile'
import Filter from 'src/components/Filter/Filter'
import _ from 'lodash'
import ListServices from './ListServices'
import ChartWidget2 from '../../components/ChartWidget2'
import reportsApi from 'src/api/reports.api'
import LoadingSkeleton from './LoadingSkeleton'
import ChartPie from '../../components/ChartPie'
import { ColorsHelpers } from 'src/helpers/ColorsHelpers'
import ElementEmpty from 'src/components/Empty/ElementEmpty'

import moment from 'moment'
import 'moment/locale/vi'
import LoadingChart from 'src/components/Loading/LoadingChart'
import { TextHelper } from 'src/helpers/TextHelpers'
import { useWindowSize } from 'src/hooks/useWindowSize'
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

function RPServices(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    Date: new Date() // Ngày,
  })
  const [dataChart, setDataChart] = useState(objData)
  const [optionsChart, setOptionsChart] = useState(optionsObj)
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [loading, setLoading] = useState(false)
  const [OverviewData, setOverviewData] = useState(null)
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
      item => Number(item.ID) === Number(CrStockID)
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
  }, [filters])

  const getOverviewService = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    const newFilters = {
      ...filters,
      Date: moment(filters.Date).format('DD/MM/yyyy')
    }
    reportsApi
      .getOverviewServices(newFilters)
      .then(({ data }) => {
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
        isFilter && setIsFilter(false)
        callback && callback()
      })
      .catch(error => console.log(error))
  }

  const onFilter = values => {
    if (_.isEqual(values, filters)) {
      getOverviewService()
    } else {
      setFilters(values)
    }
  }

  const onRefresh = () => {
    getOverviewService()
  }

  const onOpenFilter = () => {
    setIsFilter(true)
  }

  const onHideFilter = () => {
    setIsFilter(false)
  }

  return (
    <div className="py-main">
      <div className="mb-20px d-flex justify-content-between align-items-end">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Báo cáo dịch vụ
          </span>
          <span className="ps-0 ps-lg-3 text-muted d-block d-lg-inline-block">
            {StockName}
          </span>
        </div>
        <div className="w-85px">
          <button
            type="button"
            className="btn btn-primary p-0 w-40px h-35px"
            onClick={onOpenFilter}
          >
            <i className="fa-regular fa-filters font-size-lg mt-5px"></i>
          </button>
          <IconMenuMobile />
          <Filter
            show={isFilter}
            filters={filters}
            onHide={onHideFilter}
            onSubmit={onFilter}
            onRefresh={onRefresh}
            loading={loading}
          />
        </div>
      </div>
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
                    Dịch vụ hôm nay
                  </div>
                  <ChartWidget2
                    colors={{
                      labelColor: '#343a40',
                      strokeColor: '#fff',
                      color: '#0d6efd',
                      borderColor: '#f1fafe'
                    }}
                    height={100}
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
                    height={100}
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
                    height={100}
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
      <ListServices />
    </div>
  )
}

export default RPServices
