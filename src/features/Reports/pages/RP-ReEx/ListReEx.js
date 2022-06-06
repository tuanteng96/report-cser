import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import _ from 'lodash'
import FilterList from 'src/components/Filter/FilterList'
import reportsApi from 'src/api/reports.api'
import BaseTablesCustom from 'src/components/Tables/BaseTablesCustom'
import { PriceHelper } from 'src/helpers/PriceHelper'
import ModalViewMobile from './ModalViewMobile'

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

const JSONData = {
  Total: 1,
  PCount: 1,
  Items: [
    {
      Id: 1,
      CreateDate: '2022-06-03T14:11:39',
      TM: 4000000,
      CK: 2000000,
      QT: 1000000,
      Tag: 'Thu',
      Content: 'Tiền của chị',
      StockName: 'Cser Hà Nội',
      Staff: {
        ID: 1,
        FullName: 'Admin'
      },
      Member: {
        ID: 2,
        FullName: 'Nguyễn Tài Tuấn'
      }
    },
    {
      Id: 2,
      CreateDate: '2022-06-03T14:11:39',
      TM: 4000000,
      CK: 2000000,
      QT: 1000000,
      Tag: 'Thu',
      Content: 'Tiền của chị',
      StockName: 'Cser Hà Nội',
      Staff: {
        ID: 1,
        FullName: 'Admin'
      },
      Member: {
        ID: 2,
        FullName: 'Nguyễn Tài Tuấn'
      }
    }
  ]
}

function ListReEx(props) {
  const { CrStockID } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || ''
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    DateStart: new Date(), // Ngày bắt đầu
    DateEnd: new Date(), // Ngày kết thúc
    Pi: 1, // Trang hiện tại
    Ps: 10, // Số lượng item
    PaymentMethods: '', // TM, CK, QT
    TypeTC: '', // Thu hay chi
    TagsTC: '' // ID nhân viên
  })
  const [ListData, setListData] = useState([])
  const [isFilter, setIsFilter] = useState(false)
  const [loading, setLoading] = useState(false)
  const [PageTotal, setPageTotal] = useState(0)
  const [initialValuesMobile, setInitialValuesMobile] = useState(null)
  const [isModalMobile, setIsModalMobile] = useState(false)

  useEffect(() => {
    getListReEx()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListReEx = (isLoading = true, callback) => {
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
      PaymentMethods: filters.GroupCustomerID
        ? filters.GroupCustomerID.value
        : '',
      Type: filters.SourceName ? filters.SourceName.value : '',
      Tags: filters.ProvincesID ? filters.ProvincesID.value : ''
    }
    reportsApi
      .getOverviewReEx(newFilters)
      .then(({ data }) => {
        const { Items, Total } = data.result || JSONData
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
      getListReEx()
    } else {
      setFilters(values)
    }
  }

  const onRefresh = () => {
    getListReEx()
  }

  const OpenModalMobile = value => {
    setInitialValuesMobile(value)
    setIsModalMobile(true)
  }

  const HideModalMobile = () => {
    setInitialValuesMobile(null)
    setIsModalMobile(false)
  }

  return (
    <div className="bg-white rounded mt-25px">
      <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between">
        <div className="fw-500 font-size-lg">Danh sách thu chi & sổ quỹ</div>
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
              dataField: 'CreateDate',
              text: 'Ngày',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) =>
                moment(row.CreateDate).format('HH:mm DD/MM/YYYY'),
              attrs: { 'data-title': 'Ngày' },
              headerStyle: () => {
                return { minWidth: '150px', width: '150px' }
              }
            },
            {
              dataField: 'TM',
              text: 'Tiền mặt',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => PriceHelper.formatVND(row.TM),
              attrs: { 'data-title': 'Tiền mặt' },
              headerStyle: () => {
                return { minWidth: '180px', width: '180px' }
              }
            },
            {
              dataField: 'CK',
              text: 'Chuyển khoản',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => PriceHelper.formatVND(row.CK),
              attrs: { 'data-title': 'Chuyển khoản' },
              headerStyle: () => {
                return { minWidth: '180px', width: '180px' }
              }
            },
            {
              dataField: 'QT',
              text: 'Quẹt thẻ',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => PriceHelper.formatVND(row.QT),
              attrs: { 'data-title': 'Quẹt thẻ' },
              headerStyle: () => {
                return { minWidth: '180px', width: '180px' }
              }
            },
            {
              dataField: 'Tag',
              text: 'Tag',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => row.Tag,
              attrs: { 'data-title': 'Tag' },
              headerStyle: () => {
                return { minWidth: '180px', width: '180px' }
              }
            },
            {
              dataField: 'Content',
              text: 'Nội dung',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => row.Content || 'Không có nội dung',
              attrs: { 'data-title': 'Nội dung' },
              headerStyle: () => {
                return { minWidth: '200px', width: '200px' }
              }
            },
            {
              dataField: 'StockName',
              text: 'Cơ sở',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => row.StockName || 'Tất cả cơ sở',
              attrs: { 'data-title': 'Cơ sở' },
              headerStyle: () => {
                return { minWidth: '200px', width: '200px' }
              }
            },
            {
              dataField: 'Member',
              text: 'Khách hàng',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) =>
                row.Member
                  ? `${row.Member.FullName} (#${row.Member.ID})`
                  : 'Chưa xác định',
              attrs: { 'data-title': 'Khách hàng' },
              headerStyle: () => {
                return { minWidth: '220px', width: '220px' }
              }
            },
            {
              dataField: 'Staff',
              text: 'Nhân viên tạo',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) =>
                row.Staff
                  ? `${row.Staff.FullName} (#${row.Staff.ID})`
                  : 'Chưa xác định',
              attrs: { 'data-title': 'Nhân viên tạo' },
              headerStyle: () => {
                return { minWidth: '220px', width: '220px' }
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

export default ListReEx
