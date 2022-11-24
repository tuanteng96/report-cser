import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterToggle from 'src/components/Filter/FilterToggle'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import reportsApi from 'src/api/reports.api'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import ModalViewMobile from './ModalViewMobile'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import { uuidv4 } from '@nikitababko/id-generator'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'

import moment from 'moment'
import 'moment/locale/vi'
import { JsonFilter } from 'src/Json/JsonFilter'

moment.locale('vi')

var thisYear = new Date().getFullYear()
var start = new Date('1/1/' + thisYear)
var defaultStart = moment(start.valueOf()).toDate()

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
          CreateDateProd: order.CreateDate,
          TanSuatSDProd: order.TanSuatSD,
          ...obj,
          rowIndex: index,
          Ids: uuidv4()
        }
        if (x !== 0) delete newObj.ProdsList
        newArray.push(newObj)
      }
    } else {
      newArray.push({
        rowIndex: index,
        Ids: uuidv4(),
        ...obj
      })
    }
  }
  return newArray
}

function FrequencyUseCustomer(props) {
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
    CateServiceIDs: '', // Danh mục dịch vụ
    ServiceIDs: '', // Danh mục dịch vụ
    DayService: '', // Khoảng thời gian không đến làm dịch vụ
    LastUsedFrom: null, // Ngày dùng cuối từ
    LastUsedTo: null, // Ngày dùng cuối đến
    Frequency: JsonFilter.FrequencyList[2], // Tần suất SD
    FrequencyDay: '', // Tuần suất theo ngày
    StatusServices: '',
    FrequencyDateStart: defaultStart,
    FrequencyDateEnd: moment().toDate()
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
    getListFrequencyUseCustomer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListFrequencyUseCustomer = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    reportsApi
      .getListCustomerFrequencyUse(
        BrowserHelpers.getRequestParamsToggle(filters)
      )
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
          setPageTotal(Total)
          setPageCount(PCount)
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
      getListFrequencyUseCustomer()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    getListFrequencyUseCustomer()
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
        reportsApi.getListCustomerFrequencyUse(
          BrowserHelpers.getRequestParamsToggle(filters, {
            Total: PageTotal
          })
        ),
      UrlName: '/khach-hang/tan-suat-su-dung'
    })
  }

  const columns = useMemo(
    () => [
      {
        key: 'index',
        title: 'STT',
        dataKey: 'index',
        cellRenderer: ({ rowData }) =>
          filters.Ps * (filters.Pi - 1) + (rowData.rowIndex + 1),
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
        width: 150,
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
        width: 220,
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
        width: 200,
        sortable: false,
        rowSpan: ({ rowData }) =>
          rowData.ProdsList && rowData.ProdsList.length > 0
            ? rowData.ProdsList.length
            : 1
      },
      {
        key: 'TanSuatSD',
        title: 'Tần suất sử dụng',
        dataKey: 'TanSuatSD',
        width: 200,
        sortable: false,
        cellRenderer: ({ rowData }) => rowData.TanSuatSD,
        rowSpan: ({ rowData }) =>
          rowData.ProdsList && rowData.ProdsList.length > 0
            ? rowData.ProdsList.length
            : 1
      },
      {
        key: 'CreateDateProd',
        title: 'Thời gian mua',
        dataKey: 'CreateDateProd',
        cellRenderer: ({ rowData }) =>
          rowData.CreateDateProd
            ? moment(rowData.CreateDateProd).format('HH:mm DD/MM/YYYY')
            : '',
        width: 180,
        sortable: false
      },
      {
        key: 'Title',
        title: 'Tên dịch vụ',
        dataKey: 'Title',
        width: 250,
        sortable: false
      },
      {
        key: 'LastUsedTime',
        title: 'TG dùng gần nhất',
        dataKey: 'LastUsedTime',
        cellRenderer: ({ rowData }) =>
          rowData.LastUsedTime
            ? moment(rowData.LastUsedTime).format('HH:mm DD/MM/YYYY')
            : '',
        width: 150,
        sortable: false
      },
      {
        key: 'TanSuatSDProd',
        title: 'Tần suất sử dụng',
        dataKey: 'TanSuatSDProd',
        width: 150,
        cellRenderer: ({ rowData }) => rowData.TanSuatSDProd,
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
    const indexList = [0, 1, 2, 3, 4, 5]
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

  const onPagesChange = ({ Pi, Ps }) => {
    setFilters({ ...filters, Pi, Ps })
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Tần suất sử dụng
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
            useIsScrolling
            overscanRowCount={50}
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

export default FrequencyUseCustomer
