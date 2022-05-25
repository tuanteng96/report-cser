import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterList from 'src/components/Filter/FilterList'
import _ from 'lodash'

import moment from 'moment'
import 'moment/locale/vi'
import reportsApi from 'src/api/reports.api'
import BaseTablesCustom from 'src/components/Tables/BaseTablesCustom'
import { PriceHelper } from 'src/helpers/PriceHelper'
moment.locale('vi')

function ListCustomer(props) {
  const { CrStockID } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || ''
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    DateStart: new Date(), // Ngày bắt đầu
    DateEnd: new Date(), // Ngày kết thúc
    Pi: 1, // Trang hiện tại
    Ps: 10, // Số lượng item
    GroupCustomerID: '', // ID Nhóm khách hàng
    ProvincesID: '', // ID Thành phố
    DistrictsID: '', //ID Huyện
    SourceName: '', // ID Nguồn
    StaffID: ''
  })
  const [ListData, setListData] = useState([])
  const [isFilter, setIsFilter] = useState(false)
  const [loading, setLoading] = useState(false)
  const [PageTotal, setPageTotal] = useState(0)

  useEffect(() => {
    getListCustomer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListCustomer = (isLoading = true, callback) => {
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
      DistrictsID: filters.DistrictsID ? filters.DistrictsID.value : ''
    }
    reportsApi
      .getListCustomer(newFilters)
      .then(({ data }) => {
        const { Members, Total } = data.result
        setListData(Members)
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
      getListCustomer()
    } else {
      setFilters(values)
    }
  }

  return (
    <div className="bg-white rounded mt-25px">
      <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between">
        <div className="fw-500 font-size-lg">Danh sách khách hàng</div>
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
        loading={loading}
      />
      <div className="p-20px">
        <BaseTablesCustom
          data={ListData}
          textDataNull="Không có dữ liệu."
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
              dataField: 'CreateDate',
              text: 'Ngày tạo',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) =>
                moment(row.CreateDate).format('DD/MM/YYYY'),
              attrs: { 'data-title': 'Ngày tạo' },
              headerStyle: () => {
                return { minWidth: '120px', width: '120px' }
              }
            },
            {
              dataField: 'FullName',
              text: 'Tên khách hàng',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => (
                <div>
                  <span className="font-number text-muted font-size-xs mr-5px">
                    [#{row.Id}]
                  </span>
                  {row.FullName}
                </div>
              ),
              attrs: { 'data-title': 'Tên' },
              headerStyle: () => {
                return { minWidth: '250px', width: '250px' }
              }
            },
            {
              dataField: 'MobilePhone',
              text: 'Số điện thoại',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) =>
                row.MobilePhone || 'Không có số điện thoại',
              attrs: { 'data-title': 'Số điện thoại' },
              headerStyle: () => {
                return { minWidth: '150px', width: '150px' }
              }
            },
            {
              dataField: 'Email',
              text: 'Email',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => row.Email || 'Không có Email',
              attrs: { 'data-title': 'Email' },
              headerStyle: () => {
                return { minWidth: '150px', width: '150px' }
              }
            },
            {
              dataField: 'BirthDate',
              text: 'Ngày sinh',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) =>
                row.BirthDate
                  ? moment(row.BirthDate).format('DD/MM/YYYY')
                  : 'Không có',
              attrs: { 'data-title': 'Ngày sinh' },
              headerStyle: () => {
                return { minWidth: '120px', width: '120px' }
              }
            },
            {
              dataField: 'Gender',
              text: 'Giới tính',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) =>
                row.Gender === 0 ? (
                  'Nam'
                ) : (
                  <>{row.Gender === 1 ? 'Nữ' : 'Chưa xác định'}</>
                ),
              attrs: { 'data-title': 'Ngày sinh' },
              headerStyle: () => {
                return { minWidth: '100px', width: '100px' }
              }
            },
            {
              dataField: 'HomeAddress',
              text: 'Địa chỉ',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => row.HomeAddress || 'Không có',
              attrs: { 'data-title': 'Địa chỉ' },
              headerStyle: () => {
                return { minWidth: '200px', width: '200px' }
              }
            },
            {
              dataField: 'DistrictsName',
              text: 'Quận Huyện',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => row.DistrictsName || 'Không có',
              attrs: { 'data-title': 'Quận huyện' },
              headerStyle: () => {
                return { minWidth: '150px', width: '150px' }
              }
            },
            {
              dataField: 'ProvincesName',
              text: 'Tỉnh / Thành phố',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => row.ProvincesName || 'Không có',
              attrs: { 'data-title': 'Tỉnh / TP' },
              headerStyle: () => {
                return { minWidth: '150px', width: '150px' }
              }
            },
            {
              dataField: 'ByStockName',
              text: 'Cơ sở',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => row.ByStockName || 'Chưa có',
              attrs: { 'data-title': 'Cơ sở' },
              headerStyle: () => {
                return { minWidth: '180px', width: '180px' }
              }
            },
            {
              dataField: 'GroupCustomerName',
              text: 'Nhóm khách hàng',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => row.GroupCustomerName || 'Chưa có',
              attrs: { 'data-title': 'Nhóm khách hàng' },
              headerStyle: () => {
                return { minWidth: '180px', width: '180px' }
              }
            },
            {
              dataField: 'Source',
              text: 'Nguồn',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => row.Source || 'Chưa có',
              attrs: { 'data-title': 'Nguồn' },
              headerStyle: () => {
                return { minWidth: '100px', width: '100px' }
              }
            },
            {
              dataField: 'HandCardID',
              text: 'Mã thẻ',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => row.HandCardID || 'Chưa có',
              attrs: { 'data-title': 'Mã thẻ' },
              headerStyle: () => {
                return { minWidth: '180px', width: '180px' }
              }
            },
            {
              dataField: 'ByUserName',
              text: 'Nhân viên chăm sóc',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => row.ByUserName || 'Chưa có',
              attrs: { 'data-title': 'Nhân viên chăm sóc' },
              headerStyle: () => {
                return { minWidth: '150px', width: '150px' }
              }
            },
            {
              dataField: 'vi_dien_tu',
              text: 'Ví',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => PriceHelper.formatVND(row.vi_dien_tu),
              attrs: { 'data-title': 'Ví' },
              headerStyle: () => {
                return { minWidth: '150px', width: '150px' }
              }
            },
            {
              dataField: 'cong_no',
              text: 'Công nợ',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => PriceHelper.formatVND(row.cong_no),
              attrs: { 'data-title': 'Công nợ' },
              headerStyle: () => {
                return { minWidth: '100px', width: '100px' }
              }
            },
            {
              dataField: 'the_tien',
              text: 'Thẻ tiền',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => PriceHelper.formatVND(row.the_tien),
              attrs: { 'data-title': 'Thẻ tiền' },
              headerStyle: () => {
                return { minWidth: '100px', width: '100px' }
              }
            }
          ]}
          loading={loading}
          keyField="Id"
          className="table-responsive-attr"
          classes="table-bordered"
        />
      </div>
    </div>
  )
}

export default ListCustomer
