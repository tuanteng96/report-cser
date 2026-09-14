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

function ModalViewMobile({ show, onHide, data }) {
  return (
    <Modal
      className="modal-view-mobile"
      show={show}
      onHide={onHide}
      scrollable={true}
    >
      <div className="modal-view-head align-items-baseline px-15px py-8px">
        <div className="flex-1 modal-view-title text-uppercase font-size-lg fw-500 pr-15px">
          {data?.Ten_Khach_Hang || 'Chưa có tên'}
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
        <div className="px-15px d-flex justify-content-between py-12px border-bottom-dashed line-height-sm">
          <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
            Số điện thoại
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">{data?.SDT}</div>
        </div>
        <div className="px-15px d-flex justify-content-between py-12px border-bottom-dashed line-height-sm">
          <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
            ID Đơn hàng
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            #{data?.DonHangID}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
            Cơ sở
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.Co_so || 'Không có'}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
            Ngày bán
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {moment(data?.Ngay_ban).format('DD/MM/YYYY')}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
            Tên sản phẩm
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.Ten_san_pham || 'Không có'}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
            Số lượng
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.So_luong || 0}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
            Số buổi liệu trình
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.So_buoi_lieu_tring || 0}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
            Thành tiền
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {PriceHelper.formatVND(data?.Thanh_tien)}
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
            Còn nợ
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {PriceHelper.formatVND(data?.Con_no)}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
            Số buổi KM
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.So_buoi_km || 0}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
            Số buổi đã sử dụng
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.So_buoi_su_dung}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
            Giá trị xuất HĐ
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {PriceHelper.formatVND(data?.Gia_tri_xuat_hd)}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
            Số buổi chuyển liệu trình
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.So_buoi_chuyen_lieu_trinh}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
            Số buổi đã xoá
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.So_buoi_da_xoa}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
            Ngày thanh toán nợ
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.Ngay_thanh_toan_no
              ? moment(data?.Ngay_thanh_toan_no).format('DD/MM/YYYY')
              : ''}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
            Ghi chú
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.Ghi_chu}
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
