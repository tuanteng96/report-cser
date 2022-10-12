import React, { Fragment, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import LoadingSkeleton from './LoadingSkeleton'
import reportsApi from 'src/api/reports.api'
import FilterList from 'src/components/Filter/FilterList'
import ElementEmpty from 'src/components/Empty/ElementEmpty'
import { PriceHelper } from 'src/helpers/PriceHelper'
import { ArrayHeplers } from 'src/helpers/ArrayHeplers'
import { useWindowSize } from 'src/hooks/useWindowSize'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

const perfectScrollbarOptions = {
  wheelSpeed: 2,
  wheelPropagation: false
}

function TopProducts(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    DateStart: new Date(), // Ngày,
    DateEnd: new Date(), // Ngày,
    TopType: ''
  })
  const [StockName, setStockName] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [isFilter, setIsFilter] = useState(false)
  const [dataResult, setDataResult] = useState({
    TOP_BH: [], //
    TOP_DS: [] //
  })
  const [heighElm, setHeightElm] = useState({
    Content: 'calc(100% - 55px)',
    Box: 'calc(100% - 100px)'
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

  const GeneralNewFilter = filters => {
    return {
      ...filters,
      DateStart: filters.DateStart
        ? moment(filters.DateStart).format('DD/MM/yyyy')
        : null,
      DateEnd: filters.DateEnd
        ? moment(filters.DateEnd).format('DD/MM/yyyy')
        : null
    }
  }

  const getSalesDetail = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    const newFilters = GeneralNewFilter(filters)
    reportsApi
      .getListTopSalesDetail(newFilters)
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          var List_TOP_BH = data?.result ? [...data?.result] : []
          var List_TOP_DS = data?.result ? [...data?.result] : []

          if (filters.TopType) {
            List_TOP_BH = List_TOP_BH.filter(
              item => item.Format === Number(filters.TopType)
            ).sort((a, b) => parseFloat(b.SumQTy) - parseFloat(a.SumQTy))
            List_TOP_DS = List_TOP_DS.filter(
              item => item.Format === Number(filters.TopType)
            ).sort((a, b) => parseFloat(b.SumTopay) - parseFloat(a.SumTopay))
          } else {
            List_TOP_BH = List_TOP_BH.sort((a, b) => b.SumQTy - a.SumQTy)
            List_TOP_DS = List_TOP_DS.sort((a, b) => b.SumTopay - a.SumTopay)
          }
          setDataResult({
            TOP_BH: ArrayHeplers.getItemSize(List_TOP_BH, 15),
            TOP_DS: ArrayHeplers.getItemSize(List_TOP_DS, 15)
          })
          setLoading(false)
          isFilter && setIsFilter(false)
          callback && callback()
          PermissionHelpers.HideErrorAccess()
        }
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

  const onExport = () => {
    setLoadingExport(true)
    const newFilters = GeneralNewFilter(
      ArrayHeplers.getFilterExport({ ...filters })
    )
    reportsApi
      .getListTopSalesDetail(newFilters)
      .then(({ data }) => {
        window?.EzsExportExcel &&
          window?.EzsExportExcel({
            Url: '/ban-hang/top-ban-hang-doanh-so',
            Data: data,
            hideLoading: () => setLoadingExport(false)
          })
      })
      .catch(error => console.log(error))
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
    <div className="py-main h-100 d-flex flex-column">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            TOP bán hàng, doanh số
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
      {loading && <LoadingSkeleton />}
      {!loading && (
        <div className="flex-grow-1" style={{ height: heighElm.Content }}>
          <div className="row h-auto h-lg-100">
            <div className="col-lg-6 col-md-6 mb-15px mb-lg-0 h-100">
              <div className="bg-white rounded h-100">
                <div className="px-20px px-20px pt-20px">
                  <div className="fw-500 font-size-lg">TOP bán hàng</div>
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
                  {dataResult.TOP_BH && dataResult.TOP_BH.length > 0 ? (
                    <Fragment>
                      {dataResult.TOP_BH.map((item, index) => (
                        <div
                          className={`${
                            dataResult.TOP_BH.length - 1 === index
                              ? 'pt-12px'
                              : 'py-12px'
                          } border-top border-gray-200 d-flex`}
                          key={index}
                        >
                          <div className="font-size-md fw-500 flex-1 pr-20px pr-sm-15px">
                            {index + 1}. {item.ProdTitle}
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
            <div className="col-lg-6 col-md-6 h-100">
              <div className="bg-white rounded h-100">
                <div className="px-20px px-20px pt-20px">
                  <div className="fw-500 font-size-lg">TOP doanh số</div>
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
                  {dataResult.TOP_DS && dataResult.TOP_DS.length > 0 ? (
                    <Fragment>
                      {dataResult.TOP_DS.map((item, index) => (
                        <div
                          className={`${
                            dataResult.TOP_DS.length - 1 === index
                              ? 'pt-12px'
                              : 'py-12px'
                          } border-top border-gray-200 d-flex`}
                          key={index}
                        >
                          <div className="font-size-md fw-500 flex-1 pr-20px pr-sm-15px">
                            {index + 1}. {item.ProdTitle}
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
          </div>
        </div>
      )}
    </div>
  )
}

export default TopProducts
