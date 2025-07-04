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
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import { ArrayHeplers } from 'src/helpers/ArrayHeplers'
import { JsonFilter } from 'src/Json/JsonFilter'

import moment from 'moment'
import 'moment/locale/vi'
import PickerView from './PickerView'

moment.locale('vi')

let { TimeToRealList } = JsonFilter

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
    DateEnd: new Date(), // Ngày,
    BrandIds: '',
    CategoriesIds: '',
    ProductIds: '',
    TimeToReal: TimeToRealList[1],
    ShowsType: '1'
  })
  const [StockName, setStockName] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [isFilter, setIsFilter] = useState(false)
  const [dataResult, setDataResult] = useState({
    SP_NVL: [], //1
    DV_PP: [], //2
    TT: [] //3
  })
  const [Total, setTotal] = useState({
    SL: 0,
    DS: 0,
    TongThanhToan: 0,
    TongThanhToanSP_NVL: 0,
    TongThanhToanDV_PP: 0,
    TongThanhToanTT: 0
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

  const GeneralNewFilter = filters => {
    return {
      ...filters,
      DateStart: filters.DateStart
        ? moment(filters.DateStart).format('DD/MM/yyyy')
        : null,
      DateEnd: filters.DateEnd
        ? moment(filters.DateEnd).format('DD/MM/yyyy')
        : null,
      Voucher: filters.Voucher ? filters.Voucher.value : '',
      Payment: filters.Payment ? filters.Payment.value : '',
      IsMember: filters.IsMember ? filters.IsMember.value : '',
      BrandIds:
        filters.BrandIds && filters.BrandIds.length > 0
          ? filters.BrandIds.map(item => item.value).join(',')
          : '',
      CategoriesIds:
        filters.CategoriesIds && filters.CategoriesIds.length > 0
          ? filters.CategoriesIds.map(item => item.value).join(',')
          : '',
      ProductIds:
        filters.ProductIds && filters.ProductIds.length > 0
          ? filters.ProductIds.map(item => item.value).join(',')
          : '',
      TimeToReal: filters.TimeToReal ? filters.TimeToReal.value : ''
    }
  }

  const getSalesDetail = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    const newFilters = GeneralNewFilter(filters)
    reportsApi
      .getListSalesDetail(newFilters)
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          let obj = {
            SP_NVL:
              (data?.result &&
                data?.result.filter(item => item.Format === 1)) ||
              [],
            DV_PP:
              (data?.result &&
                data?.result.filter(item => item.Format === 2)) ||
              [],
            TT:
              (data?.result &&
                data?.result.filter(item => item.Format === 3)) ||
              []
          }

          setTotal(prevState => ({
            ...prevState,
            DS: ArrayHeplers.totalKeyArray(data?.result, 'SumTopay'),
            SL: ArrayHeplers.totalKeyArray(data?.result, 'SumQTy'),
            TongThanhToan: ArrayHeplers.totalKeyArray(
              data?.result
                ? data?.result.map(x => ({
                    ThanhToan: x.CK + x.QT + x.TM + x.TT + x.Vi
                  }))
                : [],
              'ThanhToan'
            ),
            TongThanhToanSP_NVL: ArrayHeplers.totalKeyArray(
              obj.SP_NVL.map(x => ({
                ThanhToan: x.CK + x.QT + x.TM + x.TT + x.Vi
              })),
              'ThanhToan'
            ),
            TongThanhToanDV_PP: ArrayHeplers.totalKeyArray(
              obj.DV_PP.map(x => ({
                ThanhToan: x.CK + x.QT + x.TM + x.TT + x.Vi
              })),
              'ThanhToan'
            ),
            TongThanhToanTT: ArrayHeplers.totalKeyArray(
              obj.TT.map(x => ({
                ThanhToan: x.CK + x.QT + x.TM + x.TT + x.Vi
              })),
              'ThanhToan'
            )
          }))

          setDataResult(obj)
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
    if (filters.ShowsType === '2') {
      reportsApi
        .getListSalesOnStock({
          From: moment(filters.DateStart).format('YYYY-MM-DD'),
          To: moment(filters.DateEnd).format('YYYY-MM-DD'),
          StockID: filters.StockID ? [filters.StockID] : []
        })
        .then(({ data }) => {
          window?.EzsExportExcel &&
            window?.EzsExportExcel({
              Url: '/ban-hang/sp-dv-ban-ra',
              Data: {
                ...data,
                param: {
                  Body: filters
                }
              },
              hideLoading: () => setLoadingExport(false)
            })
        })
    } else {
      reportsApi
        .getListSalesDetail(newFilters)
        .then(({ data }) => {
          window?.EzsExportExcel &&
            window?.EzsExportExcel({
              Url: '/ban-hang/sp-dv-ban-ra',
              Data: data,
              hideLoading: () => setLoadingExport(false)
            })
        })
        .catch(error => console.log(error))
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

  const sumTotalDS = data => {
    return data
      ? data.reduce((accumulator, object) => {
          return accumulator + object.SumTopay
        }, 0)
      : 0
  }

  return (
    <div className="py-main h-100 d-flex flex-column">
      <div className="subheader d-flex justify-content-between align-items-center flex-shrink-1">
        <div className="flex-1">
          <span className="text-uppercase font-size-xl fw-600">
            Sản phẩm, dịch vụ bán ra
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
      <div className="bg-white mb-15px">
        <div className="border-gray-200 px-20px py-15px d-flex align-items-center justify-content-between">
          <div className="fw-500 font-size-lg">Danh sách SP, DV bán ra</div>
          {width <= 1200 ? (
            <div className="fw-500 d-flex align-items-center">
              <OverlayTrigger
                rootClose
                trigger="click"
                key="bottom"
                placement="bottom"
                overlay={
                  <Popover id={`popover-positioned-top`}>
                    <Popover.Body className="p-0">
                      <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                        <span>Tổng thanh toán</span>
                        <span>
                          {PriceHelper.formatVNDPositive(Total.TongThanhToan)}
                        </span>
                      </div>
                      <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                        <span>Thanh toán Sản phẩm / NVL</span>
                        <span>
                          {PriceHelper.formatVNDPositive(
                            Total.TongThanhToanSP_NVL
                          )}
                        </span>
                      </div>
                      <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                        <span>Thanh toán Dịch vụ / PP</span>
                        <span>
                          {PriceHelper.formatVNDPositive(
                            Total.TongThanhToanDV_PP
                          )}
                        </span>
                      </div>
                      <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                        <span>Thanh toán Thẻ tiền</span>
                        <span>
                          {PriceHelper.formatVNDPositive(Total.TongThanhToanTT)}
                        </span>
                      </div>
                      <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                        <span>Tổng số lượng</span>
                        <span>{PriceHelper.formatVNDPositive(Total.SL)}</span>
                      </div>
                      <div className="py-10px px-15px fw-600 font-size-md d-flex justify-content-between">
                        <span>Tổng tiền</span>
                        <span>{PriceHelper.formatVNDPositive(Total.DS)}</span>
                      </div>
                    </Popover.Body>
                  </Popover>
                }
              >
                <div className="d-flex justify-content-between align-items-center">
                  <span className="font-size-xl fw-600 pl-5px font-number text-success">
                    {PriceHelper.formatVNDPositive(Total.DS)}
                  </span>
                  <i className="cursor-pointer fa-solid fa-circle-exclamation text-warning ml-5px"></i>
                </div>
              </OverlayTrigger>
            </div>
          ) : (
            <div className="d-flex">
              <div className="fw-500">
                Tổng số lượng{' '}
                <span className="font-size-xl fw-600 pl-5px font-number text-success">
                  {PriceHelper.formatVND(Total.SL)}
                </span>
              </div>
              <div className="fw-500 pl-20px">
                Tổng tiền{' '}
                <span className="font-size-xl fw-600 pl-5px font-number text-success">
                  {PriceHelper.formatVND(Total.DS)}
                </span>
              </div>
              <div className="fw-500 d-flex align-items-center">
                <OverlayTrigger
                  rootClose
                  trigger="click"
                  key="bottom"
                  placement="bottom"
                  overlay={
                    <Popover id={`popover-positioned-top`}>
                      <Popover.Body className="p-0">
                        <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                          <span>Thanh toán Sản phẩm / NVL</span>
                          <span>
                            {PriceHelper.formatVNDPositive(
                              Total.TongThanhToanSP_NVL
                            )}
                          </span>
                        </div>
                        <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                          <span>Thanh toán Dịch vụ / PP</span>
                          <span>
                            {PriceHelper.formatVNDPositive(
                              Total.TongThanhToanDV_PP
                            )}
                          </span>
                        </div>
                        <div className="py-10px px-15px fw-600 font-size-md d-flex justify-content-between">
                          <span>Thanh toán Thẻ tiền</span>
                          <span>
                            {PriceHelper.formatVNDPositive(
                              Total.TongThanhToanTT
                            )}
                          </span>
                        </div>
                      </Popover.Body>
                    </Popover>
                  }
                >
                  <div className="fw-500 pl-20px">
                    Tổng thanh toán{' '}
                    <span className="font-size-xl fw-600 pl-5px font-number text-success">
                      {PriceHelper.formatVND(Total.TongThanhToan)}
                    </span>
                    <i className="align-text-top cursor-pointer fa-solid fa-circle-exclamation text-warning ml-5px"></i>
                  </div>
                </OverlayTrigger>
              </div>
            </div>
          )}
        </div>
      </div>

      {!loading && (
        <div className="flex-grow-1">
          <div className="h-auto row h-lg-100">
            <div className="col-lg-4 mb-15px mb-lg-0 h-100">
              <div className="bg-white rounded h-100">
                <div className="px-20px pt-20px">
                  <div className="d-flex justify-content-between">
                    <div>
                      <div className="fw-500 font-size-lg">Sản phẩm / NVL</div>
                      <div className="text-muted font-size-smm">
                        Tổng{' '}
                        {(dataResult.SP_NVL && dataResult.SP_NVL.length) || 0}{' '}
                        sản phẩm, NVL
                      </div>
                    </div>
                    <div>
                      <div className="font-number fw-600 font-size-lg">
                        {PriceHelper.formatVNDPositive(
                          sumTotalDS(dataResult.SP_NVL)
                        )}
                      </div>
                      <div className="text-center text-muted font-size-smm">
                        Tổng doanh số
                      </div>
                    </div>
                  </div>
                  <div className="mt-12px">
                    <div className="d-flex justify-content-between py-12px">
                      <div className="flex-1 text-muted2 text-uppercase font-size-smm fw-500 pr-20px pr-sm-15px">
                        Tên mặt hàng
                      </div>
                      <div className="text-center text-muted2 text-uppercase font-size-smm fw-500 w-40px pr-15px">
                        SL
                      </div>
                      <div className="text-muted2 text-uppercase font-size-smm fw-500 w-70px w-sm-100px text-end">
                        Doanh số
                      </div>
                      <div className="text-muted2 text-uppercase font-size-smm fw-500 w-100px w-sm-120px text-end">
                        Thực thu
                      </div>
                    </div>
                  </div>
                </div>
                <PerfectScrollbar
                  options={perfectScrollbarOptions}
                  className="scroll px-20px pb-20px"
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
                          <PickerView item={item} filters={filters}>
                            {({ open }) => (
                              <div
                                className="flex-1 cursor-pointer font-size-md fw-500 pr-20px pr-sm-15px"
                                onClick={open}
                              >
                                {item.ProdTitle}
                              </div>
                            )}
                          </PickerView>
                          <div className="text-center w-40px fw-500 pr-15px">
                            {item.SumQTy}
                          </div>
                          <div className="fw-500 w-70px w-sm-100px text-end">
                            {PriceHelper.formatVND(item.SumTopay)}
                          </div>
                          <div className="fw-500 w-100px w-sm-120px text-end">
                            <OverlayTrigger
                              rootClose
                              trigger="click"
                              key="bottom"
                              placement="bottom"
                              overlay={
                                <Popover id={`popover-positioned-top`}>
                                  <Popover.Body className="p-0">
                                    <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                      <span>Chuyển khoản</span>
                                      <span>
                                        {PriceHelper.formatVNDPositive(item.CK)}
                                      </span>
                                    </div>
                                    <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                      <span>Quẹt thẻ</span>
                                      <span>
                                        {PriceHelper.formatVNDPositive(item.QT)}
                                      </span>
                                    </div>
                                    <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                      <span>Tiền mặt</span>
                                      <span>
                                        {PriceHelper.formatVNDPositive(item.TM)}
                                      </span>
                                    </div>
                                  </Popover.Body>
                                </Popover>
                              }
                            >
                              <div>
                                <div className="d-flex justify-content-end align-items-center">
                                  <span>
                                    {PriceHelper.formatVNDPositive(
                                      item.CK + item.QT + item.TM
                                    )}
                                  </span>
                                  <i className="cursor-pointer fa-solid fa-circle-exclamation text-warning ml-5px"></i>
                                </div>
                              </div>
                            </OverlayTrigger>
                            {Number(item.Vi + item.TT) > 0 && (
                              <OverlayTrigger
                                rootClose
                                trigger="click"
                                key="bottom"
                                placement="bottom"
                                overlay={
                                  <Popover id={`popover-positioned-top`}>
                                    <Popover.Body className="p-0">
                                      <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                        <span>Ví</span>
                                        <span>
                                          {PriceHelper.formatVNDPositive(
                                            item.Vi
                                          )}
                                        </span>
                                      </div>
                                      <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                        <span>Thẻ tiền</span>
                                        <span>
                                          {PriceHelper.formatVNDPositive(
                                            item.TT
                                          )}
                                        </span>
                                      </div>
                                    </Popover.Body>
                                  </Popover>
                                }
                              >
                                <div>
                                  <div className="d-flex justify-content-end align-items-center">
                                    <span>
                                      {PriceHelper.formatVNDPositive(
                                        item.Vi + item.TT
                                      )}
                                    </span>
                                    <i className="cursor-pointer fa-solid fa-circle-exclamation text-warning ml-5px"></i>
                                  </div>
                                </div>
                              </OverlayTrigger>
                            )}
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
                <div className="px-20px pt-20px">
                  <div className="d-flex justify-content-between">
                    <div>
                      <div className="fw-500 font-size-lg">Dịch vụ / PP</div>
                      <div className="text-muted font-size-smm">
                        Tổng{' '}
                        {(dataResult.DV_PP && dataResult.DV_PP.length) || 0}{' '}
                        dịch vụ, Phụ phí
                      </div>
                    </div>
                    <div>
                      <div className="font-number fw-600 font-size-lg">
                        {PriceHelper.formatVNDPositive(
                          sumTotalDS(dataResult.DV_PP)
                        )}
                      </div>
                      <div className="text-center text-muted font-size-smm">
                        Tổng doanh số
                      </div>
                    </div>
                  </div>
                  <div className="mt-12px">
                    <div className="d-flex justify-content-between py-12px">
                      <div className="flex-1 text-muted2 text-uppercase font-size-smm fw-500 pr-20px pr-sm-15px">
                        Tên mặt hàng
                      </div>
                      <div className="text-center text-muted2 text-uppercase font-size-smm fw-500 w-40px pr-15px">
                        SL
                      </div>
                      <div className="text-muted2 text-uppercase font-size-smm fw-500 w-70px w-sm-100px text-end">
                        Doanh số
                      </div>
                      <div className="text-muted2 text-uppercase font-size-smm fw-500 w-100px w-sm-120px text-end">
                        Thực thu
                      </div>
                    </div>
                  </div>
                </div>
                <PerfectScrollbar
                  options={perfectScrollbarOptions}
                  className="scroll px-20px pb-20px"
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
                            <PickerView item={item} filters={filters}>
                              {({ open }) => (
                                <div
                                  className="flex-1 cursor-pointer font-size-md fw-500 pr-20px pr-sm-15px"
                                  onClick={open}
                                >
                                  {item.ProdTitle}
                                </div>
                              )}
                            </PickerView>
                            <div className="text-center w-40px fw-500 pr-15px">
                              {item.SumQTy}
                            </div>
                            <div className="fw-500 w-100px text-end">
                              {PriceHelper.formatVND(item.SumTopay)}
                            </div>
                            <div className="fw-500 w-100px w-sm-120px text-end">
                              <OverlayTrigger
                                rootClose
                                trigger="click"
                                key="bottom"
                                placement="bottom"
                                overlay={
                                  <Popover id={`popover-positioned-top`}>
                                    <Popover.Body className="p-0">
                                      <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                        <span>Chuyển khoản</span>
                                        <span>
                                          {PriceHelper.formatVNDPositive(
                                            item.CK
                                          )}
                                        </span>
                                      </div>
                                      <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                        <span>Quẹt thẻ</span>
                                        <span>
                                          {PriceHelper.formatVNDPositive(
                                            item.QT
                                          )}
                                        </span>
                                      </div>
                                      <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                        <span>Tiền mặt</span>
                                        <span>
                                          {PriceHelper.formatVNDPositive(
                                            item.TM
                                          )}
                                        </span>
                                      </div>
                                    </Popover.Body>
                                  </Popover>
                                }
                              >
                                <div>
                                  <div className="d-flex justify-content-end align-items-center">
                                    <span>
                                      {PriceHelper.formatVNDPositive(
                                        item.CK + item.QT + item.TM
                                      )}
                                    </span>
                                    <i className="cursor-pointer fa-solid fa-circle-exclamation text-warning ml-5px"></i>
                                  </div>
                                </div>
                              </OverlayTrigger>
                              {Number(item.Vi + item.TT) > 0 && (
                                <OverlayTrigger
                                  rootClose
                                  trigger="click"
                                  key="bottom"
                                  placement="bottom"
                                  overlay={
                                    <Popover id={`popover-positioned-top`}>
                                      <Popover.Body className="p-0">
                                        <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                          <span>Ví</span>
                                          <span>
                                            {PriceHelper.formatVNDPositive(
                                              item.Vi
                                            )}
                                          </span>
                                        </div>
                                        <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                          <span>Thẻ tiền</span>
                                          <span>
                                            {PriceHelper.formatVNDPositive(
                                              item.TT
                                            )}
                                          </span>
                                        </div>
                                      </Popover.Body>
                                    </Popover>
                                  }
                                >
                                  <div>
                                    <div className="d-flex justify-content-end align-items-center">
                                      <span>
                                        {PriceHelper.formatVNDPositive(
                                          item.Vi + item.TT
                                        )}
                                      </span>
                                      <i className="cursor-pointer fa-solid fa-circle-exclamation text-warning ml-5px"></i>
                                    </div>
                                  </div>
                                </OverlayTrigger>
                              )}
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
                <div className="px-20px pt-20px">
                  <div className="d-flex justify-content-between">
                    <div>
                      <div className="fw-500 font-size-lg">Thẻ tiền</div>
                      <div className="text-muted font-size-smm">
                        Tổng {(dataResult.TT && dataResult.TT.length) || 0} thẻ
                        tiền
                      </div>
                    </div>
                    <div>
                      <div className="font-number fw-600 font-size-lg">
                        {PriceHelper.formatVNDPositive(
                          sumTotalDS(dataResult.TT)
                        )}
                      </div>
                      <div className="text-center text-muted font-size-smm">
                        Tổng doanh số
                      </div>
                    </div>
                  </div>
                  <div className="mt-12px">
                    <div className="d-flex justify-content-between py-12px">
                      <div className="flex-1 text-muted2 text-uppercase font-size-smm fw-500 pr-20px pr-sm-15px">
                        Tên mặt hàng
                      </div>
                      <div className="text-center text-muted2 text-uppercase font-size-smm fw-500 w-40px pr-15px">
                        SL
                      </div>
                      <div className="text-muted2 text-uppercase font-size-smm fw-500 w-70px w-sm-100px text-end">
                        Doanh số
                      </div>
                      <div className="text-muted2 text-uppercase font-size-smm fw-500 w-100px w-sm-120px text-end">
                        Thực thu
                      </div>
                    </div>
                  </div>
                </div>
                <PerfectScrollbar
                  options={perfectScrollbarOptions}
                  className="scroll px-20px pb-20px"
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
                          <PickerView item={item} filters={filters}>
                            {({ open }) => (
                              <div
                                className="flex-1 cursor-pointer font-size-md fw-500 pr-20px pr-sm-15px"
                                onClick={open}
                              >
                                {item.ProdTitle}
                              </div>
                            )}
                          </PickerView>
                          <div className="text-center w-40px fw-500 pr-15px">
                            {item.SumQTy}
                          </div>
                          <div className="fw-500 w-100px text-end">
                            {PriceHelper.formatVND(item.SumTopay)}
                          </div>
                          <div className="fw-500 w-100px w-sm-120px text-end">
                            <OverlayTrigger
                              rootClose
                              trigger="click"
                              key="bottom"
                              placement="bottom"
                              overlay={
                                <Popover id={`popover-positioned-top`}>
                                  <Popover.Body className="p-0">
                                    <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                      <span>Chuyển khoản</span>
                                      <span>
                                        {PriceHelper.formatVNDPositive(item.CK)}
                                      </span>
                                    </div>
                                    <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                      <span>Quẹt thẻ</span>
                                      <span>
                                        {PriceHelper.formatVNDPositive(item.QT)}
                                      </span>
                                    </div>
                                    <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                      <span>Tiền mặt</span>
                                      <span>
                                        {PriceHelper.formatVNDPositive(item.TM)}
                                      </span>
                                    </div>
                                  </Popover.Body>
                                </Popover>
                              }
                            >
                              <div>
                                <div className="d-flex justify-content-end align-items-center">
                                  <span>
                                    {PriceHelper.formatVNDPositive(
                                      item.CK + item.QT + item.TM
                                    )}
                                  </span>
                                  <i className="cursor-pointer fa-solid fa-circle-exclamation text-warning ml-5px"></i>
                                </div>
                              </div>
                            </OverlayTrigger>
                            {Number(item.Vi + item.TT) > 0 && (
                              <OverlayTrigger
                                rootClose
                                trigger="click"
                                key="bottom"
                                placement="bottom"
                                overlay={
                                  <Popover id={`popover-positioned-top`}>
                                    <Popover.Body className="p-0">
                                      <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                        <span>Ví</span>
                                        <span>
                                          {PriceHelper.formatVNDPositive(
                                            item.Vi
                                          )}
                                        </span>
                                      </div>
                                      <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                        <span>Thẻ tiền</span>
                                        <span>
                                          {PriceHelper.formatVNDPositive(
                                            item.TT
                                          )}
                                        </span>
                                      </div>
                                    </Popover.Body>
                                  </Popover>
                                }
                              >
                                <div>
                                  <div className="d-flex justify-content-end align-items-center">
                                    <span>
                                      {PriceHelper.formatVNDPositive(
                                        item.Vi + item.TT
                                      )}
                                    </span>
                                    <i className="cursor-pointer fa-solid fa-circle-exclamation text-warning ml-5px"></i>
                                  </div>
                                </div>
                              </OverlayTrigger>
                            )}
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
