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
  const [loadingExport, setLoadingExport] = useState(false)
  const [ListData, setListData] = useState([])
  const [TotalList, setTotalList] = useState({})
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
      TagWL: filters.TagWL
        ? filters.TagWL.map(item => item.value).join(',')
        : ''
    }
  }

  const getListTotal = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    const newFilters = GeneralNewFilter(filters)
    reportsApi
      .getListTotalWallet(newFilters)
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
          setTotalList(data.result)
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

  const onExport = () => {
    setLoadingExport(true)
    const newFilters = GeneralNewFilter({ ...filters, Ps: 1000, Pi: 1 })
    reportsApi
      .getListTotalWallet(newFilters)
      .then(({ data }) => {
        window?.EzsExportExcel &&
          window?.EzsExportExcel({
            Url: '/khac/bao-cao-vi',
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
            Báo cáo ví
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
          <div className="fw-500 font-size-lg">Danh sách ví khách hàng</div>
        </div>
        <div className="p-20px">
          <BaseTablesCustom
            data={ListData}
            textDataNull="Không có dữ liệu."
            optionsMoible={{
              itemShow: 3,
              CallModal: row => OpenModalMobile(row),
              columns: [
                {
                  dataField: '#',
                  text: '...',
                  //headerAlign: "center",
                  //style: { textAlign: "center" },
                  formatter: (cell, row) => (
                    <button
                      type="button"
                      className="btn btn-primary btn-xs"
                      onClick={() => OpenModalDetail(row)}
                    >
                      Chi tiết
                    </button>
                  ),
                  attrs: { 'data-title': 'Sử dụng ví' },
                  headerStyle: () => {
                    return { minWidth: '150px', width: '150px' }
                  }
                }
              ],
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
                formatter: (cell, row) => PriceHelper.formatVND(row.TonTruoc),
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
                formatter: (cell, row) => PriceHelper.formatVND(row.NapVi),
                attrs: { 'data-title': 'Nạp ví' },
                headerStyle: () => {
                  return { minWidth: '160px', width: '160px' }
                },
                footer: 'Nạp ví',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(TotalList?.NapVi)}
                  </span>
                )
              },
              {
                dataField: 'TraTMTuVi',
                text: 'Trả tiền mặt từ ví',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.TraTMTuVi),
                attrs: { 'data-title': 'Trả tiền mặt từ ví' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                },
                footer: 'Trả tiền mặt từ ví',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(TotalList?.TraTMTuVi)}
                  </span>
                )
              },
              {
                dataField: 'KetThucLe',
                text: 'Kết thúc lẻ buổi hoàn ví',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.KetThucLe),
                attrs: { 'data-title': 'Kết thúc lẻ buổi hoàn ví' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                },
                footer: 'Kết thúc lẻ buổi hoàn ví',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(TotalList?.KetThucLe)}
                  </span>
                )
              },
              {
                dataField: 'HoanTienMuaHang',
                text: 'Hoàn tiền tích lũy (Mua hàng)',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVND(row.HoanTienMuaHang),
                attrs: { 'data-title': 'Hoàn tiền tích lũy (Mua hàng)' },
                headerStyle: () => {
                  return { minWidth: '230px', width: '230px' }
                },
                footer: 'Hoàn tiền tích lũy (Mua hàng)',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(TotalList?.HoanTienMuaHang)}
                  </span>
                )
              },
              {
                dataField: 'KhauTruTichLuy',
                text: 'Khấu trừ tích lũy (Trả hàng)',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVND(row.KhauTruTichLuy),
                attrs: { 'data-title': 'Khấu trừ tích lũy (Trả hàng)' },
                headerStyle: () => {
                  return { minWidth: '230px', width: '230px' }
                },
                footer: 'Khấu trừ tích lũy (Trả hàng)',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(TotalList?.KhauTruTichLuy)}
                  </span>
                )
              },
              {
                dataField: 'TraHangHoanVi',
                text: 'Trả hàng hoàn ví',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVND(row.TraHangHoanVi),
                attrs: { 'data-title': 'Trả hàng hoàn ví' },
                headerStyle: () => {
                  return { minWidth: '160px', width: '160px' }
                },
                footer: 'Trả hàng hoàn ví',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(TotalList?.TraHangHoanVi)}
                  </span>
                )
              },
              {
                dataField: 'HoaHongGT',
                text: 'Hoa hồng giới thiệu',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.HoaHongGT),
                attrs: { 'data-title': 'Hoa hồng giới thiệu' },
                headerStyle: () => {
                  return { minWidth: '160px', width: '160px' }
                },
                footer: 'Hoa hồng giới thiệu',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(TotalList?.HoaHongGT)}
                  </span>
                )
              },
              {
                dataField: 'KhauTruHoaHongGT',
                text: 'Khấu trừ hoa hồng giới thiệu',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVND(row.KhauTruHoaHongGT),
                headerStyle: () => {
                  return { minWidth: '230px', width: '230px' }
                },
                footer: 'Khấu trừ hoa hồng giới thiệu',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(TotalList?.KhauTruHoaHongGT)}
                  </span>
                )
              },
              {
                dataField: 'HoaHongChiaSeMaGiamGia',
                text: 'Hoa hồng chia sẻ mã giảm giá',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVND(row.HoaHongChiaSeMaGiamGia),
                attrs: { 'data-title': 'Hoa hồng chia sẻ mã giảm giá' },
                headerStyle: () => {
                  return { minWidth: '230px', width: '230px' }
                },
                footer: 'Hoa hồng chia sẻ mã giảm giá',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(TotalList?.HoaHongChiaSeMaGiamGia)}
                  </span>
                )
              },
              {
                dataField: 'KetThucTheHoanVi',
                text: 'Kết thúc thẻ hoàn ví',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVND(row.KetThucTheHoanVi),
                attrs: { 'data-title': 'Hoa hồng giới thiệu' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                },
                footer: 'Hoa hồng giới thiệu',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(TotalList?.KetThucTheHoanVi)}
                  </span>
                )
              },
              {
                dataField: 'TangDKDN',
                text: 'Tặng đăng ký đăng nhập',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.TangDKDN),
                attrs: { 'data-title': 'Tặng đăng ký đăng nhập' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                },
                footer: 'Tặng đăng ký đăng nhập',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(TotalList?.TangDKDN)}
                  </span>
                )
              },
              {
                dataField: 'TangSN',
                text: 'Tặng sinh nhật',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.TangSN),
                attrs: { 'data-title': 'Tặng sinh nhật' },
                headerStyle: () => {
                  return { minWidth: '160px', width: '160px' }
                },
                footer: 'Tặng sinh nhật',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(TotalList?.TangSN)}
                  </span>
                )
              },
              {
                dataField: 'ThanhToanDH',
                text: 'Thanh toán đơn hàng',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVND(row.ThanhToanDH),
                attrs: { 'data-title': 'Thanh toán đơn hàng' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                },
                footer: 'Thanh toán đơn hàng',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(TotalList?.ThanhToanDH)}
                  </span>
                )
              },
              {
                dataField: 'TonCuoiKy',
                text: 'Tồn tới thời gian lọc',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.TonCuoiKy),
                attrs: { 'data-title': 'Tồn tới thời gian lọc' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                },
                footer: 'Tồn tới thời gian lọc',
                footerFormatter: () => (
                  <span className="font-size-md font-number">
                    {PriceHelper.formatVND(TotalList?.TonCuoiKy)}
                  </span>
                )
              },
              {
                dataField: 'TonHienTai',
                text: 'Hiện tại',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.TonHienTai),
                attrs: { 'data-title': 'Hiện tại' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                },
                footer: 'Tồn hiện tại',
                footerFormatter: () => (
                  <span className="text-success font-size-md font-number">
                    {PriceHelper.formatVND(TotalList?.TonHienTai)}
                  </span>
                ),
                footerAttrs: (column, colIndex) => ({
                  colSpan: 2
                })
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
                }
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
