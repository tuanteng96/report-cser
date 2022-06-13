import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'react-bootstrap'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { PriceHelper } from 'src/helpers/PriceHelper'
import { OverlayTrigger, Popover } from 'react-bootstrap'

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
          {(data?.Staffs &&
            data?.Staffs.map(item => item.FullName).join(', ')) ||
            'Chưa có tên'}
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
              Lương ca và phụ phí
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              <OverlayTrigger
                rootClose
                trigger="click"
                key="bottom"
                placement="bottom"
                overlay={
                  <Popover id={`popover-positioned-top`}>
                    <Popover.Header
                      className="py-10px text-uppercase fw-600"
                      as="h3"
                    >
                      Chi tiết lương ca & phụ phí
                    </Popover.Header>
                    <Popover.Body className="p-0">
                      {(data?.LuongCa_PPhi?.DS_DV &&
                        data?.LuongCa_PPhi?.DS_DV.length > 0) ||
                      (data?.LuongCa_PPhi?.DS_PP &&
                        data?.LuongCa_PPhi?.DS_PP.length > 0) ? (
                        <Fragment>
                          {data?.LuongCa_PPhi?.DS_DV.map((item, index) => (
                            <div
                              className="py-10px px-15px fw-600 font-size-md border-top border-gray-200 d-flex justify-content-between"
                              key={index}
                            >
                              <span>{item.Title}</span>
                              <span>{PriceHelper.formatVND(item.ToPay)}</span>
                            </div>
                          ))}
                          {data?.LuongCa_PPhi?.DS_PP.map((item, index) => (
                            <div
                              className="py-10px px-15px fw-600 font-size-md border-top border-gray-200 d-flex justify-content-between"
                              key={index}
                            >
                              <span>{item.Title}</span>
                              <span>{PriceHelper.formatVND(item.ToPay)}</span>
                            </div>
                          ))}
                        </Fragment>
                      ) : (
                        <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                          <span>Không có dữ liệu</span>
                        </div>
                      )}
                    </Popover.Body>
                  </Popover>
                }
              >
                <div>
                  {PriceHelper.formatVND(data?.LuongCa_PPhi.Tong_Luong)}
                  <i className="fa-solid fa-circle-exclamation cursor-pointer text-warning pl-5px"></i>
                </div>
              </OverlayTrigger>
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
              Ngày làm
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.Ngay_Lam
                ? moment(data.Ngay_Lam).format('HH:mm DD-MM-YYYY')
                : 'Không có'}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
              Cơ sở
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.StockName || 'Không có'}
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
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
              Số điện thoại
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.Member?.Phone || 'Chưa có'}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
              Dịch vụ gốc
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.DV_Goc?.ProdTitle || 'Không có dịch vụ gốc'}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
              Thẻ dịch vụ
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.The_DV?.CardTitle || 'Không có thẻ'}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
              ID Buổi Dịch vụ
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.ID_Buoi_Dv}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
            <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
              Phụ phí
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.LuongCa_PPhi?.DS_PP && data?.LuongCa_PPhi?.DS_PP.length > 0
                ? data?.LuongCa_PPhi?.DS_PP.map(item => item.Title).join(', ')
                : 'Không có'}
            </div>
          </div>
          <div className="px-15px d-flex justify-content-between py-10px line-height-sm">
            <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
              Cơ sở
            </div>
            <div className="fw-600 font-size-mdd w-60 text-end">
              {data?.StockName || 'Chưa có'}
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
