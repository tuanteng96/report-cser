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

function ModalViewMobile({ show, onHide, data, translateType }) {
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
            {moment(data?.CreateDate).format('DD-MM-YYYY HH:mm')}
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
          <div className="p-12px">
            {data?.MemberList &&
              data?.MemberList.map((member, index) => (
                <div className="border px-12px mb-12px" key={index}>
                  <div className="d-flex justify-content-between py-12px border-bottom-dashed line-height-sm">
                    <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                      Khách hàng
                    </div>
                    <div className="fw-600 font-size-mdd w-60 text-end">
                      {member.FullName}
                    </div>
                  </div>
                  <div className="d-flex justify-content-between py-12px border-bottom-dashed line-height-sm">
                    <div className="fw-600 text-uppercase text-muted font-size-smm pr-10px flex-1 text-truncate">
                      Số điện thoại
                    </div>
                    <div className="fw-600 font-size-mdd w-60 text-end">
                      {member.Phone}
                    </div>
                  </div>
                  <div>
                    <div className="text-uppercase fw-600 text-muted font-size-smm pt-12px pb-8px">
                      Lịch sử sử dụng
                    </div>
                    <div>
                      {member.UsageHistory &&
                        member.UsageHistory.map((use, idx) => (
                          <div className="border mb-12px rounded-sm">
                            <div className="d-flex justify-content-between py-5px px-10px border-bottom-dashed line-height-sm">
                              <div className="fw-600 text-muted font-size-sm pr-10px flex-1 text-truncate">
                                Sử dụng / hoàn
                              </div>
                              <div className="fw-600 font-size-md w-60 text-end">
                                {translateType(use.Type)}
                              </div>
                            </div>
                            <div className="d-flex justify-content-between py-5px px-10px border-bottom-dashed line-height-sm">
                              <div className="fw-600 text-muted font-size-sm pr-10px flex-1 text-truncate">
                                Mã thẻ tiền
                              </div>
                              <div className="fw-600 font-size-md w-60 text-end">
                                {use.Code}
                              </div>
                            </div>
                            <div className="d-flex justify-content-between py-5px px-10px border-bottom-dashed line-height-sm">
                              <div className="fw-600 text-muted font-size-sm pr-10px flex-1 text-truncate">
                                Tên thẻ tiền
                              </div>
                              <div className="fw-600 font-size-md w-60 text-end">
                                {use.Title || 'Chưa có'}
                              </div>
                            </div>
                            <div className="d-flex justify-content-between py-5px px-10px border-bottom-dashed line-height-sm">
                              <div className="fw-600 text-muted font-size-sm pr-10px flex-1 text-truncate">
                                Số tiền
                              </div>
                              <div className="fw-600 font-size-md w-60 text-end">
                                {PriceHelper.formatVND(use.Value)}
                              </div>
                            </div>
                            <div className="d-flex justify-content-between py-5px px-10px line-height-sm">
                              <div className="fw-600 text-muted font-size-sm pr-10px flex-1 text-truncate">
                                Sản phẩm, dịch vụ
                              </div>
                              <div className="fw-600 font-size-md w-60 text-end">
                                {use.ProdLists &&
                                  use.ProdLists.map(
                                    item => `${item.Title} (x${item.Qty})`
                                  ).join(', ')}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
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
