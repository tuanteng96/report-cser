import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import 'src/_assets/sass/pages/_report.scss'
import reportsApi from 'src/api/reports.api'
import LoadingSkeleton from './LoadingSkeleton'
import { PriceHelper } from 'src/helpers/PriceHelper'
import Filter from 'src/components/Filter/Filter'
import _ from 'lodash'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import ChartWidget from 'src/features/Reports/components/ChartWidget'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'

import moment from 'moment'
import 'moment/locale/vi'

moment.locale('vi')

function DaysOverview(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    Date: new Date() // Ngày,
  })
  const [StockName, setStockName] = useState('')
  const [dataDays, setDataDays] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isFilter, setIsFilter] = useState(false)

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
    getAllDays()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getAllDays = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    const newFilters = {
      ...filters,
      Date: moment(filters.Date).format('DD/MM/yyyy')
    }
    reportsApi
      .getAllDay(newFilters)
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          setDataDays(data.result)
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
      getAllDays()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    getAllDays()
  }

  const onOpenFilter = () => {
    setIsFilter(true)
  }

  const onHideFilter = () => {
    setIsFilter(false)
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Báo cáo ngày
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
      <Filter
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
          <div className="col-md-6 col-lg-6 col-xl-6 mb-4">
            <div className="bg-white rounded">
              <div className="p-20px">
                <div className="text-dark text-capitalize fw-500 font-size-lg d-flex justify-content-between">
                  <span>Khách hàng</span>
                  <div>
                    <span className="text-success pr-5px font-number">
                      +{dataDays?.KHMoi || 0}
                    </span>
                    <span className="font-size-smm fw-400 text-muted text-none">
                      Khách hàng mới
                    </span>
                  </div>
                </div>
                <div className="mt-10px">
                  <div className="d-flex justify-content-between border-bottom-dashed py-12px">
                    <div className="text-muted">Đến tại Spa</div>
                    <div className="fw-600 font-number">
                      {dataDays?.KHDenTaiSpa || 0}
                    </div>
                  </div>
                  <div className="d-flex justify-content-between border-bottom-dashed py-12px">
                    <div className="text-muted">Web / App</div>
                    <div className="fw-600 font-number">
                      {dataDays?.KHWebApp || 0}
                    </div>
                  </div>
                  <div className="d-flex justify-content-between border-bottom-dashed py-12px">
                    <div className="text-muted">Khách đang CheckIn</div>
                    <div className="fw-600 font-number">
                      {dataDays?.KHDangCheckIn || 0}
                    </div>
                  </div>
                  <div className="d-flex justify-content-between pt-12px">
                    <div className="text-muted">
                      Khách mới / Tổng khách CheckIn
                    </div>
                    <div className="fw-600 font-number">
                      <span className="font-size-md text-success">
                        {dataDays?.KHFirstCheckIn || 0}
                      </span>
                      <span className="font-size-xs px-1">/</span>
                      <span>{dataDays?.KHCheckIn || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
              <ChartWidget
                colors={{
                  labelColor: '#343a40',
                  strokeColor: '#dee2e6',
                  baseColor: '#0d6efd',
                  lightColor: '#f1fafe'
                }}
                height={150}
                data={[15, 25, 15, 40, 20, 50]}
              />
            </div>
          </div>
          <div className="col-md-6 col-lg-6 col-xl-6 mb-4">
            <div className="bg-white rounded h-100 d-flex flex-column justify-content-between">
              <div className="p-20px">
                <div className="text-dark text-capitalize fw-500 font-size-lg d-flex justify-content-between">
                  <span>Bán hàng</span>
                  <div>
                    <span className="text-success pr-5px font-number">
                      +{dataDays?.DonHangMoi || 0}
                    </span>
                    <span className="font-size-smm fw-400 text-muted text-none">
                      Đơn hàng mới
                    </span>
                  </div>
                </div>
                <div className="mt-10px">
                  <div className="d-flex justify-content-between border-bottom-dashed py-12px">
                    <div className="text-muted">Doanh số</div>
                    <div className="fw-600 font-number">
                      {PriceHelper.formatVND(dataDays?.DSo || 0)}
                    </div>
                  </div>
                  <div className="d-flex justify-content-between border-bottom-dashed py-12px">
                    <div className="text-muted">Thanh toán</div>
                    <div className="fw-600 font-number">
                      {PriceHelper.formatVND(dataDays?.DSo_DaTT || 0)}
                    </div>
                  </div>
                  <div className="d-flex justify-content-between pt-12px">
                    <div className="text-muted">Thanh toán nợ</div>
                    <div className="fw-600 font-number">
                      {PriceHelper.formatVND(dataDays?.DSo_No || 0)}
                    </div>
                  </div>
                </div>
              </div>
              <ChartWidget
                colors={{
                  labelColor: '#343a40',
                  strokeColor: '#0bb783',
                  baseColor: '#0bb783',
                  lightColor: '#e8fff3'
                }}
                height={150}
                data={[25, 15, 45, 50, 20, 29]}
              />
            </div>
          </div>
          <div className="col-md-6 col-lg-6 col-xl-6 mb-4 mb-md-0">
            <div className="bg-white rounded h-100 d-flex flex-column justify-content-between">
              <div className="p-20px">
                <div className="text-dark text-capitalize fw-500 font-size-lg d-flex justify-content-between">
                  <span>Dịch vụ</span>
                  <div>
                    <span className="text-success pr-5px font-number">
                      +{dataDays?.DVu_DatLich || 0}
                    </span>
                    <span className="font-size-smm fw-400 text-muted text-none">
                      Đặt lịch mới
                    </span>
                  </div>
                </div>
                <div className="mt-10px">
                  <div className="d-flex justify-content-between border-bottom-dashed py-12px">
                    <div className="text-muted">Đặt lịch</div>
                    <div className="fw-600 font-number">
                      {dataDays?.DVu_DatLich || 0}
                    </div>
                  </div>
                  <div className="d-flex justify-content-between border-bottom-dashed py-12px">
                    <div className="text-muted">Dịch vụ đang làm</div>
                    <div className="fw-600 font-number">
                      {dataDays?.DVu_DangTHien || 0}
                    </div>
                  </div>
                  <div className="d-flex justify-content-between pt-12px">
                    <div className="text-muted">Dịch vụ đã xong</div>
                    <div className="fw-600 font-number">
                      {dataDays?.DVu_DaXong || 0}
                    </div>
                  </div>
                </div>
              </div>
              <ChartWidget
                colors={{
                  labelColor: '#f64e60',
                  strokeColor: '#f64e60',
                  baseColor: '#f64e60',
                  lightColor: '#fff5f8'
                }}
                height={150}
                data={[45, 25, 35, 10, 50, 19]}
              />
            </div>
          </div>
          <div className="col-md-6 col-lg-6 col-xl-6">
            <div className="bg-white rounded h-100 d-flex flex-column justify-content-between">
              <div className="p-20px">
                <div className="text-dark text-capitalize fw-500 font-size-lg d-flex justify-content-between">
                  <span>Tổng thu / chi</span>
                </div>
                <div className="mt-10px">
                  <div className="d-flex justify-content-between border-bottom-dashed py-12px">
                    <div className="text-muted">Tổng thu</div>
                    <div className="fw-600 text-success font-size-lg font-number">
                      {PriceHelper.formatVND(dataDays?.TgThu || 0)}
                    </div>
                  </div>
                  <div className="d-flex justify-content-between pt-12px">
                    <div className="text-muted">Tổng chi</div>
                    <div className="fw-600 text-danger font-size-lg font-number">
                      {PriceHelper.formatVNDPositive(dataDays?.TgChi || 0)}
                    </div>
                  </div>
                </div>
              </div>
              <ChartWidget
                colors={{
                  labelColor: '#ffa800',
                  strokeColor: '#ffa800',
                  baseColor: '#ffa800',
                  lightColor: '#fff8dd'
                }}
                height={150}
                data={[15, 35, 45, 18, 50, 19]}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DaysOverview
