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
              Tổng lương
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
              {data?.Staff?.FullName || 'Chưa có tên'}
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
                  #{data?.Staff?.ID}
                </div>
              </div>
              <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
                <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                  Cơ sở
                </div>
                <div className="fw-600 font-size-mdd w-60 text-end">
                  {data?.DiemQL && data?.DiemQL.length > 0
                    ? data?.DiemQL.map(stock => stock.StockTitle).join(', ')
                    : 'Chưa xác định'}
                </div>
              </div>
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
    </Modal>
  )
}

ModalViewMobile.propTypes = {
  show: PropTypes.bool
}

export default ModalViewMobile
