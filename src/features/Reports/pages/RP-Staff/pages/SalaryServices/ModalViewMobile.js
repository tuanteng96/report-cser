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
  const salaryGroups = Object.values(
    (data?.Salary?.salaryList || []).reduce((groups, item) => {
      if (!groups[item.StaffID]) {
        groups[item.StaffID] = { StaffName: item.StaffName, Value: 0 }
      }
      groups[item.StaffID].Value += Number(item.Value || 0)
      return groups
    }, {})
  )
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
            ? data?.UserFullName || 'Chưa có tên'
            : ShowsX === '1'
            ? data?.Staffs?.map(item => item.FullName).join(', ') ||
              'Chưa có tên'
            : data?.ReceiverName || 'Chưa có tên'}
        </div>
        <button
          type="button"
          aria-label="Đóng"
          className="text-center modal-view-close font-size-h3 w-20px p-0 border-0 bg-transparent"
          onClick={onHide}
        >
          <i className="fa-light fa-xmark"></i>
        </button>
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
                ID Dịch vụ / Lớp
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.OrderServiceID || `Lớp (${data?.ClassID})`}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Thời gian
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.CreateDate
                  ? moment(data.CreateDate).format('HH:mm DD-MM-YYYY')
                  : 'Không xác định'}
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
                {data?.OrderServiceID
                  ? PriceHelper.formatVND(data?.ValueSetup)
                  : ''}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Extra
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.OrderServiceID
                  ? PriceHelper.formatVND(data?.ValueExtra)
                  : ''}
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
                {data?.OrderServiceID
                  ? data?.Prod?.Title || ''
                  : data?.MethodTitle || ''}
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
        ) : ShowsX === '1' ? (
          <div className="py-5px">
            <div className="px-15px d-flex justify-content-between py-12px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Lương ca và phụ phí
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.ID ? (
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
                            data?.LuongCa_PPhi?.DS_PP.length > 0) ||
                          salaryGroups.length > 0 ? (
                            <Fragment>
                              {data?.LuongCa_PPhi?.DS_DV?.map((item, index) => (
                                <div
                                  className="border-gray-200 py-10px px-15px fw-600 font-size-md border-top d-flex justify-content-between"
                                  key={index}
                                >
                                  <span>{item.Title}</span>
                                  <span>
                                    {PriceHelper.formatVND(
                                      data?.LuongCa_PPhi?.Tong_DV ||
                                        data?.LuongCa_PPhi?.Tong_DV_Extra
                                    )}
                                  </span>
                                </div>
                              ))}
                              {data?.LuongCa_PPhi?.DS_PP?.map((item, index) => (
                                <div
                                  className="border-gray-200 py-10px px-15px fw-600 font-size-md border-top d-flex justify-content-between"
                                  key={index}
                                >
                                  <span>{item.Title}</span>
                                  <span>
                                    {PriceHelper.formatVND(item.ToPay)}
                                  </span>
                                </div>
                              ))}
                              {salaryGroups.length > 1 &&
                                salaryGroups.map((item, index) => (
                                  <div
                                    className="border-gray-200 py-10px px-15px fw-600 font-size-md border-top d-flex justify-content-between"
                                    key={`staff-${index}`}
                                  >
                                    <span>{item.StaffName}</span>
                                    <span>
                                      {PriceHelper.formatVND(item.Value)}
                                    </span>
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
                ) : (
                  PriceHelper.formatVND(data?.LuongCa_PPhi?.Tong_Luong)
                )}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Ngày làm
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.Ngay_Lam
                  ? moment(data.Ngay_Lam).format('HH:mm DD-MM-YYYY')
                  : 'Không xác định'}
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
                {data?.ID ? data?.The_DV?.CardTitle : data?.MethodTitle}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                ID Đơn hàng
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.Salary?.salaryList?.[0]?.OrderID ?? ''}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                ID Buổi dịch vụ / Lớp
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.ID ? data?.ID_Buoi_Dv : `Lớp (${data?.ClassID})`}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Giá buổi
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.ID ? PriceHelper.formatVND(data?.giabuoi) : ''}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Phụ phí
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.LuongCa_PPhi?.DS_PP &&
                data?.LuongCa_PPhi?.DS_PP.length > 0
                  ? data?.LuongCa_PPhi?.DS_PP?.map(item => item.Title).join(
                      ', '
                    )
                  : ''}
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
        ) : (
          <div className="py-5px">
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Tên nhân viên
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.ReceiverName || 'Chưa có tên'}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Thời gian
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.CreateDate
                  ? moment(data.CreateDate).format('HH:mm DD-MM-YYYY')
                  : 'Không xác định'}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Cơ sở
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.StockTitle || 'Không có'}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px border-bottom-dashed line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Tiền TIP
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {PriceHelper.formatVND(data?.Value)}
              </div>
            </div>
            <div className="px-15px d-flex justify-content-between py-10px line-height-sm">
              <div className="flex-1 fw-600 text-uppercase text-muted font-size-smm pr-10px text-truncate">
                Nội dung
              </div>
              <div className="fw-600 font-size-mdd w-60 text-end">
                {data?.Desc}
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
