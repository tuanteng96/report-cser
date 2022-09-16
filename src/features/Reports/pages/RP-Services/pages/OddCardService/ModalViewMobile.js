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

function ModalViewMobile({ show, onHide, data, transformDetail }) {
  return (
    <Modal
      className="modal-view-mobile"
      show={show}
      onHide={onHide}
      scrollable={true}
    >
      <div className="modal-view-head align-items-baseline px-15px py-8px">
        <div className="modal-view-title text-uppercase font-size-lg fw-500 flex-1 pr-15px">
          {data?.MemberName || 'Chưa có tên'}
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
              Ngày
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.BookDate
                ? moment(data.CreateDate).format('DD/MM/YYYY')
                : 'Không có'}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
              Cơ sở
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.StockTitle || 'Không có'}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
              Nghiệp vụ
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.Title || 'Không có'}
            </div>
          </div>
          <div className="px-15px d-flex flex-column justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="fw-600 text-uppercase text-muted font-size-smm flex-1 text-truncate">
              Chi tiết thực hiện
            </div>
            <div className="fw-600 font-size-mdd w-100 text-start mt-5px">
              {transformDetail(data)}
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
