import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterList from 'src/components/Filter/FilterList'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import ModalViewMobile from './ModalViewMobile'
import reportsApi from 'src/api/reports.api'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'

import moment from 'moment'
import 'moment/locale/vi'
import { PriceHelper } from 'src/helpers/PriceHelper'

moment.locale('vi')

function Home(props) {
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
    CategoriesTK: '', // 0 => SP, 1 => NVL
    ProdIDs: '', // Danh sách SP, NVL
    QtyNumber: '', // Lọc ra Qty < QtyNumber
    IsQtyEmpty: true,
    BrandId: '',
    CategoriesId: '',
    gia_nhap_tb_khoang_tg: false // Tính theo DateStart,DateEnd, ngược lại tất cả
  })
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [ListData, setListData] = useState([])
  const [PageTotal, setPageTotal] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
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
    reportsApi
      .getListInventory(BrowserHelpers.getRequestParamsList(filters))
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
      getListPayroll()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    getListPayroll()
  }

  const onExport = () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getListInventory(
          BrowserHelpers.getRequestParamsList(filters, {
            Total: PageTotal
          })
        ),
      UrlName: '/ton-kho/danh-sach'
    })
  }

  const OpenModalMobile = value => {
    setInitialValuesMobile(value)
    setIsModalMobile(true)
  }

  const HideModalMobile = () => {
    setInitialValuesMobile(null)
    setIsModalMobile(false)
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
        key: 'ProdTitle',
        title: 'Tên',
        dataKey: 'ProdTitle',
        width: 350,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Code',
        title: 'Mã',
        dataKey: 'Code',
        width: 150,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'SUnit',
        title: 'Đơn vị',
        dataKey: 'SUnit',
        cellRenderer: ({ rowData }) => rowData?.SUnit || 'Chưa xác định',
        width: 150,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'ImportPrice',
        title: 'Giá nhập',
        dataKey: 'ImportPrice',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData?.ImportPrice),
        width: 180,
        sortable: false
      },
      {
        key: 'AverageCost',
        title: 'Giá nhập trung bình',
        dataKey: 'AverageCost',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData?.AverageCost),
        width: 180,
        sortable: false
      },
      {
        key: 'QtyBefore',
        title: 'Tồn trước',
        dataKey: 'QtyBefore',
        cellRenderer: ({ rowData }) => rowData?.QtyBefore || 0,
        width: 150,
        sortable: false
      },
      {
        key: 'QtyImport',
        title: 'Nhập trong',
        dataKey: 'QtyImport',
        cellRenderer: ({ rowData }) => rowData?.QtyImport || 0,
        width: 150,
        sortable: false
      },
      {
        key: 'QtyExport',
        title: 'Xuất trong (Tổng)',
        dataKey: 'QtyExport',
        cellRenderer: ({ rowData }) => Math.abs(rowData?.QtyExport || 0),
        width: 150,
        sortable: false
      },
      {
        key: 'QtyExportSell',
        title: 'Xuất trong (Bán)',
        dataKey: 'QtyExportSell',
        cellRenderer: ({ rowData }) => Math.abs(rowData?.QtyExportSell || 0),
        width: 150,
        sortable: false
      },
      {
        key: 'QtyExportConsumption',
        title: 'Xuất trong (Tiêu hao)',
        dataKey: 'QtyExportConsumption',
        cellRenderer: ({ rowData }) =>
          Math.abs(rowData?.QtyExportConsumption || 0),
        width: 200,
        sortable: false
      },
      {
        key: 'QtyExportTotal',
        title: 'Xuất (Đơn xuất)',
        dataKey: 'QtyExportTotal',
        cellRenderer: ({ rowData }) => rowData?.QtyDonXuat,
        width: 150,
        sortable: false
      },
      {
        key: 'Qty',
        title: 'Hiện tại',
        dataKey: 'Qty',
        cellRenderer: ({ rowData }) => rowData?.Qty || 0,
        width: 150,
        sortable: false
      },
      {
        key: 'TotalValue',
        title: 'Tổng giá trị tồn',
        dataKey: 'TotalValue',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData?.TotalValue),
        width: 200,
        sortable: false
      }
    ],
    [filters]
  )

  const rowClassName = ({ rowData }) => {
    if (rowData.Qty <= 5) {
      return 'bg-danger-o-90'
    }
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase font-size-xl fw-600">Tồn kho</span>
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
        isWarehouse={true}
      />
      <div className="bg-white rounded">
        <div className="border-gray-200 px-20px py-15px border-bottom d-flex align-items-center justify-content-between">
          <div className="fw-500 font-size-lg">Danh sách tồn kho</div>
        </div>
        <div className="p-20px">
          <ReactTableV7
            rowKey="ProdId"
            filters={filters}
            columns={columns}
            data={ListData}
            loading={loading}
            pageCount={pageCount}
            onPagesChange={onPagesChange}
            optionMobile={{
              CellModal: cell => OpenModalMobile(cell)
            }}
            rowClassName={rowClassName}
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

export default Home
