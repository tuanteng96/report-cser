import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterList from 'src/components/Filter/FilterList'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import { PriceHelper } from 'src/helpers/PriceHelper'
import BaseTablesCustom from 'src/components/Tables/BaseTablesCustom'
import reportsApi from 'src/api/reports.api'
import ModalViewMobile from './ModalViewMobile'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

function PayrollStaff(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    Mon: new Date(), // Ngày bắt đầu
    Pi: 1, // Trang hiện tại
    Ps: 10 // Số lượng item
  })
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ListData, setListData] = useState([])
  const [Total, setTotal] = useState({})
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
    getListPayroll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListPayroll = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    const newFilters = {
      ...filters,
      Mon: filters.Mon ? moment(filters.Mon).format('MM/yyyy') : null
    }
    reportsApi
      .getListStaffPayroll(newFilters)
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const { Items, Total, SumTotal } = {
            Items: data.result?.Items || [],
            Total: data.result?.Total || 0,
            SumTotal: data.result?.Sum || {}
          }
          setListData(Items)
          setTotal({ ...Total, ...SumTotal })
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
      getListPayroll()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    getListPayroll()
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
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Bảng lương nhân viên
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
          <div className="fw-500 font-size-lg">Danh sách nhân viên</div>
        </div>
        <div className="p-20px">
          <BaseTablesCustom
            data={ListData}
            textDataNull="Không có dữ liệu."
            optionsMoible={{
              itemShow: 5,
              CallModal: row => OpenModalMobile(row),
              tfoot: {
                Title: 'Tổng lương',
                CallModal: () => OpenModalMobile({ ...Total, TypeOf: true })
              }
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
                attrs: { 'data-title': 'STT' },
                footer: 'Tổng',
                footerAttrs: (column, colIndex) => ({
                  colSpan: 4
                }),
                footerStyle: {
                  textAlign: 'center'
                }
              },
              {
                dataField: 'Id',
                text: 'ID',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => `#${row.Staff?.ID}`,
                attrs: { 'data-title': 'ID' },
                headerStyle: () => {
                  return { minWidth: '100px', width: '100px' }
                }
              },
              {
                dataField: 'StaffName',
                text: 'Tên nhân viên',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  row?.Staff?.FullName || 'Chưa xác định',
                attrs: { 'data-title': 'Tên nhân viên' },
                headerStyle: () => {
                  return { minWidth: '220px', width: '220px' }
                }
              },
              {
                dataField: 'DiemQL',
                text: 'Cơ sở',
                formatter: (cell, row) =>
                  row?.DiemQL && row?.DiemQL.length > 0
                    ? row?.DiemQL.map(stock => stock.StockTitle).join(', ')
                    : 'Chưa xác định',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                attrs: { 'data-title': 'Cơ sở' },
                headerStyle: () => {
                  return { minWidth: '220px', width: '220px' }
                }
              },
              {
                dataField: 'LUONG_CAU_HINH',
                text: 'Lương chính sách',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVND(row.LUONG_CAU_HINH),
                attrs: { 'data-title': 'Lương chính sách' },
                headerStyle: () => {
                  return { minWidth: '160px', width: '160px' }
                },
                footer: 'Lương chính sách',
                footerFormatter: () => (
                  <span className="text-success font-size-md font-number">
                    {PriceHelper.formatVND(Total?.LUONG_CAU_HINH)}
                  </span>
                )
              },
              {
                dataField: 'PHU_CAP',
                text: 'Phụ cấp',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.PHU_CAP),
                attrs: { 'data-title': 'Phụ cấp' },
                headerStyle: () => {
                  return { minWidth: '145px', width: '145px' }
                },
                footer: 'Phụ cấp',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(Total?.PHU_CAP)}
                  </span>
                )
              },
              {
                dataField: 'TRU_NGAY_NGHI',
                text: 'Ngày nghỉ',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVND(row.TRU_NGAY_NGHI),
                attrs: { 'data-title': 'Ngày nghỉ' },
                headerStyle: () => {
                  return { minWidth: '145px', width: '145px' }
                },
                footer: 'Ngày nghỉ',
                footerFormatter: () => (
                  <span className="font-size-md text-danger font-number">
                    {PriceHelper.formatVND(Total?.TRU_NGAY_NGHI)}
                  </span>
                )
              },
              {
                dataField: 'THUONG',
                text: 'Thưởng',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.THUONG),
                attrs: { 'data-title': 'Thưởng' },
                headerStyle: () => {
                  return { minWidth: '145px', width: '145px' }
                },
                footer: 'Thưởng',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(Total?.THUONG)}
                  </span>
                )
              },
              {
                dataField: 'TRU_PHAT',
                text: 'Phạt',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.TRU_PHAT),
                attrs: { 'data-title': 'Phạt' },
                headerStyle: () => {
                  return { minWidth: '145px', width: '145px' }
                },
                footer: 'Phạt',
                footerFormatter: () => (
                  <span className="font-size-md text-danger font-number">
                    {PriceHelper.formatVND(Total?.TRU_PHAT)}
                  </span>
                )
              },
              {
                dataField: 'LUONG_CA',
                text: 'Lương Ca',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.LUONG_CA),
                attrs: { 'data-title': 'Lương Ca' },
                headerStyle: () => {
                  return { minWidth: '145px', width: '145px' }
                },
                footer: 'Lương ca',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(Total?.LUONG_CA)}
                  </span>
                )
              },
              {
                dataField: 'HOA_HONG',
                text: 'Hoa Hồng',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.HOA_HONG),
                attrs: { 'data-title': 'Hoa Hồng' },
                headerStyle: () => {
                  return { minWidth: '145px', width: '145px' }
                },
                footer: 'Hoa hồng',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(Total?.HOA_HONG)}
                  </span>
                )
              },
              {
                dataField: 'KPI_Hoa_hong',
                text: 'KPI Doanh số',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVND(row.KPI_Hoa_hong),
                attrs: { 'data-title': 'KPI Doanh số' },
                headerStyle: () => {
                  return { minWidth: '160px', width: '160px' }
                },
                footer: 'KPI Doanh số',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(Total?.KPI_Hoa_hong)}
                  </span>
                )
              },
              {
                dataField: 'LUONG_DU_KIEN',
                text: 'Thu nhập dự kiến',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVND(row.LUONG_DU_KIEN),
                attrs: { 'data-title': 'Thu nhập dự kiến' },
                headerStyle: () => {
                  return { minWidth: '160px', width: '160px' }
                },
                footer: 'Thu nhập dự kiến',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(Total?.LUONG_DU_KIEN)}
                  </span>
                )
              },
              {
                dataField: 'GIU_LUONG',
                text: 'Giữ lương',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.GIU_LUONG),
                attrs: { 'data-title': 'Giữ lương' },
                headerStyle: () => {
                  return { minWidth: '145px', width: '145px' }
                },
                footer: 'Giữ lương',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(Total?.GIU_LUONG)}
                  </span>
                )
              },
              {
                dataField: 'THUC_TRA_DU_KIEN',
                text: 'Thực trả dự kiến',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVND(row.THUC_TRA_DU_KIEN),
                attrs: { 'data-title': 'Thực trả dự kiến' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                },
                footer: 'Thực trả dự kiến',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(Total?.THUC_TRA_DU_KIEN)}
                  </span>
                )
              },
              {
                dataField: 'TAM_UNG',
                text: 'Tạm ứng',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVND(row.TAM_UNG - row.HOAN_UNG),
                attrs: { 'data-title': 'Tạm ứng' },
                headerStyle: () => {
                  return { minWidth: '145px', width: '145px' }
                },
                footer: 'Tạm ứng',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(Total?.TAM_UNG - Total?.HOAN_UNG)}
                  </span>
                )
              },
              {
                dataField: 'Phai_Tra_Nhan_Vien',
                text: 'Phải trả nhân viên',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVND(
                    row.THUC_TRA_DU_KIEN - (row.TAM_UNG - row.HOAN_UNG)
                  ),
                attrs: { 'data-title': 'Phải trả nhân viên' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                },
                footer: 'Phải trả nhân viên',
                footerFormatter: () => (
                  <span className="font-size-md font-number text-success">
                    {PriceHelper.formatVND(
                      Total?.THUC_TRA_DU_KIEN -
                        (Total?.TAM_UNG - Total?.HOAN_UNG)
                    )}
                  </span>
                )
              },
              {
                dataField: 'DA_TRA',
                text: 'Đã trả',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.DA_TRA),
                attrs: { 'data-title': 'Đã trả' },
                headerStyle: () => {
                  return { minWidth: '145px', width: '145px' }
                },
                footer: 'Đã trả',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(Total?.DA_TRA)}
                  </span>
                )
              },
              {
                dataField: 'TON_GIU_LUONG',
                text: 'Tồn giữ lương',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVND(row.TON_GIU_LUONG),
                attrs: { 'data-title': 'Tồn giữ lương' },
                headerStyle: () => {
                  return { minWidth: '145px', width: '145px' }
                },
                footer: 'Tồn giữ lương',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(Total?.TON_GIU_LUONG)}
                  </span>
                )
              }
            ]}
            loading={loading}
            keyField="Staff.ID"
            className="table-responsive-attr"
            classes="table-bordered"
            footerClasses="bg-light"
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

export default PayrollStaff
