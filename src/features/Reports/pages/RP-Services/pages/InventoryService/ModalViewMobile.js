import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'react-bootstrap'
import PerfectScrollbar from 'react-perfect-scrollbar'

import moment from 'moment'
import 'moment/locale/vi'
import { PriceHelper } from 'src/helpers/PriceHelper'
moment.locale('vi')

const perfectScrollbarOptions = {
  wheelSpeed: 2,
  wheelPropagation: false
}

function ModalViewMobile({ show, onHide, data, transformDetail }) {
  return (
    <Modal
      className="modal-view-mobile"
      show={show}
      onHide={onHide}
      scrollable={true}
    >
      <div className="modal-view-head align-items-baseline px-15px py-8px">
        <div className="flex-1 modal-view-title text-uppercase font-size-lg fw-500 pr-15px">
          {data?.Ten_dich_vu || 'Chưa có tên'}
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
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Ngày mua
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.BookDate
                ? moment(data.NgayMua).format('HH:mm DD/MM/YYYY')
                : 'Không có'}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Ngày hết hạn
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.NgayHetHan
                ? moment(data.NgayHetHan).format('HH:mm DD/MM/YYYY')
                : 'Không có'}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Mã đơn hàng
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.MaDonHang || 'Không có'}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Mã dịch vụ
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.MaDichVu || 'Không có'}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Số lượng
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.SoLuong || 'Không có'}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Đã sử dụng
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.Da_su_dung || 'Không có'}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Số buổi còn
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {(data?.Tong_buoi || 0) - (data?.Da_su_dung || 0)}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Tổng buổi
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.Tong_buoi || 'Không có'}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Tổng số tiền
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {PriceHelper.formatVND(data?.Tong_tien)}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Giá trị chưa dùng
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {PriceHelper.formatVND(data?.CostTotal)}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Đã thanh toán
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {PriceHelper.formatVND(data?.Da_Thanh_toan)}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Ví
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {PriceHelper.formatVND(data?.Vi)}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Thẻ tiền
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {PriceHelper.formatVND(data?.The_tien)}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Công nợ
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {PriceHelper.formatVND(data?.Cong_no)}
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
