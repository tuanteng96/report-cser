import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import FilterList from 'src/components/Filter/FilterList'
import BaseTablesCustom from 'src/components/Tables/BaseTablesCustom'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import reportsApi from 'src/api/reports.api'
import ModalViewMobile from './ModalViewMobile'

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

function BirthdayCustomer(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    DateStart: new Date(), // Ngày bắt đầu
    DateEnd: new Date(), // Ngày kết thúc
    Pi: 1, // Trang hiện tại
    Ps: 15 // Số lượng item
  })
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ListData, setListData] = useState([])
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
        : null
    }
    reportsApi
      .getListBirthdayCustomer(newFilters)
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const { Items, Total } = {
            Items: data.result?.Items || [],
            Total: data.result?.Total || 0
          }
          setListData(Items)
          setLoading(false)
          setPageTotal(Total)
          isFilter && setIsFilter(false)
          callback && callback()
          PermissionHelpers.HideErrorAccess()
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
      onRefresh()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    getListCustomer()
  }

  const OpenModalMobile = value => {
    setInitialValuesMobile(value)
    setIsModalMobile(true)
  }

  const HideModalMobile = () => {
    setInitialValuesMobile(null)
    setIsModalMobile(false)
  }

  const rowStyle = (row, rowIndex) => {
    const styles = {}
    const DateBirth = moment(row.Birthday).format('DD/MM')
    const DateCurrent = moment().format('DD/MM')
    if (DateBirth === DateCurrent) {
      styles.backgroundColor = 'rgb(255 160 160)'
    }
    return styles
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Khách hàng sinh nhật
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
      <div className="bg-white rounded">
        <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between">
          <div className="fw-500 font-size-lg">Danh sách khách hàng</div>
        </div>
        <div className="p-20px">
          <BaseTablesCustom
            data={ListData}
            textDataNull="Không có dữ liệu."
            optionsMoible={{
              itemShow: 2,
              CallModal: row => OpenModalMobile(row),
              columns: [
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
                  dataField: 'MemberName',
                  text: 'Khách hàng',
                  //headerAlign: "center",
                  //style: { textAlign: "center" },
                  formatter: (cell, row) => row.MemberName || 'Không có tên',
                  attrs: { 'data-title': 'Khách hàng' },
                  headerStyle: () => {
                    return { minWidth: '200px', width: '200px' }
                  }
                }
              ]
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
                setFilters({ ...filters, Ps: Ps, Pi: 1 })
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
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'FullName',
                text: 'Tên khách hàng',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.FullName || 'Chưa có',
                attrs: { 'data-title': 'Tên khách hàng' },
                headerStyle: () => {
                  return { minWidth: '250px', width: '250px' }
                }
              },
              {
                dataField: 'Phone',
                text: 'Số điện thoại',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.Phone || 'Chưa có',
                attrs: { 'data-title': 'Số điện thoại' },
                headerStyle: () => {
                  return { minWidth: '250px', width: '250px' }
                }
              },
              {
                dataField: 'Birthday',
                text: 'Ngày sinh',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  moment(row.Birthday).format('HH:mm DD/MM/YYYY'),
                attrs: { 'data-title': 'Ngày sinh' },
                headerStyle: () => {
                  return { minWidth: '250px', width: '250px' }
                }
              },
              {
                dataField: 'Gender',
                text: 'Giới tính',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => (row?.Gender === 0 ? 'Nam' : 'Nữ'),
                attrs: { 'data-title': 'Giới tính' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                }
              }
            ]}
            loading={loading}
            keyField="Id"
            className="table-responsive-attr"
            classes="table-bordered"
            rowStyle={rowStyle}
          />
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

export default BirthdayCustomer
