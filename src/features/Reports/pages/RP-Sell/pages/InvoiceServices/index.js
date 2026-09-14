import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import FilterList from 'src/components/Filter/FilterList'
import { PriceHelper } from 'src/helpers/PriceHelper'
import reportsApi from 'src/api/reports.api'
import ModalViewMobile from './ModalViewMobile'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'

import moment from 'moment'
import 'moment/locale/vi'

moment.locale('vi')

function InvoiceServices(props) {
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
  const [ListData, setListData] = useState([])
  const [ListDataMobile, setListDataMobile] = useState([])
  const [pageCount, setPageCount] = useState(0)
  const [StockName, setStockName] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [isFilter, setIsFilter] = useState(false)
  const [PageTotal, setPageTotal] = useState(1)
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
    getListInvoiceServices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListInvoiceServices = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    let newFilters = {
      From: filters.DateStart
        ? moment(filters.DateStart).format('YYYY-MM-DD')
        : null,
      To: filters.DateEnd ? moment(filters.DateEnd).format('YYYY-MM-DD') : null,
      StockID: filters.StockID,
      Pi: filters.Pi,
      Ps: filters.Ps
    }
    reportsApi
      .getListInvoiceServices(newFilters)
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const { Items, Total, PCount } = {
            Items: data.result?.Lst || [],
            Total: data.result?.Total || 0,
            PCount: data?.result?.PCount || 0
          }
          setListData(Items)
          setListDataMobile(Items)
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

  const onFilter = values => {
    if (_.isEqual(values, filters)) {
      getListInvoiceServices()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onExport = () => {
    let newFilters = {
      From: filters.DateStart,
      To: filters.DateEnd,
      Pi: filters.Pi,
      Ps: filters.Ps,
      StockID: filters.StockID
    }
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getListInvoiceServices(
          BrowserHelpers.getRequestParamsList(newFilters, {
            Total: PageTotal
          })
        ),
      UrlName: '/ban-hang/dich-vu-xuat-hoa-don'
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
        key: 'Ten_Khach_Hang',
        title: 'Tên khách hàng',
        dataKey: 'Ten_Khach_Hang',
        width: 250,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'SDT',
        title: 'Số điện thoại',
        dataKey: 'SDT',
        width: 135,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'DonHangID',
        title: 'ID Đơn hàng',
        dataKey: 'DonHangID',
        cellRenderer: ({ rowData }) => `#${rowData.DonHangID}`,

        width: 120,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Co_so',
        title: 'Cơ sở',
        dataKey: 'Co_so',
        width: 200,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Ngay_ban',
        title: 'Ngày bán',
        dataKey: 'Ngay_ban',
        cellRenderer: ({ rowData }) =>
          moment(rowData?.Ngay_ban).format('DD/MM/YYYY'),

        width: 150,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Ten_san_pham',
        title: 'Tên sản phẩm',
        dataKey: 'Ten_san_pham',
        width: 250,
        sortable: false
      },
      {
        key: 'So_luong',
        title: 'Số lượng',
        dataKey: 'So_luong',
        cellRenderer: ({ rowData }) => rowData.So_luong || 0,
        width: 150,
        sortable: false
      },
      {
        key: 'So_buoi_lieu_tring',
        title: 'Số buổi liệu trình',
        dataKey: 'So_buoi_lieu_tring',
        cellRenderer: ({ rowData }) => rowData.So_buoi_lieu_tring || 0,
        width: 150,
        sortable: false
      },
      {
        key: 'Thanh_tien',
        title: 'Thành tiền',
        dataKey: 'Thanh_tien',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.Thanh_tien),
        width: 150,
        sortable: false
      },
      {
        key: 'Da_Thanh_toan',
        title: 'Đã thanh toán',
        dataKey: 'Da_Thanh_toan',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.Da_Thanh_toan),
        width: 150,
        sortable: false
      },
      {
        key: 'Con_no',
        title: 'Còn nợ',
        dataKey: 'Con_no',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.Con_no),
        width: 150,
        sortable: false
      },
      {
        key: 'So_buoi_km',
        title: 'Số buổi KM',
        dataKey: 'So_buoi_km',
        cellRenderer: ({ rowData }) => rowData.So_buoi_km || 0,
        width: 150,
        sortable: false
      },
      {
        key: 'So_buoi_su_dung',
        title: 'Số buổi đã sử dụng',
        dataKey: 'So_buoi_su_dung',
        cellRenderer: ({ rowData }) => rowData.So_buoi_su_dung || 0,
        width: 200,
        sortable: false
      },
      {
        key: 'Gia_tri_xuat_hd',
        title: 'Giá trị xuất HĐ',
        dataKey: 'Gia_tri_xuat_hd',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.Gia_tri_xuat_hd),
        width: 150,
        sortable: false
      },
      {
        key: 'So_buoi_chuyen_lieu_trinh',
        title: 'Số buổi chuyển liệu trình',
        dataKey: 'So_buoi_chuyen_lieu_trinh',
        cellRenderer: ({ rowData }) => rowData.So_buoi_chuyen_lieu_trinh,
        width: 220,
        sortable: false
      },
      {
        key: 'So_buoi_da_xoa',
        title: 'Số buổi đã xoá',
        dataKey: 'So_buoi_da_xoa',
        cellRenderer: ({ rowData }) => rowData.So_buoi_da_xoa || 0,
        width: 150,
        sortable: false
      },
      {
        key: 'Ngay_thanh_toan_no',
        title: 'Ngày thanh toán nợ',
        dataKey: 'Ngay_thanh_toan_no',
        cellRenderer: ({ rowData }) =>
          rowData?.Ngay_thanh_toan_no &&
          moment(rowData?.Ngay_thanh_toan_no).format('DD/MM/YYYY'),

        width: 180,
        sortable: false
      },
      {
        key: 'Ghi_chu',
        title: 'Ghi chú',
        dataKey: 'Ghi_chu',
        width: 300,
        sortable: false
      }
    ],
    [filters]
  )

  const onRefresh = () => {
    getListInvoiceServices()
  }

  const onOpenFilter = () => {
    setIsFilter(true)
  }

  const onHideFilter = () => {
    setIsFilter(false)
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
          <span className="text-uppercase font-size-xl fw-600">
            Dịch vụ xuất hoá đơn
          </span>
          <span className="ps-0 ps-lg-3 text-muted d-block d-lg-inline-block">
            {StockName}
          </span>
        </div>
        <div className="w-85px d-flex justify-content-end">
          <button
            type="button"
            className="p-0 btn btn-primary w-40px h-35px"
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
        <div className="border-gray-200 px-20px py-15px border-bottom d-flex align-items-md-center justify-content-between flex-column flex-md-row">
          <div className="fw-500 font-size-lg">
            Danh sách dịch vụ xuất hoá đơn
          </div>
          <div className="fw-500"></div>
        </div>
        <div className="p-20px">
          <ReactTableV7
            rowKey="Ids"
            overscanRowCount={50}
            useIsScrolling
            filters={filters}
            columns={columns}
            data={ListData}
            dataMobile={ListDataMobile}
            loading={loading}
            pageCount={pageCount}
            onPagesChange={onPagesChange}
            optionMobile={{
              CellModal: cell => OpenModalMobile(cell)
            }}
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

export default InvoiceServices
