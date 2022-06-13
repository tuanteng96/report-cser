import React, { Fragment, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterList from 'src/components/Filter/FilterList'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import { PriceHelper } from 'src/helpers/PriceHelper'
import ChildrenTables from 'src/components/Tables/ChildrenTables'
import ModalViewMobile from './ModalViewMobile'
import reportsApi from 'src/api/reports.api'

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

const JSONData = {
  Total: 1,
  PCount: 1,
  TongHoaHong: 900000,
  Items: [
    {
      CreateDate: '2022-06-03T14:11:39',
      StaffsList: [
        {
          Staff: {
            ID: 123,
            FullName: 'Nguyễn Tài Tuấn'
          },
          RoseMoney: 2000000,
          OrdersList: [
            {
              ID: 25841, // Id đơn hàng
              Member: {
                ID: 258,
                FullName: 'Nguyễn Tài Tuấn',
                Phone: '0971021196'
              },
              RoseMoney: 2000000,
              Lines: [
                {
                  ProdId: 1234,
                  ProdTitle: 'SP A',
                  ToPay: 200000
                },
                {
                  ProdId: 1234,
                  ProdTitle: 'SP B',
                  ToPay: 100000
                }
              ]
            },
            {
              ID: 25842, // Id đơn hàng
              Member: {
                ID: 258,
                FullName: 'Nguyễn Tài Tuấn 2',
                Phone: '0971021196'
              },
              RoseMoney: 2000000,
              Lines: [
                {
                  ProdId: 1234,
                  ProdTitle: 'SP C',
                  ToPay: 200000
                }
              ]
            }
          ]
        },
        {
          Staff: {
            ID: 1235,
            FullName: 'Lê bảo ngọc'
          },
          RoseMoney: 2000000,
          OrdersList: [
            {
              ID: 25842, // Id đơn hàng
              Member: {
                ID: 258,
                FullName: 'Nguyễn Tài Tuấn',
                Phone: '0971021196'
              },
              RoseMoney: 2000000,
              Lines: [
                {
                  ProdId: 1234,
                  ProdTitle: 'SP E',
                  ToPay: 200000
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

function RoseStaff(props) {
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
    MemberID: '', // ID khách hàng
    StaffID: '', // ID nhân viên
    OrderID: ''
  })
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ListData, setListData] = useState([])
  const [TotalHoaHong, setTotalHoaHong] = useState(0)
  const [PageTotal, setPageTotal] = useState(0)
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
    getListRose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListRose = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    const newFilters = {
      ...filters,
      DateStart: filters.DateStart
        ? moment(filters.DateStart).format('DD/MM/yyyy')
        : null,
      DateEnd: filters.DateEnd
        ? moment(filters.DateEnd).format('DD/MM/yyyy')
        : null,
      StaffID: filters.StaffID ? filters.StaffID.value : '',
      MemberID: filters.MemberID ? filters.MemberID.value : ''
    }
    reportsApi
      .getListStaffRose(newFilters)
      .then(({ data }) => {
        const { Items, Total, TongHoaHong } = {
          Items: data.result?.Items || JSONData.Items,
          TongHoaHong: data.result?.TongHoaHong || JSONData.TongHoaHong,
          Total: data.result?.Total || JSONData.Total
        }
        setListData(Items)
        setTotalHoaHong(TongHoaHong)
        setLoading(false)
        setPageTotal(Total)
        isFilter && setIsFilter(false)
        callback && callback()
      })
      .catch(error => console.log(error))
  }

  const onOpenFilter = () => {
    setIsFilter(true)
  }

  const onHideFilter = () => {
    setIsFilter(false)
  }

  const onFilter = values => {
    if (_.isEqual(values, filters)) {
      getListRose()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    getListRose()
  }

  const OpenModalMobile = value => {
    setInitialValuesMobile(value)
    setIsModalMobile(true)
  }

  const HideModalMobile = () => {
    setInitialValuesMobile(null)
    setIsModalMobile(false)
  }

  const AmountMember = item => {
    var totalArray = 0
    if (!item) return totalArray
    for (let keyItem of item) {
      totalArray += keyItem.OrdersList.length
    }
    return totalArray
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Nhân viên hoa hồng
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
      <div className="bg-white rounded mt-25px">
        <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-md-center justify-content-between flex-column flex-md-row">
          <div className="fw-500 font-size-lg">
            Danh sách hoa hồng nhân viên
          </div>
          <div className="fw-500">
            Tổng hoa hồng{' '}
            <span className="font-size-xl fw-600 text-success">
              {PriceHelper.formatVND(TotalHoaHong)}
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
                text: 'Nhân viên',
                headerStyle: {
                  minWidth: '200px',
                  width: '200px'
                }
              },
              {
                text: 'Hoa hồng',
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
                text: 'Khách hàng',
                headerStyle: {
                  minWidth: '200px',
                  width: '200px'
                }
              },
              {
                text: 'Số điện thoại',
                headerStyle: {
                  minWidth: '200px',
                  width: '200px'
                }
              },
              {
                text: 'Hoa hồng',
                headerStyle: {
                  minWidth: '150px',
                  width: '150px'
                }
              },
              {
                text: 'Chi tiết',
                headerStyle: {
                  minWidth: '250px',
                  width: '250px'
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
              itemShow: 1,
              CallModal: row => OpenModalMobile(row),
              columns: [
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
              ListData.map((item, index) => (
                <Fragment key={index}>
                  {item.StaffsList.map((staff, staffIndex) => (
                    <Fragment key={staffIndex}>
                      {staff.OrdersList &&
                        staff.OrdersList.map((order, orderIndex) => (
                          <Fragment key={orderIndex}>
                            <tr>
                              {index === 0 &&
                                staffIndex === 0 &&
                                orderIndex === 0 && (
                                  <td
                                    className="vertical-align-middle"
                                    rowSpan={AmountMember(item.StaffsList)}
                                  >
                                    {moment(item.CreateDate).format(
                                      'HH:mm DD-MM-YYYY'
                                    )}
                                  </td>
                                )}
                              {orderIndex === 0 && (
                                <Fragment>
                                  <td
                                    className="vertical-align-middle"
                                    rowSpan={staff.OrdersList.length}
                                  >
                                    {staff.Staff?.FullName || 'Chưa có'}
                                  </td>
                                  <td
                                    className="vertical-align-middle"
                                    rowSpan={staff.OrdersList.length}
                                  >
                                    {PriceHelper.formatVND(staff.RoseMoney)}
                                  </td>
                                </Fragment>
                              )}
                              <td>#{order.ID}</td>
                              <td>{order?.Member?.FullName || 'Chưa có'}</td>
                              <td>{order?.Member?.Phone || 'Chưa có'}</td>
                              <td>{PriceHelper.formatVND(order.RoseMoney)}</td>
                              <td>
                                {order.Lines.map(
                                  line =>
                                    `${
                                      line.ProdTitle
                                    } - ${PriceHelper.formatVND(line.ToPay)}`
                                ).join(', ')}
                              </td>
                            </tr>
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

export default RoseStaff
