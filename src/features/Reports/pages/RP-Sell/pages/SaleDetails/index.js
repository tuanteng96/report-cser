import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Filter from 'src/components/Filter/Filter'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'

function SaleDetails(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    Date: new Date() // Ngày,
  })
  const [StockName, setStockName] = useState('')
  const [loading, setLoading] = useState(false)
  const [isFilter, setIsFilter] = useState(false)

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

  const onFilter = values => {
    if (_.isEqual(values, filters)) {
      //getAllDays()
    } else {
      setFilters(values)
    }
  }

  const onRefresh = () => {
    //getAllDays()
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
        <div className="col-md-4">
          <div className="p-20px bg-white rounded h-100">
            <div>
              <div className="fw-500 font-size-lg">Sản phẩm / NVL</div>
              <div className="text-muted font-size-smm">
                Tổng 18 sản phẩm, 22 NVL
              </div>
            </div>
            <div className="mt-12px">
              <div className="d-flex justify-content-between py-12px">
                <div className="text-muted2 text-uppercase font-size-smm fw-500 flex-1 pr-15px">
                  Tên SP / NVL
                </div>
                <div className="text-muted2 text-uppercase font-size-smm fw-500 w-70px text-end">
                  Số lượng
                </div>
              </div>
              <div className="d-flex justify-content-between py-12px border-top border-gray-200">
                <div className="font-size-md fw-500 flex-1 pr-15px">
                  Kem dưỡng da
                </div>
                <div className="font-number font-size-smm fw-500 w-70px text-end">
                  1
                </div>
              </div>
              <div className="d-flex justify-content-between py-12px border-top border-gray-200">
                <div className="font-size-md fw-500 flex-1 pr-15px">
                  Serum dưỡng da
                </div>
                <div className="font-number font-size-smm fw-500 w-70px text-end">
                  12
                </div>
              </div>
              <div className="d-flex justify-content-between py-12px border-top border-gray-200">
                <div className="font-size-md fw-500 flex-1 pr-15px">NVL 1</div>
                <div className="font-number font-size-smm fw-500 w-70px text-end">
                  8
                </div>
              </div>
              <div className="d-flex justify-content-between pt-10px border-top border-gray-200">
                <div className="font-size-md fw-500 flex-1 pr-15px">NVL 2</div>
                <div className="font-number font-size-smm fw-500 w-70px text-end">
                  15
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-20px bg-white rounded h-100">
            <div>
              <div className="fw-500 font-size-lg">Dịch vụ / Phụ phí</div>
              <div className="text-muted font-size-smm">
                Tổng 18 dịch vụ, 22 Phụ phí
              </div>
            </div>
            <div className="mt-12px">
              <div className="d-flex justify-content-between py-12px">
                <div className="text-muted2 text-uppercase font-size-smm fw-500 flex-1 pr-15px">
                  Tên SP / NVL
                </div>
                <div className="text-muted2 text-uppercase font-size-smm fw-500 w-70px text-end">
                  Số lượng
                </div>
              </div>
              <div className="d-flex justify-content-between py-12px border-top border-gray-200">
                <div className="font-size-md fw-500 flex-1 pr-15px">
                  Thẻ 10 buổi chăm sóc da
                </div>
                <div className="font-number font-size-smm fw-500 w-70px text-end">
                  1
                </div>
              </div>
              <div className="d-flex justify-content-between py-12px border-top border-gray-200">
                <div className="font-size-md fw-500 flex-1 pr-15px">
                  Thẻ 12 buổi trị mụn
                </div>
                <div className="font-number font-size-smm fw-500 w-70px text-end">
                  12
                </div>
              </div>
              <div className="d-flex justify-content-between py-12px border-top border-gray-200">
                <div className="font-size-md fw-500 flex-1 pr-15px">
                  Phụ phí 1
                </div>
                <div className="font-number font-size-smm fw-500 w-70px text-end">
                  8
                </div>
              </div>
              <div className="d-flex justify-content-between pt-10px border-top border-gray-200">
                <div className="font-size-md fw-500 flex-1 pr-15px">
                  Phụ phí 2
                </div>
                <div className="font-number font-size-smm fw-500 w-70px text-end">
                  15
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-20px bg-white rounded h-100">
            <div>
              <div className="fw-500 font-size-lg">Thẻ tiền</div>
              <div className="text-muted font-size-smm">Tổng 18 thẻ tiền</div>
            </div>
            <div className="mt-12px">
              <div className="d-flex justify-content-between py-12px">
                <div className="text-muted2 text-uppercase font-size-smm fw-500 flex-1 pr-15px">
                  Tên SP / NVL
                </div>
                <div className="text-muted2 text-uppercase font-size-smm fw-500 w-70px text-end">
                  Số lượng
                </div>
              </div>
              <div className="d-flex justify-content-between py-12px border-top border-gray-200">
                <div className="font-size-md fw-500 flex-1 pr-15px">
                  Thẻ 10r
                </div>
                <div className="font-number font-size-smm fw-500 w-70px text-end">
                  1
                </div>
              </div>
              <div className="d-flex justify-content-between py-12px border-top border-gray-200">
                <div className="font-size-md fw-500 flex-1 pr-15px">
                  Thẻ 12tr
                </div>
                <div className="font-number font-size-smm fw-500 w-70px text-end">
                  12
                </div>
              </div>
              <div className="d-flex justify-content-between pt-10px border-top border-gray-200">
                <div className="font-size-md fw-500 flex-1 pr-15px">
                  Thẻ 2tr
                </div>
                <div className="font-number font-size-smm fw-500 w-70px text-end">
                  15
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SaleDetails
