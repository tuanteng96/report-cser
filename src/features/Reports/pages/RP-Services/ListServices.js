import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterList from 'src/components/Filter/FilterList'
import _ from 'lodash'
import reportsApi from 'src/api/reports.api'
import BaseTablesCustom from 'src/components/Tables/BaseTablesCustom'
import { PriceHelper } from 'src/helpers/PriceHelper'
import ModalViewMobile from './ModalViewMobile'

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

function ListServices(props) {
  const { CrStockID } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || ''
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    DateStart: new Date(), // Ngày bắt đầu
    DateEnd: new Date(), // Ngày kết thúc
    Pi: 1, // Trang hiện tại
    Ps: 10, // Số lượng item
    Status: '', // Trạng thái
    Warranty: '', // Bảo hành
    StaffID: '' // ID nhân viên
  })
  const [ListData, setListData] = useState([])
  const [isFilter, setIsFilter] = useState(false)
  const [loading, setLoading] = useState(false)
  const [PageTotal, setPageTotal] = useState(0)
  const [initialValuesMobile, setInitialValuesMobile] = useState(null)
  const [isModalMobile, setIsModalMobile] = useState(false)

  useEffect(() => {
    getListServices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListServices = (isLoading = true, callback) => {
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
      GroupCustomerID: filters.GroupCustomerID
        ? filters.GroupCustomerID.value
        : '',
      SourceName: filters.SourceName ? filters.SourceName.value : '',
      ProvincesID: filters.ProvincesID ? filters.ProvincesID.value : '',
      DistrictsID: filters.DistrictsID ? filters.DistrictsID.value : '',
      Status: filters.Status ? filters.Status.value : '',
      Warranty: filters.Warranty ? filters.Warranty.value : ''
    }
    reportsApi
      .getListServices(newFilters)
      .then(({ data }) => {
        const { Items, Total } = data.result
        setListData(Items)
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
      getListServices()
    } else {
      setFilters(values)
    }
  }

  const onRefresh = () => {
    getListServices()
  }

  const OpenModalMobile = value => {
    setInitialValuesMobile(value)
    setIsModalMobile(true)
  }

  const HideModalMobile = () => {
    setInitialValuesMobile(null)
    setIsModalMobile(false)
  }

  const removeName = name => {
    if (!name) return ''
    const index = name.lastIndexOf('-')
    if (index > -1) {
      return name.slice(index + 1, name.length)
    }
  }

  return (
    <div className="bg-white rounded mt-25px">
      <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between">
        <div className="fw-500 font-size-lg">Danh sách dịch vụ</div>
        <button
          type="button"
          className="btn btn-primary p-0 w-35px h-30px"
          onClick={onOpenFilter}
        >
          <i className="fa-regular fa-filter-list font-size-md mt-5px"></i>
        </button>
      </div>
      <FilterList
        show={isFilter}
        filters={filters}
        onHide={onHideFilter}
        onSubmit={onFilter}
        onRefresh={onRefresh}
        loading={loading}
      />
      <div className="p-20px">
        <BaseTablesCustom
          data={ListData}
          textDataNull="Không có dữ liệu."
          optionsMoible={{
            itemShow: 5,
            CallModal: row => OpenModalMobile(row)
          }}
          options={{
            custom: true,
            totalSize: PageTotal,
            page: filters.Pi,
            sizePerPage: filters.Ps,
            alwaysShowAllBtns: true,
            onSizePerPageChange: sizePerPage => {
              setListData([])
              const Ps = sizePerPage
              setFilters({ ...filters, Ps: Ps })
            },
            onPageChange: page => {
              setListData([])
              const Pi = page
              setFilters({ ...filters, Pi: Pi })
            }
          }}
          columns={[
            {
              dataField: '',
              text: 'STT',
              formatter: (cell, row, rowIndex) => (
                <span className="font-number">
                  {filters.Ps * (filters.Pi - 1) + (rowIndex + 1)}
                </span>
              ),
              headerStyle: () => {
                return { width: '60px' }
              },
              headerAlign: 'center',
              style: { textAlign: 'center' },
              attrs: { 'data-title': 'STT' }
            },
            {
              dataField: 'Id',
              text: 'ID',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => <div>#{row.Id}</div>,
              attrs: { 'data-title': 'ID' },
              headerStyle: () => {
                return { minWidth: '100px', width: '100px' }
              }
            },
            {
              dataField: 'BookDate',
              text: 'Ngày đặt lịch',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) =>
                moment(row.BookDate).format('HH:mm DD/MM/YYYY'),
              attrs: { 'data-title': 'Ngày đặt lịch' },
              headerStyle: () => {
                return { minWidth: '150px', width: '150px' }
              }
            },
            {
              dataField: 'StockName',
              text: 'Cơ sở',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => row.StockName || 'Chưa có',
              attrs: { 'data-title': 'Cơ sở' },
              headerStyle: () => {
                return { minWidth: '200px', width: '200px' }
              }
            },
            {
              dataField: 'MemberName',
              text: 'Khách hàng',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => row.MemberName || 'Chưa có',
              attrs: { 'data-title': 'Khách hàng' },
              headerStyle: () => {
                return { minWidth: '200px', width: '200px' }
              }
            },
            {
              dataField: 'MemberPhone',
              text: 'Số điện thoại',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => row.MemberPhone || 'Chưa có',
              attrs: { 'data-title': 'Số điện thoại' },
              headerStyle: () => {
                return { minWidth: '200px', width: '200px' }
              }
            },
            {
              dataField: 'ProServiceName',
              text: 'Dịch vụ gốc',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) =>
                row.ProServiceName || 'Không có dịch vụ gốc',
              attrs: { 'data-title': 'Dịch vụ gốc' },
              headerStyle: () => {
                return { minWidth: '220px', width: '220px' }
              }
            },
            {
              dataField: 'Card',
              text: 'Thẻ',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => row.Card || 'Không có thẻ',
              attrs: { 'data-title': 'Thẻ' },
              headerStyle: () => {
                return { minWidth: '250px', width: '250px' }
              }
            },
            {
              dataField: 'SessionCost',
              text: 'Giá buổi',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => PriceHelper.formatVND(row.SessionCost),
              attrs: { 'data-title': 'Giá buổi' },
              headerStyle: () => {
                return { minWidth: '180px', width: '180px' }
              }
            },
            {
              dataField: 'SessionCostExceptGift',
              text: 'Giá buổi (Tặng)',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) =>
                PriceHelper.formatVND(row.SessionCostExceptGift),
              attrs: { 'data-title': 'Giá buổi (Tặng)' },
              headerStyle: () => {
                return { minWidth: '180px', width: '180px' }
              }
            },
            {
              dataField: 'SessionIndex',
              text: 'Buổi',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) =>
                row.Warranty ? row.SessionWarrantyIndex : row.SessionIndex,
              attrs: { 'data-title': 'Buổi' },
              headerStyle: () => {
                return { minWidth: '100px', width: '100px' }
              }
            },
            {
              dataField: 'Warranty',
              text: 'Bảo hành',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) =>
                row.Warranty ? 'Bảo hành' : 'Không có',
              attrs: { 'data-title': 'Bảo hành' },
              headerStyle: () => {
                return { minWidth: '120px', width: '120px' }
              }
            },
            {
              dataField: 'AddFeeTitles',
              text: 'Phụ phí',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) =>
                row.AddFeeTitles && row.AddFeeTitles.length > 0
                  ? row.AddFeeTitles.map((item, index) => (
                      <div key={index}>{removeName(item)} </div>
                    ))
                  : 'Không có',
              attrs: { 'data-title': 'Phụ phí' },
              headerStyle: () => {
                return { minWidth: '200px', width: '200px' }
              }
            },
            {
              dataField: 'Nhân viên thực hiện',
              text: 'Nhân viên thực hiện',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) =>
                row.Gender === 0 ? (
                  'Nam'
                ) : (
                  <>
                    {row.StaffSalaries && row.StaffSalaries.length > 0
                      ? row.StaffSalaries.map(
                          item =>
                            `${item.FullName} (${PriceHelper.formatVND(
                              item.Salary
                            )})`
                        ).join(', ')
                      : 'Chưa xác định'}
                  </>
                ),
              attrs: { 'data-title': 'Nhân viên thực hiện' },
              headerStyle: () => {
                return { minWidth: '200px', width: '200px' }
              }
            },
            {
              dataField: 'TotalSalary',
              text: 'Tổng lương nhân viên',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => PriceHelper.formatVND(row.TotalSalary),
              attrs: { 'data-title': 'Tổng lương NV' },
              headerStyle: () => {
                return { minWidth: '180px', width: '180px' }
              }
            },
            {
              dataField: 'Status',
              text: 'Trạng thái',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) =>
                row.Status === 'done' ? (
                  <span className="badge bg-success">Hoàn thành</span>
                ) : (
                  <span className="badge bg-warning">Đang thực hiện</span>
                ),
              attrs: { 'data-title': 'Trạng thái' },
              headerStyle: () => {
                return { minWidth: '150px', width: '150px' }
              }
            },
            {
              dataField: 'Rate',
              text: 'Đánh giá sao',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => row.Rate || 'Chưa đánh giá',
              attrs: { 'data-title': 'Đánh giá sao' },
              headerStyle: () => {
                return { minWidth: '150px', width: '150px' }
              }
            },
            {
              dataField: 'RateNote',
              text: 'Nội dung đánh giá',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => row.RateNote || 'Chưa có',
              attrs: { 'data-title': 'Nội dung đánh giá' },
              headerStyle: () => {
                return { minWidth: '180px', width: '180px' }
              }
            }
          ]}
          loading={loading}
          keyField="Id"
          className="table-responsive-attr"
          classes="table-bordered"
        />
      </div>
      <ModalViewMobile
        show={isModalMobile}
        onHide={HideModalMobile}
        data={initialValuesMobile}
      />
    </div>
  )
}

export default ListServices
