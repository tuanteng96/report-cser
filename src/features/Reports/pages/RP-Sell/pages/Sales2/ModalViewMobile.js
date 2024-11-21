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
          {data?.MemberName}
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
          <div className="px-15px d-flex justify-content-between py-12px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              ID Khách hàng
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.MemberID}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Khách hàng
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.MemberName}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Số điện thoại
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.MobilePhone}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Nhóm
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.GroupList
                ? data?.GroupList.map(
                    item =>
                      `${item.Title} (Ngưỡng ${PriceHelper.formatVND(
                        item.Point
                      )})`
                  )
                : ''}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Chi tiêu
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {PriceHelper.formatVND(data?.ToPay)}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Cấp tiếp theo có thể lên
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.GroupNext
                ? data?.GroupNext.map(
                    item =>
                      `${item.Title} (${PriceHelper.formatVND(item.Point)})`
                  ).join(', ')
                : ''}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Chi tiết đơn hàng
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.Items
                ? data?.Items.map(
                    item => `[#${item.ID}] ${item.ProdTitle} (x${item.Qty})`
                  ).join(', ')
                : ''}
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
