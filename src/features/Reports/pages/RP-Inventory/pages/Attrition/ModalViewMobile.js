import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'react-bootstrap'
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
  return (
    <Modal
      className="modal-view-mobile"
      show={show}
      onHide={onHide}
      scrollable={true}
    >
      <div className="modal-view-head align-items-baseline px-15px py-8px">
        <div className="modal-view-title text-uppercase font-size-lg fw-500 flex-1 pr-15px">
          {data?.ProdTitle || 'Chưa có'}
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
              Mã
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.Code || 'Chưa có'}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
              Sử dụng
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.Unit || 'Chưa có'}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
              Đơn vị
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.SUnit || 'Chưa có'}
            </div>
          </div>
          <div className="px-15px d-flex flex-column justify-content-between py-10px line-height-sm">
            <div className="fw-600 text-uppercase text-muted font-size-smm text-truncate">
              Tỉ lệ theo cơ sở
            </div>
            <div className="fw-600 font-size-mdd">
              {data?.StockUsageList
                ? data?.StockUsageList.map(
                    item => `${item.Title} (${item?.Unit} ${item?.SUnit})`
                  ).join(', ')
                : 'Chưa xác định'}
            </div>
          </div>
          <div className="px-15px d-flex flex-column justify-content-between py-10px line-height-sm">
            <div className="fw-600 text-uppercase text-muted font-size-smm text-truncate">
              Tỉ lệ vào các dịch vụ
            </div>
            <div className="fw-600 font-size-mdd">
              {data?.UsageList
                ? data?.UsageList.map(
                    item => `${item.Title} (${item?.Unit} ${item?.SUnit})`
                  ).join(', ')
                : 'Chưa xác định'}
            </div>
          </div>
        </div>
        <div className="px-15px">
          {data &&
            data.ListOrders &&
            data.ListOrders.map((item, index) => (
              <div
                className="border mb-15px shadows border-gray-200 rounded"
                key={index}
              >
                <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                  <div>ID đơn hàng</div>
                  <div className="fw-600">#{item.Id}</div>
                </div>
                <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                  <div>Ngày bán</div>
                  <div className="fw-600">
                    {item?.CreateDate
                      ? moment(data.CreateDate).format('HH:mm DD/MM/YYYY')
                      : 'Không có'}
                  </div>
                </div>
                <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                  <div>Tổng tiền nợ</div>
                  <div className="fw-600">
                    {PriceHelper.formatVND(item.TongNo)}
                  </div>
                </div>
                <div className="border-bottom border-gray-200 p-12px">
                  <div>Sản phẩm</div>
                  <div>
                    {item.ListDebt &&
                      item.ListDebt.map((order, orderIndex) => (
                        <div
                          className={`mt-10px ${clsx({
                            'pt-10px border-top-dashed': orderIndex !== 0
                          })}`}
                          key={orderIndex}
                        >
                          <div className="d-flex py-3px">
                            <div className="pr-5px">Tên Sản phẩm</div>
                            <div className="fw-600">{order.ProdTitle}</div>
                          </div>
                          <div className="d-flex py-3px">
                            <div className="pr-5px">Số lượng</div>
                            <div className="fw-600">{order.Qty}</div>
                          </div>
                          <div className="d-flex py-3px">
                            <div className="pr-5px">Thành tiền</div>
                            <div className="fw-600">
                              {PriceHelper.formatVND(order.ToPay)}
                            </div>
                          </div>
                          <div className="d-flex py-3px">
                            <div className="pr-5px">Còn nợ</div>
                            <div className="fw-600">
                              {PriceHelper.formatVND(order.ConNo)}
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
