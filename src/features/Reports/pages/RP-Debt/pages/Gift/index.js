import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterList from 'src/components/Filter/FilterList'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import reportsApi from 'src/api/reports.api'
import ModalViewMobile from './ModalViewMobile'
import { PriceHelper } from 'src/helpers/PriceHelper'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'

import moment from 'moment'
import 'moment/locale/vi'

moment.locale('vi')

function Gift(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    DateStart: new Date(), // Ngày bắt đầu
    DateEnd: new Date(), // Ngày kết thúc
    Pi: 1,
    Ps: 15
  })
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [PageTotal, setPageTotal] = useState(0)
  const [ListData, setListData] = useState([])
  const [Total, setTotal] = useState({
    TONG_DH_TANG: 0,
    TONG_TIEN_TANG: 0
  })
  const [pageCount, setPageCount] = useState(0)
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
    getListDebtGift()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListDebtGift = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    reportsApi
      .getListDebtGift(BrowserHelpers.getRequestParamsList(filters))
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const { Items, Total, PCount, TONG_DH_TANG, TONG_TIEN_TANG } = {
            Items: data.result?.Items || [],
            Total: data.result?.Total || 0,
            PCount: data.result?.PCount || 0,
            TONG_DH_TANG: data.result?.TONG_DH_TANG || 0,
            TONG_TIEN_TANG: data.result?.TONG_TIEN_TANG || 0
          }
          setListData(Items)
          setTotal({ TONG_DH_TANG, TONG_TIEN_TANG })
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
      getListDebtGift()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    getListDebtGift()
  }

  const onExport = () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getListDebtGift(
          BrowserHelpers.getRequestParamsToggle(filters, { Total: PageTotal })
        ),
      UrlName: '/cong-no/tang'
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
        key: 'Id',
        title: 'ID đơn hàng',
        dataKey: 'Id',
        cellRenderer: ({ rowData }) => `#${rowData.Id}`,
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'NgayBanDH',
        title: 'Ngày bán',
        dataKey: 'NgayBanDH',
        cellRenderer: ({ rowData }) =>
          rowData.NgayBanDH
            ? moment(rowData.NgayBanDH).format('HH:mm DD/MM/YYYY')
            : 'Chưa xác định',
        width: 200,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Member.FullName',
        title: 'Tên khách hàng',
        dataKey: 'Member.FullName',
        width: 250,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Member.Phone',
        title: 'Số điện thoại',
        dataKey: 'Member.Phone',
        cellRenderer: ({ rowData }) =>
          rowData.Member ? rowData.Member.Phone : 'Chưa xác định',
        width: 200,
        sortable: false
      },
      {
        key: 'NgayTang',
        title: 'Ngày Tặng',
        dataKey: 'NgayTang',
        cellRenderer: ({ rowData }) =>
          moment(rowData.NgayTang).format('HH:mm DD/MM/YYYY'),
        width: 200,
        sortable: false
      },
      {
        key: 'SoTienTang',
        title: 'Số tiền tặng',
        dataKey: 'SoTienTang',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.SoTienTang),
        width: 200,
        sortable: false
      },
      {
        key: 'Staff.FullName',
        title: 'Người tạo đơn tặng',
        dataKey: 'Staff.FullName',
        width: 250,
        sortable: false
      },
      {
        key: 'ThoiGianTang',
        title: 'Thời gian tặng',
        dataKey: 'ThoiGianTang',
        cellRenderer: ({ rowData }) =>
          moment(rowData.ThoiGianTang).format('HH:mm DD/MM/YYYY'),
        width: 180,
        sortable: false,
        className: 'flex-fill'
      }
    ],
    [filters]
  )

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Báo cáo tặng
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
        <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between flex-column flex-md-row">
          <div className="fw-500 font-size-lg">Danh sách tặng</div>
          <div className="d-flex">
            <div className="fw-500">
              Tổng đơn hàng tặng{' '}
              <span className="font-size-xl fw-600 text-success pl-5px font-number">
                {Total.TONG_DH_TANG}
              </span>
            </div>
            <div className="fw-500 pl-20px">
              Tổng tiền tặng{' '}
              <span className="font-size-xl fw-600 text-success pl-5px font-number">
                {PriceHelper.formatVND(Total.TONG_TIEN_TANG)}
              </span>
            </div>
          </div>
        </div>
        <div className="p-20px">
          <ReactTableV7
            rowKey="Id"
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

export default Gift
