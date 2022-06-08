import React from 'react'
import PropTypes from 'prop-types'
import { Modal, OverlayTrigger, Popover } from 'react-bootstrap'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { PriceHelper } from 'src/helpers/PriceHelper'

import moment from 'moment'
import 'moment/locale/vi'
import clsx from 'clsx'
moment.locale('vi')

const perfectScrollbarOptions = {
  wheelSpeed: 2,
  wheelPropagation: false
}

function ModalViewMobile({ show, onHide, data }) {
  console.log(data)
  return (
    <Modal
      className="modal-view-mobile"
      show={show}
      onHide={onHide}
      scrollable={true}
    >
      <div className="modal-view-head align-items-baseline px-15px py-8px">
        <div className="modal-view-title text-uppercase font-size-lg fw-500 flex-1 pr-15px">
          Ngày{' '}
          {data?.CreateDate && moment(data?.CreateDate).format('DD-MM-YYYY')}
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
          <div className="px-15px d-flex justify-content-between py-12px line-height-sm">
            <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
              Tổng thanh toán nợ
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {PriceHelper.formatVND(data?.TTToanNo)}
            </div>
          </div>
        </div>
        <div className="px-15px">
          {data &&
            data.ListCustomer &&
            data.ListCustomer.map((item, index) => (
              <div
                className="border mb-15px shadows border-gray-200 rounded"
                key={index}
              >
                <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                  <div>Tên khách hàng</div>
                  <div className="fw-600">{item.MemberName}</div>
                </div>
                <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                  <div>Số điện thoại</div>
                  <div className="fw-600">{item.MemberPhone}</div>
                </div>
                <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                  <div>Thanh toán nợ</div>
                  <div className="fw-600">
                    {PriceHelper.formatVND(item.TTToanNo)}
                  </div>
                </div>
                <div className="border-bottom border-gray-200 p-12px">
                  <div>Đơn hàng</div>
                  <div>
                    {item.ListOrders &&
                      item.ListOrders.map((order, orderIndex) => (
                        <div
                          className={`mt-10px ${clsx({
                            'pt-10px border-top-dashed': orderIndex !== 0
                          })}`}
                          key={orderIndex}
                        >
                          <div className="d-flex py-3px">
                            <div className="pr-5px">ID</div>
                            <div className="fw-600">#{order.Id}</div>
                          </div>
                          <div className="d-flex py-3px">
                            <div className="pr-5px">Thanh toán nợ</div>
                            <div className="fw-600">
                              {PriceHelper.formatVND(order.TTToanNo)}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
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
