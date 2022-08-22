import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'react-bootstrap'
import PerfectScrollbar from 'react-perfect-scrollbar'

import moment from 'moment'
import 'moment/locale/vi'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
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
          {data?.FullName || 'Chưa có tên'}
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
            Tên khách hàng
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.FullName || 'Không có'}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
            Số điện thoại
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.MobilePhone || 'Không có'}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
            Thiết bị cài đặt
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {BrowserHelpers.getOperatingSystem(data?.App?.app)}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
            Trạng thái
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.LogoutDate ? (
              <span className="text-danger fw-700 text-italic">
                Offline - {moment(data?.LogoutDate).format('HH:mm DD-MM-YYYY')}
              </span>
            ) : (
              <span className="text-success fw-700 text-italic">Online</span>
            )}
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
