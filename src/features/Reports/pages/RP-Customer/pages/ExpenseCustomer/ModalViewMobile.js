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
          <div>Số điện thoại</div>
          <div className="fw-600">{data?.MemberPhone}</div>
        </div>
        <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
          <div>Cơ sở</div>
          <div className="fw-600">{data?.StockName}</div>
        </div>
        <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
          <div>Tổng tiền chi tiêu</div>
          <div className="fw-600">
            {PriceHelper.formatVND(data?.TongChiTieu)}
          </div>
        </div>
        <div className="px-15px">
          {data &&
            data.OrdersList &&
            data.OrdersList.map((item, index) => (
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
                  <div>Cơ sở mua hàng</div>
                  <div className="fw-600">{item?.StockName ?? 'Không có'}</div>
                </div>
                <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                  <div>Mã đơn hàng</div>
                  <div className="fw-600">#{item?.ID}</div>
                </div>
                <div className="border-bottom border-bottom border-gray-200 p-12px">
                  <div>Tên mặt hàng</div>
                  <div className="mt-5px">
                    {item?.Prods && item?.Prods.length > 0
                      ? item?.Prods.map(
                          prod => `${prod.name} (x${prod.qty})`
                        ).join(', ')
                      : 'Không có mặt hàng.'}
                  </div>
                </div>
                <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                  <div>Doanh số</div>
                  <div className="fw-600">
                    {PriceHelper.formatVND(item.DoanhSo)}
                  </div>
                </div>
                <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                  <div>Giảm giá</div>
                  <div className="fw-600">
                    {PriceHelper.formatVND(item.GiamGia)}
                  </div>
                </div>
                <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                  <div>Doanh thu</div>
                  <div className="fw-600">
                    {PriceHelper.formatVND(item.DoanhThu)}
                  </div>
                </div>
                <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                  <div>Tổng thanh toán</div>
                  <div className="fw-600">
                    {PriceHelper.formatVND(item.TongThanhToan)}
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
