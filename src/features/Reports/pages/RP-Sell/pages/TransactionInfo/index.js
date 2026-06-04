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

function TransactionInfo(props) {
  const { Stocks, CrStockID } = useSelector(({ auth }) => ({
    GlobalConfig: auth?.GlobalConfig,
    Stocks: auth?.Info?.Stocks || [],
    CrStockID: auth?.Info?.CrStockID || ''
  }))
  const [filters, setFilters] = useState({
    DateStart: new Date(), // Ngày bắt đầu
    DateEnd: new Date(), // Ngày kết thúc
    Pi: 1,
    Ps: 20,
    StockID: CrStockID || ''
  })
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [ListData, setListData] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  const [PageTotal, setPageTotal] = useState(0)

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
      .getListTransactionInfo(BrowserHelpers.getRequestParamsList(filters))
      .then(async ({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const { Items, PCount, Total } = {
            Items: data?.result?.List || [],
            PCount: data?.result?.pCount || 0,
            Total: data.result?.Total || 0
          }

          let newItems = [...Items]

          if (newItems && newItems.length > 0) {
            let rs = await reportsApi.getGiaNVLTb({
              ProdIDs: Items.map(i => i.ID).join(',')
            })

            if (rs?.data?.result?.lst && rs?.data?.result?.lst.length > 0) {
              newItems = newItems.map(i => {
                const index = rs.data.result.lst.findIndex(
                  x => Number(x.ProdID) === Number(i.ID)
                )
                if (index > -1) {
                  return {
                    ...i,
                    Item_NVL: rs.data.result.lst[index]
                  }
                }
                return i
              })
            }
          }

          setPageCount(PCount)
          setPageTotal(Total)
          setListData(newItems)
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
        key: 'Ten_mat_hang',
        title: 'Tên mặt hàng',
        dataKey: 'Ten_mat_hang',
        width: 300,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'So_luong',
        title: 'Số lượng',
        dataKey: 'So_luong',
        width: 120,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Doanh_so',
        title: 'Doanh số',
        dataKey: 'Doanh_so',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData?.Doanh_so),
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'VI_THE_TIEN',
        title: 'Ví + Thẻ tiền',
        dataKey: 'VI_THE_TIEN',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData?.Vi_The_tien),
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Thu_thu',
        title: 'Thực thu',
        dataKey: 'Thu_thu',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData?.Thuc_thu),
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Gia_cua_ten_mat_hang',
        title: 'Giá của tên mặt hàng',
        dataKey: 'Gia_cua_ten_mat_hang',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData?.Gia_cua_ten_mat_hang || 0),
        width: 250,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'So_luong_thuc_thu',
        title: 'Số lượng / Thực thu',
        dataKey: 'So_luong_thuc_thu',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData?.So_luong_thuc_thu),
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'So_lan',
        title: 'Số lần (SL setup trong gói/LT)',
        dataKey: 'So_lan',
        cellRenderer: ({ rowData }) => rowData?.So_lan,
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Sl_chia_thuc_thu',
        title: 'Số lần / Thực thu',
        dataKey: 'Sl_chia_thuc_thu',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(
            (rowData?.So_lan || 0) * (rowData?.Thuc_thu || 0)
          ),
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'GIA_NVL',
        title:
          'Giá NVL (Chỉ gồm tiền NVL để làm LT cho khách) => Setup tiêu hao vào thẳng dịch vụ',
        dataKey: 'GIA_NVL',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData?.Item_NVL?.Value),
        width: 250,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Tong_von',
        title: 'Tổng vốn',
        dataKey: 'Tong_von',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(
            rowData?.Item_NVL?.Value *
              (rowData?.So_lan || 0) *
              (rowData?.Thuc_thu || 0)
          ),
        width: 250,
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
        new Promise(async (resolve, reject) => {
          let rs1 = await reportsApi.getListTransactionInfo(
            BrowserHelpers.getRequestParamsList(filters, {
              Total: PageTotal
            })
          )

          let newRs = { ...rs1 }
          if (
            newRs?.data?.result?.List &&
            newRs?.data?.result?.List.length > 0
          ) {
            let rs = await reportsApi.getGiaNVLTb({
              ProdIDs: newRs.data.result.List.map(i => i.ID).join(',')
            })

            if (rs?.data?.result?.lst && rs?.data?.result?.lst.length > 0) {
              newRs.data.result.List = newRs.data.result.List.map(i => {
                const index = rs.data.result.lst.findIndex(
                  x => Number(x.ProdID) === Number(i.ID)
                )
                if (index > -1) {
                  return {
                    ...i,
                    Item_NVL: rs.data.result.lst[index]
                  }
                }
                return i
              })
            }
          }
          resolve(newRs)
        }),

      UrlName: '/ban-hang/tien-hang'
    })
  }

  const onPagesChange = ({ Pi, Ps }) => {
    setFilters({ ...filters, Pi, Ps })
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase font-size-xl fw-600">Tiền hàng</span>
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
        <div className="border-gray-200 px-20px py-15px border-bottom d-flex align-items-center justify-content-between flex-column flex-md-row">
          <div className="fw-500 font-size-lg">Danh sách dịch vụ / phụ phí</div>
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
            rowKey="ID"
            filters={filters}
            columns={columns}
            data={ListData}
            loading={loading}
            pageCount={pageCount}
            onPagesChange={onPagesChange}
            headerHeight={80}
          />
        </div>
      </div>
    </div>
  )
}
export default TransactionInfo
