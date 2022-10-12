import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import FilterList from 'src/components/Filter/FilterList'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import reportsApi from 'src/api/reports.api'
import { PriceHelper } from 'src/helpers/PriceHelper'
import ModalViewMobile from './ModalViewMobile'
import ModalViewDetail from './ModalViewDetail'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'
import clsx from 'clsx'

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
    Ps: 15, // Số lượng item
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
  const [pageCount, setPageCount] = useState(0)
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
    reportsApi
      .getListTotalWallet(BrowserHelpers.getRequestParamsList(filters))
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const { Items, Total, PCount } = {
            Items: data.result?.Items || [],
            Total: data.result?.Total || 0,
            PCount: data?.result?.PCount || 0
          }
          setListData(Items)
          setTotalList(data.result)
          setLoading(false)
          setPageTotal(Total)
          setPageCount(PCount)
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
    getListTotal()
  }

  const onExport = () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getListTotalWallet(
          BrowserHelpers.getRequestParamsList(filters, {
            Total: PageTotal
          })
        ),
      UrlName: '/khac/bao-cao-vi'
    })
  }

  const onPagesChange = ({ Pi, Ps }) => {
    setFilters({ ...filters, Pi, Ps })
  }

  const columns = useMemo(
    () => [
      {
        key: 'index',
        title: 'STT',
        dataKey: 'index',
        cellRenderer: ({ rowIndex }) =>
          filters.Ps * (filters.Pi - 1) + (rowIndex + 1),
        width: 60,
        sortable: false,
        align: 'center',
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'FullName',
        title: 'Tên khách hàng',
        dataKey: 'FullName',
        width: 250,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Phone',
        title: 'Số điện thoại',
        dataKey: 'Phone',
        width: 200,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'TonTruoc',
        title: 'Tồn trước',
        dataKey: 'TonTruoc',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.TonTruoc),
        width: 160,
        sortable: false,
        footerRenderer: () => (
          <span className="text-success font-size-md font-number">
            {PriceHelper.formatVND(TotalList?.TonTruoc)}
          </span>
        )
      },
      {
        key: 'NapVi',
        title: 'Nạp ví',
        dataKey: 'NapVi',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.NapVi),
        width: 160,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(TotalList?.NapVi)}
          </span>
        )
      },
      {
        key: 'TraTMTuVi',
        title: 'Trả tiền mặt từ ví',
        dataKey: 'TraTMTuVi',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.TraTMTuVi),
        width: 180,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(TotalList?.TraTMTuVi)}
          </span>
        )
      },
      {
        key: 'KetThucLe',
        title: 'Kết thúc lẻ buổi hoàn ví',
        dataKey: 'KetThucLe',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.KetThucLe),
        width: 200,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(TotalList?.KetThucLe)}
          </span>
        )
      },
      {
        key: 'HoanTienMuaHang',
        title: 'Hoàn tiền tích lũy (Mua hàng)',
        dataKey: 'HoanTienMuaHang',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.HoanTienMuaHang),
        width: 230,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(TotalList?.HoanTienMuaHang)}
          </span>
        )
      },
      {
        key: 'KhauTruTichLuy',
        title: 'Khấu trừ tích lũy (Trả hàng)',
        dataKey: 'KhauTruTichLuy',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.KhauTruTichLuy),
        width: 230,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(TotalList?.KhauTruTichLuy)}
          </span>
        )
      },
      {
        key: 'TraHangHoanVi',
        title: 'Trả hàng hoàn ví',
        dataKey: 'TraHangHoanVi',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.TraHangHoanVi),
        width: 230,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(TotalList?.TraHangHoanVi)}
          </span>
        )
      },
      {
        key: 'HoaHongGT',
        title: 'Hoa hồng giới thiệu',
        dataKey: 'HoaHongGT',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.HoaHongGT),
        width: 230,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(TotalList?.HoaHongGT)}
          </span>
        )
      },
      {
        key: 'KhauTruHoaHongGT',
        title: 'Khấu trừ hoa hồng giới thiệu',
        dataKey: 'KhauTruHoaHongGT',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.KhauTruHoaHongGT),
        width: 230,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(TotalList?.KhauTruHoaHongGT)}
          </span>
        )
      },
      {
        key: 'HoaHongChiaSeMaGiamGia',
        title: 'Hoa hồng chia sẻ mã giảm giá',
        dataKey: 'HoaHongChiaSeMaGiamGia',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.HoaHongChiaSeMaGiamGia),
        width: 230,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(TotalList?.HoaHongChiaSeMaGiamGia)}
          </span>
        )
      },
      {
        key: 'KetThucTheHoanVi',
        title: 'Kết thúc thẻ hoàn ví',
        dataKey: 'KetThucTheHoanVi',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.KetThucTheHoanVi),
        width: 230,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(TotalList?.KetThucTheHoanVi)}
          </span>
        )
      },
      {
        key: 'TangDKDN',
        title: 'Tặng đăng ký đăng nhập',
        dataKey: 'TangDKDN',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.TangDKDN),
        width: 230,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(TotalList?.TangDKDN)}
          </span>
        )
      },
      {
        key: 'TangSN',
        title: 'Tặng sinh nhật',
        dataKey: 'TangSN',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.TangSN),
        width: 230,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(TotalList?.TangSN)}
          </span>
        )
      },
      {
        key: 'ThanhToanDH',
        title: 'Thanh toán đơn hàng',
        dataKey: 'ThanhToanDH',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.ThanhToanDH),
        width: 230,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(TotalList?.ThanhToanDH)}
          </span>
        )
      },
      {
        key: 'TonCuoiKy',
        title: 'Tồn tới thời gian lọc',
        dataKey: 'TonCuoiKy',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.TonCuoiKy),
        width: 230,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(TotalList?.TonCuoiKy)}
          </span>
        )
      },
      {
        key: 'TonHienTai',
        title: 'Hiện tại',
        dataKey: 'TonHienTai',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.TonHienTai),
        width: 230,
        sortable: false,
        footerRenderer: () => (
          <span className="text-success font-size-md font-number">
            {PriceHelper.formatVND(TotalList?.TonHienTai)}
          </span>
        )
      },
      {
        key: '#',
        title: '#',
        dataKey: '#',
        cellRenderer: ({ rowData }) => (
          <button
            type="button"
            className="btn btn-primary btn-xs"
            onClick={() => OpenModalDetail(rowData)}
          >
            Chi tiết ví
          </button>
        ),
        width: 120,
        sortable: false,
        align: 'center'
      }
    ],
    [filters, TotalList]
  )

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

  const headerRenderer = ({ cells, columns, headerIndex }) => {
    if (headerIndex === 0) {
      return cells
    }
    const groupCells = []
    columns.forEach((column, columnIndex) => {
      groupCells.push(
        <div
          className={clsx(
            cells[columnIndex].props.className,
            !column.footerRenderer && 'bg-stripes'
          )}
          key={`header-group-cell-${column.key}`}
          style={{ ...cells[columnIndex].props.style }}
        >
          {column.footerRenderer && column.footerRenderer()}
        </div>
      )
    })
    return groupCells
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
          <ReactTableV7
            rowKey="Staff.ID"
            filters={filters}
            columns={columns}
            data={ListData}
            loading={loading}
            pageCount={pageCount}
            onPagesChange={onPagesChange}
            optionMobile={{
              CellModal: cell => OpenModalMobile(cell)
            }}
            headerHeight={[50, 50]}
            headerRenderer={headerRenderer}
            headerClassName={({ columns, headerIndex }) =>
              headerIndex === 1 ? 'bg-gray-200' : ''
            }
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
