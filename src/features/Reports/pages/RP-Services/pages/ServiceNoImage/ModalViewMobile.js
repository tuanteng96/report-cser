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

function ModalViewMobile({ show, onHide, data, Stocks }) {
  let Member = data?.MemberInfo ? JSON.parse(data?.MemberInfo) : null
  let SalaryJSON = data?.SalaryJSON ? JSON.parse(data?.SalaryJSON) : null
  return (
    <Modal
      className="modal-view-mobile"
      show={show}
      onHide={onHide}
      scrollable={true}
    >
      <div className="modal-view-head align-items-baseline px-15px py-8px">
        <div className="flex-1 modal-view-title text-uppercase font-size-lg fw-500 pr-15px">
          {Member?.FullName || 'Chưa có tên'}
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
        <div className="px-15px d-flex justify-content-between py-12px border-bottom-dashed line-height-sm">
          <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
            Số điện thoại
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {Member?.MobilePhone}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-12px border-bottom-dashed line-height-sm">
          <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
            ID
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">#{data?.ID}</div>
        </div>
        <div className="px-15px d-flex justify-content-between py-12px border-bottom-dashed line-height-sm">
          <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
            ID đơn hàng
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            #{data?.OrderID}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-12px border-bottom-dashed line-height-sm">
          <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
            Ngày bán
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.CreateDate
              ? moment(data.CreateDate).format('HH:mm DD/MM/YYYY')
              : 'Chưa xác định'}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-12px border-bottom-dashed line-height-sm">
          <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
            Ngày đặt lịch
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.BookDate
              ? moment(data.BookDate).format('HH:mm DD/MM/YYYY')
              : 'Chưa xác định'}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
            Cơ sở
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {Stocks?.find(x => x.ID === data?.StockID)?.Title || 'Chưa có'}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
            Khách hàng
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {Member?.FullName}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
            Số điện thoại
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {Member?.MobilePhone}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
            Dịch vụ
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.RootTitle}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
            Dịch vụ thẻ
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {data?.OrderTitle}
          </div>
        </div>
        <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
          <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
            Nhân viên thực hiện
          </div>
          <div className="fw-600 font-size-mdd w-60 text-end">
            {SalaryJSON?.salaryList && SalaryJSON?.salaryList.length > 0
              ? SalaryJSON?.salaryList
                  .map(
                    item =>
                      `${item.StaffName} (${PriceHelper.formatVND(item.Value)})`
                  )
                  .join(', ')
              : 'Chưa xác định'}
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
