import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'react-bootstrap'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { PriceHelper } from 'src/helpers/PriceHelper'

import moment from 'moment'
import 'moment/locale/vi'
import { useSelector } from 'react-redux'
moment.locale('vi')

const perfectScrollbarOptions = {
  wheelSpeed: 2,
  wheelPropagation: false
}

function ModalViewMobile({
  show,
  onHide,
  data,
  filters,
  OverlayLCS,
  OverlayLT,
  OverlayDS,
  OverlayHH,
  OverlayKPI
}) {
  const { GlobalConfig } = useSelector(({ auth }) => ({
    GlobalConfig: auth?.GlobalConfig
  }))

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
              {GlobalConfig?.Admin?.bang_luong_nang_cao && (
                <>
                  <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                    <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                      Loại hợp đồng
                    </div>
                    <div className="fw-600 font-size-mdd w-60 text-end">
                      {data?.Staff?.Address}
                    </div>
                  </div>
                  <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                    <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                      Tình trạng
                    </div>
                    <div className="fw-600 font-size-mdd w-60 text-end">
                      {data?.TrackValue?.Config?.Values?.WORKING_STATUS === 0
                        ? 'Đã nghỉ'
                        : 'Hoạt động'}
                    </div>
                  </div>
                </>
              )}
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Lương chấm công
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(
                    data?.TrackValue?.WorkQty ===
                      data?.TrackValue?.Config?.Values?.NGAY_CONG
                      ? data?.TrackValue?.Config?.Values?.LUONG
                      : data?.TrackValue?.WorkQty * data?.NGAY_LUONG_CO_BAN
                  )}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Đi sớm, Về muộn
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(
                    data?.TrackValue?.DI_SOM + data?.TrackValue?.VE_MUON
                  )}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Đi muộn, Về sớm
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {data?.TrackValue?.DI_MUON + data?.TrackValue?.VE_SOM > 0
                    ? PriceHelper.formatVND(
                        (data?.TrackValue?.DI_MUON + data?.TrackValue?.VE_SOM) *
                          -1
                      )
                    : PriceHelper.formatVND(
                        data?.TrackValue?.DI_MUON + data?.TrackValue?.VE_SOM
                      )}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Phụ cấp ngày
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {GlobalConfig?.Admin?.phu_cap_ngay_cong2 ? (
                    <>
                      {PriceHelper.formatVND(
                        (data?.TrackValue?.WorkQtyAllowance || 0) *
                          (data?.TRO_CAP_NGAY || 0) +
                          (data?.TrackValue?.WorkQtyAllowance2 || 0) *
                            ((data?.TRO_CAP_NGAY || 0) / 2)
                      )}
                    </>
                  ) : (
                    <>
                      {PriceHelper.formatVND(
                        (data?.TrackValue?.WorkQtyAllowance || 0) *
                          data?.TRO_CAP_NGAY
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Lương chính sách
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  <OverlayLCS
                    wrapClass="cursor-pointer d-flex justify-content-end w-100 align-items-center gap-2"
                    rowData={data}
                    filters={filters}
                  />
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
                  <OverlayLT
                    wrapClass="cursor-pointer d-flex justify-content-end w-100 align-items-center gap-2"
                    rowData={data}
                    filters={filters}
                  />
                </div>
              </div>
              {Number(filters.Shows) !== 0 && (
                <>
                  <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                    <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                      Hoa hồng sản phẩm
                    </div>
                    <div className="fw-600 font-size-mdd w-60 text-end">
                      {PriceHelper.formatVND(data?.HOA_HONG_Sanpham)}
                    </div>
                  </div>
                  <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                    <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                      Hoa hồng dịch vụ
                    </div>
                    <div className="fw-600 font-size-mdd w-60 text-end">
                      {PriceHelper.formatVND(data?.HOA_HONG_Dichvu)}
                    </div>
                  </div>
                  <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                    <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                      Hoa hồng thẻ tiền
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
                      HH Phụ phí
                    </div>
                    <div className="fw-600 font-size-mdd w-60 text-end">
                      {PriceHelper.formatVND(data?.HOA_HONG_Phuphi)}
                    </div>
                  </div>
                </>
              )}

              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Hoa Hồng
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  <OverlayHH
                    wrapClass="cursor-pointer d-flex justify-content-end w-100 align-items-center gap-2"
                    rowData={data}
                    filters={filters}
                  />
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  Doanh số
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  <OverlayDS
                    wrapClass="cursor-pointer d-flex justify-content-end w-100 align-items-center gap-2"
                    rowData={data}
                    filters={filters}
                  />
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                  KPI
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {GlobalConfig?.Admin?.chi_tiet_cong ? (
                    <OverlayKPI
                      wrapClass="cursor-pointer d-flex justify-content-end w-100 align-items-center gap-2"
                      rowData={data}
                      filters={filters}
                    />
                  ) : (
                    PriceHelper.formatVND(data?.KPI_Hoa_hong)
                  )}
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
              {GlobalConfig?.Admin?.bang_luong_nang_cao && (
                <>
                  <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                    <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                      BHXH (10.5%)
                    </div>
                    <div className="fw-600 font-size-mdd w-60 text-end">
                      {PriceHelper.formatVND(data?.DONG_BHXH)}
                    </div>
                  </div>
                  <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                    <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                      Giảm trừ gia cảnh
                    </div>
                    <div className="fw-600 font-size-mdd w-60 text-end">
                      {PriceHelper.formatVND(data?.GIAM_TRU_GIA_CANH)}
                    </div>
                  </div>
                  <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                    <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                      Thu nhập chịu thuế
                    </div>
                    <div className="fw-600 font-size-mdd w-60 text-end">
                      {PriceHelper.formatVND(data?.THU_NHAP_CHIU_THUE)}
                    </div>
                  </div>
                  <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                    <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                      Thuế thu nhập cá nhân
                    </div>
                    <div className="fw-600 font-size-mdd w-60 text-end">
                      {PriceHelper.formatVND(data?.THUE_THU_NHAP_CA_NHAN)}
                    </div>
                  </div>
                </>
              )}
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
              {GlobalConfig?.Admin?.bang_luong_nang_cao && (
                <>
                  <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                    <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                      Loại hợp đồng
                    </div>
                    <div className="fw-600 font-size-mdd w-60 text-end">
                      {data?.Staff?.Address}
                    </div>
                  </div>
                  <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                    <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                      Tình trạng
                    </div>
                    <div className="fw-600 font-size-mdd w-60 text-end">
                      {data?.TrackValue?.Config?.Values?.WORKING_STATUS === 0
                        ? 'Đã nghỉ'
                        : 'Hoạt động'}
                    </div>
                  </div>
                </>
              )}
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
              {GlobalConfig?.Admin?.bang_luong_nang_cao && (
                <>
                  <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                    <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                      BHXH (10.5%)
                    </div>
                    <div className="fw-600 font-size-mdd w-60 text-end">
                      {PriceHelper.formatVND(data?.DONG_BHXH)}
                    </div>
                  </div>
                  <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                    <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                      Giảm trừ gia cảnh
                    </div>
                    <div className="fw-600 font-size-mdd w-60 text-end">
                      {PriceHelper.formatVND(data?.GIAM_TRU_GIA_CANH)}
                    </div>
                  </div>
                  <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                    <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                      Thu nhập chịu thuế
                    </div>
                    <div className="fw-600 font-size-mdd w-60 text-end">
                      {PriceHelper.formatVND(data?.THU_NHAP_CHIU_THUE)}
                    </div>
                  </div>
                  <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                    <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                      Thuế thu nhập cá nhân
                    </div>
                    <div className="fw-600 font-size-mdd w-60 text-end">
                      {PriceHelper.formatVND(data?.THUE_THU_NHAP_CA_NHAN)}
                    </div>
                  </div>
                </>
              )}
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
