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
          #{data?.ID} - {data?.KhachHang}
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
          <div className="px-15px d-flex justify-content-between py-12px border-bottom-dashed line-height-sm">
            <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
              Thời gian
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {moment(data?.CreateDate).format('HH:mm DD-MM-YYYY')}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
              ID đơn hàng
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">{data?.ID}</div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
              Khách hàng
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.KhachHang}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
              Tổng giá trị
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {PriceHelper.formatVND(data?.TongGiaTri)}
            </div>
          </div>
          {data?.BankValue &&
            data?.BankValue.map((item, index) => (
              <div
                className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm"
                key={index}
              >
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  {item.ngan_hang}
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.Value)}
                </div>
              </div>
            ))}
          <div className="px-15px d-flex justify-content-between py-10px line-height-sm">
            <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
              Ghi chú
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.Desc}
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
