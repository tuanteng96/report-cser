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
      {/* <Modal.Header>
                <Modal.Title>Modal title</Modal.Title>
            </Modal.Header>

            <Modal.Body>One fine body...
                <div style={{ height: `${1000}px` }}>
                    a
                </div>
            </Modal.Body> */}
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
        <div className="px-15px d-flex justify-content-between py-12px border-bottom-dashed line-height-sm">
          <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
            ID
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">#{data?.Id}</div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
            Ngày tạo
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.CreateDate
              ? moment(data.CreateDate).format('DD/MM/YYYY')
              : 'Không có'}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
            Số điện thoại
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.MobilePhone || 'Không có'}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
            Email
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.Email || 'Không có'}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
            Ngày sinh
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.BirthDate
              ? moment(data.BirthDate).format('HH:mm DD/MM/YYYY')
              : 'Không có'}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
            Giới tính
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.Gender === 0 ? (
              'Nam'
            ) : (
              <>{data?.Gender === 1 ? 'Nữ' : 'Chưa xác định'}</>
            )}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
            Địa chỉ
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.HomeAddress || 'Không có'}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
            Quận Huyện
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.DistrictsName || 'Không có'}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
            Tỉnh / Thành phố
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.ProvincesName || 'Không có'}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
            Cơ sở
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.ByStockName || 'Chưa có'}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
            Nhóm khách hàng
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.GroupCustomerName || 'Chưa có'}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
            Nguồn
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.Source || 'Chưa có'}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
            Mã thẻ
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.HandCardID || 'Chưa có'}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
            Nhân viên chăm sóc
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.ByUserName || 'Chưa có'}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
            Ví
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {PriceHelper.formatVND(data?.vi_dien_tu)}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
            Công nợ
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {PriceHelper.formatVND(data?.cong_no)}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px line-height-sm">
          <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
            Thẻ tiền
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {PriceHelper.formatVND(data?.the_tien)}
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
