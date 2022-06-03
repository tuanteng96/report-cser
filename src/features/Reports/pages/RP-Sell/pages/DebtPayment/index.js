import React, { Fragment, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import FilterList from 'src/components/Filter/FilterList'
import { PriceHelper } from 'src/helpers/PriceHelper'

const JsonData = [
  {
    CreateDate: '2022-06-03T14:11:39',
    TTToanNo: 13000000,
    ListCustomer: [
      {
        MemberName: 'Nguyễn Tài Tuấn',
        MemberPhone: '0971021196',
        TTToanNo: 13000000,
        ListOrders: [
          {
            Id: 25897,
            TTToanNo: 25000000,
            OrderItems: [
              {
                Id: 12579,
                ToPay: 800000,
                TTToanNo: 25000000,
                DaThToan: 0,
                DaThToan_TM: 0,
                DaThToan_CK: 0,
                DaThToan_QT: 0,
                DaThToan_Vi: 0,
                DaThToan_ThTien: 0,
                lines: [
                  {
                    ProdId: 12499,
                    ProdTitle: 'Thẻ 10 buổi trang điểm dạ hội'
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        MemberName: 'Lê Bảo Ngọc',
        MemberPhone: '0981883338',
        TTToanNo: 13000000,
        ListOrders: [
          {
            Id: 25897,
            TTToanNo: 25000000,
            OrderItems: [
              {
                Id: 12579,
                ToPay: 800000,
                TTToanNo: 25000000,
                DaThToan: 0,
                DaThToan_TM: 0,
                DaThToan_CK: 0,
                DaThToan_QT: 0,
                DaThToan_Vi: 0,
                DaThToan_ThTien: 0,
                lines: [
                  {
                    ProdId: 12499,
                    ProdTitle: 'Thẻ 10 buổi trang điểm dạ hội'
                  }
                ]
              },
              {
                Id: 12579,
                ToPay: 800000,
                TTToanNo: 25000000,
                DaThToan: 0,
                DaThToan_TM: 100000,
                DaThToan_CK: 200000,
                DaThToan_QT: 150000,
                DaThToan_Vi: 250000,
                DaThToan_ThTien: 1000000,
                lines: [
                  {
                    ProdId: 12419,
                    ProdTitle: 'Mỹ phẩm trị nám'
                  },
                  {
                    ProdId: 12420,
                    ProdTitle: 'Chăm sóc da'
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    CreateDate: '2022-06-03T14:11:39',
    TTToanNo: 13000000,
    ListCustomer: [
      {
        MemberName: 'Lê Bảo Ngọc',
        MemberPhone: '0981883338',
        TTToanNo: 13000000,
        ListOrders: [
          {
            Id: 25897,
            TTToanNo: 25000000,
            OrderItems: [
              {
                Id: 12579,
                ToPay: 800000,
                TTToanNo: 25000000,
                DaThToan: 0,
                DaThToan_TM: 0,
                DaThToan_CK: 0,
                DaThToan_QT: 0,
                DaThToan_Vi: 0,
                DaThToan_ThTien: 0,
                lines: [
                  {
                    ProdId: 12499,
                    ProdTitle: 'Thẻ 10 buổi trang điểm dạ hội'
                  }
                ]
              },
              {
                Id: 12579,
                ToPay: 800000,
                TTToanNo: 25000000,
                DaThToan: 0,
                DaThToan_TM: 100000,
                DaThToan_CK: 200000,
                DaThToan_QT: 150000,
                DaThToan_Vi: 250000,
                DaThToan_ThTien: 1000000,
                lines: [
                  {
                    ProdId: 12419,
                    ProdTitle: 'Mỹ phẩm trị nám'
                  },
                  {
                    ProdId: 12420,
                    ProdTitle: 'Chăm sóc da'
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        MemberName: 'Nguyễn Tài Tuấn',
        MemberPhone: '0971021196',
        TTToanNo: 13000000,
        ListOrders: [
          {
            Id: 25897,
            TTToanNo: 25000000,
            OrderItems: [
              {
                Id: 12579,
                ToPay: 800000,
                TTToanNo: 25000000,
                DaThToan: 0,
                DaThToan_TM: 0,
                DaThToan_CK: 0,
                DaThToan_QT: 0,
                DaThToan_Vi: 0,
                DaThToan_ThTien: 0,
                lines: [
                  {
                    ProdId: 12499,
                    ProdTitle: 'Thẻ 10 buổi trang điểm dạ hội'
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
]

function DebtPayment(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    Date: new Date() // Ngày,
  })
  const [StockName, setStockName] = useState('')
  const [loading, setLoading] = useState(false)
  const [isFilter, setIsFilter] = useState(false)

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

  const onFilter = values => {
    if (_.isEqual(values, filters)) {
      //getAllDays()
    } else {
      setFilters(values)
    }
  }

  const onRefresh = () => {
    //getAllDays()
  }

  const onOpenFilter = () => {
    setIsFilter(true)
  }

  const onHideFilter = () => {
    setIsFilter(false)
  }
  //
  const AmountTR = item => {
    var totalArray = 0
    if (!item) return totalArray
    for (let keyItem of item) {
      for (let keyOrder of keyItem.ListOrders) {
        totalArray += keyOrder?.OrderItems?.length || 0
      }
    }
    return totalArray
  }

  return (
    <div className="py-main">
      <div className="mb-20px d-flex justify-content-between align-items-end">
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
          <FilterList
            show={isFilter}
            filters={filters}
            onHide={onHideFilter}
            onSubmit={onFilter}
            onRefresh={onRefresh}
            loading={loading}
          />
        </div>
      </div>
      <div className="bg-white rounded mt-25px">
        <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between">
          <div className="fw-500 font-size-lg">Danh sách thanh toán nợ</div>
        </div>
        <div className="p-20px">
          <div className="react-bootstrap-table table-responsive table-responsive-attr">
            <table className="table table-bordered">
              <thead>
                <tr className="fw-500">
                  <th>Ngày</th>
                  <th>Khách hàng</th>
                  <th>Số điện thoại</th>
                  <th>Tổng Thanh toán nợ</th>
                  <th>Đơn hàng</th>
                  <th>Thanh toán nợ</th>
                  <th>Chi tiết</th>
                  <th>Thanh toán</th>
                  <th>Ví</th>
                  <th>Thẻ tiền</th>
                  <th>Sản phẩm</th>
                </tr>
              </thead>
              <tbody>
                {/* <tr>
                  <td className="vertical-align-middle" rowSpan="3">
                    03/04/2022
                  </td>
                  <td className="vertical-align-middle" rowSpan="2">
                    Nguyễn Tài Tuấn
                  </td>
                  <td className="vertical-align-middle" rowSpan="2">
                    0971021196
                  </td>
                  <td className="vertical-align-middle" rowSpan="2">
                    3,000,000
                  </td>
                  <td>#25975</td>
                  <td>200,000</td>
                  <td>300,000</td>
                  <td>100,000</td>
                  <td>0</td>
                  <td>500,000</td>
                  <td>Combo làm đẹp trọn vẹn</td>
                </tr>
                <tr>
                  <td>#25975</td>
                  <td>80,000</td>
                  <td>120,000</td>
                  <td>160,000</td>
                  <td>0</td>
                  <td>0</td>
                  <td>Mỹ phẩm trị nám</td>
                </tr>
                <tr>
                  <td>Lê Bảo Ngọc</td>
                  <td>0981883338</td>
                  <td>3,500,000</td>
                  <td>#25977</td>
                  <td>250,000</td>
                  <td>0</td>
                  <td>0</td>
                  <td>0</td>
                  <td>0</td>
                  <td>Chăm sóc da</td>
                </tr> */}
                {JsonData.map((item, itemIndex) => (
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
                                        rowSpan={AmountTR(item.ListCustomer)}
                                      >
                                        {item.CreateDate}
                                      </td>
                                    )}
                                  {orders.OrderItems.length > 0 &&
                                    orderItemIndex === 0 && (
                                      <Fragment>
                                        <td
                                          className="vertical-align-middle"
                                          rowSpan={orders.OrderItems.length}
                                        >
                                          {member.MemberName}
                                        </td>
                                        <td
                                          className="vertical-align-middle"
                                          rowSpan={orders.OrderItems.length}
                                        >
                                          {member.MemberPhone}
                                        </td>
                                        <td
                                          className="vertical-align-middle"
                                          rowSpan={orders.OrderItems.length}
                                        >
                                          {PriceHelper.formatVND(
                                            member.TTToanNo
                                          )}
                                        </td>
                                      </Fragment>
                                    )}
                                  <td>#{orderItem.Id}</td>
                                  <td>{orderItem.TTToanNo}</td>
                                  <td>{orderItem.ToPay}</td>
                                  <td>{orderItem.DaThToan}</td>
                                  <td>{orderItem.DaThToan_Vi}</td>
                                  <td>{orderItem.DaThToan_ThTien}</td>
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

                {/* {
                  JsonData.map((item, index) => (
                    <Fragment key={index}>
                      {
                        Array(AmountTR(item.ListCustomer)).fill().map((i, idx) => (
                          <tr key={idx} >
                            {
                              idx === 0 && (
                                <td rowSpan={AmountTR(item.ListCustomer)}>{item.CreateDate}</td>
                              )
                            }
                            {
                              item.ListCustomer.map((Member, MemberId) => (
                                <Fragment key={MemberId}>
                                  {
                                    Member.ListOrders.map((Order, OrderId) => (
                                      <Fragment key={OrderId}>
                                        {
                                          Order.OrderItems.map((OrderItem, OrderItemId) => (
                                            <Fragment key={OrderItemId}>
                                              <td>#{OrderItem.Id}</td>
                                              <td>{OrderItem.TTToanNo}</td>
                                              <td>{OrderItem.ToPay}</td>
                                              <td>{OrderItem.DaThToan}</td>
                                              <td>{OrderItem.lines.map(line => line.ProdTitle).join(", ")}</td>
                                            </Fragment>
                                          ))
                                        }
                                      </Fragment>
                                    ))
                                  }
                                </Fragment>
                              ))
                            }
                          </tr>
                        ))
                      }
                    </Fragment>
                  ))
                } */}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DebtPayment
