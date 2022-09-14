import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterToggle from 'src/components/Filter/FilterToggle'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import ChildrenTables from 'src/components/Tables/ChildrenTables'
import { PriceHelper } from 'src/helpers/PriceHelper'
import reportsApi from 'src/api/reports.api'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import ModalViewMobile from './ModalViewMobile'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import { ArrayHeplers } from 'src/helpers/ArrayHeplers'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'
import { uuidv4 } from '@nikitababko/id-generator'
import moment from 'moment'
import 'moment/locale/vi'

moment.locale('vi')

const convertArray = arrays => {
  const newArray = []
  if (!arrays || arrays.length === 0) {
    return newArray
  }
  for (let [index, obj] of arrays.entries()) {
    for (let [x, order] of obj.OrdersList.entries()) {
      const newObj = {
        ...order,
        ...obj,
        CoSoMuaHang: order.StockName,
        NgayMuaHang: order.CreateDate,
        rowIndex: index,
        Id: uuidv4()
      }
      if (x !== 0) delete newObj.OrdersList
      newArray.push(newObj)
    }
  }
  //console.log(newArray.length)
  return newArray
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
  const [pageCount, setPageCount] = useState(0)
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
          const { Members, Total, PCount } = {
            Members: data?.result?.Members || [],
            Total: data?.result?.Total || 0,
            PCount: data?.result?.PCount || 0
          }
          setListData(convertArray(Members))
          setPageTotal(Total)
          setPageCount(PCount)
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
    const newFilters = GeneralNewFilter(
      ArrayHeplers.getFilterExport({ ...filters }, PageTotal)
    )
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

  const onPagesChange = ({ Pi, Ps }) => {
    setFilters({ ...filters, Pi, Ps })
  }

  const columns = useMemo(
    () => [
      {
        key: 'index',
        title: 'STT',
        dataKey: 'index',
        cellRenderer: ({ rowData }) =>
          filters.Ps * (filters.Pi - 1) + (rowData.rowIndex + 1),
        width: 60,
        sortable: false,
        align: 'center',
        rowSpan: ({ rowData }) =>
          rowData.OrdersList && rowData.OrdersList.length > 0
            ? rowData.OrdersList.length
            : 1
      },
      {
        key: 'CreateDate',
        title: 'Ngày tạo',
        dataKey: 'CreateDate',
        cellRenderer: ({ rowData }) =>
          moment(rowData.CreateDate).format('HH:mm DD/MM/YYYY'),
        width: 150,
        sortable: false,
        rowSpan: ({ rowData }) =>
          rowData.OrdersList && rowData.OrdersList.length > 0
            ? rowData.OrdersList.length
            : 1
      },
      {
        key: 'MemberFullName',
        title: 'Tên khách hàng',
        dataKey: 'MemberFullName',
        width: 200,
        sortable: false,
        rowSpan: ({ rowData }) =>
          rowData.OrdersList && rowData.OrdersList.length > 0
            ? rowData.OrdersList.length
            : 1
      },
      {
        key: 'MemberPhone',
        title: 'Số điện thoại',
        dataKey: 'MemberPhone',
        width: 150,
        sortable: false,
        rowSpan: ({ rowData }) =>
          rowData.OrdersList && rowData.OrdersList.length > 0
            ? rowData.OrdersList.length
            : 1
      },
      {
        key: 'StockName',
        title: 'Cơ sở',
        dataKey: 'StockName',
        width: 200,
        sortable: false,
        rowSpan: ({ rowData }) =>
          rowData.OrdersList && rowData.OrdersList.length > 0
            ? rowData.OrdersList.length
            : 1
      },
      {
        key: 'TongChiTieu',
        title: 'Tồn tiền chi tiêu',
        dataKey: 'TongChiTieu',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.TongChiTieu),
        width: 150,
        sortable: false,
        rowSpan: ({ rowData }) =>
          rowData.OrdersList && rowData.OrdersList.length > 0
            ? rowData.OrdersList.length
            : 1
      },
      {
        key: 'NgayMuaHang',
        title: 'Thời gian mua hàng',
        dataKey: 'NgayMuaHang',
        cellRenderer: ({ rowData }) =>
          rowData.NgayMuaHang
            ? moment(rowData.NgayMuaHang).format('HH:mm DD/MM/YYYY')
            : '',
        width: 180,
        sortable: false
      },
      {
        key: 'CoSoMuaHang',
        title: 'Cở sở mua hàng',
        dataKey: 'CoSoMuaHang',
        width: 180,
        sortable: false
      },
      {
        key: 'ID',
        title: 'Mã đơn hàng',
        dataKey: 'ID',
        width: 120,
        sortable: false
      },
      {
        key: 'Prods',
        title: 'Mặt hàng mua',
        dataKey: 'Prods',
        cellRenderer: ({ rowData }) =>
          rowData.Prods && rowData.Prods.length > 0
            ? rowData.Prods.map(prod => `${prod.name} (x${prod.qty})`).join(',')
            : 'Không có mặt hàng.',
        width: 250,
        sortable: false
      },
      {
        key: 'DoanhSo',
        title: 'Doanh số',
        dataKey: 'DoanhSo',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.DoanhSo),
        width: 150,
        sortable: false
      },
      {
        key: 'GiamGia',
        title: 'Giảm giá',
        dataKey: 'GiamGia',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.GiamGia),
        width: 150,
        sortable: false
      },
      {
        key: 'DaThanhToan',
        title: 'Đã thanh toán',
        dataKey: 'DaThanhToan',
        cellRenderer: ({ rowData }) => (
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
                  Chi tiết thanh toán #{rowData.ID}
                </Popover.Header>
                <Popover.Body className="p-0">
                  <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                    <span>Tiền mặt</span>
                    <span>{PriceHelper.formatVND(rowData.TM)}</span>
                  </div>
                  <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                    <span>Chuyển khoản</span>
                    <span>{PriceHelper.formatVND(rowData.CK)}</span>
                  </div>
                  <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                    <span>Quẹt thẻ</span>
                    <span>{PriceHelper.formatVND(rowData.QT)}</span>
                  </div>
                </Popover.Body>
              </Popover>
            }
          >
            <div className="d-flex justify-content-between align-items-center w-100">
              {PriceHelper.formatVND(rowData.DaThanhToan)}
              <i className="fa-solid fa-circle-exclamation cursor-pointer text-warning"></i>
            </div>
          </OverlayTrigger>
        ),
        width: 180,
        sortable: false
      },
      {
        key: 'TheTien',
        title: 'Thẻ tiền',
        dataKey: 'TheTien',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.DoanhThu),
        width: 150,
        sortable: false
      },
      {
        key: 'Vi',
        title: 'Ví',
        dataKey: 'Vi',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.DoanhThu),
        width: 150,
        sortable: false
      }
    ],
    [filters]
  )

  const rowRenderer = ({ rowData, rowIndex, cells, columns }) => {
    const indexList = [0, 1, 2, 3, 4, 5]
    for (let index of indexList) {
      const rowSpan = columns[index].rowSpan({ rowData, rowIndex })
      if (rowSpan > 1) {
        const cell = cells[index]
        const style = {
          ...cell.props.style,
          backgroundColor: '#fff',
          height: rowSpan * 50 - 1,
          alignSelf: 'flex-start',
          zIndex: 1
        }
        cells[index] = React.cloneElement(cell, { style })
      }
    }
    return cells
  }

  //console.log(ListData)
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
          <ReactTableV7
            rowKey="Id"
            filters={filters}
            columns={columns}
            data={ListData}
            loading={loading}
            pageCount={pageCount}
            onPagesChange={onPagesChange}
            optionMobile={{
              CellModal: cell => OpenModalMobile(cell)
            }}
            rowRenderer={rowRenderer}
          />
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
                              {item?.MemberFullName || 'Chưa xác định'}
                            </td>
                            <td
                              className="vertical-align-middle"
                              rowSpan={item?.OrdersList.length}
                            >
                              {item?.MemberPhone || 'Chưa xác định'}
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
                                prod => `${prod.name} (x${prod.qty})`
                              ).join(',')
                            : 'Không có mặt hàng.'}
                        </td>
                        <td>{PriceHelper.formatVND(order.DoanhSo)}</td>
                        <td>{PriceHelper.formatVND(order.GiamGia)}</td>
                        <td>{PriceHelper.formatVND(order.DoanhThu)}</td>
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
                                  Chi tiết thanh toán #{order.ID}
                                </Popover.Header>
                                <Popover.Body className="p-0">
                                  <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                                    <span>Tiền mặt</span>
                                    <span>
                                      {PriceHelper.formatVND(order.TM)}
                                    </span>
                                  </div>
                                  <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                                    <span>Chuyển khoản</span>
                                    <span>
                                      {PriceHelper.formatVND(order.CK)}
                                    </span>
                                  </div>
                                  <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                                    <span>Quẹt thẻ</span>
                                    <span>
                                      {PriceHelper.formatVND(order.QT)}
                                    </span>
                                  </div>
                                </Popover.Body>
                              </Popover>
                            }
                          >
                            <div className="d-flex justify-content-between align-items-center">
                              {PriceHelper.formatVND(order.DaThanhToan)}
                              <i className="fa-solid fa-circle-exclamation cursor-pointer text-warning"></i>
                            </div>
                          </OverlayTrigger>
                        </td>
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
