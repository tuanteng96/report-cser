import React, { Fragment, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import FilterList from 'src/components/Filter/FilterList'
import { PriceHelper } from 'src/helpers/PriceHelper'
import ChildrenTables from 'src/components/Tables/ChildrenTables'
import reportsApi from 'src/api/reports.api'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import ModalViewMobile from './ModalViewMobile'

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

function DebtPayment(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    DateStart: new Date(), // Ngày bắt đầu
    DateEnd: new Date(), // Ngày kết thúc
    Pi: 1, // Trang hiện tại
    Ps: 10, // Số lượng item
    MemberID: ''
  })
  const [ListData, setListData] = useState([])
  const [TongTTNo, setTongTTNo] = useState(0)
  const [StockName, setStockName] = useState('')
  const [loading, setLoading] = useState(false)
  const [isFilter, setIsFilter] = useState(false)
  const [PageTotal, setPageTotal] = useState(1)
  const [initialValuesMobile, setInitialValuesMobile] = useState(null)
  const [isModalMobile, setIsModalMobile] = useState(false)

  useEffect(() => {
    const index = Stocks.findIndex(
      item => Number(item.ID) === Number(filters.StockID)
    )
    if (index > -1) {
      setStockName(Stocks[index].Title)
    } else {
      setStockName('Tất cả cơ sở')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  useEffect(() => {
    getListDebtPayment()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListDebtPayment = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    const newFilters = {
      ...filters,
      DateStart: filters.DateStart
        ? moment(filters.DateStart).format('DD/MM/yyyy')
        : null,
      DateEnd: filters.DateEnd
        ? moment(filters.DateEnd).format('DD/MM/yyyy')
        : null,
      MemberID: filters.MemberID ? filters.MemberID.value : ''
    }
    reportsApi
      .getListDebtPayment(newFilters)
      .then(({ data }) => {
        const { Items, Total, TTToanNo } = {
          Items: data.result?.Items || [],
          TTToanNo: data.result?.TTToanNo || 0,
          Total: data.result?.Total || 0
        }
        setListData(Items)
        setTongTTNo(TTToanNo)
        setLoading(false)
        setPageTotal(Total)
        isFilter && setIsFilter(false)
        callback && callback()
      })
      .catch(error => console.log(error))
  }

  const onFilter = values => {
    if (_.isEqual(values, filters)) {
      getListDebtPayment()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    getListDebtPayment()
  }

  const onOpenFilter = () => {
    setIsFilter(true)
  }

  const onHideFilter = () => {
    setIsFilter(false)
  }

  const OpenModalMobile = value => {
    setInitialValuesMobile(value)
    setIsModalMobile(true)
  }

  const HideModalMobile = () => {
    setInitialValuesMobile(null)
    setIsModalMobile(false)
  }

  //
  const AmountMember = item => {
    var totalArray = 0
    if (!item) return totalArray
    for (let keyItem of item) {
      for (let keyOrder of keyItem.ListOrders) {
        totalArray += keyOrder?.OrderItems?.length || 0
      }
    }
    return totalArray
  }
  const AmountOrderItem = member => {
    var totalArray = 0
    if (!member) return totalArray
    for (let keyOrders of member.ListOrders) {
      totalArray += keyOrders?.OrderItems?.length || 0
    }
    return totalArray
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Thanh toán trả nợ
          </span>
          <span className="ps-0 ps-lg-3 text-muted d-block d-lg-inline-block">
            {StockName}
          </span>
        </div>
        <div className="w-85px d-flex justify-content-end">
          <button
            type="button"
            className="btn btn-primary p-0 w-40px h-35px"
            onClick={onOpenFilter}
          >
            <i className="fa-regular fa-filters font-size-lg mt-5px"></i>
          </button>
          <IconMenuMobile />
        </div>
      </div>
      <FilterList
        show={isFilter}
        filters={filters}
        onHide={onHideFilter}
        onSubmit={onFilter}
        onRefresh={onRefresh}
        loading={loading}
      />
      <div className="bg-white rounded">
        <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-md-center justify-content-between flex-column flex-md-row">
          <div className="fw-500 font-size-lg">Danh sách thanh toán nợ</div>
          <div className="fw-500">
            Tổng thanh toán nợ{' '}
            <span className="font-size-xl fw-600 text-success">
              {PriceHelper.formatVND(TongTTNo)}
            </span>
          </div>
        </div>
        <div className="p-20px">
          <ChildrenTables
            data={ListData}
            columns={[
              {
                text: 'Ngày',
                headerStyle: {
                  minWidth: '160px',
                  width: '160px'
                },
                attrs: { 'data-title': 'Ngày' }
              },
              {
                text: 'Khách hàng',
                headerStyle: {
                  minWidth: '200px',
                  width: '200px'
                }
              },
              {
                text: 'Số điện thoại',
                headerStyle: {
                  minWidth: '180px',
                  width: '180px'
                }
              },
              {
                text: 'Tổng thanh toán nợ',
                headerStyle: {
                  minWidth: '180px',
                  width: '180px'
                }
              },
              {
                text: 'Đơn hàng',
                headerStyle: {
                  minWidth: '150px',
                  width: '150px'
                }
              },
              {
                text: 'Thanh toán nợ',
                headerStyle: {
                  minWidth: '180px',
                  width: '180px'
                }
              },
              {
                text: 'Chi tiết',
                headerStyle: {
                  minWidth: '120px',
                  width: '120px'
                }
              },
              {
                text: 'Thanh toán',
                headerStyle: {
                  minWidth: '150px',
                  width: '150px'
                }
              },
              {
                text: 'Ví',
                headerStyle: {
                  minWidth: '120px',
                  width: '120px'
                }
              },
              {
                text: 'Thẻ tiền',
                headerStyle: {
                  minWidth: '120px',
                  width: '120px'
                }
              },
              {
                text: 'Sản phẩm',
                headerStyle: {
                  minWidth: '220px',
                  width: '220px'
                }
              }
            ]}
            options={{
              totalSize: PageTotal,
              page: filters.Pi,
              sizePerPage: filters.Ps,
              sizePerPageList: [10, 25, 30, 50],
              onPageChange: page => {
                setListData([])
                const Pi = page
                setFilters({ ...filters, Pi: Pi })
              },
              onSizePerPageChange: sizePerPage => {
                setListData([])
                const Ps = sizePerPage
                setFilters({ ...filters, Ps: Ps })
              }
            }}
            optionsMoible={{
              itemShow: 0,
              CallModal: row => OpenModalMobile(row),
              columns: [
                {
                  attrs: { 'data-title': 'Ngày' },
                  formatter: row => moment(row.CreateDate).format('DD-MM-YYYY')
                },
                {
                  attrs: { 'data-title': 'Tổng khách hàng' },
                  formatter: row => row.ListCustomer.length
                },
                {
                  attrs: { 'data-title': 'Tổng thanh toán nợ' },
                  formatter: row => PriceHelper.formatVND(row.TTToanNo)
                }
              ]
            }}
            loading={loading}
          >
            {ListData &&
              ListData.map((item, itemIndex) => (
                <Fragment key={itemIndex}>
                  {item.ListCustomer.map((member, memberIndex) => (
                    <Fragment key={memberIndex}>
                      {member.ListOrders.map((orders, ordersIndex) => (
                        <Fragment key={ordersIndex}>
                          {orders.OrderItems.map(
                            (orderItem, orderItemIndex) => (
                              <tr key={orderItemIndex}>
                                {memberIndex === 0 &&
                                  ordersIndex === 0 &&
                                  orderItemIndex === 0 && (
                                    <td
                                      className="vertical-align-middle"
                                      rowSpan={AmountMember(item.ListCustomer)}
                                    >
                                      {moment(item.CreateDate).format(
                                        'DD-MM-YYYY'
                                      )}
                                    </td>
                                  )}
                                {ordersIndex === 0 && orderItemIndex === 0 && (
                                  <Fragment>
                                    <td
                                      className="vertical-align-middle"
                                      rowSpan={AmountOrderItem(member)}
                                    >
                                      {member.MemberName}
                                    </td>
                                    <td
                                      className="vertical-align-middle"
                                      rowSpan={AmountOrderItem(member)}
                                    >
                                      {member.MemberPhone}
                                    </td>
                                    <td
                                      className="vertical-align-middle"
                                      rowSpan={AmountOrderItem(member)}
                                    >
                                      {PriceHelper.formatVND(member.TTToanNo)}
                                    </td>
                                  </Fragment>
                                )}
                                {orders.OrderItems.length > 0 &&
                                  orderItemIndex === 0 && (
                                    <Fragment>
                                      <td
                                        className="vertical-align-middle"
                                        rowSpan={orders.OrderItems.length}
                                      >
                                        #{orders.Id}
                                      </td>
                                      <td
                                        className="vertical-align-middle"
                                        rowSpan={orders.OrderItems.length}
                                      >
                                        {PriceHelper.formatVND(orders.TTToanNo)}
                                      </td>
                                    </Fragment>
                                  )}
                                <td>
                                  {PriceHelper.formatVND(orderItem.ToPay)}
                                </td>
                                <td>
                                  <OverlayTrigger
                                    rootClose
                                    trigger="click"
                                    key="top"
                                    placement="top"
                                    overlay={
                                      <Popover id={`popover-positioned-top`}>
                                        <Popover.Header
                                          className="py-10px text-uppercase fw-600"
                                          as="h3"
                                        >
                                          Chi tiết thanh toán #{orderItem.Id}
                                        </Popover.Header>
                                        <Popover.Body className="p-0">
                                          <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                                            <span>Tiền mặt</span>
                                            <span>
                                              {PriceHelper.formatVND(
                                                orderItem.DaThToan_TM
                                              )}
                                            </span>
                                          </div>
                                          <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                                            <span>Chuyển khoản</span>
                                            <span>
                                              {PriceHelper.formatVND(
                                                orderItem.DaThToan_CK
                                              )}
                                            </span>
                                          </div>
                                          <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                                            <span>Quẹt thẻ</span>
                                            <span>
                                              {PriceHelper.formatVND(
                                                orderItem.DaThToan_QT
                                              )}
                                            </span>
                                          </div>
                                        </Popover.Body>
                                      </Popover>
                                    }
                                  >
                                    <div className="d-flex justify-content-between align-items-center">
                                      {PriceHelper.formatVND(
                                        orderItem.DaThToan
                                      )}
                                      <i className="fa-solid fa-circle-exclamation cursor-pointer text-warning"></i>
                                    </div>
                                  </OverlayTrigger>
                                </td>
                                <td>
                                  {PriceHelper.formatVND(orderItem.DaThToan_Vi)}
                                </td>
                                <td>
                                  {PriceHelper.formatVND(
                                    orderItem.DaThToan_ThTien
                                  )}
                                </td>
                                <td>
                                  {orderItem.lines
                                    .map(line => line.ProdTitle)
                                    .join(', ')}
                                </td>
                              </tr>
                            )
                          )}
                        </Fragment>
                      ))}
                    </Fragment>
                  ))}
                </Fragment>
              ))}
          </ChildrenTables>
        </div>
        <ModalViewMobile
          show={isModalMobile}
          onHide={HideModalMobile}
          data={initialValuesMobile}
        />
      </div>
    </div>
  )
}

export default DebtPayment
