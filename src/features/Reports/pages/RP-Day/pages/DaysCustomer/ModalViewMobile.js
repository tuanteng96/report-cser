import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { Modal, OverlayTrigger, Popover } from 'react-bootstrap'
import PerfectScrollbar from 'react-perfect-scrollbar'

import moment from 'moment'
import 'moment/locale/vi'
import { PriceHelper } from 'src/helpers/PriceHelper'
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
          {data?.FullName || 'Chưa có tên KH'}
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
          <div className="fw-600">{data?.Phone}</div>
        </div>
        <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
          <div>Tổng thanh toán</div>
          <div className="fw-600">
            {PriceHelper.formatVND(data?.TongThanhToan)}
          </div>
        </div>
        <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
          <div>CheckIn</div>
          <div className="fw-600">
            {data?.CheckIn
              ? moment(data?.CheckIn).format('HH:mm DD/MM/YYYY')
              : ''}
          </div>
        </div>
        <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
          <div>CheckOut</div>
          <div className="fw-600">
            {data?.CheckOut
              ? moment(data?.CheckOut).format('HH:mm DD/MM/YYYY')
              : ''}
          </div>
        </div>
        {data?.children &&
          data?.children.map((children, idx) => (
            <div className="px-15px mt-15px" key={idx}>
              <div className="mb-15px">
                <div className="mb-8px text-uppercase fw-600 font-size-md">
                  <span className="text-danger">(*)</span> Đơn hàng & Sử dụng
                  dịch vụ
                </div>
                {children.MajorList && children.MajorList.length > 0 ? (
                  children.MajorList &&
                  children.MajorList.map((item, index) => (
                    <Fragment key={index}>
                      {item.Order && (
                        <div className="mb-12px border">
                          <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                            <div className="w-120px">Đơn hàng mới</div>
                            <div className="fw-600 text-end flex-1">
                              #{item.Order.ID}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                            <div className="w-120px">Sản phẩm / Dịch vụ</div>
                            <div className="fw-600 flex-1 pl-15px text-end">
                              {item.Order.Prods.map(
                                item => `${item.Title} (x${item.Qty})`
                              ).join(', ')}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                            <div className="w-120px">Giá bán đơn hàng</div>
                            <div className="fw-600 flex-1 text-end">
                              {PriceHelper.formatVND(item.Order.GiaBanDonHang)}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                            <div className="w-120px">Thanh toán</div>
                            <div className="fw-600">
                              {PriceHelper.formatVND(item.Order.ThanhToan)}
                              <OverlayTrigger
                                rootClose
                                trigger="click"
                                key="top"
                                placement="top"
                                overlay={
                                  <Popover id={`popover-positioned-top`}>
                                    <Popover.Header
                                      className="py-10px text-uppercase fw-600"
                                      as="h3"
                                    >
                                      Chi tiết thanh toán
                                    </Popover.Header>
                                    <Popover.Body className="p-0">
                                      <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                                        <span>Tiền mặt</span>
                                        <span>
                                          {PriceHelper.formatVNDPositive(
                                            item.Order.ThanhToan_TienMat
                                          )}
                                        </span>
                                      </div>
                                      <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                                        <span>Chuyển khoản</span>
                                        <span>
                                          {PriceHelper.formatVNDPositive(
                                            item.Order.ThanhToan_CK
                                          )}
                                        </span>
                                      </div>
                                      <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                                        <span>Quẹt thẻ</span>
                                        <span>
                                          {PriceHelper.formatVNDPositive(
                                            item.Order.ThanhToan_QT
                                          )}
                                        </span>
                                      </div>
                                    </Popover.Body>
                                  </Popover>
                                }
                              >
                                <span>
                                  <i className="fa-solid fa-circle-exclamation cursor-pointer text-success ml-5px"></i>
                                </span>
                              </OverlayTrigger>
                            </div>
                          </div>
                          <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                            <div className="w-120px">Thanh toán ví</div>
                            <div className="fw-600 flex-1 text-end">
                              {PriceHelper.formatVNDPositive(item.Order.Vi)}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                            <div className="w-120px">Thanh toán thẻ tiền</div>
                            <div className="fw-600 flex-1 text-end">
                              {PriceHelper.formatVNDPositive(
                                item.Order.TheTien
                              )}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                            <div className="w-120px">Còn nợ</div>
                            <div className="fw-600 flex-1 text-end">
                              {PriceHelper.formatVNDPositive(item.Order.No)}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                            <div className="w-120px">Hoa hồng</div>
                            <div className="d-flex flex-1 justify-content-end flex-wrap">
                              {item?.Order?.HoaHong &&
                              item?.Order?.HoaHong.length > 0
                                ? item?.Order?.HoaHong.map((item, index) => (
                                    <div className="fw-600" key={index}>
                                      {item.FullName}{' '}
                                      {PriceHelper.formatVND(item.Bonus)}
                                    </div>
                                  ))
                                : 'Không'}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between p-12px">
                            <div className="w-120px">Doanh số</div>
                            <div className="d-flex flex-1 justify-content-end flex-wrap">
                              {item.Order?.DoanhSo &&
                              item.Order?.DoanhSo.length > 0
                                ? item.Order?.DoanhSo.map((item, index) => (
                                    <div className="fw-600" key={index}>
                                      {item.FullName}{' '}
                                      {PriceHelper.formatVND(item.Bonus)}
                                    </div>
                                  ))
                                : 'Không'}
                            </div>
                          </div>
                        </div>
                      )}
                      {item.PayDebt && (
                        <div className="mb-12px border">
                          <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                            <div className="w-120px">Thanh toán nợ</div>
                            <div className="fw-600 text-end flex-1">
                              #{item.PayDebt.ID}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                            <div className="w-120px">Sản phẩm / Dịch vụ</div>
                            <div className="fw-600 flex-1 pl-15px text-end">
                              {item?.PayDebt?.Prods &&
                              item?.PayDebt?.Prods.length > 0
                                ? item?.PayDebt?.Prods.map(
                                    item => `${item.Title} (x${item.Qty})`
                                  ).join(', ')
                                : 'Không có'}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                            <div className="w-120px">Thanh toán</div>
                            <div className="fw-600 text-end flex-1">
                              {PriceHelper.formatVND(item.PayDebt.ThanhToan)}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                            <div className="w-120px">Thanh toán ví</div>
                            <div className="fw-600 text-end flex-1">
                              {PriceHelper.formatVNDPositive(item.PayDebt.Vi)}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                            <div className="w-120px">Thanh toán thẻ tiền</div>
                            <div className="fw-600 text-end flex-1">
                              {PriceHelper.formatVND(item.PayDebt.TheTien)}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                            <div className="w-120px">Còn nợ</div>
                            <div className="fw-600 text-end flex-1">
                              {PriceHelper.formatVND(item.PayDebt.No)}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                            <div className="w-120px">Hoa hồng</div>
                            <div className="d-flex flex-1 justify-content-end flex-wrap">
                              {item?.PayDebt?.HoaHong &&
                              item?.PayDebt?.HoaHong.length > 0
                                ? item?.PayDebt?.HoaHong.map((item, index) => (
                                    <div className="fw-600" key={index}>
                                      {item.FullName}{' '}
                                      {PriceHelper.formatVND(item.Bonus)}
                                    </div>
                                  ))
                                : 'Không'}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between p-12px">
                            <div className="w-120px">Doanh số</div>
                            <div className="d-flex flex-1 justify-content-end flex-wrap">
                              {item?.PayDebt?.DoanhSo &&
                              item?.PayDebt?.DoanhSo.length > 0
                                ? item?.PayDebt?.DoanhSo.map((item, index) => (
                                    <div className="fw-600" key={index}>
                                      {item.FullName}{' '}
                                      {PriceHelper.formatVND(item.Bonus)}
                                    </div>
                                  ))
                                : 'Không'}
                            </div>
                          </div>
                        </div>
                      )}
                      {item.Returns && (
                        <div className="mb-12px border">
                          <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                            <div className="w-120px">Đơn trả hàng</div>
                            <div className="fw-600 text-end flex-1">
                              #{item.Returns.ID}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                            <div>Sản phẩm / Dịch vụ</div>
                            <div className="fw-600 flex-1 pl-15px text-end">
                              {item?.Returns?.Prods &&
                              item?.Returns?.Prods.length > 0
                                ? item?.Returns?.Prods.map(
                                    item => `${item.Title} (x${item.Qty})`
                                  ).join(', ')
                                : 'Không'}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                            <div className="w-120px">Giá trị đơn trả</div>
                            <div className="fw-600 text-end flex-1 text-danger">
                              {PriceHelper.formatVND(item.Returns.GiaTriDonTra)}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                            <div className="w-120px">Hoàn tiền mặt</div>
                            <div className="fw-600 text-end flex-1">
                              {PriceHelper.formatVND(item.Returns.HoanTienMat)}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                            <div className="w-120px">Hoàn ví</div>
                            <div className="fw-600 text-end flex-1">
                              {PriceHelper.formatVND(item.Returns.HoanVi)}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                            <div className="w-120px">Hoàn thẻ tiền</div>
                            <div className="fw-600 text-end flex-1">
                              {PriceHelper.formatVND(item.Returns.HoanTheTien)}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                            <div className="w-120px">Hoa hồng giảm</div>
                            <div className="d-flex flex-1 justify-content-end flex-wrap">
                              {item?.Returns?.HoaHongGiam &&
                              item?.Returns?.HoaHongGiam.length > 0
                                ? item?.Returns?.HoaHongGiam.map(
                                    (item, index) => (
                                      <div className="fw-600" key={index}>
                                        {item.FullName}{' '}
                                        {PriceHelper.formatVND(item.Bonus)}
                                      </div>
                                    )
                                  )
                                : 'Không'}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between p-12px">
                            <div className="w-120px">Doanh số giảm</div>
                            <div className="d-flex flex-1 justify-content-end flex-wrap">
                              {item?.Returns?.DoanhSoGiam &&
                              item?.Returns?.DoanhSoGiam.length > 0
                                ? item?.Returns?.DoanhSoGiam.map(
                                    (item, index) => (
                                      <div className="fw-600" key={index}>
                                        {item.FullName}{' '}
                                        {PriceHelper.formatVND(item.Bonus)}
                                      </div>
                                    )
                                  )
                                : 'Không'}
                            </div>
                          </div>
                        </div>
                      )}
                      {item.Services &&
                        item.Services.map((service, x) => (
                          <div className="mb-12px border" key={x}>
                            <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                              <div className="w-120px">Loại</div>
                              <div className="fw-600 text-end flex-1">
                                {service.Type}
                              </div>
                            </div>
                            <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                              <div className="w-120px">Sản phẩm / Dịch vụ</div>
                              <div className="fw-600 text-end flex-1">
                                {service.Title}
                              </div>
                            </div>
                            <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                              <div className="w-120px">Phụ Phí</div>
                              <div className="fw-600 text-end flex-1">
                                {service?.PhuPhi && service?.PhuPhi.length > 0
                                  ? service?.PhuPhi.map(o => o.Title).join(', ')
                                  : 'Không'}
                              </div>
                            </div>
                            <div className="d-flex justify-content-between p-12px">
                              <div className="w-120px">Hoa hồng</div>
                              <div className="d-flex flex-1 justify-content-end flex-wrap">
                                {service.HoaHong && service.HoaHong.length > 0
                                  ? service.HoaHong.map((item, index) => (
                                      <div className="fw-600" key={index}>
                                        {item.FullName}{' '}
                                        {PriceHelper.formatVND(item.Bonus)}
                                      </div>
                                    ))
                                  : 'Không'}
                              </div>
                            </div>
                          </div>
                        ))}
                    </Fragment>
                  ))
                ) : (
                  <div className="pl-15px">Chưa có dữ liệu</div>
                )}
              </div>
              <div className="mb-15px">
                <div className="mb-8px text-uppercase fw-600 font-size-md">
                  <span className="text-danger">(*)</span> Nghiệp vụ khác
                </div>
                {children.More && children.More.length > 0 ? (
                  children.More.map((item, index) => (
                    <div key={index}>
                      <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                        <div className="w-120px">Tên nghiệp vụ</div>
                        <div className="fw-600 flex-1 text-end">
                          {item.Title || 'Chưa xác định'}
                        </div>
                      </div>
                      <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                        <div className="w-120px">Giá trị</div>
                        <div className="fw-600 flex-1 text-end">
                          {PriceHelper.formatVND(item.Value)}
                        </div>
                      </div>
                      <div className="d-flex justify-content-between border-bottom border-gray-200 p-12px">
                        <div className="w-120px">Phát sinh thu / Chi TM</div>
                        <div className="fw-600 flex-1 text-end">
                          {PriceHelper.formatVND(item.PhatSinhThuChi)}
                        </div>
                      </div>
                      <div className="d-flex justify-content-between p-12px">
                        <div className="w-120px">Chi tiết</div>
                        <div className="fw-600 flex-1 text-end">
                          {item.Desc}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div>Không có dữ liệu</div>
                )}
              </div>

              {/* {data &&
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
              ))} */}
            </div>
          ))}
      </PerfectScrollbar>
    </Modal>
  )
}

ModalViewMobile.propTypes = {
  show: PropTypes.bool
}

export default ModalViewMobile
