import React from 'react'
import Skeleton from 'react-loading-skeleton'
import { AssetsHelpers } from 'src/helpers/AssetsHelpers'

function LoadingSkeleton(props) {
  return (
    <div className="row">
      <div className="col-md-6 order-1">
        <div
          className="bg-white rounded px-20px py-30px text-center"
          style={{
            backgroundPosition: 'right top',
            backgroundSize: '30% auto',
            backgroundRepeat: 'no-repeat',
            backgroundImage: `url(${AssetsHelpers.toAbsoluteUrl(
              '/assets/media/svg/shapes/abstract-4.svg'
            )})`
          }}
        >
          <div className="font-number font-size-35 fw-600 line-height-xxl text-primary">
            <Skeleton width={120} height={35} />
          </div>
          <div className="fw-600 text-uppercase text-muted font-size-smm mt-5px">
            Tồn tiền đầu kỳ
          </div>
        </div>
      </div>
      <div className="col-md-6 order-3 order-md-2">
        <div
          className="bg-white rounded px-20px py-30px mt-20px mt-md-0 text-center"
          style={{
            backgroundPosition: 'right top',
            backgroundSize: '30% auto',
            backgroundRepeat: 'no-repeat',
            backgroundImage: `url(${AssetsHelpers.toAbsoluteUrl(
              '/assets/media/svg/shapes/abstract-4.svg'
            )})`
          }}
        >
          <div className="font-number font-size-35 fw-600 line-height-xxl text-success">
            <Skeleton width={120} height={35} />
          </div>
          <div className="fw-600 text-uppercase text-muted font-size-smm mt-5px">
            Tồn tiền hiện tại
          </div>
        </div>
      </div>
      <div className="col-md-12 order-2 order-md-3">
        <div className="bg-white rounded px-20px py-30px d-flex mt-20px flex-column flex-md-row">
          <div className="flex-1 text-center">
            <div className="font-number font-size-30 fw-600 line-height-xxl">
              <Skeleton width={120} height={35} />
            </div>
            <div className="fw-600 text-uppercase text-muted font-size-smm mt-5px">
              Thu trong kỳ
            </div>
          </div>
          <div className="flex-1 text-center border-left border-left-0 border-md-left-1  border-right border-right-0 border-md-right-1 border-gray-200 border-bottom border-md-bottom-0 border-top border-md-top-0 py-20px my-20px py-md-0 my-md-0">
            <div className="font-number font-size-30 fw-600 line-height-xxl text-danger">
              <Skeleton width={120} height={35} />
            </div>
            <div className="fw-600 text-uppercase text-muted font-size-smm mt-5px">
              Chi trong kỳ
            </div>
          </div>
          <div className="flex-1 text-center">
            <div className="font-number font-size-30 fw-600 line-height-xxl">
              <Skeleton width={120} height={35} />
            </div>
            <div className="fw-600 text-uppercase text-muted font-size-smm mt-5px">
              Tồn kỳ
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingSkeleton
