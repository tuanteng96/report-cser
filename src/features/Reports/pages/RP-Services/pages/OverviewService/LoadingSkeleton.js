import React from 'react'
import Skeleton from 'react-loading-skeleton'
import ChartWidget2 from 'src/features/Reports/components/ChartWidget2'

function LoadingSkeleton(props) {
  return (
    <div className="row">
      <div className="col-12 mb-20px">
        <div className="rounded p-20px" style={{ backgroundColor: '#ffbed3' }}>
          <div className="font-size-md fw-600 text-uppercase">Tổng dịch vụ</div>
          <ChartWidget2
            colors={{
              labelColor: '#343a40',
              strokeColor: '#fff',
              color: '#0d6efd',
              borderColor: '#f1fafe'
            }}
            height={30}
            data={[15, 25, 15, 40, 20, 50]}
          />
          <div className="mt-30px d-flex align-items-baseline">
            <div className="font-size-50 line-height-xxl fw-500 font-number">
              <Skeleton width={82} height={38} />
            </div>
          </div>
        </div>
      </div>
      <div className="col-12 mb-20px">
        <div className="rounded p-20px" style={{ backgroundColor: '#8fbd56' }}>
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
            height={30}
            data={[15, 25, 15, 40, 20, 50]}
          />
          <div className="mt-30px d-flex align-items-baseline">
            <div className="font-size-50 line-height-xxl fw-500 font-number">
              <Skeleton width={82} height={38} />
            </div>
          </div>
        </div>
      </div>
      <div className="col-12">
        <div className="rounded p-20px" style={{ backgroundColor: '#e7c354' }}>
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
            height={30}
            data={[15, 25, 15, 40, 20, 50]}
          />
          <div className="mt-30px d-flex align-items-baseline">
            <div className="font-size-50 line-height-xxl fw-500 font-number">
              <Skeleton width={82} height={38} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingSkeleton
