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
        <div className="modal-view-title text-uppercase font-size-lg fw-500 flex-1 pr-15px">
          {data?.Ten || 'Chưa có tên'}
        </div>
        <div
          className="modal-view-close font-size-h3 w-20px text-center"
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
          <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
            ID
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">#{data?.Id}</div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
            Tên măt hàng
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.Ten || 'Không có'}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
            Mã
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.MaSP || 'Không có'}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
            Nguyên Giá
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {PriceHelper.formatVND(data?.NguyenGia)}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
            Giá hiện tại
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.GiaKM > 0
              ? PriceHelper.formatVND(data?.GiaKM)
              : PriceHelper.formatVND(data?.NguyenGia)}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
            Tồn kho
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.TonKho ? `${data?.TonKho} ${data?.DonVi || ''}` : 0}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
            Danh mục
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.DanhMuc}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
            Nhãn hàng
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.NhanHang}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
            Hoa hồng Sale
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {PriceHelper.formatVND(data?.hoa_hong_sale)}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
            Hoa hồng KTV
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {PriceHelper.formatVND(data?.hoa_hong_ktv)}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
            Lương ca
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {PriceHelper.formatVND(data?.luong_ca)}
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
