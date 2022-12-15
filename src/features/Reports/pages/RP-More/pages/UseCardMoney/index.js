import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import FilterList from 'src/components/Filter/FilterList'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import reportsApi from 'src/api/reports.api'
import { PriceHelper } from 'src/helpers/PriceHelper'
import ModalViewMobile from './ModalViewMobile'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import Text from 'react-texty'
import { uuidv4 } from '@nikitababko/id-generator'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'

import moment from 'moment'
import 'moment/locale/vi'

moment.locale('vi')

const convertArray = arrays => {
  const newArray = []
  if (!arrays || arrays.length === 0) {
    return newArray
  }

  for (let [index, obj] of arrays.entries()) {
    for (let [o, member] of obj.MemberList.entries()) {
      for (let [k, use] of member.UsageHistory.entries()) {
        const newObj = {
          ...use,
          ...member,
          ...obj,
          rowIndex: index,
          Ids: uuidv4()
        }
        if (o === 0 && k === 0) {
        } else {
          delete newObj.MemberList
        }
        if (k === 0) {
        } else {
          delete newObj.UsageHistory
        }
        newArray.push(newObj)
      }
    }
  }
  return newArray
}

function UseCardMoney(props) {
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
    MemberID: '',
    TypeTT: ''
  })
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [ListData, setListData] = useState([])
  const [ListDataMobile, setListDataMobile] = useState([])
  const [TotalValue, setTotalValue] = useState(0)
  const [PageTotal, setPageTotal] = useState(0)
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
    getListCardService()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListCardService = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    reportsApi
      .getListTotalUseCard(BrowserHelpers.getRequestParamsList(filters))
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const { Items, Total, PCount, TongTien } = {
            Items: data.result?.Items || [],
            Total: data.result?.Total || [],
            TongTien: data.result?.TongTien || 0,
            PCount: data?.result?.PCount || 0
          }
          setListData(convertArray(Items))
          setListDataMobile(Items)
          setTotalValue(TongTien)
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
      onRefresh()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    getListCardService()
  }

  const onExport = () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getListTotalUseCard(
          BrowserHelpers.getRequestParamsList(filters, {
            Total: PageTotal
          })
        ),
      UrlName: '/khac/bao-cao-su-dung-the-tien'
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

  const columns = useMemo(
    () => [
      {
        key: 'CreateDate',
        title: 'Ngày',
        dataKey: 'CreateDate',
        cellRenderer: ({ rowData }) =>
          moment(rowData.CreateDate).format('DD/MM/YYYY'),
        width: 180,
        sortable: false,
        rowSpan: ({ rowData }) => AmountUse(rowData.MemberList),
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'FullName',
        title: 'Khách hàng',
        dataKey: 'FullName',
        width: 250,
        sortable: false,
        rowSpan: ({ rowData }) =>
          rowData.UsageHistory && rowData.UsageHistory.length > 0
            ? rowData.UsageHistory.length
            : 1,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Phone',
        title: 'Số điện thoại',
        dataKey: 'Phone',
        width: 180,
        sortable: false,
        rowSpan: ({ rowData }) =>
          rowData.UsageHistory && rowData.UsageHistory.length > 0
            ? rowData.UsageHistory.length
            : 1
      },
      {
        key: 'Type',
        title: 'Sử dụng / Hoàn',
        dataKey: 'Type',
        cellRenderer: ({ rowData }) => translateType(rowData.Type),
        width: 200,
        sortable: false
      },
      {
        key: 'Code',
        title: 'Mã thẻ tiền',
        dataKey: 'Code',
        width: 150,
        sortable: false
      },
      {
        key: 'Title',
        title: 'Tên thẻ tiền',
        dataKey: 'Title',
        width: 180,
        sortable: false
      },
      {
        key: 'Value',
        title: 'Số tiền',
        dataKey: 'Value',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.Value),
        width: 150,
        sortable: false
      },
      {
        key: 'Value',
        title: 'Sản phẩm / Dịch vụ',
        dataKey: 'Value',
        cellRenderer: ({ rowData }) => (
          <Text tooltipMaxWidth={300}>
            {rowData.ProdLists &&
              rowData.ProdLists.map(
                item => `${item.Title} 
            (x${item.Qty})`
              ).join(', ')}
          </Text>
        ),
        width: 250,
        sortable: false,
        className: 'flex-fill'
      }
    ],
    []
  )

  const onPagesChange = ({ Pi, Ps }) => {
    setFilters({ ...filters, Pi, Ps })
  }

  const AmountUse = item => {
    var totalArray = 0
    if (!item) return totalArray
    for (let keyItem of item) {
      totalArray += keyItem?.UsageHistory?.length || 0
    }
    return totalArray
  }

  const translateType = types => {
    if (types === 'THE_TIEN') {
      return 'Mua thẻ tiền'
    }
    if (types === 'THANH_TOAN_DH') {
      return 'Thanh toán đơn hàng'
    }
    if (types === 'KET_THUC_THE') {
      return 'Kết thúc thẻ'
    }
    if (types === 'TRA_HANG') {
      return 'Trả hàng'
    }
    return types
  }

  const rowRenderer = ({ rowData, rowIndex, cells, columns, isScrolling }) => {
    if (isScrolling)
      return (
        <div className="pl-15px d-flex align-items">
          <div className="spinner spinner-primary w-40px"></div> Đang tải ...
        </div>
      )
    const indexList = [0, 1, 2]
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
            Báo cáo sử dụng thẻ tiền
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
        <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between">
          <div className="fw-500 font-size-lg">Danh sách sử dụng thẻ tiền</div>
          <div className="d-flex">
            <div className="fw-500 d-flex align-items-center">
              Tổng tiền
              <span className="font-size-xl fw-600 text-success pl-5px font-number">
                {PriceHelper.formatVND(TotalValue)}
              </span>
            </div>
          </div>
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
          translateType={translateType}
        />
      </div>
    </div>
  )
}

export default UseCardMoney
