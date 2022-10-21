import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import reportsApi from 'src/api/reports.api'
import FilterList from 'src/components/Filter/FilterList'
import _ from 'lodash'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'
import { uuidv4 } from '@nikitababko/id-generator'

import moment from 'moment'
import 'moment/locale/vi'
import { PriceHelper } from 'src/helpers/PriceHelper'
import ModalViewMobile from './ModalViewMobile'

moment.locale('vi')

function UsedElsewhere(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [StockName, setStockName] = useState('')
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    DateStart: new Date(), // Ngày bắt đầu
    DateEnd: new Date(), // Ngày kết thúc
    Pi: 1, // Trang hiện tại
    Ps: 15, // Số lượng item
    AllServiceID: ''
  })
  const [isFilter, setIsFilter] = useState(false)
  const [ListData, setListData] = useState([])
  const [loading, setLoading] = useState(false)
  const [PageTotal, setPageTotal] = useState(0)
  const [pageCount, setPageCount] = useState(0)
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
    getListUsedElsewhere()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListUsedElsewhere = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    reportsApi
      .getListUsedElsewhere(BrowserHelpers.getRequestParamsList(filters))
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
          setListData(Items.map(item => ({ ...item, Ids: uuidv4() })))
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

  const onPagesChange = ({ Pi, Ps }) => {
    setFilters({ ...filters, Pi, Ps })
  }

  const onRefresh = () => {
    getListUsedElsewhere()
  }

  const onExport = async () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getListUsedElsewhere(
          BrowserHelpers.getRequestParamsList(filters, {
            Total: PageTotal
          })
        ),
      UrlName: '/dich-vu/dv-diem-sd-diem-khac'
    })
  }

  const columns = useMemo(
    () => [
      {
        key: '',
        title: 'STT',
        dataKey: 'index',
        cellRenderer: ({ rowIndex, rowData }) =>
          filters.Ps * (filters.Pi - 1) + (rowIndex + 1),
        width: 60,
        sortable: false,
        align: 'center',
        className: 'position-relative',
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Ho_ten',
        title: 'Khách hàng',
        dataKey: 'Ho_ten',
        width: 200,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'SDT',
        title: 'Số điện thoại',
        dataKey: 'SDT',
        width: 150,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Da_dung',
        title: 'Đã dùng',
        dataKey: 'Da_dung',
        width: 100,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Ngay_dung_gan_nhat',
        title: 'Ngày dùng gần nhất',
        dataKey: 'Ngay_dung_gan_nhat',
        cellRenderer: ({ rowData }) =>
          moment(rowData.Ngay_dung_gan_nhat).format('HH:mm DD-MM-YYYY'),
        width: 200,
        sortable: false
      },
      {
        key: 'Diem_mua',
        title: 'Cơ sở mua',
        dataKey: 'Diem_mua',
        width: 200,
        sortable: false
      },
      {
        key: 'So_buoi',
        title: 'Số buổi',
        dataKey: 'So_buoi',
        width: 100,
        sortable: false
      },
      {
        key: 'Gia_tri_buoi',
        title: 'Giá trị buổi',
        dataKey: 'Gia_tri_buoi',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.Gia_tri_buoi),
        width: 150,
        sortable: false
      },
      {
        key: 'Gia_tri_the',
        title: 'Giá trị thẻ',
        dataKey: 'Gia_tri_the',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.Gia_tri_the),
        width: 150,
        sortable: false
      },
      {
        key: 'The',
        title: 'Tên thẻ',
        dataKey: 'The',
        width: 250,
        sortable: false
      },
      {
        key: 'The_ID',
        title: 'ID thẻ',
        dataKey: 'The_ID',
        width: 100,
        sortable: false
      },
      {
        key: 'Ngay_mua',
        title: 'Ngày mua',
        dataKey: 'Ngay_mua',
        cellRenderer: ({ rowData }) =>
          moment(rowData.Ngay_mua).format('HH:mm DD-MM-YYYY'),
        width: 200,
        sortable: false
      }
    ],
    [filters]
  )

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
          <span className="text-uppercase font-size-xl fw-600 text-truncate max-w-250px max-w-md-auto d-block d-md-inline">
            Dịch vụ điểm này, sử dụng điểm khác
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
        <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-md-center justify-content-between flex-column flex-md-row">
          <div className="fw-500 font-size-lg">Danh sách sử dụng</div>
        </div>
        <div className="p-20px">
          <ReactTableV7
            rowKey="Ids"
            overscanRowCount={50}
            useIsScrolling
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
      </div>
      <ModalViewMobile
        show={isModalMobile}
        onHide={HideModalMobile}
        data={initialValuesMobile}
      />
    </div>
  )
}

export default UsedElsewhere
