import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'react-bootstrap'
import PerfectScrollbar from 'react-perfect-scrollbar'

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
          {data?.UserName || 'Chưa có tên'}
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
        <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
          <div className="text-uppercase fw-600">Ngày tạo</div>
          <div className="text-uppercase fw-600">Số lần</div>
        </div>
        {data?.Dates && data?.Dates.length > 0 ? (
          data?.Dates.map((item, index) => (
            <div
              className="d-flex justify-content-between border-bottom border-gray-200 p-12px"
              key={index}
            >
              <div>{moment(item?.Date).format('DD/MM/YYYY')}</div>
              <div className="fw-600">{item.Total}</div>
            </div>
          ))
        ) : (
          <>Chưa có dữ liệu</>
        )}
      </PerfectScrollbar>
    </Modal>
  )
}

ModalViewMobile.propTypes = {
  show: PropTypes.bool
}

export default ModalViewMobile
