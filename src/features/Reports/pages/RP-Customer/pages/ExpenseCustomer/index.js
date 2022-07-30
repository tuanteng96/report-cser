import React, { Fragment, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterToggle from 'src/components/Filter/FilterToggle'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import ChildrenTables from 'src/components/Tables/ChildrenTables'
import { PriceHelper } from 'src/helpers/PriceHelper'
import reportsApi from 'src/api/reports.api'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import ModalViewMobile from './ModalViewMobile'

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

const JSONData = {
  Total: 1,
  PCount: 1,
  Members: [
    {
      CreateDate: '2022-07-29T09:25:52.72',
      Member: {
        ID: '4236', // ID khách hàng
        FullName: 'Nguyễn Tài Tuấn',
        Phone: '0971021196'
      },
      StockID: '8975',
      StockName: 'Cser Hà Nội',
      TongChiTieu: 30000000,
      OrdersList: [
        {
          CreateDate: '2022-07-29T09:25:52.72',
          StockID: '8975',
          StockName: 'Cser Hà Nội',
          ID: '1235', // ID Đơn hàng,
          Prods: [
            {
              Id: 1234, // ID SP, Dv
              Title: 'Sản phẩm chăm sóc da',
              Qty: 5,
              Price: 200000
            }
          ],
          DoanhSo: 200000,
          GiamGia: 100000,
          HoanLai: 100000,
          DoanhThu: 400000,
          DaThanhToan: 400000,
          Vi: 100000,
          TheTien: 10000
        }
      ]
    }
  ]
}

function ExpenseCustomer(props) {
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
    StockOrderID: '', // Cơ sở mua
    MemberID: '', // ID Khách hàng
    GroupCustomerID: '', // ID Nhóm khách hàng
    SourceName: '', // Nguồn
    DateOrderStart: null, // Bắt đầu mua hàng
    DateOrderEnd: null, // Kết thúc mua hàng
    TypeOrder: '', // Phát sinh mua (SP / DV / THE_TIEN / PP / NVL)
    BrandOrderID: '', // Phát sinh mua theo nhãn hàng
    ProductOrderID: '', // Phát sinh mua theo mặt hàng
    PriceFromOrder: '', // Mức chi tiêu từ
    PriceToOrder: '' // Mức chi tiêu đến
  })
  const [StockName, setStockName] = useState('')
  const [ListData, setListData] = useState([])
  const [PageTotal, setPageTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [isFilter, setIsFilter] = useState(false)
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
    getListExpenseCustomer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const GeneralNewFilter = filters => {
    return {
      ...filters,
      DateStart: filters.DateStart
        ? moment(filters.DateStart).format('DD/MM/yyyy')
        : null,
      DateEnd: filters.DateEnd
        ? moment(filters.DateEnd).format('DD/MM/yyyy')
        : null,
      MemberID: filters.MemberID ? filters.MemberID.value : '',
      GroupCustomerID: filters.GroupCustomerID
        ? filters.GroupCustomerID.value
        : '',
      SourceName: filters.SourceName ? filters.SourceName.value : '',
      BrandOrderID: filters.BrandOrderID ? filters.BrandOrderID.value : '',
      ProductOrderID: filters.ProductOrderID
        ? filters.ProductOrderID.value
        : '',
      TypeOrder: filters.TypeOrder
        ? filters.TypeOrder.map(item => item.value).join(',')
        : '',
      DateOrderStart: filters.DateOrderStart
        ? moment(filters.DateOrderStart).format('DD/MM/yyyy')
        : null,
      DateOrderEnd: filters.DateOrderEnd
        ? moment(filters.DateOrderEnd).format('DD/MM/yyyy')
        : filters.DateOrderStart
        ? moment(filters.DateOrderStart).format('DD/MM/yyyy')
        : null
    }
  }

  const getListExpenseCustomer = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    const newFilters = GeneralNewFilter(filters)
    reportsApi
      .getListCustomerExpense(newFilters)
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const { Members, Total } = {
            Members: data?.result?.Members || JSONData.Members,
            Total: data?.result?.Total || 0
          }
          setListData(Members)
          setPageTotal(Total)
          setLoading(false)
          isFilter && setIsFilter(false)
          callback && callback()
        }
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
      getListExpenseCustomer()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    getListExpenseCustomer()
  }

  const OpenModalMobile = value => {
    setInitialValuesMobile(value)
    setIsModalMobile(true)
  }

  const HideModalMobile = () => {
    setInitialValuesMobile(null)
    setIsModalMobile(false)
  }

  const onExport = () => {
    setLoadingExport(true)
    const newFilters = GeneralNewFilter({ ...filters, Ps: 1000, Pi: 1 })
    reportsApi
      .getListCustomerExpense(newFilters)
      .then(({ data }) => {
        window?.EzsExportExcel &&
          window?.EzsExportExcel({
            Url: '/khach-hang/chi-tieu',
            Data: data,
            hideLoading: () => setLoadingExport(false)
          })
      })
      .catch(error => console.log(error))
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Khách hàng chi tiêu
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
      <FilterToggle
        show={isFilter}
        filters={filters}
        onHide={onHideFilter}
        onSubmit={onFilter}
        onRefresh={onRefresh}
        loading={loading}
        loadingExport={loadingExport}
        onExport={onExport}
      />
      <div className="bg-white rounded">
        <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between">
          <div className="fw-500 font-size-lg">Danh sách khách hàng</div>
        </div>
        <div className="p-20px">
          <ChildrenTables
            data={ListData}
            columns={[
              {
                text: 'STT',
                headerStyle: {
                  minWidth: '60px',
                  width: '60px',
                  textAlign: 'center'
                },
                attrs: { 'data-title': 'STT' }
              },
              {
                text: 'Ngày tạo',
                headerStyle: {
                  minWidth: '150px',
                  width: '150px'
                },
                attrs: { 'data-title': 'Ngày tạo' }
              },
              {
                text: 'Tên khách hàng',
                headerStyle: {
                  minWidth: '200px',
                  width: '200px'
                },
                attrs: { 'data-title': 'Tên khách hàng' }
              },
              {
                text: 'Số điện thoại',
                headerStyle: {
                  minWidth: '200px',
                  width: '200px'
                },
                attrs: { 'data-title': 'Số điện thoại' }
              },
              {
                text: 'Cơ sở',
                headerStyle: {
                  minWidth: '180px',
                  width: '180px'
                },
                attrs: { 'data-title': 'Cơ sở' }
              },
              {
                text: 'Tổng tiền chi tiêu',
                headerStyle: {
                  minWidth: '160px',
                  width: '160px'
                },
                attrs: { 'data-title': 'Tổng tiền chi tiêu' }
              },
              {
                text: 'Thời gian mua hàng',
                headerStyle: {
                  minWidth: '160px',
                  width: '160px'
                },
                attrs: { 'data-title': 'Thời gian mua hàng' }
              },
              {
                text: 'Cơ sở mua hàng',
                headerStyle: {
                  minWidth: '160px',
                  width: '160px'
                },
                attrs: { 'data-title': 'Cơ sở' }
              },
              {
                text: 'Mã đơn hàng',
                headerStyle: {
                  minWidth: '150px',
                  width: '150px'
                }
              },
              {
                text: 'Tên mặt hàng mua',
                headerStyle: {
                  minWidth: '250px',
                  width: '250px'
                }
              },
              {
                text: 'Doanh số',
                headerStyle: {
                  minWidth: '180px',
                  width: '180px'
                }
              },
              {
                text: 'Giảm giá',
                headerStyle: {
                  minWidth: '180px',
                  width: '180px'
                }
              },
              {
                text: 'Tiền hoàn lại',
                headerStyle: {
                  minWidth: '180px',
                  width: '180px'
                }
              },
              {
                text: 'Doanh thu',
                headerStyle: {
                  minWidth: '180px',
                  width: '180px'
                }
              },
              {
                text: 'Đã thanh toán',
                headerStyle: {
                  minWidth: '180px',
                  width: '180px'
                }
              },
              {
                text: 'Ví',
                headerStyle: {
                  minWidth: '150px',
                  width: '150px'
                }
              },
              {
                text: 'Thẻ tiền',
                headerStyle: {
                  minWidth: '150px',
                  width: '150px'
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
                setFilters({ ...filters, Ps: Ps, Pi: 1 })
              }
            }}
            optionsMoible={{
              itemShow: 0,
              CallModal: row => OpenModalMobile(row),
              columns: [
                {
                  attrs: { 'data-title': 'STT' },
                  formatter: (row, index) => (
                    <span className="font-number">
                      {filters.Ps * (filters.Pi - 1) + (index + 1)}
                    </span>
                  )
                },
                {
                  attrs: { 'data-title': 'Ngày tạo' },
                  formatter: row =>
                    moment(row.CreateDate).format('HH:mm DD/MM/YYYY')
                },
                {
                  attrs: { 'data-title': 'Tên khách hàng' },
                  formatter: row => row?.Member?.FullName || 'Chưa xác định'
                },
                {
                  attrs: { 'data-title': 'Số điện thoại' },
                  formatter: row => row?.Member?.Phone || 'Chưa xác định'
                },
                {
                  attrs: { 'data-title': 'Cơ sở' },
                  formatter: row => row?.StockName || 'Chưa xác định'
                },
                {
                  attrs: { 'data-title': 'Tổng tiền chi tiêu' },
                  formatter: row => PriceHelper.formatVND(row.TongChiTieu)
                }
              ]
            }}
            loading={loading}
          >
            {ListData &&
              ListData.map((item, index) => (
                <Fragment key={index}>
                  {item?.OrdersList &&
                    item?.OrdersList.map((order, orderIndex) => (
                      <tr key={orderIndex}>
                        {orderIndex === 0 && (
                          <Fragment>
                            <td
                              className="vertical-align-middle text-center"
                              rowSpan={item?.OrdersList.length}
                            >
                              <span className="font-number">
                                {filters.Ps * (filters.Pi - 1) + (index + 1)}
                              </span>
                            </td>
                            <td
                              className="vertical-align-middle"
                              rowSpan={item?.OrdersList.length}
                            >
                              {moment(item.CreateDate).format(
                                'HH:mm DD/MM/YYYY'
                              )}
                            </td>
                            <td
                              className="vertical-align-middle"
                              rowSpan={item?.OrdersList.length}
                            >
                              {item?.Member?.FullName || 'Chưa xác định'}
                            </td>
                            <td
                              className="vertical-align-middle"
                              rowSpan={item?.OrdersList.length}
                            >
                              {item?.Member?.Phone || 'Chưa xác định'}
                            </td>
                            <td
                              className="vertical-align-middle"
                              rowSpan={item?.OrdersList.length}
                            >
                              {item?.StockName || 'Chưa xác định'}
                            </td>
                            <td
                              className="vertical-align-middle"
                              rowSpan={item?.OrdersList.length}
                            >
                              {PriceHelper.formatVND(item.TongChiTieu)}
                            </td>
                          </Fragment>
                        )}
                        <td>
                          {moment(order.CreateDate).format('HH:mm DD/MM/YYYY')}
                        </td>
                        <td>{order.StockName}</td>
                        <td>{order.ID}</td>
                        <td>
                          {order.Prods && order.Prods.length > 0
                            ? order.Prods.map(
                                prod => `${prod.Title} (x${prod.Qty})`
                              ).join(',')
                            : 'Không có mặt hàng.'}
                        </td>
                        <td>{PriceHelper.formatVND(order.DoanhSo)}</td>
                        <td>{PriceHelper.formatVND(order.GiamGia)}</td>
                        <td>{PriceHelper.formatVND(order.HoanLai)}</td>
                        <td>{PriceHelper.formatVND(order.DoanhThu)}</td>
                        <td>{PriceHelper.formatVND(order.DaThanhToan)}</td>
                        <td>{PriceHelper.formatVND(order.Vi)}</td>
                        <td>{PriceHelper.formatVND(order.TheTien)}</td>
                      </tr>
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

export default ExpenseCustomer
