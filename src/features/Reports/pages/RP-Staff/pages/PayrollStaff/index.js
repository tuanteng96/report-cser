import React, { Fragment, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterList from 'src/components/Filter/FilterList'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import { PriceHelper } from 'src/helpers/PriceHelper'
import BaseTablesCustom from 'src/components/Tables/BaseTablesCustom'
import reportsApi from 'src/api/reports.api'
import { OverlayTrigger, Popover } from 'react-bootstrap'

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

const JSONData = {
  Total: 1,
  PCount: 1,
  Items: [
    {
      Id: 13597, // Id nhân viên
      StaffName: 'Nguyễn Tài Tuấn',
      StockName: 'Cser Hà Nội',
      Luong_Chinh_Sach: 10000000,
      Phu_Cap: 500000,
      Ngay_Nghi: -200000,
      Thuong: 200000,
      Phat: 300000,
      Luong_Ca: 4000000,
      Hoa_Hong: 600000,
      KPI_DoanhSo: 120000,
      Luong_Du_Kien: 9070000,
      Giu_Luong: 907000,
      Thuc_Tra_Du_Kien: 8163000,
      Tam_Ung: 0,
      Phai_Tra_Nhan_Vien: 8163000,
      Da_Tra: 8163000,
      Ton_Giu_luong: 0
    }
  ],
  SumTotal: {
    Luong_Chinh_Sach: 1000000,
    Phu_Cap: 1000000,
    Ngay_Nghi: 1000000,
    Thuong: 1000000,
    Phat: 1000000,
    Luong_Ca: 1000000,
    Hoa_Hong: 1000000,
    KPI_DoanhSo: 1000000,
    Luong_Du_Kien: 1000000,
    Giu_Luong: 1000000,
    Thuc_Tra_Du_Kien: 1000000,
    Tam_Ung: 1000000,
    Phai_Tra_Nhan_Vien: 1000000,
    Da_Tra: 1000000,
    Ton_Giu_Luong: 1000000
  }
}

function PayrollStaff(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    MonthDate: new Date(), // Ngày bắt đầu
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
      MonthDate: filters.MonthDate
        ? moment(filters.MonthDate).format('MM/yyyy')
        : null
    }
    reportsApi
      .getListStaffPayroll(newFilters)
      .then(({ data }) => {
        const { Items, Total, SumTotal } = {
          Items: data.result?.Items || JSONData.Items,
          Total: data.result?.Total || JSONData.Total,
          SumTotal: data.result?.SumTotal || JSONData.SumTotal
        }
        setListData(Items)
        setTotal(SumTotal)
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
                formatter: (cell, row) => `#${row.Id}`,
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
                formatter: (cell, row) => row?.StaffName || 'Chưa xác định',
                attrs: { 'data-title': 'Tên nhân viên' },
                headerStyle: () => {
                  return { minWidth: '220px', width: '220px' }
                }
              },
              {
                dataField: 'StockName',
                text: 'Cơ sở',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                attrs: { 'data-title': 'Cơ sở' },
                headerStyle: () => {
                  return { minWidth: '220px', width: '220px' }
                }
              },
              {
                dataField: 'Luong_Chinh_Sach',
                text: 'Lương chính sách',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVND(row.Luong_Chinh_Sach),
                attrs: { 'data-title': 'Lương chính sách' },
                headerStyle: () => {
                  return { minWidth: '160px', width: '160px' }
                },
                footer: 'Lương chính sách',
                footerFormatter: () => (
                  <span className="text-success font-size-md font-number">
                    {PriceHelper.formatVND(Total?.Luong_Chinh_Sach)}
                  </span>
                )
              },
              {
                dataField: 'Phu_Cap',
                text: 'Phụ cấp',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.Phu_Cap),
                attrs: { 'data-title': 'Phụ cấp' },
                headerStyle: () => {
                  return { minWidth: '145px', width: '145px' }
                },
                footer: 'Phụ cấp',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(Total?.Phu_Cap)}
                  </span>
                )
              },
              {
                dataField: 'Ngay_Nghi',
                text: 'Ngày nghỉ',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.Ngay_Nghi),
                attrs: { 'data-title': 'Ngày nghỉ' },
                headerStyle: () => {
                  return { minWidth: '145px', width: '145px' }
                },
                footer: 'Ngày nghỉ',
                footerFormatter: () => (
                  <span className="font-size-md text-danger font-number">
                    {PriceHelper.formatVND(Total?.Ngay_Nghi)}
                  </span>
                )
              },
              {
                dataField: 'Thuong',
                text: 'Thưởng',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.Thuong),
                attrs: { 'data-title': 'Thưởng' },
                headerStyle: () => {
                  return { minWidth: '145px', width: '145px' }
                },
                footer: 'Thưởng',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(Total?.Thuong)}
                  </span>
                )
              },
              {
                dataField: 'Phat',
                text: 'Phạt',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.Phat),
                attrs: { 'data-title': 'Phạt' },
                headerStyle: () => {
                  return { minWidth: '145px', width: '145px' }
                },
                footer: 'Phạt',
                footerFormatter: () => (
                  <span className="font-size-md text-danger font-number">
                    {PriceHelper.formatVND(Total?.Phat)}
                  </span>
                )
              },
              {
                dataField: 'Luong_Ca',
                text: 'Lương Ca',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.Luong_Ca),
                attrs: { 'data-title': 'Lương Ca' },
                headerStyle: () => {
                  return { minWidth: '145px', width: '145px' }
                },
                footer: 'Lương ca',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(Total?.Luong_Ca)}
                  </span>
                )
              },
              {
                dataField: 'Hoa_Hong',
                text: 'Hoa Hồng',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.Hoa_Hong),
                attrs: { 'data-title': 'Hoa Hồng' },
                headerStyle: () => {
                  return { minWidth: '145px', width: '145px' }
                },
                footer: 'Hoa hồng',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(Total?.Hoa_Hong)}
                  </span>
                )
              },
              {
                dataField: 'KPI_DoanhSo',
                text: 'KPI Doanh số',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVND(row.KPI_DoanhSo),
                attrs: { 'data-title': 'KPI Doanh số' },
                headerStyle: () => {
                  return { minWidth: '160px', width: '160px' }
                },
                footer: 'KPI Doanh số',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(Total?.KPI_DoanhSo)}
                  </span>
                )
              },
              {
                dataField: 'Luong_Du_Kien',
                text: 'Thu nhập dự kiến',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVND(row.Luong_Du_Kien),
                attrs: { 'data-title': 'Thu nhập dự kiến' },
                headerStyle: () => {
                  return { minWidth: '160px', width: '160px' }
                },
                footer: 'Thu nhập dự kiến',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(Total?.Luong_Du_Kien)}
                  </span>
                )
              },
              {
                dataField: 'Giu_Luong',
                text: 'Giữ lương',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.Giu_Luong),
                attrs: { 'data-title': 'Giữ lương' },
                headerStyle: () => {
                  return { minWidth: '145px', width: '145px' }
                },
                footer: 'Giữ lương',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(Total?.Giu_Luong)}
                  </span>
                )
              },
              {
                dataField: 'Thuc_Tra_Du_Kien',
                text: 'Thực trả dự kiến',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVND(row.Thuc_Tra_Du_Kien),
                attrs: { 'data-title': 'Thực trả dự kiến' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                },
                footer: 'Thực trả dự kiến',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(Total?.Thuc_Tra_Du_Kien)}
                  </span>
                )
              },
              {
                dataField: 'Tam_Ung',
                text: 'Tạm ứng',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.Tam_Ung),
                attrs: { 'data-title': 'Tạm ứng' },
                headerStyle: () => {
                  return { minWidth: '145px', width: '145px' }
                },
                footer: 'Tạm ứng',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(Total?.Tam_Ung)}
                  </span>
                )
              },
              {
                dataField: 'Phai_Tra_Nhan_Vien',
                text: 'Phải trả nhân viên',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVND(row.Phai_Tra_Nhan_Vien),
                attrs: { 'data-title': 'Phải trả nhân viên' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                },
                footer: 'Phải trả nhân viên',
                footerFormatter: () => (
                  <span className="font-size-md font-number text-success">
                    {PriceHelper.formatVND(Total?.Phai_Tra_Nhan_Vien)}
                  </span>
                )
              },
              {
                dataField: 'Da_Tra',
                text: 'Đã trả',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.Da_Tra),
                attrs: { 'data-title': 'Đã trả' },
                headerStyle: () => {
                  return { minWidth: '145px', width: '145px' }
                },
                footer: 'Đã trả',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(Total?.Da_Tra)}
                  </span>
                )
              },
              {
                dataField: 'Ton_Giu_Luong',
                text: 'Tồn giữ lương',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVND(row.Ton_Giu_Luong),
                attrs: { 'data-title': 'Tồn giữ lương' },
                headerStyle: () => {
                  return { minWidth: '145px', width: '145px' }
                },
                footer: 'Tồn giữ lương',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(Total?.Ton_Giu_Luong)}
                  </span>
                )
              }
            ]}
            loading={loading}
            keyField="Id"
            className="table-responsive-attr"
            classes="table-bordered"
            footerClasses="bg-light"
          />
        </div>
      </div>
    </div>
  )
}

export default PayrollStaff
