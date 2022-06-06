import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import IconMenuMobile from '../../components/IconMenuMobile'
import _ from 'lodash'
import ListReEx from './ListReEx'
import Filter from 'src/components/Filter/Filter'
import Chart2Column from '../../components/Chart2Column'
import reportsApi from 'src/api/reports.api'
import { PriceHelper } from 'src/helpers/PriceHelper'

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

const JSONData = {
  DS_THU_Week: [
    30000000, 15000000, 12000000, 50000000, 35000000, 8000000, 18000000
  ],
  DS_CHI_Week: [
    38000000, 11000000, 17000000, 51000000, 32000000, 8500000, 14000000
  ],
  TonTienDauKy: 12000000,
  ThuTrongKy: 12000000,
  ChiTrongKy: 12000000,
  ThuChiTrongKy: 6000000,
  ThuChiHienTai: 12000000
}

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

const labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
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
    Date: new Date() // Ngày
  })
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dataChart, setDataChart] = useState(objData)
  const [OverviewData, setOverviewData] = useState(null)

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
  }, [filters])

  const getOverviewReEx = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    const newFilters = {
      ...filters,
      Date: moment(filters.Date).format('DD/MM/yyyy')
    }
    reportsApi
      .getOverviewReEx(newFilters)
      .then(({ data }) => {
        const { DS_THU_Week, DS_CHI_Week } = data.result || JSONData
        setDataChart(prevState => ({
          ...prevState,
          datasets: [
            {
              label: `Thu`,
              data: DS_THU_Week || [],
              backgroundColor: 'rgba(53, 162, 235, 0.5)'
            },
            {
              label: `Chi`,
              data: DS_CHI_Week || [],
              backgroundColor: 'rgba(255, 99, 132, 0.5)'
            }
          ]
        }))
        setOverviewData(data.result || JSONData)
        setLoading(false)
        isFilter && setIsFilter(false)
        callback && callback()
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
      getOverviewReEx()
    } else {
      setFilters(values)
    }
  }

  const onRefresh = () => {
    getOverviewReEx()
  }

  return (
    <div className="py-main">
      <div className="mb-20px d-flex justify-content-between align-items-end">
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
        <div className="col-md-3">
          <div className="bg-white rounded p-15px">
            <div>{PriceHelper.formatVND(OverviewData?.TonTienDauKy)}</div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="bg-white rounded">a</div>
        </div>
        <div className="col-md-3">
          <div className="bg-white rounded p-15px">
            <div>{PriceHelper.formatVND(OverviewData?.TonTienDauKy)}</div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded p-20px mt-20px">
        <Chart2Column options={optionsObj} data={dataChart} />
      </div>
      <ListReEx />
    </div>
  )
}

export default RPReEx
