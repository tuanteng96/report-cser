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
        <div className="flex-1 modal-view-title text-uppercase font-size-lg fw-500 pr-15px">
          {data?.FullName || 'Chưa có tên KH'}
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
        <div className="border-gray-200 d-flex justify-content-between border-bottom p-12px">
          <div>Số điện thoại</div>
          <div className="fw-600">{data?.Phone}</div>
        </div>
        <div className="border-gray-200 d-flex justify-content-between border-bottom p-12px">
          <div>Tổng thanh toán</div>
          <div className="fw-600">
            {PriceHelper.formatVND(data?.TongThanhToan)}
          </div>
        </div>
        <div className="border-gray-200 d-flex justify-content-between border-bottom p-12px">
          <div>CheckIn</div>
          <div className="fw-600">
            {data?.CheckIn
              ? moment(data?.CheckIn).format('HH:mm DD/MM/YYYY')
              : ''}
          </div>
        </div>
        <div className="border-gray-200 d-flex justify-content-between border-bottom p-12px">
          <div>CheckOut</div>
          <div className="fw-600">
            {data?.CheckOut
              ? moment(data?.CheckOut).format('HH:mm DD/MM/YYYY')
              : ''}
          </div>
        </div>

        <div className="border-gray-200 px-15px mt-15px border-bottom p-12px">
          <div className="mb-15px">
            <div className="mb-8px text-uppercase fw-600 font-size-md">
              <span className="text-danger">(*)</span> Đơn hàng mới/Thanh toán
              nợ/Trả hàng
            </div>
            <div>
              {data?.children &&
                data?.children.map((children, idx) => (
                  <Fragment key={idx}>
                    {children.MajorList &&
                      children.MajorList.map((major, i) => (
                        <Fragment key={i}>
                          {major.Order && (
                            <div className="grid grid-cols-1 gap-1.5 mb-3 pb-3 border-bottom border-gray-200 border-bottom-dashed last:!border-0 last:!pb-0 last:!mb-0">
                              <div>
                                <div className="flex mb-1 fw-600">
                                  <div>#{major.Order?.ID}</div>
                                  <div className="pl-2 text-danger">
                                    {PriceHelper.formatVND(
                                      major.Order?.GiaBanDonHang
                                    )}
                                  </div>
                                </div>
                                <div>
                                  {major.Order?.Prods?.map((x, k) => (
                                    <div key={k}>
                                      {x.Title} (x{x.Qty})
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-baseline fw-600">
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
                                        <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                          <span>Tiền mặt</span>
                                          <span>
                                            {PriceHelper.formatVNDPositive(
                                              major.Order.ThanhToan_TienMat
                                            )}
                                          </span>
                                        </div>
                                        <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                          <span>Chuyển khoản</span>
                                          <span>
                                            {PriceHelper.formatVNDPositive(
                                              major.Order.ThanhToan_CK
                                            )}
                                          </span>
                                        </div>
                                        <div className="border-gray-200 py-10px px-15px fw-500 font-size-md d-flex justify-content-between border-bottom">
                                          <span>Quẹt thẻ</span>
                                          <span>
                                            {PriceHelper.formatVNDPositive(
                                              major.Order.ThanhToan_QT
                                            )}
                                          </span>
                                        </div>
                                        <div className="border-gray-200 py-10px px-15px fw-500 font-size-md d-flex justify-content-between border-bottom">
                                          <span>Ví</span>
                                          <span>
                                            {PriceHelper.formatVNDPositive(
                                              major.Order.Vi
                                            )}
                                          </span>
                                        </div>
                                        <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                                          <span>Thẻ tiền</span>
                                          <span>
                                            {PriceHelper.formatVNDPositive(
                                              major.Order.TheTien
                                            )}
                                          </span>
                                        </div>
                                      </Popover.Body>
                                    </Popover>
                                  }
                                >
                                  <div className="d-flex justify-content-between align-items-center">
                                    <i className="cursor-pointer fa-solid fa-circle-exclamation text-success mr-5px"></i>
                                  </div>
                                </OverlayTrigger>
                                <span className="text-success fw-600">
                                  TT:
                                  <span className="pl-1">
                                    {PriceHelper.formatVNDPositive(
                                      major.Order.ThanhToan +
                                        Math.abs(major.Order?.Vi || 0) +
                                        Math.abs(major.Order?.TheTien || 0)
                                    )}
                                  </span>
                                </span>
                              </div>
                              <div>
                                {major?.Order?.HoaHong &&
                                  major?.Order?.HoaHong.length > 0 && (
                                    <div>
                                      <div className="underline">
                                        Hoa hồng :
                                      </div>
                                      <div>
                                        {major?.Order?.HoaHong &&
                                        major?.Order?.HoaHong.length > 0
                                          ? major?.Order?.HoaHong.map(
                                              (o, k) => (
                                                <div key={k}>
                                                  {o.FullName}
                                                  <span className="pl-1">
                                                    [{' '}
                                                    {PriceHelper.formatVND(
                                                      o.Bonus
                                                    )}
                                                    đ ]
                                                  </span>
                                                </div>
                                              )
                                            )
                                          : 'Không'}
                                      </div>
                                    </div>
                                  )}
                                {major?.Order?.DoanhSo &&
                                  major?.Order?.DoanhSo.length > 0 && (
                                    <div>
                                      <div className="underline">Tư vấn :</div>
                                      <div>
                                        {major?.Order?.DoanhSo &&
                                        major?.Order?.DoanhSo.length > 0
                                          ? major?.Order?.DoanhSo.map(
                                              (o, k) => (
                                                <div key={k}>
                                                  {o.FullName}
                                                  <span className="pl-1">
                                                    [{' '}
                                                    {PriceHelper.formatVND(
                                                      o.Bonus
                                                    )}
                                                    đ ]
                                                  </span>
                                                </div>
                                              )
                                            )
                                          : 'Không'}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                          )}
                          {major.Returns && (
                            <div className="grid grid-cols-1 gap-1.5 mb-3 pb-3 border-bottom border-gray-200 border-bottom-dashed last:!border-0 last:!pb-0 last:!mb-0">
                              <div>
                                <div className="flex mb-1 fw-600">
                                  <div>#{major.Returns?.ID}</div>
                                  <div className="pl-2 text-danger">
                                    [ Trả hàng ]
                                  </div>
                                </div>
                                <div>
                                  {major.Returns?.Prods?.map((x, k) => (
                                    <div key={k}>
                                      {x.Title} (x{x.Qty})
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-baseline fw-600">
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
                                        Chi tiết hoàn tiền
                                      </Popover.Header>
                                      <Popover.Body className="p-0">
                                        <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                          <span>Hoàn tiền mặt</span>
                                          <span>
                                            {PriceHelper.formatVNDPositive(
                                              major.Returns.HoanTienMat
                                            )}
                                          </span>
                                        </div>
                                        <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                          <span>Hoàn ví</span>
                                          <span>
                                            {PriceHelper.formatVNDPositive(
                                              major.Returns.HoanVi
                                            )}
                                          </span>
                                        </div>
                                        <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                                          <span>Hoàn thẻ tiền</span>
                                          <span>
                                            {PriceHelper.formatVNDPositive(
                                              major.Returns.HoanTheTien
                                            )}
                                          </span>
                                        </div>
                                      </Popover.Body>
                                    </Popover>
                                  }
                                >
                                  <div className="d-flex justify-content-between align-items-center">
                                    <i className="cursor-pointer fa-solid fa-circle-exclamation text-success mr-5px"></i>
                                  </div>
                                </OverlayTrigger>
                                <span className="text-success fw-600">
                                  Hoàn:
                                  <span className="pl-1">
                                    {PriceHelper.formatVNDPositive(
                                      major.Returns.HoanTienMat +
                                        major.Returns.HoanVi +
                                        major.Returns.HoanTheTien
                                    )}
                                  </span>
                                </span>
                              </div>
                              {((major?.Returns?.HoaHongGiam &&
                                major?.Returns?.HoaHongGiam.length > 0) ||
                                (major?.Returns?.DoanhSoGiam &&
                                  major?.Returns?.DoanhSoGiam.length > 0)) && (
                                <div>
                                  <div className="mb-1 fw-600">
                                    Khấu trừ HS & DS
                                  </div>
                                  {major?.Returns?.HoaHongGiam &&
                                    major?.Returns?.HoaHongGiam.length > 0 && (
                                      <div>
                                        <div className="underline">
                                          Hoa hồng giảm :
                                        </div>
                                        <div>
                                          {major?.Returns?.HoaHongGiam &&
                                          major?.Returns?.HoaHongGiam.length > 0
                                            ? major?.Returns?.HoaHongGiam.map(
                                                (o, k) => (
                                                  <div key={k}>
                                                    {o.FullName}
                                                    <span className="pl-1">
                                                      [{' '}
                                                      {PriceHelper.formatVND(
                                                        o.Bonus
                                                      )}
                                                      đ ]
                                                    </span>
                                                  </div>
                                                )
                                              )
                                            : 'Không'}
                                        </div>
                                      </div>
                                    )}
                                  {major?.Returns?.DoanhSoGiam &&
                                    major?.Returns?.DoanhSoGiam.length > 0 && (
                                      <div>
                                        <div className="underline">
                                          Tư vấn :
                                        </div>
                                        <div>
                                          {major?.Returns?.DoanhSoGiam &&
                                          major?.Returns?.DoanhSoGiam.length > 0
                                            ? major?.Returns?.DoanhSoGiam.map(
                                                (o, k) => (
                                                  <div key={k}>
                                                    {o.FullName}
                                                    <span className="pl-1">
                                                      [{' '}
                                                      {PriceHelper.formatVND(
                                                        o.Bonus
                                                      )}
                                                      đ ]
                                                    </span>
                                                  </div>
                                                )
                                              )
                                            : 'Không'}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              )}
                            </div>
                          )}
                        </Fragment>
                      ))}
                  </Fragment>
                ))}
              {data?.PayDebtWrap &&
                data?.PayDebtWrap.length > 0 &&
                data?.PayDebtWrap.map((item, index) => (
                  <div
                    className="grid grid-cols-1 gap-1.5 mb-3 pb-3 border-bottom border-gray-200 border-bottom-dashed last:!border-0 last:!pb-0 last:!mb-0"
                    key={index}
                  >
                    <div>
                      <div className="flex mb-1 fw-600">
                        <div>#{item?.ID}</div>
                        <div className="pl-2 text-danger">
                          [ Thanh toán nợ ]
                        </div>
                      </div>
                      <div>
                        {item?.Prods?.map((x, k) => (
                          <div key={k}>
                            {x.Title} (x{x.Qty})
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-baseline fw-600">
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
                              <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                <span>Tiền mặt</span>
                                <span>
                                  {PriceHelper.formatVNDPositive(
                                    item?.ThanhToan_TienMat
                                  )}
                                </span>
                              </div>
                              <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                <span>Chuyển khoản</span>
                                <span>
                                  {PriceHelper.formatVNDPositive(
                                    item?.ThanhToan_CK
                                  )}
                                </span>
                              </div>
                              <div className="border-gray-200 py-10px px-15px fw-500 font-size-md d-flex justify-content-between border-bottom">
                                <span>Quẹt thẻ</span>
                                <span>
                                  {PriceHelper.formatVNDPositive(
                                    item?.ThanhToan_QT
                                  )}
                                </span>
                              </div>
                              <div className="border-gray-200 py-10px px-15px fw-500 font-size-md d-flex justify-content-between border-bottom">
                                <span>Thanh toán ví</span>
                                <span>
                                  {PriceHelper.formatVNDPositive(item?.Vi)}
                                </span>
                              </div>
                              <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                                <span>Quẹt thẻ</span>
                                <span>
                                  {PriceHelper.formatVNDPositive(item?.TheTien)}
                                </span>
                              </div>
                            </Popover.Body>
                          </Popover>
                        }
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <i className="cursor-pointer fa-solid fa-circle-exclamation text-success mr-5px"></i>
                        </div>
                      </OverlayTrigger>
                      <span className="text-success fw-600">
                        TT:
                        <span className="pl-1">
                          {PriceHelper.formatVNDPositive(item?.ThanhToan)}
                        </span>
                      </span>
                    </div>
                    <div>
                      {item?.HoaHong && item?.HoaHong.length > 0 && (
                        <div>
                          <div className="underline">Hoa hồng :</div>
                          <div>
                            {item?.HoaHong && item?.HoaHong.length > 0
                              ? item?.HoaHong.map((o, k) => (
                                  <div key={k}>
                                    {o.FullName}
                                    <span className="pl-1">
                                      [ {PriceHelper.formatVND(o.Bonus)}đ ]
                                    </span>
                                  </div>
                                ))
                              : 'Không'}
                          </div>
                        </div>
                      )}
                      {item?.DoanhSo && item?.DoanhSo.length > 0 && (
                        <div>
                          <div className="underline">Tư vấn :</div>
                          <div>
                            {item?.DoanhSo && item?.DoanhSo.length > 0
                              ? item?.DoanhSo.map((o, k) => (
                                  <div key={k}>
                                    {o.FullName}
                                    <span className="pl-1">
                                      [ {PriceHelper.formatVND(o.Bonus)}đ ]
                                    </span>
                                  </div>
                                ))
                              : 'Không'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
        <div className="border-gray-200 px-15px mt-15px border-bottom p-12px">
          <div className="mb-15px">
            <div className="mb-8px text-uppercase fw-600 font-size-md">
              <span className="text-danger">(*)</span> Dịch vụ thực hiện
            </div>
            <div>
              {data?.children &&
                data?.children.map((item, index) => (
                  <Fragment key={index}>
                    {item.MajorList &&
                      item.MajorList.filter(
                        x => x.Services && x.Services.length > 0
                      ).map((major, i) => (
                        <Fragment key={i}>
                          {major.Services &&
                            major.Services.map((sv, k) => (
                              <div className="mb-3 last:!mb-0" key={k}>
                                <div className="fw-600">{sv.Title}</div>
                                {sv.PhuPhi && sv.PhuPhi.length > 0 && (
                                  <div>
                                    Phụ phí :
                                    <span className="pl-1">
                                      {sv.PhuPhi &&
                                        sv.PhuPhi.map(o => o.Title).join(', ')}
                                      {(!sv.PhuPhi || sv.PhuPhi.length === 0) &&
                                        'Không'}
                                    </span>
                                  </div>
                                )}
                                {sv.HoaHong && sv.HoaHong.length > 0 && (
                                  <div>
                                    <div className="underline">
                                      Nhân viên :{' '}
                                    </div>
                                    <div>
                                      {sv.HoaHong &&
                                        sv.HoaHong.length > 0 &&
                                        sv.HoaHong.map((o, io) => (
                                          <div key={io}>
                                            <span>{o.FullName}</span>
                                            <span className="pl-1">
                                              [ {PriceHelper.formatVND(o.Bonus)}
                                              đ ]
                                            </span>
                                          </div>
                                        ))}
                                      {(!sv.HoaHong ||
                                        sv.HoaHong.length === 0) &&
                                        'Không có nhân viên.'}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                        </Fragment>
                      ))}
                  </Fragment>
                ))}
            </div>
          </div>
        </div>
        <div className="px-15px mt-15px p-12px">
          <div className="mb-15px">
            <div className="mb-8px text-uppercase fw-600 font-size-md">
              <span className="text-danger">(*)</span> Nghiệp vụ khác
            </div>
            <div>
              {data?.children &&
                data?.children
                  .filter(x => x.More && x.More.length > 0)
                  .map((item, index) => (
                    <Fragment key={index}>
                      {item.More &&
                        item.More.map((more, i) => (
                          <div className="mb-3 last:!mb-0" key={i}>
                            <div className="fw-600">{more.Title}</div>
                            <div>{more.Desc}</div>
                            <div>
                              Giá trị :
                              <span className="pl-5px text-danger fw-500">
                                {PriceHelper.formatVND(more.Value)}
                              </span>
                            </div>
                          </div>
                        ))}
                    </Fragment>
                  ))}
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
