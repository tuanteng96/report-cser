import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Filter from 'src/components/Filter/Filter'
import IconMenuMobile from '../../components/IconMenuMobile'

function RPCustomer() {
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
    // if(_.isEqual(values, filters)) {
    //   getAllDays()
    // }
    // else {
    //   setFilters(values)
    // }
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
        <div>
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Báo cáo khách hàng
          </span>
          <span className="pl-8px text-muted">{StockName}</span>
        </div>
        <div>
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
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}

export default RPCustomer
