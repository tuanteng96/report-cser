import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterList from 'src/components/Filter/FilterList'
import _ from 'lodash'

import moment from 'moment'
import 'moment/locale/vi'
import reportsApi from 'src/api/reports.api'
import BaseTablesCustom from 'src/components/Tables/BaseTablesCustom'
moment.locale('vi')

function ListCustomer(props) {
  const { CrStockID } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || ''
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    DateStart: '', // Ngày bắt đầu
    DateEnd: '', // Ngày kết thúc
    Pi: 1, // Trang hiện tại
    Ps: 10, // Số lượng item
    GroupCustomerID: '', // ID Nhóm khách hàng
    ProvincesID: '', // ID Thành phố
    DistrictsID: '', //ID Huyện
    SourceName: '', // ID Nguồn
    StaffID: ''
  })
  const [isFilter, setIsFilter] = useState(false)
  const [loading, setLoading] = useState(false)
  const [PageTotal, setPageTotal] = useState(2)

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
        : '',
      DateEnd: filters.DateEnd
        ? moment(filters.DateEnd).format('DD/MM/yyyy')
        : '',
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
        setLoading(false)
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
          data={[
            {
              ID: 1,
              FullName: 'Nguyễn Tài Tuấn',
              Phone: '0971021196',
              CreateDate: '25/06/2022'
            },
            {
              ID: 2,
              FullName: 'Nguyễn Tài Tuấn',
              Phone: '0971021196',
              CreateDate: '25/06/2022'
            }
          ]}
          textDataNull="Không có dữ liệu."
          options={{
            custom: true,
            totalSize: PageTotal,
            page: filters.Pi,
            sizePerPage: filters.Ps,
            alwaysShowAllBtns: true,
            onSizePerPageChange: sizePerPage => {
              //setListCurriculum([])
              const Ps = sizePerPage
              setFilters({ ...filters, Pi: Ps })
            },
            onPageChange: page => {
              //setListCurriculum([])
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
              dataField: 'FullName',
              text: 'Tên khách hàng',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              attrs: { 'data-title': 'Tên' },
              headerStyle: () => {
                return { minWidth: '250px', width: '250px' }
              }
            },
            {
              dataField: 'Phone',
              text: 'Số điện thoại',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              attrs: { 'data-title': 'Số điện thoại' },
              headerStyle: () => {
                return { minWidth: '100px', width: '100px' }
              }
            }
          ]}
          loading={loading}
          keyField="ID"
          className="table-responsive-attr"
          classes="table-bordered"
        />
      </div>
    </div>
  )
}

export default ListCustomer
