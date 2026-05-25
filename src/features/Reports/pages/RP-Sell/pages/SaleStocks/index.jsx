import React, { useEffect, useMemo, useState } from 'react'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import FilterList from 'src/components/Filter/FilterList'
import { useSelector } from 'react-redux'
import _ from 'lodash'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import reportsApi from 'src/api/reports.api'
import { PriceHelper } from 'src/helpers/PriceHelper'

import moment from 'moment'
import 'moment/locale/vi'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'
moment.locale('vi')

function SalesStocks(props) {
  const { Stocks, GlobalConfig } = useSelector(({ auth }) => ({
    GlobalConfig: auth?.GlobalConfig,
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    DateStart: new Date(), // Ngày bắt đầu
    DateEnd: new Date(), // Ngày kết thúc
    Thu_khac: ''
  })
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [ListData, setListData] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)

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
    getList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getList = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    reportsApi
      .getListSaleStocks(BrowserHelpers.getRequestParamsList(filters))
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const { Items } = {
            Items: data?.result?.List || []
          }
          setListData(Items)
          setLoading(false)
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
    getList()
  }

  const columns = useMemo(
    () => [
      {
        key: 'index',
        title: 'STT',
        dataKey: 'index',
        cellRenderer: ({ rowIndex }) => rowIndex + 1,
        width: 60,
        sortable: false,
        align: 'center',
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'StockTitle',
        title: 'Cơ sở',
        dataKey: 'StockTitle',
        width: 300,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Doanh_so_moi',
        title: 'Doanh số mới',
        dataKey: 'Doanh_so_moi',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData?.Doanh_so_moi),
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'No_moi',
        title: 'Nợ mới',
        dataKey: 'No_moi',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData?.No_moi),
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Thuc_thu_moi',
        title: 'Thực thu mới',
        dataKey: 'Thuc_thu_moi',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData?.Thuc_thu_moi),
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Thu_no_cu',
        title: 'Thực thu nợ cũ',
        dataKey: 'Thu_no_cu',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData?.Thu_no_cu),
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Tong_thu_thu',
        title: 'Tổng thực thu (Đơn mới + Nợ cũ)',
        dataKey: 'Tong_thu_thu',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(
            (rowData?.Thuc_thu_moi || 0) + (rowData?.Thu_no_cu || 0)
          ),
        width: 250,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Thuc_thu_dich_vu',
        title: 'Thực thu dịch vụ',
        dataKey: 'Thuc_thu_dich_vu',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData?.Thuc_thu_dich_vu),
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Thuc_thu_the_tien',
        title: 'Thực thu thẻ tiền',
        dataKey: 'Thuc_thu_the_tien',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData?.Thuc_thu_the_tien),
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Thuc_thu_cong_ty',
        title: 'Thực thu SP',
        dataKey: 'Thuc_thu_cong_ty',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(
            (rowData?.Thuc_thu_san_pham || 0) - (rowData?.Thuc_thu_doi_tac || 0)
          ),
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Thuc_thu_doi_tac',
        title: 'Thực thu SP đối tác',
        dataKey: 'Thuc_thu_doi_tac',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData?.Thuc_thu_doi_tac),
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Thu_tu_chuyen_lieu_trinh',
        title: 'Thu từ chuyển liệu trình',
        dataKey: 'Thu_tu_chuyen_lieu_trinh',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData?.Thu_tu_chuyen_lieu_trinh),
        width: 250,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Thu_khac',
        title: 'Khác',
        dataKey: 'Thu_khac',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData?.Thu_khac),
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Thuc_thu_tinh',
        title: 'Thực thu tính %',
        dataKey: 'Thuc_thu_tinh',
        cellRenderer: ({ rowData }) => {
          return PriceHelper.formatVND(
            (rowData?.Thuc_thu_dich_vu || 0) +
              (rowData?.Thuc_thu_the_tien || 0) +
              ((rowData?.Thuc_thu_san_pham || 0) -
                (rowData?.Thuc_thu_doi_tac || 0))
          )
        },
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Phi_dieu_hanh',
        title: 'Phí điều hành',
        dataKey: 'Phi_dieu_hanh',
        cellRenderer: ({ rowData }) => {
          let K2 =
            (rowData?.Thuc_thu_dich_vu || 0) +
            (rowData?.Thuc_thu_the_tien || 0) +
            (rowData?.Thuc_thu_san_pham || 0) -
            (rowData?.Thuc_thu_doi_tac || 0);

          if (K2 < 200000000) {
            return PriceHelper.formatVND(35000000)
          }

          if (K2 <= 250000000) {
            return PriceHelper.formatVND(K2 * 0.21)
          }

          if (K2 <= 300000000) {
            return PriceHelper.formatVND(K2 * 0.2)
          }

          if (K2 <= 350000000) {
            return PriceHelper.formatVND(K2 * 0.18)
          }

          if (K2 <= 400000000) {
            return PriceHelper.formatVND(K2 * 0.17)
          }

          if (K2 <= 450000000) {
            return PriceHelper.formatVND(K2 * 0.16)
          }

          if (K2 <= 500000000) {
            return PriceHelper.formatVND(K2 * 0.15)
          }

          if (K2 <= 600000000) {
            return PriceHelper.formatVND(K2 * 0.14)
          }

          return PriceHelper.formatVND(K2 * 0.13)
        },
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      }
    ], // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters]
  )

  const onExport = () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getListSaleStocks(
          BrowserHelpers.getRequestParamsList(filters)
        ),
      UrlName: '/ban-hang/doanh-so-co-so'
    })
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase font-size-xl fw-600">
            Doanh số cơ sở
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
        <div className="border-gray-200 px-20px py-15px border-bottom d-flex align-items-center justify-content-between flex-column flex-md-row">
          <div className="fw-500 font-size-lg">Danh sách cơ sở</div>
          {/* <div className="fw-500">
            Tổng doanh số giảm trừ
            <span className="font-size-xl fw-600 text-success pl-5px font-number">
              {PriceHelper.formatVND(TotalSaleRuduced)}
            </span>
          </div> */}
        </div>
        <div className="p-20px">
          <ReactTableV7
            rowHeight={60}
            rowKey="StockID"
            columns={columns}
            data={ListData}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}
export default SalesStocks
