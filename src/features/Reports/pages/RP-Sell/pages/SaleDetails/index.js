import React, { Fragment, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import LoadingSkeleton from './LoadingSkeleton'
import reportsApi from 'src/api/reports.api'
import FilterList from 'src/components/Filter/FilterList'
import ElementEmpty from 'src/components/Empty/ElementEmpty'
import { PriceHelper } from 'src/helpers/PriceHelper'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useWindowSize } from 'src/hooks/useWindowSize'

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

const perfectScrollbarOptions = {
  wheelSpeed: 2,
  wheelPropagation: false
}

function SaleDetails(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    DateStart: new Date(), // Ngày,
    DateEnd: new Date() // Ngày,
  })
  const [StockName, setStockName] = useState('')
  const [loading, setLoading] = useState(false)
  const [isFilter, setIsFilter] = useState(false)
  const [dataResult, setDataResult] = useState({
    SP_NVL: [], //1
    DV_PP: [], //2
    TT: [] //3
  })
  const [heighElm, setHeightElm] = useState({
    Content: 'calc(100% - 55px)',
    Box: 'calc(100% - 120px)'
  })
  const { width } = useWindowSize()

  useEffect(() => {
    if (width < 991 && width > 0) {
      setHeightElm({
        Content: 'auto',
        Box: '350px'
      })
    }
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
    getSalesDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getSalesDetail = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    const newFilters = {
      ...filters,
      DateStart: filters.DateStart
        ? moment(filters.DateStart).format('DD/MM/yyyy')
        : null,
      DateEnd: filters.DateEnd
        ? moment(filters.DateEnd).format('DD/MM/yyyy')
        : null,
      Voucher: filters.Voucher ? filters.Voucher.value : '',
      Payment: filters.Payment ? filters.Payment.value : '',
      IsMember: filters.IsMember ? filters.IsMember.value : ''
    }
    reportsApi
      .getListSalesDetail(newFilters)
      .then(({ data }) => {
        setDataResult({
          SP_NVL:
            (data?.result && data?.result.filter(item => item.Format === 1)) ||
            [],
          DV_PP:
            (data?.result && data?.result.filter(item => item.Format === 2)) ||
            [],
          TT:
            (data?.result && data?.result.filter(item => item.Format === 3)) ||
            []
        })
        setLoading(false)
        isFilter && setIsFilter(false)
        callback && callback()
      })
      .catch(error => console.log(error))
  }

  const onFilter = values => {
    if (_.isEqual(values, filters)) {
      getSalesDetail()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    getSalesDetail()
  }

  const onOpenFilter = () => {
    setIsFilter(true)
  }

  const onHideFilter = () => {
    setIsFilter(false)
  }

  return (
    <div className="py-main py-main-100 d-flex flex-column">
      <div className="mb-20px d-flex justify-content-between align-items-end flex-shrink-1">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Sản phẩm, dịch vụ bán ra
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
        <div className="flex-1-1-auto" style={{ height: heighElm.Content }}>
          <div className="row h-auto h-lg-100">
            <div className="col-lg-4 mb-15px mb-lg-0 h-100">
              <div className="bg-white rounded h-100">
                <div className="px-20px px-20px pt-20px">
                  <div className="fw-500 font-size-lg">Sản phẩm / NVL</div>
                  <div className="text-muted font-size-smm">
                    Tổng {(dataResult.SP_NVL && dataResult.SP_NVL.length) || 0}{' '}
                    sản phẩm, NVL
                  </div>
                  <div className="mt-12px">
                    <div className="d-flex justify-content-between py-12px">
                      <div className="text-muted2 text-uppercase font-size-smm fw-500 flex-1 pr-20px pr-sm-15px">
                        Tên mặt hàng
                      </div>
                      <div className="text-muted2 text-uppercase font-size-smm fw-500 w-40px pr-15px text-center">
                        SL
                      </div>
                      <div className="text-muted2 text-uppercase font-size-smm fw-500 w-70px w-sm-100px text-end">
                        Doanh số
                      </div>
                    </div>
                  </div>
                </div>
                <PerfectScrollbar
                  options={perfectScrollbarOptions}
                  className="scroll px-20px px-20px pb-20px"
                  style={{ position: 'relative', maxHeight: heighElm.Box }}
                >
                  {dataResult.SP_NVL && dataResult.SP_NVL.length > 0 ? (
                    <Fragment>
                      {dataResult.SP_NVL.map((item, index) => (
                        <div
                          className={`${
                            dataResult.SP_NVL.length - 1 === index
                              ? 'pt-12px'
                              : 'py-12px'
                          } border-top border-gray-200 d-flex`}
                          key={index}
                        >
                          <div className="font-size-md fw-500 flex-1 pr-20px pr-sm-15px">
                            {item.ProdTitle}
                          </div>
                          <div className="w-40px fw-500 pr-15px text-center">
                            {item.SumQTy}
                          </div>
                          <div className="fw-500 w-70px w-sm-100px text-end">
                            {PriceHelper.formatVND(item.SumTopay)}
                          </div>
                        </div>
                      ))}
                    </Fragment>
                  ) : (
                    <ElementEmpty />
                  )}
                </PerfectScrollbar>
              </div>
            </div>
            <div className="col-lg-4 mb-15px mb-lg-0 h-100">
              <div className="bg-white rounded h-100">
                <div className="px-20px px-20px pt-20px">
                  <div className="fw-500 font-size-lg">Dịch vụ / Phụ phí</div>
                  <div className="text-muted font-size-smm">
                    Tổng {(dataResult.DV_PP && dataResult.DV_PP.length) || 0}{' '}
                    dịch vụ, Phụ phí
                  </div>
                  <div className="mt-12px">
                    <div className="d-flex justify-content-between py-12px">
                      <div className="text-muted2 text-uppercase font-size-smm fw-500 flex-1 pr-20px pr-sm-15px">
                        Tên mặt hàng
                      </div>
                      <div className="text-muted2 text-uppercase font-size-smm fw-500 w-40px pr-15px text-center">
                        SL
                      </div>
                      <div className="text-muted2 text-uppercase font-size-smm fw-500 w-70px w-sm-100px text-end">
                        Doanh số
                      </div>
                    </div>
                  </div>
                </div>
                <PerfectScrollbar
                  options={perfectScrollbarOptions}
                  className="scroll px-20px px-20px pb-20px"
                  style={{ position: 'relative', maxHeight: heighElm.Box }}
                >
                  {dataResult.DV_PP.length > 0 ? (
                    <Fragment>
                      {dataResult.DV_PP &&
                        dataResult.DV_PP.map((item, index) => (
                          <div
                            className={`${
                              dataResult.DV_PP.length - 1 === index
                                ? 'pt-12px'
                                : 'py-12px'
                            } border-top border-gray-200 d-flex`}
                            key={index}
                          >
                            <div className="font-size-md fw-500 flex-1 pr-20px pr-sm-15px">
                              {item.ProdTitle}
                            </div>
                            <div className="w-40px fw-500 pr-15px text-center">
                              {item.SumQTy}
                            </div>
                            <div className="fw-500 w-100px text-end">
                              {PriceHelper.formatVND(item.SumTopay)}
                            </div>
                          </div>
                        ))}
                    </Fragment>
                  ) : (
                    <ElementEmpty />
                  )}
                </PerfectScrollbar>
              </div>
            </div>
            <div className="col-lg-4 h-100">
              <div className="bg-white rounded h-100">
                <div className="px-20px px-20px pt-20px">
                  <div className="fw-500 font-size-lg">Thẻ tiền</div>
                  <div className="text-muted font-size-smm">
                    Tổng {(dataResult.TT && dataResult.TT.length) || 0} thẻ tiền
                  </div>
                  <div className="mt-12px">
                    <div className="d-flex justify-content-between py-12px">
                      <div className="text-muted2 text-uppercase font-size-smm fw-500 flex-1 pr-20px pr-sm-15px">
                        Tên mặt hàng
                      </div>
                      <div className="text-muted2 text-uppercase font-size-smm fw-500 w-40px pr-15px text-center">
                        SL
                      </div>
                      <div className="text-muted2 text-uppercase font-size-smm fw-500 w-70px w-sm-100px text-end">
                        Doanh số
                      </div>
                    </div>
                  </div>
                </div>
                <PerfectScrollbar
                  options={perfectScrollbarOptions}
                  className="scroll px-20px px-20px pb-20px"
                  style={{ position: 'relative', maxHeight: heighElm.Box }}
                >
                  {dataResult.TT && dataResult.TT.length > 0 ? (
                    <Fragment>
                      {dataResult.TT.map((item, index) => (
                        <div
                          className={`${
                            dataResult.TT.length - 1 === index
                              ? 'pt-12px'
                              : 'py-12px'
                          } border-top border-gray-200 d-flex`}
                          key={index}
                        >
                          <div className="font-size-md fw-500 flex-1 pr-20px pr-sm-15px">
                            {item.ProdTitle}
                          </div>
                          <div className="w-40px fw-500 pr-15px text-center">
                            {item.SumQTy}
                          </div>
                          <div className="fw-500 w-100px text-end">
                            {PriceHelper.formatVND(item.SumTopay)}
                          </div>
                        </div>
                      ))}
                    </Fragment>
                  ) : (
                    <ElementEmpty />
                  )}
                </PerfectScrollbar>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SaleDetails
