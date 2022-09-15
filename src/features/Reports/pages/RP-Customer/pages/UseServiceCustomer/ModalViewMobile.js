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
        <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
          <div>Ngày tạo</div>
          <div className="fw-600">
            {moment(data?.CreateDate).format('HH:mm DD/MM/YYYY')}
          </div>
        </div>
        <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
          <div>Số điện thoại</div>
          <div className="fw-600">{data?.MemberPhone}</div>
        </div>
        <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
          <div>Cơ sở</div>
          <div className="fw-600">{data?.StockName}</div>
        </div>
        <div className="px-15px">
          {data &&
            data.ServiceList &&
            data.ServiceList.map((item, index) => (
              <div
                className="border my-15px shadows border-gray-200 rounded"
                key={index}
              >
                <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                  <div>Tên dịch vụ</div>
                  <div className="fw-600">{item?.Title}</div>
                </div>
                <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                  <div>Số buổi còn</div>
                  <div className="fw-600">{item?.BuoiCon}</div>
                </div>
                <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                  <div>Thời gian dùng cuối</div>
                  <div className="fw-600">
                    {item.UseEndTime
                      ? moment(item.UseEndTime).format('HH:mm DD/MM/YYYY')
                      : ''}
                  </div>
                </div>
                <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                  <div>Trạng thái</div>
                  <div>{item?.Status}</div>
                </div>
                <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                  <div>Mô tả</div>
                  <div className="fw-600">{item?.Desc}</div>
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
