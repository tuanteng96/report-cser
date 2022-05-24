import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import IconMenuMobile from '../../components/IconMenuMobile'
import Filter from 'src/components/Filter/Filter'
import _ from 'lodash'
import ListServices from './ListServices'
import ChartWidget2 from '../../components/ChartWidget2'

function RPServices(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    Date: new Date() // Ngày,
  })
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [loading, setLoading] = useState(false)

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
      // Call Api
    } else {
      setFilters(values)
    }
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
            Báo cáo dịch vụ
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
      <div className="row">
        <div className="col-md-6 col-lg-4 col-xl-4 mb-xl-0 mb-4">
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
                +12
              </div>
              <div className="fw-500 ml-10px font-size-md">dịch vụ</div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-4 col-xl-4 mb-xl-0 mb-4">
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
                3
              </div>
              <div className="fw-500 ml-10px font-size-md">dịch vụ</div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-4 col-xl-4 mb-xl-0 mb-4">
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
                5
              </div>
              <div className="fw-500 ml-10px font-size-md">dịch vụ</div>
            </div>
          </div>
        </div>
      </div>
      <ListServices />
    </div>
  )
}

export default RPServices
