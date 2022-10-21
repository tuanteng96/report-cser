import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import FilterList from 'src/components/Filter/FilterList'
import { PriceHelper } from 'src/helpers/PriceHelper'
import reportsApi from 'src/api/reports.api'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import ModalViewMobile from './ModalViewMobile'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import { uuidv4 } from '@nikitababko/id-generator'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import Text from 'react-texty'
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
    for (let [x, customer] of obj.ListCustomer.entries()) {
      for (let [o, order] of customer.ListOrders.entries()) {
        for (let [k, item] of order.OrderItems.entries()) {
          const newObj = {
            ...item,
            OrderItemsId: item.Id,
            ...order,
            TTToanNoOrder: order.TTToanNo,
            ...customer,
            TTToanNoCustomer: customer.TTToanNo,
            ...obj,
            rowIndex: index,
            Ids: uuidv4()
          }
          if (x === 0 && o === 0 && k === 0) {
          } else {
            delete newObj.ListCustomer
          }
          if (o === 0 && k === 0) {
          } else {
            delete newObj.ListOrders
          }
          if (k === 0) {
          } else {
            delete newObj.OrderItems
          }
          newArray.push(newObj)
        }
      }
    }
  }
  return newArray
}

function DebtPayment(props) {
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
    MemberID: ''
  })
  const [ListData, setListData] = useState([])
  const [ListDataMobile, setListDataMobile] = useState([])
  const [pageCount, setPageCount] = useState(0)
  const [TongTTNo, setTongTTNo] = useState(0)
  const [StockName, setStockName] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [isFilter, setIsFilter] = useState(false)
  const [PageTotal, setPageTotal] = useState(1)
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
    getListDebtPayment()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListDebtPayment = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    reportsApi
      .getListDebtPayment(BrowserHelpers.getRequestParamsList(filters))
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const { Items, Total, TTToanNo, PCount } = {
            Items: data.result?.Items || [],
            TTToanNo: data.result?.TTToanNo || 0,
            Total: data.result?.Total || 0,
            PCount: data?.result?.PCount || 0
          }
          setListData(convertArray(Items))
          setListDataMobile(Items)
          setTongTTNo(TTToanNo)
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

  const onFilter = values => {
    if (_.isEqual(values, filters)) {
      getListDebtPayment()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onExport = () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getListDebtPayment(
          BrowserHelpers.getRequestParamsList(filters, {
            Total: PageTotal
          })
        ),
      UrlName: '/ban-hang/thanh-toan-tra-no'
    })
  }

  const onPagesChange = ({ Pi, Ps }) => {
    setFilters({ ...filters, Pi, Ps })
  }

  const columns = useMemo(
    () => [
      {
        key: 'CreateDate',
        title: 'Ngày',
        dataKey: 'CreateDate',
        cellRenderer: ({ rowData }) =>
          moment(rowData.CreateDate).format('HH:mm DD/MM/YYYY'),
        width: 180,
        sortable: false,
        rowSpan: ({ rowData }) => AmountMember(rowData.ListCustomer),
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
        rowSpan: ({ rowData }) => AmountOrderItems(rowData.ListOrders),
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
        rowSpan: ({ rowData }) => AmountOrderItems(rowData.ListOrders),
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'TTToanNoCustomer',
        title: 'Tổng thanh toán nợ',
        dataKey: 'TTToanNoCustomer',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.TTToanNoCustomer),
        rowSpan: ({ rowData }) => AmountOrderItems(rowData.ListOrders),
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Id',
        title: 'ID Đơn hàng',
        dataKey: 'Id',
        cellRenderer: ({ rowData }) => `${rowData.Id}`,
        rowSpan: ({ rowData }) =>
          rowData.OrderItems && rowData.OrderItems.length > 0
            ? rowData.OrderItems.length
            : 1,
        width: 150,
        sortable: false
      },
      {
        key: 'TTToanNoOrder',
        title: 'Thanh toán nợ',
        dataKey: 'TTToanNoOrder',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.TTToanNoOrder),
        rowSpan: ({ rowData }) =>
          rowData.OrderItems && rowData.OrderItems.length > 0
            ? rowData.OrderItems.length
            : 1,
        width: 180,
        sortable: false
      },
      {
        key: 'ToPay',
        title: 'Chi tiết',
        dataKey: 'ToPay',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.ToPay),
        width: 120,
        sortable: false
      },
      {
        key: 'DaThToan',
        title: 'Thanh toán',
        dataKey: 'DaThToan',
        cellRenderer: ({ rowData }) => (
          <OverlayTrigger
            rootClose
            trigger="click"
            key="top"
            placement="top"
            overlay={
              <Popover id={`popover-positioned-top`}>
                <Popover.Header
                  className="py-10px text-uppercase fw-600"
                  as="h3"
                >
                  Chi tiết thanh toán #{rowData.OrderItemsId}
                </Popover.Header>
                <Popover.Body className="p-0">
                  <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                    <span>Tiền mặt</span>
                    <span>{PriceHelper.formatVND(rowData.DaThToan_TM)}</span>
                  </div>
                  <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                    <span>Chuyển khoản</span>
                    <span>{PriceHelper.formatVND(rowData.DaThToan_CK)}</span>
                  </div>
                  <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                    <span>Quẹt thẻ</span>
                    <span>{PriceHelper.formatVND(rowData.DaThToan_QT)}</span>
                  </div>
                </Popover.Body>
              </Popover>
            }
          >
            <div className="d-flex justify-content-between align-items-center w-100">
              {PriceHelper.formatVND(rowData.DaThToan)}
              <i className="fa-solid fa-circle-exclamation cursor-pointer text-warning"></i>
            </div>
          </OverlayTrigger>
        ),
        width: 180,
        sortable: false
      },
      {
        key: 'DaThToan_Vi',
        title: 'Ví',
        dataKey: 'DaThToan_Vi',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.DaThToan_Vi),
        width: 150,
        sortable: false
      },
      {
        key: 'DaThToan_ThTien',
        title: 'Thẻ tiền',
        dataKey: 'DaThToan_ThTien',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.DaThToan_ThTien),
        width: 150,
        sortable: false
      },
      {
        key: 'Prod',
        title: 'Đơn hàng trả lại',
        dataKey: 'Prod',
        cellRenderer: ({ rowData }) => (
          <Text tooltipMaxWidth={300}>
            {rowData.lines.map(line => line.ProdTitle).join(', ')}
          </Text>
        ),
        width: 350,
        sortable: false,
        className: 'flex-fill'
      }
    ],
    []
  )

  const onRefresh = () => {
    getListDebtPayment()
  }

  const onOpenFilter = () => {
    setIsFilter(true)
  }

  const onHideFilter = () => {
    setIsFilter(false)
  }

  const OpenModalMobile = value => {
    setInitialValuesMobile(value)
    setIsModalMobile(true)
  }

  const HideModalMobile = () => {
    setInitialValuesMobile(null)
    setIsModalMobile(false)
  }

  //
  const AmountMember = item => {
    var totalArray = 0
    if (!item) return totalArray
    for (let keyItem of item) {
      for (let keyOrder of keyItem.ListOrders) {
        totalArray += keyOrder?.OrderItems?.length || 0
      }
    }
    return totalArray > 0 ? totalArray : 1
  }
  const AmountOrderItems = ListOrders => {
    var totalArray = 0
    if (!ListOrders) return totalArray
    for (let keyOrders of ListOrders) {
      totalArray += keyOrders?.OrderItems?.length || 0
    }
    return totalArray > 0 ? totalArray : 1
  }

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

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Thanh toán trả nợ
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
          <div className="fw-500 font-size-lg">Danh sách thanh toán nợ</div>
          <div className="fw-500">
            Tổng thanh toán nợ{' '}
            <span className="font-size-xl fw-600 text-success">
              {PriceHelper.formatVND(TongTTNo)}
            </span>
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
        />
      </div>
    </div>
  )
}

export default DebtPayment
