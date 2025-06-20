import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'react-bootstrap'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { PriceHelper } from 'src/helpers/PriceHelper'

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

const perfectScrollbarOptions = {
  wheelSpeed: 2,
  wheelPropagation: false
}

function ModalViewMobile({
  show,
  onHide,
  data,
  checkFCostCost,
  checkPriceCost,
  filters
}) {
  return (
    <Modal
      className="modal-view-mobile"
      show={show}
      onHide={onHide}
      scrollable={true}
    >
      {/* <Modal.Header>
                <Modal.Title>Modal title</Modal.Title>
            </Modal.Header>

            <Modal.Body>One fine body...
                <div style={{ height: `${1000}px` }}>
                    a
                </div>
            </Modal.Body> */}
      <div className="modal-view-head align-items-baseline px-15px py-8px">
        <div className="flex-1 modal-view-title text-uppercase font-size-lg fw-500 pr-15px">
          {data?.MemberName || 'Chưa có tên'}
        </div>
        <div
          className="text-center modal-view-close font-size-h3 w-20px"
          onClick={onHide}
        >
          <i className="fa-light fa-xmark"></i>
        </div>
      </div>
      <PerfectScrollbar
        options={perfectScrollbarOptions}
        className="scroll modal-view-body"
        style={{ position: 'relative' }}
      >
        <div className="py-5px">
          <div className="px-15px d-flex justify-content-between py-12px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              ID
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              #{data?.Id}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Ngày đặt lịch
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.BookDate
                ? moment(data.BookDate).format('DD/MM/YYYY')
                : 'Không có'}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Cơ sở
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.StockName || 'Không có'}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Số điện thoại
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.MemberPhone || 'Không có'}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Dịch vụ gốc
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.ProServiceName || 'Không có dịch vụ gốc'}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Thẻ
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.Card || 'Không có thẻ'}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Giá buổi
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {checkPriceCost(data)}
            </div>
          </div>
          {/* <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Giá buổi (Tặng)
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {PriceHelper.formatVND(data?.SessionCostExceptGift)}
            </div>
          </div> */}

          {filters.ShowsX !== '2' && (
            <>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Buổi
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {data?.Warranty
                    ? data?.SessionWarrantyIndex
                    : data?.SessionIndex}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Bảo hành
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {data?.Warranty ? 'Bảo hành' : 'Không có'}
                </div>
              </div>
            </>
          )}

          {filters.ShowsX === '2' && (
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Loại
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.Loai}
              </div>
            </div>
          )}

          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Phụ phí
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.AddFeeTitles && data.AddFeeTitles.length > 0
                ? data.AddFeeTitles.toString()
                : 'Không có'}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Tổng phụ phí
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {checkFCostCost(data)}
            </div>
          </div>
          {filters.ShowsX === '0' && (
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Nhóm dịch vụ
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.ProServiceType}
              </div>
            </div>
          )}
          {filters.ShowsX === '2' && (
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Nhân viên chuyển ca
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.UserFullName}
              </div>
            </div>
          )}
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Nhân viên thực hiện
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.StaffSalaries && data?.StaffSalaries.length > 0
                ? data?.StaffSalaries.map(
                    item =>
                      `${item.FullName} (${PriceHelper.formatVND(item.Salary)})`
                  ).join(', ')
                : 'Chưa xác định'}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Tổng lương nhân viên
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {PriceHelper.formatVND(data?.TotalSalary)}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Trạng thái
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.Status === 'done' ? (
                <span className="text-success">Hoàn thành</span>
              ) : (
                <span className="text-warning">Đang thực hiện</span>
              )}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Đánh giá sao
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.Rate || 'Chưa đánh giá'}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Nội dung đánh giá
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.RateNote || 'Chưa có'}
            </div>
          </div>
        </div>
      </PerfectScrollbar>
    </Modal>
  )
}

ModalViewMobile.propTypes = {
  show: PropTypes.bool
}

export default ModalViewMobile
