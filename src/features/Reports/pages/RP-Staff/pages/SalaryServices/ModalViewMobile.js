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

function ModalViewMobile({ show, onHide, data, ShowsX }) {
  return (
    <Modal
      className="modal-view-mobile"
      show={show}
      onHide={onHide}
      scrollable={true}
    >
      <div className="modal-view-head align-items-baseline px-15px py-8px">
        <div className="flex-1 modal-view-title text-uppercase font-size-lg fw-500 pr-15px">
          {ShowsX === '3'
            ? data?.UserFullName
            : (data?.Staffs &&
                data?.Staffs.map(item => item.FullName).join(', ')) ||
              'Chưa có tên'}
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
        {ShowsX === '3' ? (
          <div className="py-5px">
            <div className="px-15px d-flex justify-content-between py-12px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                ID Dịch vụ
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                <div>
                  {data?.OrderServiceID}
                  <i className="cursor-pointer fa-solid fa-circle-exclamation text-warning pl-5px"></i>
                </div>
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Thời gian
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.CreateDate
                  ? moment(data.CreateDate).format('HH:mm DD-MM-YYYY')
                  : 'Không có'}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Cơ sở
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.Stock?.Title || 'Không có'}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Tên nhân viên
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.UserFullName || 'Chưa có'}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Tổng lương
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {PriceHelper.formatVND(data?.Value)}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Theo Setup
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {PriceHelper.formatVND(data?.ValueSetup)}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Extra
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {PriceHelper.formatVND(data?.ValueExtra)}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Dịch vụ gốc
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.Root?.Title || 'Không có dịch vụ gốc'}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Thẻ dịch vụ
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.Prod?.Title || 'Không có thẻ'}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Mô tả
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.Desc}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Hệ số dịch vụ
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.TourSalaryRatio}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Khách hàng
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.Member?.FullName}
              </div>
            </div>

            <div className="px-15px d-flex justify-content-between py-10px line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Số điện thoại
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.Member?.MobilePhone || 'Chưa có'}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-5px">
            <div className="px-15px d-flex justify-content-between py-12px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
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
                                className="border-gray-200 py-10px px-15px fw-600 font-size-md border-top d-flex justify-content-between"
                                key={index}
                              >
                                <span>{item.Title}</span>
                                <span>
                                  {PriceHelper.formatVND(
                                    data?.LuongCa_PPhi?.Tong_DV_CAI_DAT
                                  )}
                                  {data?.LuongCa_PPhi?.Tong_DV_Extra > 0 && (
                                    <>
                                      ,{' '}
                                      {PriceHelper.formatVND(
                                        data?.LuongCa_PPhi?.Tong_DV_Extra
                                      )}
                                    </>
                                  )}
                                </span>
                              </div>
                            ))}
                            {data?.LuongCa_PPhi?.DS_PP.map((item, index) => (
                              <div
                                className="border-gray-200 py-10px px-15px fw-600 font-size-md border-top d-flex justify-content-between"
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
                    {PriceHelper.formatVND(data?.LuongCa_PPhi?.Tong_Luong)}
                    <i className="cursor-pointer fa-solid fa-circle-exclamation text-warning pl-5px"></i>
                  </div>
                </OverlayTrigger>
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Ngày làm
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.Ngay_Lam
                  ? moment(data.Ngay_Lam).format('HH:mm DD-MM-YYYY')
                  : 'Không có'}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Cơ sở
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.StockName || 'Không có'}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Khách hàng
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.Member?.FullName || 'Chưa có'}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Số điện thoại
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.Member?.Phone || 'Chưa có'}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Dịch vụ gốc
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.DV_Goc?.ProdTitle || 'Không có dịch vụ gốc'}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Thẻ dịch vụ
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.The_DV?.CardTitle || 'Không có thẻ'}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                ID Buổi Dịch vụ
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.ID_Buoi_Dv}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Giá buổi
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {PriceHelper.formatVND(data?.giabuoi)}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Phụ phí
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.LuongCa_PPhi?.DS_PP &&
                data?.LuongCa_PPhi?.DS_PP.length > 0
                  ? data?.LuongCa_PPhi?.DS_PP.map(item => item.Title).join(', ')
                  : 'Không có'}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Cơ sở
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.StockName || 'Chưa có'}
              </div>
            </div>
          </div>
        )}
      </PerfectScrollbar>
    </Modal>
  )
}

ModalViewMobile.propTypes = {
  show: PropTypes.bool
}

export default ModalViewMobile
