import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import reportsApi from 'src/api/reports.api'
import FilterList from 'src/components/Filter/FilterList'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import _ from 'lodash'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'
import { uuidv4 } from '@nikitababko/id-generator'
import { PriceHelper } from 'src/helpers/PriceHelper'

function SellProfit(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    DateStart: new Date(), // Ngày bắt đầu
    DateEnd: new Date(), // Ngày kết thúc
    Pi: 1, // Trang hiện tại
    Ps: 1500 // Số lượng item
  })
  const [StockName, setStockName] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [isFilter, setIsFilter] = useState(false)
  const [ListData, setListData] = useState([])
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
    getListProfit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListProfit = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    reportsApi
      .getListProfit(BrowserHelpers.getRequestParamsList(filters))
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const { ObjData, Total, PCount } = {
            ObjData: {
              dich_vu: data?.result?.dich_vu.map(item => ({
                ...item,
                Ids: uuidv4()
              })),
              san_pham: data?.result?.san_pham.map(item => ({
                ...item,
                Ids: uuidv4()
              }))
            } || { dich_vu: [], san_pham: [] },
            Total: data.result?.Total || 0,
            PCount: data?.result?.PCount || 0
          }
          setListData(ObjData)
          setPageCount(PCount)
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
      getListProfit()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onExport = () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getListProfit(
          BrowserHelpers.getRequestParamsList(filters, {
            Total: PageTotal
          })
        ),
      UrlName: '/ban-hang/loi-nhuan'
    })
  }

  const onPagesChange = ({ Pi, Ps }) => {
    setFilters({ ...filters, Pi, Ps })
  }

  const onRefresh = () => {
    getListProfit()
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
        title: 'Sản phẩm / Nguyên vật liệu',
        dataKey: 'ProdTitle',
        width: 350,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'RealQty',
        title: 'Số lượng Thực tế',
        dataKey: 'RealQty',
        width: 150,
        sortable: false,
        mobileOptions: {
          visible: true
        },
        align: 'right'
      },
      {
        key: 'RealPay',
        title: 'Doanh thu thực',
        dataKey: 'RealPay',
        width: 150,
        sortable: false,
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.RealPay),
        mobileOptions: {
          visible: true
        },
        align: 'right'
      },
      {
        key: 'Revenue',
        title: 'Lợi nhuận',
        dataKey: 'Revenue',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.Revenue),
        width: 150,
        sortable: false,
        mobileOptions: {
          visible: true
        },
        align: 'right'
      }
    ],
    [filters]
  )

  const columns2 = useMemo(
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
        title: 'Dịch vụ / Phụ phí',
        dataKey: 'ProdTitle',
        width: 320,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'RealQty',
        title: 'Số lượng Thực tế',
        dataKey: 'RealQty',
        width: 150,
        sortable: false,
        mobileOptions: {
          visible: true
        },
        align: 'right'
      },
      {
        key: 'RealPay',
        title: 'Doanh thu theo buổi',
        dataKey: 'RealPay',
        width: 180,
        sortable: false,
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.RealPay),
        mobileOptions: {
          visible: true
        },
        align: 'right'
      },
      {
        key: 'Revenue',
        title: 'Lợi nhuận',
        dataKey: 'Revenue',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.Revenue),
        width: 150,
        sortable: false,
        mobileOptions: {
          visible: true
        },
        align: 'right'
      }
    ],
    [filters]
  )

  const getTotal = (arrays, keyName) => {
    if (!arrays) return 0
    arrays.reduce((a, b) => a + b[keyName], 0)
    return arrays.reduce((a, b) => a + b[keyName], 0)
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Lợi nhuận
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
      <div className="row">
        <div className="col-md-6">
          <div className="bg-white rounded">
            <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between flex-column flex-md-row">
              <div className="fw-500 font-size-lg">
                Danh sách sản phẩm / NVL
              </div>
              <div className="font-number fw-600 font-size-lg">
                Tổng
                <span className="text-success pl-5px">
                  {PriceHelper.formatVND(
                    getTotal(ListData.san_pham, 'Revenue')
                  )}
                </span>
              </div>
            </div>
            <div className="p-20px">
              <ReactTableV7
                rowKey="Ids"
                filters={filters}
                columns={columns}
                data={ListData.san_pham}
                loading={loading}
                pageCount={pageCount}
                onPagesChange={onPagesChange}
              />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="bg-white rounded">
            <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between flex-column flex-md-row">
              <div className="fw-500 font-size-lg">
                Danh sách phụ phí / dịch vụ
              </div>
              <div className="font-number fw-600 font-size-lg">
                Tổng
                <span className="text-success pl-5px">
                  {PriceHelper.formatVND(getTotal(ListData.dich_vu, 'Revenue'))}
                </span>
              </div>
            </div>
            <div className="p-20px">
              <ReactTableV7
                rowKey="Ids"
                filters={filters}
                columns={columns2}
                data={ListData.dich_vu}
                loading={loading}
                pageCount={pageCount}
                onPagesChange={onPagesChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SellProfit
