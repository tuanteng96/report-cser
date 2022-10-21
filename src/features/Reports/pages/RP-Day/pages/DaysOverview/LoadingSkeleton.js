import React from 'react'
import Skeleton from 'react-loading-skeleton'
import ChartWidget from 'src/features/Reports/components/ChartWidget'

function LoadingSkeleton() {
  return (
    <div className="row">
      <div className="col-md-6 col-lg-6 col-xl-6 mb-4">
        <div className="bg-white rounded">
          <div className="p-20px">
            <div className="text-dark text-capitalize fw-500 font-size-lg d-flex justify-content-between">
              <span>Khách hàng</span>
            </div>
            <div className="mt-10px">
              <div className="d-flex justify-content-between border-bottom-dashed py-12px">
                <div className="text-muted">Đến tại Spa</div>
                <div className="fw-600">
                  <Skeleton width={35} height={18} />
                </div>
              </div>
              <div className="d-flex justify-content-between border-bottom-dashed py-12px">
                <div className="text-muted">Web / App</div>
                <div className="fw-600">
                  <Skeleton width={35} height={18} />
                </div>
              </div>
              <div className="d-flex justify-content-between border-bottom-dashed py-12px">
                <div className="text-muted">Khách hàng CheckIn</div>
                <div className="fw-600">
                  <Skeleton width={35} height={18} />
                </div>
              </div>
              <div className="d-flex justify-content-between pt-12px">
                <div className="text-muted">Tổng khách CheckIn</div>
                <div className="fw-600">
                  <Skeleton width={35} height={18} />
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
            </div>
            <div className="mt-10px">
              <div className="d-flex justify-content-between border-bottom-dashed py-12px">
                <div className="text-muted">Doanh số</div>
                <div className="fw-600">
                  <Skeleton width={65} height={18} />
                </div>
              </div>
              <div className="d-flex justify-content-between border-bottom-dashed py-12px">
                <div className="text-muted">Thanh toán</div>
                <div className="fw-600">
                  <Skeleton width={65} height={18} />
                </div>
              </div>
              <div className="d-flex justify-content-between pt-12px">
                <div className="text-muted">Thanh toán nợ</div>
                <div className="fw-600">
                  <Skeleton width={65} height={18} />
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
            </div>
            <div className="mt-10px">
              <div className="d-flex justify-content-between border-bottom-dashed py-12px">
                <div className="text-muted">Đặt lịch</div>
                <div className="fw-600">
                  <Skeleton width={35} height={18} />
                </div>
              </div>
              <div className="d-flex justify-content-between border-bottom-dashed py-12px">
                <div className="text-muted">Dịch vụ đang làm</div>
                <div className="fw-600">
                  <Skeleton width={35} height={18} />
                </div>
              </div>
              <div className="d-flex justify-content-between pt-12px">
                <div className="text-muted">Dịch vụ đã xong</div>
                <div className="fw-600">
                  <Skeleton width={35} height={18} />
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
                <div className="fw-600 text-success font-size-lg">
                  <Skeleton width={65} height={18} />
                </div>
              </div>
              <div className="d-flex justify-content-between pt-12px">
                <div className="text-muted">Tổng chi</div>
                <div className="fw-600 text-danger font-size-lg">
                  <Skeleton width={65} height={18} />
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
  )
}

export default LoadingSkeleton
