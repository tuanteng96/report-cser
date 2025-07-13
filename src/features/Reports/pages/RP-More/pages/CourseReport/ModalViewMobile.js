import React, { Fragment } from 'react'
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

function ModalViewMobile({ show, onHide, data, translateType }) {
  let rowData = data
  return (
    <Modal
      className="modal-view-mobile"
      show={show}
      onHide={onHide}
      scrollable={true}
    >
      <Fragment>
        <div className="modal-view-head align-items-baseline px-15px py-8px">
          <div className="flex-1 modal-view-title text-uppercase font-size-lg fw-500 pr-15px">
            {rowData?.Member.FullName}
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
                Số điện thoại
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {rowData?.Member.MobilePhone}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Ngày sinh
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {rowData?.Member?.BirtDate
                  ? moment(rowData.Member.BirtDate).format('DD/MM/YYYY')
                  : 'Không có'}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Địa chỉ
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {rowData?.Member.HomeAddress || 'Chưa xác định'}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Tên lớp
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {rowData?.Course.Title}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Khoá học
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {rowData?.OrderItem?.prodtitle}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Tags
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {rowData?.Course.Tags}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Tổng tiền
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {PriceHelper.formatVND(rowData?.OrderItem?.ToPay)}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Đã thanh toán
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {PriceHelper.formatVND(rowData?.CPayed)}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Còn nợ
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {PriceHelper.formatVND(rowData?.RemainPay)}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Ngày hẹn thanh toán
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {rowData?.CourseMember?.DayToPay
                  ? moment(rowData.CourseMember.DayToPay).format('DD/MM/YYYY')
                  : 'Không có'}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Ngày nhập học
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {rowData?.CourseMember.MinDate
                  ? moment(rowData.CourseMember.MinDate).format('DD/MM/YYYY')
                  : 'Chưa nhập học'}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Tổng số buổi
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {Number(rowData?.CourseMember?.TotalCheck || 0) +
                  Number(rowData?.CourseMember?.TotalBefore || 0)}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Trạng thái
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {Number(rowData?.CourseMember?.Status) === 1 && (
                  <span className="text-success fw-500">Đã tốt nghiệp</span>
                )}
                {Number(rowData?.CourseMember?.Status) === 2 && (
                  <span className="text-warning fw-500">Chưa tốt nghiệp</span>
                )}
                {Number(rowData?.CourseMember?.Status) === 3 && (
                  <span className="text-danger fw-500">Đang tạm dừng</span>
                )}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Thời gian đổi trạng thái
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.CourseMember?.DayStatus &&
                data?.CourseMember?.DayStatus !== '1900-01-01T00:00:00'
                  ? moment(data.CourseMember.DayStatus).format(
                      'HH:mm DD-MM-YYYY'
                    )
                  : ''}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Ghi chú
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {rowData?.CourseMember.Desc || 'Không có'}
              </div>
            </div>
          </div>
        </PerfectScrollbar>
      </Fragment>
    </Modal>
  )
}

ModalViewMobile.propTypes = {
  show: PropTypes.bool
}

export default ModalViewMobile
