import React from 'react'
import Skeleton from 'react-loading-skeleton'
import { AssetsHelpers } from 'src/helpers/AssetsHelpers'

function LoadingSkeleton(props) {
  return (
    <div className="d-flex flex-column h-100">
      <div
        className="bg-white rounded px-20px py-30px text-center flex-grow-1 d-flex flex-column justify-content-center"
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
      <div className="bg-white rounded px-20px py-30px d-flex my-20px flex-column flex-xl-row flex-grow-1">
        <div className="flex-1 text-center d-flex flex-column justify-content-center">
          <div className="font-number font-size-30 fw-600 line-height-xxl">
            <Skeleton width={120} height={35} />
          </div>
          <div className="fw-600 text-uppercase text-muted font-size-smm mt-5px">
            Thu trong kỳ
          </div>
        </div>
        <div className="flex-1 d-flex flex-column justify-content-center text-center border-left border-left-0 border-xl-left-1  border-right border-right-0 border-xl-right-1 border-gray-200 border-bottom border-xl-bottom-0 border-top border-xl-top-0 py-20px my-20px py-xl-0 my-xl-0">
          <div className="font-number font-size-30 fw-600 line-height-xxl text-danger">
            <Skeleton width={120} height={35} />
          </div>
          <div className="fw-600 text-uppercase text-muted font-size-smm mt-5px">
            Chi trong kỳ
          </div>
        </div>
        <div className="flex-1 text-center d-flex flex-column justify-content-center">
          <div className="font-number font-size-30 fw-600 line-height-xxl">
            <Skeleton width={120} height={35} />
          </div>
          <div className="fw-600 text-uppercase text-muted font-size-smm mt-5px">
            Tồn kỳ
          </div>
        </div>
      </div>
      <div
        className="bg-white rounded px-20px py-30px mb-20px mb-md-0 text-center flex-grow-1 d-flex flex-column justify-content-center"
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
  )
}

export default LoadingSkeleton
