import React from 'react'
import Skeleton from 'react-loading-skeleton'
import LoadingChart from 'src/components/Loading/LoadingChart'
import ChartWidget2 from 'src/features/Reports/components/ChartWidget2'

function LoadingSkeleton(props) {
  return (
    <div className="row">
      <div className="col-lg-7 col-xl-6">
        <div className="row">
          <div className="col-md-6 col-lg-6">
            <div
              className="rounded p-20px mb-20px"
              style={{ backgroundColor: '#ffbed3' }}
            >
              <div className="font-size-md fw-600 text-uppercase">
                Tổng khách hàng
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
                  <Skeleton width={82} height={38} />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-6">
            <div
              className="rounded p-20px mb-20px"
              style={{ backgroundColor: '#b9eff5' }}
            >
              <div className="font-size-md fw-600 text-uppercase">
                Mới trong ngày
              </div>
              <ChartWidget2
                colors={{
                  labelColor: '#343a40',
                  strokeColor: '#fff',
                  color: '#0d6efd',
                  borderColor: '#f1fafe'
                }}
                height={100}
                data={[10, 10, 45, 10, 40, 50]}
              />
              <div className="mt-30px d-flex align-items-baseline">
                <div className="font-size-50 line-height-xxl fw-500 font-number">
                  <Skeleton width={82} height={38} />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-6">
            <div
              className="rounded p-20px mb-20px mb-md-0"
              style={{ backgroundColor: '#bbc8f5' }}
            >
              <div className="font-size-md fw-600 text-uppercase">
                Mới trong tuần
              </div>
              <ChartWidget2
                colors={{
                  labelColor: '#343a40',
                  strokeColor: '#fff',
                  color: '#0d6efd',
                  borderColor: '#f1fafe'
                }}
                height={100}
                data={[45, 15, 15, 40, 10, 50]}
              />
              <div className="mt-30px d-flex align-items-baseline">
                <div className="font-size-50 line-height-xxl fw-500 font-number">
                  <Skeleton width={82} height={38} />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-6">
            <div
              className="rounded p-20px"
              style={{ backgroundColor: '#9abef1' }}
            >
              <div className="font-size-md fw-600 text-uppercase">
                Mới trong tháng
              </div>
              <ChartWidget2
                colors={{
                  labelColor: '#343a40',
                  strokeColor: '#fff',
                  color: '#0d6efd',
                  borderColor: '#f1fafe'
                }}
                height={100}
                data={[15, 45, 25, 10, 40, 30]}
              />
              <div className="mt-30px d-flex align-items-baseline">
                <div className="font-size-50 line-height-xxl fw-500 font-number">
                  <Skeleton width={82} height={38} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-5 col-xl-6">
        <div className="bg-white rounded p-20px h-100 mt-20px mt-lg-0">
          <LoadingChart />
        </div>
      </div>
    </div>
  )
}

export default LoadingSkeleton
