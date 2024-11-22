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

function ModalViewMobile({ show, onHide, data, filters }) {
  if (Number(filters.ShowsType) === 2) {
    return (
      <Modal
        className="modal-view-mobile"
        show={show}
        onHide={onHide}
        scrollable={true}
      >
        <div className="modal-view-head align-items-baseline px-15px py-8px">
          <div className="flex-1 modal-view-title text-uppercase font-size-lg fw-500 pr-15px">
            {data?.MemberName || 'Chưa có tên KH'}
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
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px">
                ID Khách hàng
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.MemberID || ''}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px">
                Khách hàng
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.MemberName || 'Chưa có'}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px">
                Số điện thoại
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.Member?.Phone || 'Chưa có số điện thoại'}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px">
                Nợ trước kỳ
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {PriceHelper.formatVND(data?.NO_A)}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px">
                Nợ phát sinh trong kỳ
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {PriceHelper.formatVND(data?.NO_A_B)}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px">
                Thanh toán nợ trong kỳ
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                <OverlayTrigger
                  rootClose
                  trigger="click"
                  key="bottom"
                  placement="bottom"
                  overlay={
                    <Popover id={`popover-positioned-top`}>
                      <Popover.Body className="p-0">
                        <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                          <span>Chuyển khoản</span>
                          <span>{data?.TRA_NO_A_B_CK}</span>
                        </div>
                        <div className="py-10px px-15px fw-600 font-size-md d-flex justify-content-between">
                          <span>Quẹt thẻ</span>
                          <span>{data?.TRA_NO_A_B_QT}</span>
                        </div>
                        <div className="py-10px px-15px fw-600 font-size-md d-flex justify-content-between">
                          <span>Tiền mặt</span>
                          <span>{data?.TRA_NO_A_B_TM}</span>
                        </div>
                        <div className="py-10px px-15px fw-600 font-size-md d-flex justify-content-between">
                          <span>Thẻ tiền</span>
                          <span>{data?.TRA_NO_A_B_TT}</span>
                        </div>
                        <div className="py-10px px-15px fw-600 font-size-md d-flex justify-content-between">
                          <span>Ví</span>
                          <span>{data?.TRA_NO_A_B_VI}</span>
                        </div>
                      </Popover.Body>
                    </Popover>
                  }
                >
                  <div className="d-flex justify-content-end align-items-center w-100">
                    <span>
                      {PriceHelper.formatVND(
                        data?.TRA_NO_A_B_CK +
                          data?.TRA_NO_A_B_QT +
                          data?.TRA_NO_A_B_TM +
                          data?.TRA_NO_A_B_TT +
                          data?.TRA_NO_A_B_VI
                      )}
                    </span>
                    <i className="cursor-pointer fa-solid fa-circle-exclamation text-warning ml-5px"></i>
                  </div>
                </OverlayTrigger>
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px">
                Thanh toán trong kỳ
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                <OverlayTrigger
                  rootClose
                  trigger="click"
                  key="bottom"
                  placement="bottom"
                  overlay={
                    <Popover id={`popover-positioned-top`}>
                      <Popover.Body className="p-0">
                        <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                          <span>Chuyển khoản</span>
                          <span>{data?.TRA_NO_A_CK}</span>
                        </div>
                        <div className="py-10px px-15px fw-600 font-size-md d-flex justify-content-between">
                          <span>Quẹt thẻ</span>
                          <span>{data?.TRA_NO_A_QT}</span>
                        </div>
                        <div className="py-10px px-15px fw-600 font-size-md d-flex justify-content-between">
                          <span>Tiền mặt</span>
                          <span>{data?.TRA_NO_A_TM}</span>
                        </div>
                        <div className="py-10px px-15px fw-600 font-size-md d-flex justify-content-between">
                          <span>Thẻ tiền</span>
                          <span>{data?.TRA_NO_A_TT}</span>
                        </div>
                        <div className="py-10px px-15px fw-600 font-size-md d-flex justify-content-between">
                          <span>Ví</span>
                          <span>{data?.TRA_NO_A_VI}</span>
                        </div>
                      </Popover.Body>
                    </Popover>
                  }
                >
                  <div className="d-flex justify-content-end align-items-center w-100">
                    <span>
                      {PriceHelper.formatVND(
                        data?.TRA_NO_A_CK +
                          data?.TRA_NO_A_QT +
                          data?.TRA_NO_A_TM +
                          data?.TRA_NO_A_TT +
                          data?.TRA_NO_A_VI
                      )}
                    </span>
                    <i className="cursor-pointer fa-solid fa-circle-exclamation text-warning ml-5px"></i>
                  </div>
                </OverlayTrigger>
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px">
                Nợ cuối kỳ
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {PriceHelper.formatVND(data?.NO_B)}
              </div>
            </div>
          </div>
        </PerfectScrollbar>
      </Modal>
    )
  }
  return (
    <Modal
      className="modal-view-mobile"
      show={show}
      onHide={onHide}
      scrollable={true}
    >
      <div className="modal-view-head align-items-baseline px-15px py-8px">
        <div className="flex-1 modal-view-title text-uppercase font-size-lg fw-500 pr-15px">
          {data?.Member?.FullName || 'Chưa có tên KH'}
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
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Số điện thoại
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.Member?.Phone || 'Chưa có số điện thoại'}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px line-height-sm">
            <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
              Tổng nợ
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {PriceHelper.formatVND(data?.TongNo)}
            </div>
          </div>
        </div>
        <div className="px-15px">
          {data &&
            data.ListOrders &&
            data.ListOrders.map((item, index) => (
              <div
                className="border border-gray-200 rounded mb-15px shadows"
                key={index}
              >
                <div className="border-gray-200 d-flex justify-content-between border-bottom p-12px">
                  <div>ID đơn hàng</div>
                  <div className="fw-600">#{item.Id}</div>
                </div>
                <div className="border-gray-200 d-flex justify-content-between border-bottom p-12px">
                  <div>Ngày bán</div>
                  <div className="fw-600">
                    {item?.CreateDate
                      ? moment(data.CreateDate).format('HH:mm DD/MM/YYYY')
                      : 'Không có'}
                  </div>
                </div>
                <div className="border-gray-200 d-flex justify-content-between border-bottom p-12px">
                  <div>Tổng tiền nợ</div>
                  <div className="fw-600">
                    {PriceHelper.formatVND(item.TongNo)}
                  </div>
                </div>
                <div className="border-gray-200 border-bottom p-12px">
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
