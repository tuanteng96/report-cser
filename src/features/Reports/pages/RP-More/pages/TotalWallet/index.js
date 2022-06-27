import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import FilterList from 'src/components/Filter/FilterList'
import BaseTablesCustom from 'src/components/Tables/BaseTablesCustom'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import reportsApi from 'src/api/reports.api'
import { PriceHelper } from 'src/helpers/PriceHelper'
import ModalViewMobile from './ModalViewMobile'
import ModalViewDetail from './ModalViewDetail'

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

const JSONData = {
  Total: 1,
  PCount: 1,
  Items: [
    {
      Id: 12372, // ID khách hàng
      FullName: 'Nguyễn Tài Tuấn',
      Phone: '0971021196',
      TonTruoc: 5000000,
      CongTrongKy: 2000000,
      TruTrongKy: 1000000,
      TonCuoiKy: 1000000,
      TonHienTai: 3000000
    }
  ]
}

const JSONDataDetail = {
  Total: 1,
  PCount: 1,
  Items: [
    {
      Id: 1237,
      CreateDate: '2022-06-21T16:59:43.113',
      TotalValue: 10000000,
      Tag: 'NAP_VI',
      StockName: 'Cser Hà Nội',
      Content: 'Nội dung'
    }
  ]
}

function TotalWallet(props) {
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
    MemberID: '',
    TagWL: ''
  })
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ListData, setListData] = useState([])
  const [TotalList, setTotalList] = useState({
    TonCuoiKy: 0,
    TonHienTai: 0,
    TonTruoc: 0
  })
  const [PageTotal, setPageTotal] = useState(0)
  const [initialValuesMobile, setInitialValuesMobile] = useState(null)
  const [isModalMobile, setIsModalMobile] = useState(false)
  const [initialValuesDetail, setInitialValuesDetail] = useState(null)
  const [isModalDetail, setIsModalDetail] = useState(false)

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
    getListTotal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListTotal = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    const newFilters = {
      ...filters,
      DateStart: filters.DateStart
        ? moment(filters.DateStart).format('DD/MM/yyyy')
        : null,
      DateEnd: filters.DateEnd
        ? moment(filters.DateEnd).format('DD/MM/yyyy')
        : null,
      TagWL: filters.TagWL
        ? filters.TagWL.map(item => item.value).join(',')
        : ''
    }
    reportsApi
      .getListTotalWallet(newFilters)
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const { Items, Total, TonCuoiKy, TonHienTai, TonTruoc } = {
            Items: data.result?.Items || [],
            Total: data.result?.Total || 0,
            TonCuoiKy: data.result?.TonCuoiKy || 0,
            TonHienTai: data.result?.TonHienTai || 0,
            TonTruoc: data.result?.TonTruoc || 0
          }
          setListData(Items)
          setTotalList({ TonCuoiKy, TonHienTai, TonTruoc })
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
      onRefresh()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    getListTotal()
  }

  const OpenModalMobile = value => {
    setInitialValuesMobile(value)
    setIsModalMobile(true)
  }

  const HideModalMobile = () => {
    setInitialValuesMobile(null)
    setIsModalMobile(false)
  }

  const OpenModalDetail = value => {
    setInitialValuesDetail(value)
    setIsModalDetail(true)
  }

  const HideModalDetail = () => {
    setInitialValuesDetail(null)
    setIsModalDetail(false)
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Tổng tiền ví khách hàng
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
          <div className="fw-500 font-size-lg">Danh sách ví khách hàng</div>
        </div>
        <div className="p-20px">
          <BaseTablesCustom
            data={ListData}
            textDataNull="Không có dữ liệu."
            optionsMoible={{
              itemShow: 3,
              CallModal: row => OpenModalMobile(row),
              tfoot: {
                Title: 'Tổng',
                CallModal: () => OpenModalMobile({ ...TotalList, TypeOf: true })
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
                  colSpan: 3
                }),
                footerStyle: {
                  textAlign: 'center'
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
                  return { minWidth: '200px', width: '200px' }
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
                  return { minWidth: '200px', width: '200px' }
                }
              },
              {
                dataField: 'TonTruoc',
                text: 'Tồn trước',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVNDPositive(row.TonTruoc),
                attrs: { 'data-title': 'Tồn trước' },
                headerStyle: () => {
                  return { minWidth: '160px', width: '150px' }
                },
                footer: 'Tồn trước',
                footerFormatter: () => (
                  <span className="text-success font-size-md font-number">
                    {PriceHelper.formatVND(TotalList?.TonTruoc)}
                  </span>
                )
              },
              {
                dataField: 'NapVi',
                text: 'Nạp ví',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVNDPositive(row.NapVi),
                attrs: { 'data-title': 'Nạp ví' },
                headerStyle: () => {
                  return { minWidth: '160px', width: '160px' }
                },
                footer: '',
                footerAttrs: (column, colIndex) => ({
                  colSpan: 15
                })
              },
              {
                dataField: 'TraTMTuVi',
                text: 'Trả tiền mặt từ ví',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVNDPositive(row.TraTMTuVi),
                attrs: { 'data-title': 'Trả tiền mặt từ ví' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'KetThucLe',
                text: 'Kết thúc lẻ buổi hoàn ví',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVNDPositive(row.KetThucLe),
                attrs: { 'data-title': 'Kết thúc lẻ buổi hoàn ví' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                }
              },
              {
                dataField: 'HoanTienMuaHang',
                text: 'Hoàn tiền tích lũy (Mua hàng)',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVNDPositive(row.HoanTienMuaHang),
                attrs: { 'data-title': 'Hoàn tiền tích lũy (Mua hàng)' },
                headerStyle: () => {
                  return { minWidth: '230px', width: '230px' }
                }
              },
              {
                dataField: 'KhauTruTichLuy',
                text: 'Khấu trừ tích lũy (Trả hàng)',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVNDPositive(row.KhauTruTichLuy),
                attrs: { 'data-title': 'Khấu trừ tích lũy (Trả hàng)' },
                headerStyle: () => {
                  return { minWidth: '230px', width: '230px' }
                }
              },
              {
                dataField: 'TraHangHoanVi',
                text: 'Trả hàng hoàn ví',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVNDPositive(row.TraHangHoanVi),
                attrs: { 'data-title': 'Trả hàng hoàn ví' },
                headerStyle: () => {
                  return { minWidth: '160px', width: '160px' }
                }
              },
              {
                dataField: 'HoaHongGT',
                text: 'Hoa hồng giới thiệu',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVNDPositive(row.HoaHongGT),
                attrs: { 'data-title': 'Hoa hồng giới thiệu' },
                headerStyle: () => {
                  return { minWidth: '160px', width: '160px' }
                }
              },
              {
                dataField: 'KhauTruHoaHongGT',
                text: 'Khấu trừ hoa hồng giới thiệu',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVNDPositive(row.KhauTruHoaHongGT),
                headerStyle: () => {
                  return { minWidth: '230px', width: '230px' }
                }
              },
              {
                dataField: 'HoaHongChiaSeMaGiamGia',
                text: 'Hoa hồng chia sẻ mã giảm giá',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVNDPositive(row.HoaHongChiaSeMaGiamGia),
                attrs: { 'data-title': 'Hoa hồng chia sẻ mã giảm giá' },
                headerStyle: () => {
                  return { minWidth: '230px', width: '230px' }
                }
              },
              {
                dataField: 'KetThucTheHoanVi',
                text: 'Kết thúc thẻ hoàn ví',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVNDPositive(row.KetThucTheHoanVi),
                attrs: { 'data-title': 'Kết thúc thẻ hoàn ví' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'TangDKDN',
                text: 'Tặng đăng ký đăng nhập',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVNDPositive(row.TangDKDN),
                attrs: { 'data-title': 'Tặng đăng ký đăng nhập' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                }
              },
              {
                dataField: 'TangSN',
                text: 'Tặng sinh nhật',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVNDPositive(row.TangSN),
                attrs: { 'data-title': 'Tặng sinh nhật' },
                headerStyle: () => {
                  return { minWidth: '160px', width: '160px' }
                }
              },
              {
                dataField: 'ThanhToanDH',
                text: 'Thanh toán đơn hàng',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVNDPositive(row.ThanhToanDH),
                attrs: { 'data-title': 'Thanh toán đơn hàng' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'PhiDV',
                text: 'Phí dịch vụ',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVNDPositive(row.PhiDV),
                attrs: { 'data-title': 'Phí dịch vụ' },
                headerStyle: () => {
                  return { minWidth: '160px', width: '160px' }
                }
              },
              {
                dataField: 'Birthday',
                text: 'Tồn tới thời gian lọc',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVNDPositive(0),
                attrs: { 'data-title': 'Tồn tới thời gian lọc' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'TonHienTai',
                text: 'Hiện tại',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVNDPositive(row.TonHienTai),
                attrs: { 'data-title': 'Hiện tại' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                },
                footer: 'Tồn hiện tại',
                footerFormatter: () => (
                  <span className="text-success font-size-md font-number">
                    {PriceHelper.formatVND(TotalList?.TonHienTai)}
                  </span>
                )
              },
              {
                dataField: '#',
                text: '#',
                headerAlign: 'center',
                style: { textAlign: 'center' },
                formatter: (cell, row) => (
                  <button
                    type="button"
                    className="btn btn-primary btn-xs"
                    onClick={() => OpenModalDetail(row)}
                  >
                    Chi tiết ví
                  </button>
                ),
                attrs: { 'data-title': '#' },
                headerStyle: () => {
                  return { minWidth: '120px', width: '120px' }
                },
                footer: ''
              }
            ]}
            loading={loading}
            keyField="Id"
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
        <ModalViewDetail
          show={isModalDetail}
          onHide={HideModalDetail}
          Member={initialValuesDetail}
        />
      </div>
    </div>
  )
}

export default TotalWallet
