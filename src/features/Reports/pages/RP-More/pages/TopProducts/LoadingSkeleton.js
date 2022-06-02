import React from 'react'
import Skeleton from 'react-loading-skeleton'

function LoadingSkeleton(props) {
  return (
    <div className="row">
      <div className="col-lg-6 col-md-6 mb-15px mb-lg-0">
        <div className="p-20px bg-white rounded h-100">
          <div>
            <div className="fw-500 font-size-lg">TOP bán hàng</div>
          </div>
          <div className="mt-12px">
            <div className="d-flex justify-content-between py-12px">
              <div className="text-muted2 text-uppercase font-size-smm fw-500 flex-1 pr-20px pr-sm-15px">
                Tên mặt hàng
              </div>
              <div className="text-muted2 text-uppercase font-size-smm fw-500 w-40px pr-15px text-center">
                SL
              </div>
              <div className="text-muted2 text-uppercase font-size-smm fw-500 w-70px w-sm-100px text-end">
                Doanh số
              </div>
            </div>
            {Array(5)
              .fill()
              .map((item, index) => (
                <div
                  className="d-flex justify-content-between py-12px border-top border-gray-200"
                  key={index}
                >
                  <div className="font-size-md fw-500 flex-1 pr-20px pr-sm-15px">
                    <Skeleton className="mx-4px" width={150} height={17} />
                  </div>
                  <div className="w-40px fw-500 pr-15px text-center">
                    <Skeleton className="mx-4px" width={20} height={17} />
                  </div>
                  <div className="fw-500 w-70px w-sm-100px text-end">
                    <Skeleton className="mx-4px" width={70} height={17} />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
      <div className="col-lg-6 col-md-6">
        <div className="p-20px bg-white rounded h-100">
          <div>
            <div className="fw-500 font-size-lg">TOP doanh số</div>
          </div>
          <div className="mt-12px">
            <div className="d-flex justify-content-between py-12px">
              <div className="text-muted2 text-uppercase font-size-smm fw-500 flex-1 pr-20px pr-sm-15px">
                Tên mặt hàng
              </div>
              <div className="text-muted2 text-uppercase font-size-smm fw-500 w-40px pr-15px text-center">
                SL
              </div>
              <div className="text-muted2 text-uppercase font-size-smm fw-500 w-70px w-sm-100px text-end">
                Doanh số
              </div>
            </div>
            {Array(5)
              .fill()
              .map((item, index) => (
                <div
                  className="d-flex justify-content-between py-12px border-top border-gray-200"
                  key={index}
                >
                  <div className="font-size-md fw-500 flex-1 pr-20px pr-sm-15px">
                    <Skeleton className="mx-4px" width={150} height={17} />
                  </div>
                  <div className="w-40px fw-500 pr-15px text-center">
                    <Skeleton className="mx-4px" width={20} height={17} />
                  </div>
                  <div className="fw-500 w-70px w-sm-100px text-end">
                    <Skeleton className="mx-4px" width={70} height={17} />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingSkeleton
