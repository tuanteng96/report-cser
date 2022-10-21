import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterToggle from 'src/components/Filter/FilterToggle'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import reportsApi from 'src/api/reports.api'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import ModalViewMobile from './ModalViewMobile'
import { uuidv4 } from '@nikitababko/id-generator'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'
import Text from 'react-texty'

import moment from 'moment'
import 'moment/locale/vi'

moment.locale('vi')

const convertArray = arrays => {
  const newArray = []
  if (!arrays || arrays.length === 0) {
    return newArray
  }
  for (let [index, obj] of arrays.entries()) {
    if (obj.ProdsList && obj.ProdsList.length > 0) {
      for (let [x, order] of obj.ProdsList.entries()) {
        const newObj = {
          ...order,
          ...obj,
          NgayMuaHang: order.CreateDate,
          rowIndex: index,
          Ids: uuidv4()
        }
        if (x !== 0) delete newObj.ProdsList
        newArray.push(newObj)
      }
    } else {
      newArray.push({ ...obj, rowIndex: index, Ids: uuidv4() })
    }
  }
  return newArray
}

function ExpectedCustomer(props) {
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
    MemberID: '', // ID Khách hàng
    GroupCustomerID: '', // ID Nhóm khách hàng
    SourceName: '', // Nguồn
    UsedUpDateStart: null, // Từ ước tính sử dụng hết
    UsedUpDateEnd: null, // Đến ước tính sử dụng hết
    ExpiryDateStart: null, // Hạn sử dụng từ ngày
    ExpiryDateEnd: null, // Hạn sử dụng đến ngày
    DayFromServices: '', // Số buổi còn lại từ
    DayToServices: '', // Số buổi còn lại đến
    TypeService: '' // Loại SP, DV
  })
  const [StockName, setStockName] = useState('')
  const [ListData, setListData] = useState([])
  const [ListDataMobile, setListDataMobile] = useState([])
  const [PageTotal, setPageTotal] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [isFilter, setIsFilter] = useState(false)
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
    getListExpectedCustomer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListExpectedCustomer = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    reportsApi
      .getListCustomerExpected(BrowserHelpers.getRequestParamsToggle(filters))
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const { Members, Total, PCount } = {
            Members: data?.result?.Members || [],
            Total: data?.result?.Total || 0,
            PCount: data?.result?.PCount || 0
          }
          setListData(convertArray(Members))
          setListDataMobile(Members)
          setPageCount(PCount)
          setPageTotal(Total)
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
      getListExpectedCustomer()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    getListExpectedCustomer()
  }

  const OpenModalMobile = value => {
    setInitialValuesMobile(value)
    setIsModalMobile(true)
  }

  const HideModalMobile = () => {
    setInitialValuesMobile(null)
    setIsModalMobile(false)
  }

  const onExport = () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getListCustomerExpected(
          BrowserHelpers.getRequestParamsToggle(filters, { Total: PageTotal })
        ),
      UrlName: '/khach-hang/du-kien'
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
        cellRenderer: ({ rowData }) => {
          return filters.Ps * (filters.Pi - 1) + (rowData.rowIndex + 1)
        },
        width: 60,
        sortable: false,
        align: 'center',
        rowSpan: ({ rowData }) =>
          rowData.ProdsList && rowData.ProdsList.length > 0
            ? rowData.ProdsList.length
            : 1,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'CreateDate',
        title: 'Ngày tạo',
        dataKey: 'CreateDate',
        cellRenderer: ({ rowData }) =>
          moment(rowData.CreateDate).format('HH:mm DD/MM/YYYY'),
        width: 180,
        sortable: false,
        rowSpan: ({ rowData }) =>
          rowData.ProdsList && rowData.ProdsList.length > 0
            ? rowData.ProdsList.length
            : 1,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'MemberFullName',
        title: 'Tên khách hàng',
        dataKey: 'MemberFullName',
        width: 250,
        sortable: false,
        rowSpan: ({ rowData }) =>
          rowData.ProdsList && rowData.ProdsList.length > 0
            ? rowData.ProdsList.length
            : 1,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'MemberPhone',
        title: 'Số điện thoại',
        dataKey: 'MemberPhone',
        width: 180,
        sortable: false,
        rowSpan: ({ rowData }) =>
          rowData.ProdsList && rowData.ProdsList.length > 0
            ? rowData.ProdsList.length
            : 1,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'StockName',
        title: 'Cơ sở',
        dataKey: 'StockName',
        width: 250,
        sortable: false,
        rowSpan: ({ rowData }) =>
          rowData.ProdsList && rowData.ProdsList.length > 0
            ? rowData.ProdsList.length
            : 1
      },
      {
        key: 'NgayMuaHang',
        title: 'Thời gian mua',
        dataKey: 'NgayMuaHang',
        cellRenderer: ({ rowData }) =>
          rowData?.NgayMuaHang
            ? moment(rowData.NgayMuaHang).format('HH:mm DD/MM/YYYY')
            : 'Chưa xác định',
        width: 180,
        sortable: false
      },
      {
        key: 'Title',
        title: 'Tên mặt hàng',
        dataKey: 'Title',
        cellRenderer: ({ rowData }) => (
          <Text tooltipMaxWidth={300}>
            {rowData.Title} {rowData.Qty && `(x${rowData.Qty})`}
          </Text>
        ),
        width: 350,
        sortable: false
      },
      {
        key: 'UsedUpDate',
        title: 'TG ước tính dùng hết',
        dataKey: 'UsedUpDate',
        cellRenderer: ({ rowData }) =>
          rowData.UsedUpDate
            ? moment(rowData.UsedUpDate).format('HH:mm DD/MM/YYYY')
            : 'Chưa xác định',
        width: 180,
        sortable: false
      }
    ],
    [filters]
  )

  const rowRenderer = ({ rowData, rowIndex, cells, columns, isScrolling }) => {
    if (isScrolling)
      return (
        <div className="pl-15px d-flex align-items">
          <div className="spinner spinner-primary w-40px"></div> Đang tải ...
        </div>
      )
    const indexList = [0, 1, 2, 3, 4]
    for (let index of indexList) {
      const rowSpan = columns[index].rowSpan({ rowData, rowIndex })
      if (rowSpan > 1) {
        const cell = cells[index]
        const style = {
          ...cell.props.style,
          backgroundColor: '#fff',
          height: rowSpan * 50 - 1,
          alignSelf: 'flex-start',
          zIndex: 1
        }
        cells[index] = React.cloneElement(cell, { style })
      }
    }
    return cells
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Khách hàng dự kiến
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
      <FilterToggle
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
          <div className="fw-500 font-size-lg">Danh sách khách hàng</div>
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
            rowRenderer={rowRenderer}
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

export default ExpectedCustomer
