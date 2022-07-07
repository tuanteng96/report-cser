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
      <Fragment>
        <div className="modal-view-head align-items-baseline px-15px py-8px">
          <div className="modal-view-title text-uppercase font-size-lg fw-500 flex-1 pr-15px">
            {data?.TenTheTien || 'Chưa có tên'}
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
                Giá bán
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {PriceHelper.formatVND(data?.GiaBan)}
              </div>
            </div>

            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                Tổng giá trị
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {PriceHelper.formatVND(data?.TongGiaTri)}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                Giá trị chi tiêu SP
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {PriceHelper.formatVND(data?.GiaTriChiTieuSP)}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                Giá trị chi tiêu DV
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {PriceHelper.formatVND(data?.GiaTriChiTieuDV)}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                Tổng chi tiêu
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {PriceHelper.formatVND(data?.TongChiTieu)}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                Đã chi tiêu SP
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {PriceHelper.formatVND(data?.DaChiTieuSP)}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                Đã chi tiêu DV
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {PriceHelper.formatVND(data?.DaChiTieuDV)}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                Tổng còn lại
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {PriceHelper.formatVND(data?.TongConLai)}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                Còn lại sản phẩm
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {PriceHelper.formatVND(data?.ConLaiSP)}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                Còn lại dịch vụ
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {PriceHelper.formatVND(data?.ConLaiDV)}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                Khách hàng
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.Member?.FullName || 'Chưa có'}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px line-height-sm">
              <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                Số điện thoại
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.Member?.Phone || 'Chưa có'}
              </div>
            </div>
          </div>
        </PerfectScrollbar>
      </Fragment>
    </Modal>
  )
}

ModalViewMobile.propTypes = {
  show: PropTypes.bool
}

export default ModalViewMobile
