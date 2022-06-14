import React from 'react'
import Skeleton from 'react-loading-skeleton'
import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

function LoadingSkeleton({ filters }) {
  return (
    <div className="bg-white rounded report-sell-overview">
      <div
        className="rounded text-white p-30px elm-top"
        style={{ backgroundColor: '#f54e60' }}
      >
        <div className="mb-15px d-flex justify-content-between align-items-end">
          <span className="text-uppercase fw-600 font-size-xl">
            Doanh số bán hàng
          </span>
        </div>
        <div className="font-number text-center py-3 py-md-5 fw-600 total">
          <Skeleton className="mx-4px" width={180} height={40} />
        </div>
      </div>
      <div className="p-25px" style={{ marginTop: '-60px' }}>
        <div className="row">
          <div className="col-md-6">
            <div
              className="rounded mb-20px p-4"
              style={{ backgroundColor: '#E1F0FF', color: '#3699FF' }}
            >
              <i className="fa-solid fa-money-bill-wave font-size-30"></i>
              <div className="font-number fw-600 mt-10px d-flex align-items-center">
                <span className="total-2">
                  <Skeleton className="mx-4px" width={150} height={22} />
                </span>
              </div>
              <div className="">Thanh toán</div>
            </div>
          </div>
          <div className="col-md-6">
            <div
              className="rounded mb-20px p-4"
              style={{ backgroundColor: '#FFF4DE', color: '#FFA800' }}
            >
              <i className="fa-solid fa-wallet font-size-30"></i>
              <div className="font-number total-2 fw-600 mt-10px">
                <Skeleton className="mx-4px" width={150} height={22} />
              </div>
              <div className="">Thanh toán từ ví</div>
            </div>
          </div>
          <div className="col-md-6">
            <div
              className="rounded p-4 mb-4 mb-md-0"
              style={{ backgroundColor: '#C9F7F5', color: '#1BC5BD' }}
            >
              <i className="fa-solid fa-id-card font-size-30"></i>
              <div className="font-number total-2 fw-600 mt-10px">
                <Skeleton className="mx-4px" width={150} height={22} />
              </div>
              <div className="">Từ thẻ tiền</div>
            </div>
          </div>
          <div className="col-md-6">
            <div
              className="rounded p-4"
              style={{ backgroundColor: '#FFE2E5', color: '#F64E60' }}
            >
              <i className="fa-solid fa-credit-card-blank font-size-30"></i>
              <div className="font-number total-2 fw-600 mt-10px">
                <Skeleton className="mx-4px" width={150} height={22} />
              </div>
              <div className="">Nợ phát sinh</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingSkeleton
