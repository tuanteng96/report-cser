import React, { useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import FilterList from 'src/components/Filter/FilterList'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import reportsApi from 'src/api/reports.api'
import ListSell from './ListSell'
import ChartYear from './ChartYear'
import ChartWeek from './ChartWeek'
import LoadingSkeleton from './LoadingSkeleton'
import { PriceHelper } from 'src/helpers/PriceHelper'
import ChartCircle from './ChartCircle'
import { useWindowSize } from 'src/hooks/useWindowSize'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

function Sales(props) {
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
    Voucher: '', // Trạng thái
    Payment: '', // Bảo hành
    IsMember: '' // ID nhân viên
  })
  const [StockName, setStockName] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [isFilter, setIsFilter] = useState(false)
  const [dataSell, setDataSell] = useState({})
  const [heightElm, setHeightElm] = useState(0)
  const elementRef = useRef(null)
  const { width } = useWindowSize()
  const elementListRef = useRef()

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
    getOverviewSell()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const awaitLoading = fn => {
    if (elementListRef?.current.getLoading()) {
      setTimeout(() => {
        awaitLoading(fn)
      }, 50)
    } else {
      fn()
    }
  }

  const getOverviewSell = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    const newFilters = {
      StockID: filters.StockID,
      DateStart: filters.DateStart
        ? moment(filters.DateStart).format('DD/MM/yyyy')
        : null,
      DateEnd: filters.DateEnd
        ? moment(filters.DateEnd).format('DD/MM/yyyy')
        : null
    }

    reportsApi
      .getOverviewSell(newFilters)
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          setDataSell({
            ...data.result,
            SellWeek: data?.result
              ? [
                  data?.result?.DSo_ThisMonday,
                  data?.result?.DSo_ThisTuesday,
                  data?.result?.DSo_ThisWednesday,
                  data?.result?.DSo_ThisThursday,
                  data?.result?.DSo_ThisFriday,
                  data?.result?.DSo_ThisSaturday,
                  data?.result?.DSo_ThisSunday
                ]
              : [],
            SellYear: data?.result
              ? [
                  data?.result?.DSo_ThisJanuary,
                  data?.result?.DSo_ThisFebruary,
                  data?.result?.DSo_ThisMarch,
                  data?.result?.DSo_ThisApril,
                  data?.result?.DSo_ThisMay,
                  data?.result?.DSo_ThisJune,
                  data?.result?.DSo_ThisJuly,
                  data?.result?.DSo_ThisAugust,
                  data?.result?.DSo_ThisSeptember,
                  data?.result?.DSo_ThisOctober,
                  data?.result?.DSo_ThisNovember,
                  data?.result?.DSo_ThisDecember
                ]
              : []
          })

          if (isFilter) {
            awaitLoading(() => {
              setLoading(false)
              isFilter && setIsFilter(false)
              callback && callback()
            })
          } else {
            setLoading(false)
            isFilter && setIsFilter(false)
            callback && callback()
          }
        }
      })
      .catch(error => console.log(error))
  }

  const onFilter = values => {
    if (_.isEqual(values, filters)) {
      setLoading(true)
      elementListRef?.current?.onRefresh(() => getOverviewSell())
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    setLoading(true)
    elementListRef?.current?.onRefresh(() => getOverviewSell())
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
    setFilters({ ...filters, Ps: Ps, Pi: 1 })
  }

  const onExport = async () => {
    setLoadingExport(true)
    const data = await elementListRef?.current?.onGetDataExport()
    window?.EzsExportExcel &&
      window?.EzsExportExcel({
        Url: '/ban-hang/doanh-so',
        Data: data,
        hideLoading: () => setLoadingExport(false)
      })
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Doanh số
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
        <div className="col-md-12 col-lg-5" ref={elementRef}>
          {loading && <LoadingSkeleton filters={filters} />}
          {!loading && (
            <div className="bg-white rounded report-sell-overview">
              <div
                className="rounded text-white p-30px elm-top"
                style={{ backgroundColor: '#f54e60' }}
              >
                <div className="mb-15px d-flex justify-content-between align-items-end">
                  <span className="text-uppercase fw-600 font-size-xl">
                    Doanh số bán hàng
                  </span>
                  {/* <span className="date">
                    {moment(filters.Date).format('ddd, ll')}
                  </span> */}
                </div>
                <div className="font-number text-center py-3 py-md-5 fw-600 total">
                  +{PriceHelper.formatVND(dataSell.DSo_Ngay)}
                </div>
              </div>
              <div className="p-25px" style={{ marginTop: '-60px' }}>
                <div className="row">
                  <div className="col-md-6">
                    <div
                      className="rounded mb-20px p-4"
                      style={{ backgroundColor: '#E1F0FF', color: '#3699FF' }}
                    >
                      <i className="fa-solid fa-money-bill-wave font-size-30"></i>
                      <div className="font-number fw-600 mt-10px d-flex align-items-center">
                        <span className="total-2">
                          {PriceHelper.formatVND(dataSell.DSo_TToan)}
                        </span>
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
                                Chi tiết thanh toán
                              </Popover.Header>
                              <Popover.Body className="p-0">
                                <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                                  <span>Tiền mặt</span>
                                  <span>
                                    {PriceHelper.formatVND(
                                      dataSell.DSo_TToan_TMat
                                    )}
                                  </span>
                                </div>
                                <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                                  <span>Chuyển khoản</span>
                                  <span>
                                    {PriceHelper.formatVND(
                                      dataSell.DSo_TToan_CKhoan
                                    )}
                                  </span>
                                </div>
                                <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                                  <span>Quẹt thẻ</span>
                                  <span>
                                    {PriceHelper.formatVND(
                                      dataSell.DSo_TToan_QThe
                                    )}
                                  </span>
                                </div>
                              </Popover.Body>
                            </Popover>
                          }
                        >
                          <i className="fa-solid fa-circle-exclamation font-size-xl pl-5px cursor-pointer"></i>
                        </OverlayTrigger>
                      </div>
                      <div className="">Thanh toán</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div
                      className="rounded mb-20px p-4"
                      style={{ backgroundColor: '#FFF4DE', color: '#FFA800' }}
                    >
                      <i className="fa-solid fa-wallet font-size-30"></i>
                      <div className="font-number total-2 fw-600 mt-10px">
                        {PriceHelper.formatVNDPositive(dataSell.DSo_TToan_Vi)}
                      </div>
                      <div className="">Thanh toán từ ví</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div
                      className="rounded p-4 mb-4 mb-md-0"
                      style={{ backgroundColor: '#C9F7F5', color: '#1BC5BD' }}
                    >
                      <i className="fa-solid fa-id-card font-size-30"></i>
                      <div className="font-number total-2 fw-600 mt-10px">
                        {PriceHelper.formatVNDPositive(
                          dataSell.DSo_TToan_ThTien
                        )}
                      </div>
                      <div className="">Từ thẻ tiền</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div
                      className="rounded p-4"
                      style={{ backgroundColor: '#FFE2E5', color: '#F64E60' }}
                    >
                      <i className="fa-solid fa-credit-card-blank font-size-30"></i>
                      <div className="font-number total-2 fw-600 mt-10px">
                        {PriceHelper.formatVNDPositive(dataSell.DSo_No_PSinh)}
                      </div>
                      <div className="">Nợ phát sinh</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="col-md-12 col-lg-7">
          <div className="row">
            <div className="col-md-12">
              <div
                className="bg-white rounded p-4 w-100 mt-4 mt-lg-0"
                style={{ height: heightElm > 0 ? `${heightElm}px` : 'auto' }}
              >
                <ChartCircle
                  loading={loading}
                  height={heightElm > 0 ? `${heightElm}px` : 'auto'}
                  data={dataSell.product1Days}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <ListSell
        onPageChange={onPageChange}
        onSizePerPageChange={onSizePerPageChange}
        filters={filters}
        ref={elementListRef}
      />
      <div className="row">
        <div className="col-md-6">
          <div className="bg-white rounded mt-20px">
            <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between">
              <div className="fw-500 font-size-lg">Doanh số theo tuần</div>
            </div>
            <div className="p-20px">
              <ChartWeek loading={loading} data={dataSell.SellWeek} />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="bg-white rounded mt-20px">
            <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between">
              <div className="fw-500 font-size-lg">Doanh số theo năm</div>
            </div>
            <div className="p-20px">
              <ChartYear loading={loading} data={dataSell.SellYear} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sales
