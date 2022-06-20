import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'react-bootstrap'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { PriceHelper } from 'src/helpers/PriceHelper'
import clsx from 'clsx'

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
          {data?.CreateDate
            ? moment(data.CreateDate).format('HH:mm DD/MM/YYYY')
            : 'Không có'}{' '}
          - Tổng{' '}
          <span className="text-success">
            {PriceHelper.formatVND(data?.TongThuc)}
          </span>
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
          {data?.StaffsList &&
            data?.StaffsList.map((item, index) => (
              <div
                className="border-bottom border-width-5 border-gray-200"
                key={index}
              >
                <div className="px-15px d-flex justify-content-between py-12px border-bottom-dashed line-height-sm">
                  <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                    Nhân viên
                  </div>
                  <div className="fw-600 font-size-mdd w-60 text-end">
                    {item?.Staff?.FullName || 'Chưa có nhân viên'}
                  </div>
                </div>
                <div className="px-15px d-flex justify-content-between py-12px line-height-sm">
                  <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                    Doanh số
                  </div>
                  <div className="fw-600 font-size-mdd w-60 text-end">
                    {PriceHelper.formatVND(item?.TongThuc)}
                  </div>
                </div>
                {item.OrdersList &&
                  item.OrdersList.map((order, orderIndex) => (
                    <div
                      className={`rounded bg-white shadows ${clsx({
                        'border border-gray-200':
                          item.OrdersList.length - 1 !== index
                      })}`}
                      key={orderIndex}
                    >
                      <div className="px-15px d-flex justify-content-between py-12px border-bottom-dashed line-height-sm">
                        <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                          Đơn hàng
                        </div>
                        <div className="fw-600 font-size-mdd w-60 text-end">
                          #{order.ID}
                        </div>
                      </div>
                      <div className="px-15px d-flex justify-content-between py-12px border-bottom-dashed line-height-sm">
                        <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                          Khách hàng
                        </div>
                        <div className="fw-600 font-size-mdd w-60 text-end">
                          {order?.Member?.FullName || 'Chưa xác định'}
                        </div>
                      </div>
                      <div className="px-15px d-flex justify-content-between py-12px border-bottom-dashed line-height-sm">
                        <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                          Số điện thoại
                        </div>
                        <div className="fw-600 font-size-mdd w-60 text-end">
                          {order?.Member?.Phone || 'Chưa xác định'}
                        </div>
                      </div>
                      <div className="px-15px d-flex justify-content-between py-12px border-bottom-dashed line-height-sm">
                        <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                          Doanh số
                        </div>
                        <div className="fw-600 font-size-mdd w-60 text-end">
                          {PriceHelper.formatVND(order?.GiaTriThuc)}
                        </div>
                      </div>
                      <div className="px-15px d-flex justify-content-between flex-column py-12px line-height-sm">
                        <div className="fw-600 text-uppercase text-muted font-size-smm text-truncate">
                          Chi tiết
                        </div>
                        <div className="fw-600 font-size-mdd">
                          {order?.Lines.map(
                            line =>
                              `${line.ProdTitle} - ${PriceHelper.formatVND(
                                line.ToPay
                              )}`
                          ).join(', ')}
                        </div>
                      </div>
                    </div>
                  ))}
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
