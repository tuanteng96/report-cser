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

function ModalViewMobile({ show, onHide, data }) {
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
            <div className="modal-view-title text-uppercase font-size-lg fw-500 flex-1 pr-15px">
              Tổng
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
                  Lương chính sách
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.LUONG_CAU_HINH)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  Phụ cấp
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.PHU_CAP)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  Ngày nghỉ
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.TRU_NGAY_NGHI)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  Thưởng
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.THUONG)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  Phạt
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.TRU_PHAT)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  Lương ca
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.LUONG_CA)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  Hoa hồng
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.HOA_HONG)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  KPI Doanh số
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.KPI_Hoa_hong)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  Thu nhập dự kiến
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.LUONG_DU_KIEN)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  Giữ lương
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.GIU_LUONG)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  Thực trả dự kiến
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.THUC_TRA_DU_KIEN)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  Tạm ứng
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.TAM_UNG - data?.HOAN_UNG)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  Phải trả nhân viên
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(
                    data?.THUC_TRA_DU_KIEN - (data?.TAM_UNG - data?.HOAN_UNG)
                  )}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  Đã trả
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVND(data?.DA_TRA)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
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
            <div className="modal-view-title text-uppercase font-size-lg fw-500 flex-1 pr-15px">
              {data?.FullName || 'Chưa có tên'}
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
              <div className="px-15px d-flex justify-content-between py-12px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  ID
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  #{data?.Id}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  Tên khách hàng
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {data?.FullName || 'Chưa có'}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  Số điện thoại
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {data?.Phone || 'Chưa có'}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  Tồn trước
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVNDPositive(data?.TonTruoc)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  Nạp ví
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVNDPositive(data?.NapVi)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  Trả tiền mặt từ ví
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVNDPositive(data?.TraTMTuVi)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  Kết thúc lẻ buổi hoàn ví
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVNDPositive(data?.KetThucLe)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  Hoàn tiền tích lũy (Mua hàng)
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVNDPositive(data?.HoanTienMuaHang)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  Khấu trừ tích lũy (Trả hàng)
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVNDPositive(data?.KhauTruTichLuy)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  Trả hàng hoàn ví
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVNDPositive(data?.TraHangHoanVi)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  Hoa hồng giới thiệu
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVNDPositive(data?.HoaHongGT)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  Khấu trừ hoa hồng giới thiệu
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVNDPositive(data?.KhauTruHoaHongGT)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  Hoa hồng chia sẻ mã giảm giá
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVNDPositive(data?.HoaHongChiaSeMaGiamGia)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  Kết thúc thẻ hoàn ví
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVNDPositive(data?.KetThucTheHoanVi)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  Tặng đăng ký đăng nhập
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVNDPositive(data?.TangDKDN)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  Tặng sinh nhật
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVNDPositive(data?.TangSN)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  Thanh toán đơn hàng
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVNDPositive(data?.ThanhToanDH)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  Phí dịch vụ
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVNDPositive(data?.PhiDV)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  Tồn tới thời gian lọc
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVNDPositive(0)}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  Hiện tại
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {PriceHelper.formatVNDPositive(data?.TonHienTai)}
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
