import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import IconMenuMobile from '../../components/IconMenuMobile'
import _ from 'lodash'
import ListReEx from './ListReEx'
import FilterList from 'src/components/Filter/FilterList'
import Chart2Column from '../../components/Chart2Column'
import reportsApi from 'src/api/reports.api'
import { PriceHelper } from 'src/helpers/PriceHelper'
import { AssetsHelpers } from 'src/helpers/AssetsHelpers'
import LoadingSkeleton from './LoadingSkeleton'

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
    Ps: 10, // Số lượng item
    PaymentMethods: '', // TM, CK, QT
    TypeTC: '', // Thu hay chi
    TagsTC: '' // ID nhân viên
  })
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingList, setLoadingList] = useState(false)
  const [ListData, setListData] = useState(null)
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
      StockID: filters.StockID,
      DateStart: moment(filters.DateStart).format('DD/MM/yyyy'),
      DateEnd: moment(filters.DateEnd).format('DD/MM/yyyy')
    }
    reportsApi
      .getOverviewReEx(newFilters)
      .then(({ data }) => {
        setDataChart(prevState => ({
          ...prevState,
          labels: data.result?.DS ? data.result?.DS.map(item => item.Text) : [],
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
      })
      .catch(error => console.log(error))
  }

  useEffect(() => {
    getListReEx()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListReEx = (isLoading = true, callback) => {
    isLoading && setLoadingList(true)
    const newFilters = {
      ...filters,
      DateStart: filters.DateStart
        ? moment(filters.DateStart).format('DD/MM/yyyy')
        : null,
      DateEnd: filters.DateEnd
        ? moment(filters.DateEnd).format('DD/MM/yyyy')
        : null,
      PaymentMethods:
        filters.PaymentMethods && filters.PaymentMethods.length > 0
          ? filters.PaymentMethods.map(item => item.value).join(',')
          : '',
      TagsTC:
        filters.TagsTC && filters.TagsTC.length > 0
          ? filters.TagsTC.map(item => item.value).join(',')
          : ''
    }
    reportsApi
      .getListReEx(newFilters)
      .then(({ data }) => {
        setListData(data.result)
        setLoadingList(false)
        !loading && isFilter && setIsFilter(false)
        callback && callback()
      })
      .catch(error => console.log(error))
  }

  const onSizePerPageChange = PsNew => {
    setFilters({ ...filters, Ps: PsNew })
  }

  const onPageChange = PiNew => {
    setFilters({ ...filters, Pi: PiNew })
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
      setFilters(values)
    }
  }

  const onRefresh = () => {
    getOverviewReEx()
    getListReEx()
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
          <FilterList
            show={isFilter}
            filters={filters}
            onHide={onHideFilter}
            onSubmit={onFilter}
            onRefresh={onRefresh}
            loading={loading}
          />
        </div>
      </div>
      {loading && <LoadingSkeleton />}
      {!loading && (
        <div className="row">
          <div className="col-md-6 order-1">
            <div
              className="bg-white rounded px-20px py-30px text-center"
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
          </div>
          <div className="col-md-6 order-3 order-md-2">
            <div
              className="bg-white rounded px-20px py-30px mt-20px mt-md-0 text-center"
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
          <div className="col-md-12 order-2 order-md-3">
            <div className="bg-white rounded px-20px py-30px d-flex mt-20px flex-column flex-md-row">
              <div className="flex-1 text-center">
                <div className="font-number font-size-30 fw-600 line-height-xxl">
                  {PriceHelper.formatVND(OverviewData?.ThuTrongKy)}
                </div>
                <div className="fw-600 text-uppercase text-muted font-size-smm mt-5px">
                  Thu trong kỳ
                </div>
              </div>
              <div className="flex-1 text-center border-left border-left-0 border-md-left-1  border-right border-right-0 border-md-right-1 border-gray-200 border-bottom border-md-bottom-0 border-top border-md-top-0 py-20px my-20px py-md-0 my-md-0">
                <div className="font-number font-size-30 fw-600 line-height-xxl text-danger">
                  {PriceHelper.formatVNDPositive(OverviewData?.ChiTrongKy)}
                </div>
                <div className="fw-600 text-uppercase text-muted font-size-smm mt-5px">
                  Chi trong kỳ
                </div>
              </div>
              <div className="flex-1 text-center">
                <div className="font-number font-size-30 fw-600 line-height-xxl">
                  {PriceHelper.formatVND(OverviewData?.ThuChiTrongKy)}
                </div>
                <div className="fw-600 text-uppercase text-muted font-size-smm mt-5px">
                  Tồn kỳ
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white rounded p-20px mt-20px">
        <Chart2Column options={optionsObj} data={dataChart} />
      </div>
      <ListReEx
        filters={filters}
        onSizePerPageChange={onSizePerPageChange}
        onPageChange={onPageChange}
        loading={loadingList}
        DataResult={ListData}
      />
    </div>
  )
}

export default RPReEx
