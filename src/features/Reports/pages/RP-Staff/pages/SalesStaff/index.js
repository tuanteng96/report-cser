import React, { Fragment, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterList from 'src/components/Filter/FilterList'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import { PriceHelper } from 'src/helpers/PriceHelper'
import ModalViewMobile from './ModalViewMobile'
import reportsApi from 'src/api/reports.api'
import ChildrenTables from 'src/components/Tables/ChildrenTables'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

function SalesStaff(props) {
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
    //ServiceCardID: '',
    CategoriesId: '', // ID 1 danh mục
    BrandId: '', //ID 1 nhãn hàng
    ProductId: '' // ID 1 SP, DV, NVL, ...
  })
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [ListData, setListData] = useState([])
  const [TotalSales, setTotalSales] = useState({
    TongDoanhSo: 0,
    TongThucDoanhSo: 0,
    KhauTru: 0
  })
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
    getListSalarys()
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
      StaffID: filters.StaffID ? filters.StaffID.value : '',
      MemberID: filters.MemberID ? filters.MemberID.value : '',
      // ServiceCardID: filters.ServiceCardID ? filters.ServiceCardID.value : '',
      CategoriesId: filters.CategoriesId ? filters.CategoriesId.value : '',
      BrandId: filters.BrandId ? filters.BrandId.value : '',
      ProductId: filters.ProductId ? filters.ProductId.value : ''
    }
  }

  const getListSalarys = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    const newFilters = GeneralNewFilter(filters)
    reportsApi
      .getListStaffSales(newFilters)
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const { Items, Total, TongDoanhSo, TongThucDoanhSo, KhauTru } = {
            Items: data.result?.Items || [],
            Total: data.result?.Total || 0,
            TongDoanhSo: data.result?.TongDoanhSo || 0,
            TongThucDoanhSo: data.result?.TongThucDoanhSo || 0,
            KhauTru: data.result?.KhauTru || 0
          }
          setListData(Items)
          setTotalSales({ TongDoanhSo, TongThucDoanhSo, KhauTru })
          setLoading(false)
          setPageTotal(Total)
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
      getListSalarys()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    getListSalarys()
  }

  const onExport = () => {
    setLoadingExport(true)
    const newFilters = GeneralNewFilter({ ...filters, Ps: 1000, Pi: 1 })
    reportsApi
      .getListStaffSales(newFilters)
      .then(({ data }) => {
        window?.EzsExportExcel &&
          window?.EzsExportExcel({
            Url: '/nhan-vien/doanh-so',
            Data: data,
            hideLoading: () => setLoadingExport(false)
          })
      })
      .catch(error => console.log(error))
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

  const CustomStyles = item => {
    const styles = {}
    if (item.tra_lai_don_hang) {
      styles.background = '#ffb2c1'
    }
    return styles
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Nhân viên doanh số
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
        loadingExport={loadingExport}
        onExport={onExport}
      />
      <div className="bg-white rounded">
        <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between">
          <div className="fw-500 font-size-lg">
            Danh sách doanh số nhân viên
          </div>
          <div className="fw-500 d-flex align-items-center ml-25px">
            Tổng doanh số
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
                    Chi tiết doanh số
                  </Popover.Header>
                  <Popover.Body className="p-0">
                    <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                      <span>Tổng</span>
                      <span>
                        {PriceHelper.formatVNDPositive(TotalSales.TongDoanhSo)}
                      </span>
                    </div>
                    <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                      <span>Khấu trừ</span>
                      <span className="text-danger">
                        {PriceHelper.formatVNDPositive(TotalSales.KhauTru)}
                      </span>
                    </div>
                  </Popover.Body>
                </Popover>
              }
            >
              <div className="d-flex justify-content-between align-items-center">
                <span className="font-size-xl fw-600 text-success pl-5px font-number">
                  {PriceHelper.formatVNDPositive(TotalSales.TongThucDoanhSo)}
                </span>
                <i className="fa-solid fa-circle-exclamation cursor-pointer text-success ml-5px"></i>
              </div>
            </OverlayTrigger>
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
                text: 'Tổng doanh số',
                headerStyle: {
                  minWidth: '150px',
                  width: '150px'
                }
              },
              {
                text: 'Nhân viên',
                headerStyle: {
                  minWidth: '200px',
                  width: '200px'
                }
              },
              {
                text: 'Doanh số',
                headerStyle: {
                  minWidth: '150px',
                  width: '150px'
                }
              },
              {
                text: 'Đơn hàng',
                headerStyle: {
                  minWidth: '120px',
                  width: '120px'
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
                  minWidth: '150px',
                  width: '150px'
                }
              },
              {
                text: 'Doanh số',
                headerStyle: {
                  minWidth: '150px',
                  width: '150px'
                }
              },
              {
                text: 'Chi tiết',
                headerStyle: {
                  minWidth: '350px',
                  width: '350px'
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
              itemShow: 1,
              CallModal: row => OpenModalMobile(row),
              columns: [
                {
                  attrs: { 'data-title': 'Tổng khách hàng' },
                  formatter: row => row.StaffsList.length
                },
                {
                  attrs: { 'data-title': 'Tổng doanh số' },
                  formatter: row => PriceHelper.formatVND(row.TongThuc)
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
                              {staffIndex === 0 && orderIndex === 0 && (
                                <Fragment>
                                  <td
                                    className="vertical-align-middle"
                                    rowSpan={AmountMember(item.StaffsList)}
                                  >
                                    {moment(item.CreateDate).format(
                                      'DD-MM-YYYY'
                                    )}
                                  </td>
                                  <td
                                    className="vertical-align-middle fw-600"
                                    rowSpan={AmountMember(item.StaffsList)}
                                  >
                                    {PriceHelper.formatVND(item.TongThuc)}
                                  </td>
                                </Fragment>
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
                                    {PriceHelper.formatVND(staff.TongThuc)}
                                  </td>
                                </Fragment>
                              )}
                              <td
                                className="vertical-align-middle"
                                style={CustomStyles(order)}
                              >
                                #{order.ID}
                              </td>
                              <td
                                className="vertical-align-middle"
                                style={CustomStyles(order)}
                              >
                                {order?.Member?.FullName || 'Chưa có'}
                              </td>
                              <td
                                className="vertical-align-middle"
                                style={CustomStyles(order)}
                              >
                                {order?.Member?.Phone || 'Chưa có'}
                              </td>
                              <td
                                className="vertical-align-middle"
                                style={CustomStyles(order)}
                              >
                                {PriceHelper.formatVND(order.GiaTriThuc)}
                              </td>
                              <td style={CustomStyles(order)}>
                                {order.Lines.map(
                                  line =>
                                    `${line.ProdTitle} ( ${
                                      line.GiaTri > 0
                                        ? PriceHelper.formatVND(line.GiaTri)
                                        : `- ${PriceHelper.formatVND(
                                            line.KhauTru
                                          )}`
                                    } )`
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

export default SalesStaff
