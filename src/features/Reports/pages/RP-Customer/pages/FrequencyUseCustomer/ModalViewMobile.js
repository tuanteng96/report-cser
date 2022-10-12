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
          {data?.MemberFullName || 'Chưa có tên KH'}
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
        <div className="px-15px">
          {data &&
            data.ProdsList &&
            data.ProdsList.map((item, index) => (
              <div
                className="border my-15px shadows border-gray-200 rounded"
                key={index}
              >
                <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                  <div>Thời gian mua hàng</div>
                  <div className="fw-600">
                    {moment(item.CreateDate).format('HH:mm DD/MM/YYYY')}
                  </div>
                </div>
                <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                  <div>Tên mặt hàng</div>
                  <div className="fw-600">
                    {item?.Title} (x{item?.Qty})
                  </div>
                </div>
                <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                  <div>Thời gian dùng gần nhất</div>
                  <div className="fw-600">
                    {moment(item.LastUsedTime).format('HH:mm DD/MM/YYYY')}
                  </div>
                </div>
                <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                  <div>Tần suất sử dụng</div>
                  <div className="fw-600">{item.TanSuatSD}</div>
                </div>
              </div>
            ))}
        </div>
      </PerfectScrollbar>
    </Modal>
  )
}

ModalViewMobile.propTypes = {
  show: PropTypes.bool
}

export default ModalViewMobile
