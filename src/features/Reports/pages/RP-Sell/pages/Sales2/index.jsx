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
import ModalViewMobile from './ModalViewMobile'
moment.locale('vi')

const ten_nghiep_vu2 = true

function Sales2(props) {
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
    Order: 'ToPay desc',
    GroupCustomerID: '',
    MemberID: ''
  })
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [ListData, setListData] = useState([])
  const [loading, setLoading] = useState(false)
  const [PageTotal, setPageTotal] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [initialValuesMobile, setInitialValuesMobile] = useState(null)
  const [isModalMobile, setIsModalMobile] = useState(false)
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
      .getListSale2(BrowserHelpers.getRequestParamsList(filters))
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const { Items, Total, PCount } = {
            Items: data?.lst
              ? data?.lst.map((x, i) => ({
                  ...x,
                  ID: x.MemberID + '-' + x.MobilePhone + i
                }))
              : [],
            PCount: data?.PCount || 0,
            Total: data?.Total || 0
          }
          setListData(Items)
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
      onRefresh()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    getList()
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
      //   {
      //     key: 'CreateDate',
      //     title: 'Ngày',
      //     dataKey: 'CreateDate',
      //     cellRenderer: ({ rowData }) =>
      //       moment(rowData.CreateDate).format('HH:mm DD/MM/YYYY'),
      //     width: 180,
      //     sortable: false,
      //     mobileOptions: {
      //       visible: true
      //     }
      //   },
      {
        key: 'MemberID',
        title: 'ID Khách hàng',
        dataKey: 'MemberID',
        width: 120,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'MemberName',
        title: 'Tên khách hàng',
        dataKey: 'MemberName',
        width: 250,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'MobilePhone',
        title: 'Số điện thoại',
        dataKey: 'MobilePhone',
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'GroupList',
        title: 'Nhóm',
        dataKey: 'GroupList',
        cellRenderer: ({ rowData }) =>
          rowData?.GroupList
            ? rowData?.GroupList.map(
                item =>
                  `${item.Title} (Ngưỡng ${PriceHelper.formatVND(item.Point)})`
              )
            : '',
        width: 300,
        sortable: false
      },
      {
        key: 'ToPay',
        title: 'Chi tiêu',
        dataKey: 'ToPay',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData?.ToPay),
        width: 200,
        sortable: false,
        className: 'flex-fill'
      },
      {
        key: 'GroupNext',
        title: 'Cấp tiếp theo có thể lên',
        dataKey: 'GroupNext',
        cellRenderer: ({ rowData }) =>
          rowData?.GroupNext
            ? rowData?.GroupNext.map(
                item => `${item.Title} (${PriceHelper.formatVND(item.Point)})`
              ).join(', ')
            : '',
        width: 300,
        sortable: false
      },
      {
        key: 'Items',
        title: 'Chi tiết đơn hàng',
        dataKey: 'Items',
        width: 300,
        sortable: false,
        cellRenderer: ({ rowData }) =>
          rowData?.Items
            ? rowData?.Items.map(
                item => `[#${item.ID}] ${item.ProdTitle} (x${item.Qty})`
              ).join(', ')
            : ''
      }
    ],
    [filters]
  )

  const onExport = () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getListSale2(
          BrowserHelpers.getRequestParamsList(filters, {
            Total: PageTotal
          })
        ),
      UrlName: '/ban-hang/doanh-so-2'
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

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase font-size-xl fw-600">Doanh số</span>
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
        ten_nghiep_vu2={ten_nghiep_vu2}
      />
      <div className="bg-white rounded">
        <div className="border-gray-200 px-20px py-15px border-bottom d-flex align-items-center justify-content-between flex-column flex-md-row">
          <div className="fw-500 font-size-lg">Danh sách khách hàng</div>
          {/* <div className="fw-500">
            Tổng doanh số giảm trừ
            <span className="font-size-xl fw-600 text-success pl-5px font-number">
              {PriceHelper.formatVND(TotalSaleRuduced)}
            </span>
          </div> */}
        </div>
        <div className="p-20px">
          <ReactTableV7
            estimatedRowHeight={80}
            rowKey="ID"
            filters={filters}
            columns={columns}
            data={ListData}
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
export default Sales2
