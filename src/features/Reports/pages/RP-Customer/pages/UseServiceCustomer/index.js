import React, { Fragment, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterToggle from 'src/components/Filter/FilterToggle'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import ChildrenTables from 'src/components/Tables/ChildrenTables'
import reportsApi from 'src/api/reports.api'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import ModalViewMobile from './ModalViewMobile'
import { ArrayHeplers } from 'src/helpers/ArrayHeplers'
import { JsonFilter } from 'src/Json/JsonFilter'

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
      ServiceList: [
        {
          Id: 2342, //ID Sp, dv
          Title: 'Chăm sóc da 10 buổi',
          BuoiCon: 5,
          UseEndTime: '2022-07-29T09:25:52.72', // Thời gian dùng cuối
          Status: 'Hiện còn',
          Desc: 'Chuyển nhượng : -3'
        }
      ]
    }
  ]
}

function UseServiceCustomer(props) {
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
    MemberID: '', // ID Khách hàng
    GroupCustomerID: '', // ID Nhóm khách hàng
    SourceName: '', // Nguồn
    ServiceIDs: '', // ID dịch vụ
    StatusServices: [JsonFilter.StatusServiceMemberList[0]],
    //TypeServices: '',
    DayFromServices: '', // Số buổi còn lại từ
    DayToServices: '' // Số buổi còn lại đến
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
    getListUseServiceCustomer()
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
      StatusServices: filters.StatusServices
        ? filters.StatusServices.map(item => item.value).join(',')
        : '',
      TypeServices: filters.TypeServices
        ? filters.TypeServices.map(item => item.value).join(',')
        : '',
      ServiceIDs: filters.ServiceIDs
        ? filters.ServiceIDs.map(item => item.value).join(',')
        : ''
    }
  }

  const getListUseServiceCustomer = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    const newFilters = GeneralNewFilter(filters)
    reportsApi
      .getListCustomerUseService(newFilters)
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
      getListUseServiceCustomer()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    getListUseServiceCustomer()
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
      .getListCustomerUseService(newFilters)
      .then(({ data }) => {
        window?.EzsExportExcel &&
          window?.EzsExportExcel({
            Url: '/khach-hang/su-dung-dich-vu',
            Data: data,
            hideLoading: () => setLoadingExport(false)
          })
      })
      .catch(error => console.log(error))
  }

  // const getStatus = status => {
  //   let obj = {
  //     Title: status,
  //     ClassName: 'default'
  //   }
  //   if (status === 'done') {
  //     obj.Title = 'Hoàn thành'
  //     obj.ClassName = 'success'
  //   }
  //   if (status === 'doing') {
  //     obj.Title = 'Đang thực hiện'
  //     obj.ClassName = 'warning'
  //   }
  //   return obj
  // }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Khách hàng sử dụng dịch vụ
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
                text: 'Tên dịch vụ',
                headerStyle: {
                  minWidth: '250px',
                  width: '250px'
                }
              },
              {
                text: 'Số buổi còn',
                headerStyle: {
                  minWidth: '120px',
                  width: '120px'
                }
              },
              {
                text: 'Thời gian dùng cuối',
                headerStyle: {
                  minWidth: '180px',
                  width: '180px'
                }
              },
              {
                text: 'Trạng thái',
                headerStyle: {
                  minWidth: '180px',
                  width: '180px'
                }
              },
              {
                text: 'Mô tả',
                headerStyle: {
                  minWidth: '180px',
                  width: '180px'
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
                  formatter: row => row?.StockName
                }
              ]
            }}
            loading={loading}
          >
            {ListData &&
              ListData.map((item, index) => (
                <Fragment key={index}>
                  {item?.ServiceList &&
                    item?.ServiceList.map((order, orderIndex) => (
                      <tr key={orderIndex}>
                        {orderIndex === 0 && (
                          <Fragment>
                            <td
                              className="vertical-align-middle text-center"
                              rowSpan={item?.ServiceList.length}
                            >
                              <span className="font-number">
                                {filters.Ps * (filters.Pi - 1) + (index + 1)}
                              </span>
                            </td>
                            <td
                              className="vertical-align-middle"
                              rowSpan={item?.ServiceList.length}
                            >
                              {moment(item.CreateDate).format(
                                'HH:mm DD/MM/YYYY'
                              )}
                            </td>
                            <td
                              className="vertical-align-middle"
                              rowSpan={item?.ServiceList.length}
                            >
                              {item?.MemberFullName || 'Chưa xác định'}
                            </td>
                            <td
                              className="vertical-align-middle"
                              rowSpan={item?.ServiceList.length}
                            >
                              {item?.MemberPhone || 'Chưa xác định'}
                            </td>
                            <td
                              className="vertical-align-middle"
                              rowSpan={item?.ServiceList.length}
                            >
                              {item?.StockName || 'Chưa xác định'}
                            </td>
                          </Fragment>
                        )}
                        <td>{order.Title}</td>
                        <td>{order.BuoiCon}</td>
                        <td>
                          {order.UseEndTime
                            ? moment(order.UseEndTime).format(
                                'HH:mm DD/MM/YYYY'
                              )
                            : ''}
                        </td>
                        <td>{order.Status}</td>
                        <td>{order.Desc}</td>
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

export default UseServiceCustomer
