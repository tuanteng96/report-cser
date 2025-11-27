import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterToggle from 'src/components/Filter/FilterToggle'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import reportsApi from 'src/api/reports.api'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import ModalViewMobile from './ModalViewMobile'
import { JsonFilter } from 'src/Json/JsonFilter'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'
import { uuidv4 } from '@nikitababko/id-generator'

import moment from 'moment'
import 'moment/locale/vi'
import { PriceHelper } from 'src/helpers/PriceHelper'

moment.locale('vi')

const convertArray = arrays => {
  const newArray = []
  if (!arrays || arrays.length === 0) {
    return newArray
  }
  for (let [index, obj] of arrays.entries()) {
    for (let [x, order] of obj.ServiceList.entries()) {
      const newObj = {
        ...order,
        ...obj,
        rowIndex: index,
        Ids: uuidv4(),
        rowSpanIndex: x
      }
      if (x !== 0) delete newObj.ServiceList
      newArray.push(newObj)
    }
  }
  return newArray
}

function UseServiceCustomer(props) {
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
    ServiceIDs: '', // ID dịch vụ
    OSFrom: '',
    OSTo: '',
    StatusServices: [JsonFilter.StatusServiceMemberList[0]],
    //TypeServices: '',
    DayFromServices: '', // Số buổi còn lại từ
    DayToServices: '' // Số buổi còn lại đến
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
    getListUseServiceCustomer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListUseServiceCustomer = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    reportsApi
      .getListCustomerUseService(BrowserHelpers.getRequestParamsToggle(filters))
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
      getListUseServiceCustomer()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    getListUseServiceCustomer()
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
        reportsApi.getListCustomerUseService(
          BrowserHelpers.getRequestParamsToggle(filters, { Total: PageTotal })
        ),
      UrlName: '/khach-hang/su-dung-dich-vu'
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
        cellRenderer: ({ rowData }) =>
          filters.Ps * (filters.Pi - 1) + (rowData.rowIndex + 1),
        width: 60,
        sortable: false,
        align: 'center',
        rowSpan: ({ rowData }) =>
          rowData.ServiceList && rowData.ServiceList.length > 0
            ? rowData.ServiceList.length
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
          rowData.ServiceList && rowData.ServiceList.length > 0
            ? rowData.ServiceList.length
            : 1,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'MemberFullName',
        title: 'Tên khách hàng',
        dataKey: 'MemberFullName',
        width: 200,
        sortable: false,
        rowSpan: ({ rowData }) =>
          rowData.ServiceList && rowData.ServiceList.length > 0
            ? rowData.ServiceList.length
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
          rowData.ServiceList && rowData.ServiceList.length > 0
            ? rowData.ServiceList.length
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
          rowData.ServiceList && rowData.ServiceList.length > 0
            ? rowData.ServiceList.length
            : 1
      },
      {
        key: 'Title',
        title: 'Tên dịch vụ',
        dataKey: 'Title',
        width: 250,
        sortable: false
      },
      {
        key: 'BuoiCon',
        title: 'Số buổi còn',
        dataKey: 'BuoiCon',
        width: 120,
        sortable: false
      },
      {
        key: 'TongGiatriBuoicon',
        title: 'Tổng giá trị buổi còn',
        dataKey: 'TongGiatriBuoicon',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.TongGiatriBuoicon),
        width: 200,
        sortable: false
      },
      {
        key: 'UseEndTime',
        title: 'Thời gian dùng cuối',
        dataKey: 'UseEndTime',
        cellRenderer: ({ rowData }) =>
          rowData.UseEndTime
            ? moment(rowData.UseEndTime).format('HH:mm DD/MM/YYYY')
            : '',
        width: 180,
        sortable: false
      },
      {
        key: 'Status',
        title: 'Trạng thái',
        dataKey: 'Status',
        width: 150,
        sortable: false
      },
      {
        key: 'Desc',
        title: 'Mô tả',
        dataKey: 'Desc',
        width: 200,
        sortable: false
      }
    ],
    [filters]
  )

  const rowRenderer = ({ rowData, rowIndex, cells, columns, isScrolling }) => {
    const indexList = [0, 1, 2, 3, 4]

    if (rowData.rowSpanIndex > 0) {
      indexList.forEach(i => {
        const cell = cells[i]

        // replace nội dung cell bằng rỗng
        cells[i] = React.cloneElement(cell, {
          children: null,
          border: 'none'
        })
      })
    }

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

    // 👉 Chỉ làm mờ khi scroll, không thay thế layout
    // if (isScrolling) {
    //   return cells.map(cell =>
    //     React.cloneElement(cell, {
    //       className: (cell.props.className || '') + ' opacity-30'
    //     })
    //   )
    // }

    return cells
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase font-size-xl fw-600">
            Khách hàng sử dụng dịch vụ
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
      <FilterToggle
        show={isFilter}
        filters={filters}
        onHide={onHideFilter}
        onSubmit={onFilter}
        onRefresh={onRefresh}
        loading={loading}
        loadingExport={loadingExport}
        onExport={onExport}
        isOnlyCard
      />
      <div className="bg-white rounded">
        <div className="border-gray-200 px-20px py-15px border-bottom d-flex align-items-center justify-content-between">
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

export default UseServiceCustomer
