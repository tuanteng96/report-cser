import React, { Fragment } from 'react'
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

function ModalViewMobile({ show, onHide, data, filters }) {
  return (
    <Modal
      className="modal-view-mobile"
      show={show}
      onHide={onHide}
      scrollable={true}
    >
      {data?.TypeOf && (
        <Fragment>
          <div className="modal-view-head align-items-baseline px-15px py-8px">
            <div className="flex-1 modal-view-title text-uppercase font-size-lg fw-500 pr-15px">
              {data?.Staff?.FullName || 'Chưa có tên'}
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
                  ID
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  #{data?.Staff?.ID}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Cơ sở
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {data?.DiemQL && data?.DiemQL.length > 0
                    ? data?.DiemQL.map(stock => stock.StockTitle).join(', ')
                    : 'Chưa xác định'}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Lương chính sách
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.LUONG_CHAM_CONG)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Phụ cấp
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.PHU_CAP)}
                </div>
              </div>
              {/* <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Ngày nghỉ
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.TRU_NGAY_NGHI)}
                </div>
              </div> */}
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Thưởng
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.THUONG)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Phạt
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.TRU_PHAT)}
                </div>
              </div>

              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Lương ca
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.LUONG_CA)}
                  {/* <OverlayTrigger
                    rootClose
                    trigger="click"
                    key="bottom"
                    placement="top"
                    overlay={
                      <Popover id={`popover-positioned-top`}>
                        <Popover.Body className="p-0">
                          <div className="py-10px px-15px fw-600 font-size-md d-flex justify-content-between">
                            <span>Lương ca cài đặt</span>
                            <span>
                              {PriceHelper.formatVND(data?.LUONG_CA_CAI_DAT)}
                            </span>
                          </div>
                          <div className="py-10px px-15px fw-600 font-size-md d-flex justify-content-between">
                            <span>Thưởng khách hàng chọn</span>
                            <span>
                              {PriceHelper.formatVND(data?.LUONG_CA_EXTRA)}
                            </span>
                          </div>
                        </Popover.Body>
                      </Popover>
                    }
                  >
                    <div>
                      <i className="cursor-pointer fa-solid fa-circle-exclamation text-warning ml-5px"></i>
                    </div>
                  </OverlayTrigger> */}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Hoa hồng
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.HOA_HONG)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  KPI
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.KPI_Hoa_hong)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Thu nhập dự kiến
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.LUONG_DU_KIEN)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Giữ lương
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.GIU_LUONG)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Thực trả dự kiến
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.THUC_TRA_DU_KIEN)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Tạm ứng
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.TAM_UNG - data?.HOAN_UNG)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Phải trả nhân viên
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(
                    data?.THUC_TRA_DU_KIEN - (data?.TAM_UNG - data?.HOAN_UNG)
                  )}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Đã trả
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.DA_TRA)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Tồn giữ lương
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.TON_GIU_LUONG)}
                </div>
              </div>
            </div>
          </PerfectScrollbar>
        </Fragment>
      )}
      {!data?.TypeOf && (
        <Fragment>
          <div className="modal-view-head align-items-baseline px-15px py-8px">
            <div className="flex-1 modal-view-title text-uppercase font-size-lg fw-500 pr-15px">
              {data?.Staff?.FullName || 'Chưa có tên'}
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
                  ID
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  #{data?.Staff?.ID}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Cơ sở
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {data?.DiemQL && data?.DiemQL.length > 0
                    ? data?.DiemQL.map(stock => stock.StockTitle).join(', ')
                    : 'Chưa xác định'}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Lương chính sách
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.LUONG_CAU_HINH)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Phụ cấp
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.PHU_CAP)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Ngày nghỉ
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.TRU_NGAY_NGHI)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Thưởng
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.THUONG)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Phạt
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.TRU_PHAT)}
                </div>
              </div>
              {Number(filters.Shows) !== 0 && (
                <>
                  <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                    <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                      Lương cài đặt
                    </div>
                    <div className="fw-600 font-size-mdd w-60 text-end">
                      {PriceHelper.formatVND(data?.LUONG_CA_CAI_DAT)}
                    </div>
                  </div>
                  <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                    <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                      Thưởng KH chọn
                    </div>
                    <div className="fw-600 font-size-mdd w-60 text-end">
                      {PriceHelper.formatVND(data?.LUONG_CA_EXTRA)}
                    </div>
                  </div>
                </>
              )}
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Lương ca
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.LUONG_CA)}
                </div>
              </div>
              {Number(filters.Shows) !== 0 && (
                <>
                  <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                    <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                      HH sản phẩm
                    </div>
                    <div className="fw-600 font-size-mdd w-60 text-end">
                      {PriceHelper.formatVND(data?.HOA_HONG_Sanpham)}
                    </div>
                  </div>
                  <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                    <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                      HH dịch vụ
                    </div>
                    <div className="fw-600 font-size-mdd w-60 text-end">
                      {PriceHelper.formatVND(data?.HOA_HONG_Dichvu)}
                    </div>
                  </div>
                  <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                    <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                      HH thẻ tiền
                    </div>
                    <div className="fw-600 font-size-mdd w-60 text-end">
                      {PriceHelper.formatVND(data?.HOA_HONG_Thetien)}
                    </div>
                  </div>
                  <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                    <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                      HH NVL
                    </div>
                    <div className="fw-600 font-size-mdd w-60 text-end">
                      {PriceHelper.formatVND(data?.HOA_HONG_NVL)}
                    </div>
                  </div>
                  <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                    <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                      HH phụ phí
                    </div>
                    <div className="fw-600 font-size-mdd w-60 text-end">
                      {PriceHelper.formatVND(data?.HOA_HONG_Phuphi)}
                    </div>
                  </div>
                </>
              )}
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Hoa hồng
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.HOA_HONG)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  KPI Doanh số
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.KPI_Hoa_hong)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Thu nhập dự kiến
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.LUONG_DU_KIEN)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Giữ lương
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.GIU_LUONG)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Thực trả dự kiến
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.THUC_TRA_DU_KIEN)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Tạm ứng
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.TAM_UNG - data?.HOAN_UNG)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Phải trả nhân viên
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(
                    data?.THUC_TRA_DU_KIEN - (data?.TAM_UNG - data?.HOAN_UNG)
                  )}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Đã trả
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.DA_TRA)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Tồn giữ lương
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.TON_GIU_LUONG)}
                </div>
              </div>
            </div>
          </PerfectScrollbar>
        </Fragment>
      )}
    </Modal>
  )
}

ModalViewMobile.propTypes = {
  show: PropTypes.bool
}

export default ModalViewMobile
