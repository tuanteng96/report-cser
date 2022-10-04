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
          {data?.Ho_ten || 'Chưa có tên'}
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
        <div className="py-5px">
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
              Số điện thoại
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.SDT}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
              Đã dùng
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.Da_dung}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
              Ngày dùng gần nhất
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {moment(data?.Ngay_dung_gan_nhat).format('HH:mm DD-MM-YYYY')}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
              Cơ sở mua
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.Diem_mua}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
              Số buổi
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.So_buoi}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
              Giá trị buổi
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {PriceHelper.formatVND(data?.Gia_tri_buoi)}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
              Giá trị thẻ
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {PriceHelper.formatVND(data?.Gia_tri_the)}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
              Tên thẻ
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.The}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
              ID thẻ
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.The_ID}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
              Ngày mua
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {moment(data?.Ngay_mua).format('HH:mm DD-MM-YYYY')}
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
