import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterList from 'src/components/Filter/FilterList'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import { PriceHelper } from 'src/helpers/PriceHelper'
import reportsApi from 'src/api/reports.api'
import ModalViewMobile from './ModalViewMobile'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import { useWindowSize } from 'src/hooks/useWindowSize'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import { uuidv4 } from '@nikitababko/id-generator'

import moment from 'moment'
import 'moment/locale/vi'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'

moment.locale('vi')

const convertArray = arrays => {
  const newArray = []
  if (!arrays || arrays.length === 0) {
    return newArray
  }
  for (let [index, obj] of arrays.entries()) {
    for (let [x, order] of obj.ListOrders.entries()) {
      for (let [o, item] of order.ListDebt.entries()) {
        const newObj = {
          ...item,
          ...order,
          OrderId: order.Id,
          OrderTongNo: order.TongNo,
          ...obj,
          rowIndex: index,
          Ids: uuidv4()
        }
        if (x === 0 && o === 0) {
        } else {
          delete newObj.ListOrders
        }
        if (o === 0) {
        } else {
          delete newObj.ListDebt
        }
        newArray.push(newObj)
      }
    }
  }
  return newArray
}

const convertArray2 = arrays => {
  const newArray = []
  if (!arrays || arrays.length === 0) {
    return newArray
  }
  for (let item of arrays) {
    let obj = {
      TTTK: {},
      TTT: []
    }
    for (const property in item) {
      if (
        property !== 'SenderID' &&
        !property.includes('Thanh toán nợ trước') &&
        !property.includes('Còn lại nợ trước') &&
        !property.includes('Nợ của các đơn trong kỳ')
      ) {
        if (
          property.includes('Thanh toán cho đơn trong kỳ') &&
          property.includes(')_')
        ) {
          obj.TTTK[property] = item[property]
        } else if (
          property.includes('Tổng thanh toán') &&
          property.includes(')_')
        ) {
          obj.TTT.push(item[property])
        } else {
          if (!property.includes('Thanh toán cho đơn trong kỳ')) {
            obj[property] = item[property]
          }
        }
      }
    }
    newArray.push(obj)
  }
  return newArray
}

function Home(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    DateStart: moment('01-01-2010', 'DD-MM-YYYY').toDate(), // Ngày bắt đầu
    DateEnd: new Date(), // Ngày kết thúc
    Pi: 1, // Trang hiện tại
    Ps: 15, // Số lượng item
    TypeCN: '',
    ShowsType: 1
  })
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [ListData, setListData] = useState([])
  const [ListDataMobile, setListDataMobile] = useState([])
  const [Total, setTotal] = useState({
    DH_NO: 0,
    KH_NO: 0,
    TongNo: 0
  })
  const [pageCount, setPageCount] = useState(0)
  const [PageTotal, setPageTotal] = useState(1)
  const [initialValuesMobile, setInitialValuesMobile] = useState(null)
  const [isModalMobile, setIsModalMobile] = useState(false)
  const { width } = useWindowSize()

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
    getListDebt()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListDebt = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    if (Number(filters.ShowsType) !== 2) {
      reportsApi
        .getListDebt(BrowserHelpers.getRequestParamsList(filters))
        .then(({ data }) => {
          if (data.isRight) {
            PermissionHelpers.ErrorAccess(data.error)
            setLoading(false)
          } else {
            const { Items, Total, PCount, TongNo, DH_NO, KH_NO } = {
              Items: data.result?.Items || [],
              TongNo: data.result?.TongNo || 0,
              DH_NO: (data.result?.DH_NO && data.result?.DH_NO.length) || 0,
              KH_NO: (data.result?.KH_NO && data.result?.KH_NO.length) || 0,
              Total: data.result?.Total || 0,
              PCount: data?.result?.PCount || 0
            }
            setListData(convertArray(Items))
            setListDataMobile(Items)
            setTotal({ TongNo, DH_NO, KH_NO })
            setLoading(false)
            setPageTotal(Total)
            setPageCount(PCount)
            isFilter && setIsFilter(false)
            callback && callback()
            PermissionHelpers.HideErrorAccess()
          }
        })
        .catch(error => console.log(error))
    } else {
      reportsApi
        .getListDebt2(BrowserHelpers.getRequestParamsList(filters))
        .then(({ data }) => {
          if (data.isRight) {
            PermissionHelpers.ErrorAccess(data.error)
            setLoading(false)
          } else {
            const { Items, Total, PCount, TongNo, DH_NO, KH_NO } = {
              Items: data?.lst || [],
              TongNo: 0,
              DH_NO: 0,
              KH_NO: 0,
              Total: data?.Total || 0,
              PCount: data?.PCount || 0
            }
            setListData(convertArray2(Items))
            setListDataMobile(convertArray2(Items))
            setTotal({ TongNo, DH_NO, KH_NO })
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
  }

  const onFilter = values => {
    if (_.isEqual(values, filters)) {
      getListDebt()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onExport = () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: async () => {
        if (Number(filters.ShowsType) === 2) {
          let rs = await reportsApi.getListDebt2(
            BrowserHelpers.getRequestParamsList(filters, { Total: PageTotal })
          )
          return {
            ...rs,
            data: {
              ...rs.data,
              param: {
                Body: {
                  ...filters,
                  DateStart: filters.DateStart
                    ? moment(filters.DateStart).format('DD/MM/yyyy')
                    : null,
                  DateEnd: filters.DateEnd
                    ? moment(filters.DateEnd).format('DD/MM/yyyy')
                    : null
                }
              }
            }
          }
        }
        return reportsApi.getListDebt(
          BrowserHelpers.getRequestParamsList(filters, { Total: PageTotal })
        )
      },
      UrlName: '/cong-no/danh-sach'
    })
  }

  const onRefresh = () => {
    getListDebt()
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

  const onPagesChange = ({ Pi, Ps }) => {
    setFilters({ ...filters, Pi, Ps })
  }

  const formatText = text => {
    if (text.includes('Nợ trước')) {
      return 'Nợ trước kỳ'
    }
    if (text.includes('Bán mới trong kỳ')) {
      return 'Nợ phát sinh trong kỳ'
    }
    if (text.includes('Tổng thanh toán') && !text.includes(')_')) {
      return 'Thanh toán, trả nợ cũ'
    }
    if (text.includes('Nợ cuối')) {
      return 'Nợ cuối kỳ'
    }
    if (text.includes('_TM')) {
      return 'Tiền mặt'
    }
    if (text.includes('_CK')) {
      return 'Chuyển khoản'
    }
    if (text.includes('_QT')) {
      return 'Quẹt thẻ'
    }
    if (text.includes('_TT')) {
      return 'Thẻ tiền'
    }
    if (text.includes('_VI')) {
      return 'Ví'
    }
    if (text.includes('_KTT')) {
      return 'Kết thúc thẻ'
    }
    if (text.includes('_TRA_HANG')) {
      return 'Trả hàng'
    }
    if (text.includes('_KET_NO')) {
      return 'Tặng'
    }
    if (text.includes('_KHOA_NO')) {
      return 'Khoá nợ'
    }
    return text
  }

  const columns = useMemo(() => {
    if (Number(filters.ShowsType) === 2) {
      if (!ListData || ListData.length === 0) {
        return [
          {
            key: 'index',
            title: 'STT',
            dataKey: 'index',
            cellRenderer: ({ rowIndex }) => {
              return filters.Ps * (filters.Pi - 1) + (rowIndex + 1)
            },
            width: 60,
            sortable: false,
            align: 'center',
            rowSpan: ({ rowData }) => 1,
            mobileOptions: {
              visible: true
            }
          },
          {
            key: 'MemberID',
            title: 'ID Khách hàng',
            dataKey: 'MemberID',
            cellRenderer: ({ rowData }) => rowData?.MemberID,
            width: 120,
            sortable: false,
            rowSpan: ({ rowData }) => 1,
            mobileOptions: {
              visible: true
            }
          },
          {
            key: 'MemberName',
            title: 'Khách hàng',
            dataKey: 'MemberName',
            cellRenderer: ({ rowData }) => rowData?.MemberName,
            width: 250,
            sortable: false,
            rowSpan: ({ rowData }) => 1,
            mobileOptions: {
              visible: true
            }
          }
        ]
      }
      let rs = [
        {
          key: 'index',
          title: 'STT',
          dataKey: 'index',
          cellRenderer: ({ rowData, rowIndex }) => {
            return (
              filters.Ps * (filters.Pi - 1) +
              ((rowData.rowIndex || rowIndex || 0) + 1)
            )
          },
          width: 60,
          sortable: false,
          align: 'center',
          rowSpan: ({ rowData }) => 1,
          mobileOptions: {
            visible: true
          }
        }
      ]
      for (let property in ListData[0]) {
        var i = Object.keys(ListData[0]).indexOf(property)

        if (property !== 'TTT' && property !== 'TTTK') {
          rs.push({
            key: property,
            title: formatText(property),
            dataKey: property,
            cellRenderer: ({ rowData }) =>
              property.includes('Thanh toán cho đơn trong kỳ') ||
              property.includes('Tổng thanh toán') ? (
                <>
                  <OverlayTrigger
                    rootClose
                    trigger="click"
                    key="bottom"
                    placement="bottom"
                    overlay={
                      <Popover
                        id={`popover-positioned-top`}
                        style={{
                          minWidth: '350px'
                        }}
                      >
                        <Popover.Body className="p-0 overflow-auto h-250px">
                          {Object.keys(rowData['TTTK']).map((keyName, i) => (
                            <div
                              className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between"
                              key={i}
                            >
                              <span>Trong kỳ - {formatText(keyName)}</span>
                              <span>
                                {PriceHelper.formatVND(
                                  rowData['TTTK'][keyName]
                                )}
                              </span>
                            </div>
                          ))}
                          {Object.keys(rowData['TTTK']).map((keyName, i) => (
                            <div
                              className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between"
                              key={i}
                            >
                              <span>Nợ cũ - {formatText(keyName)}</span>
                              <span>
                                {PriceHelper.formatVND(
                                  rowData['TTT'][i] - rowData['TTTK'][keyName]
                                )}
                              </span>
                            </div>
                          ))}
                        </Popover.Body>
                      </Popover>
                    }
                  >
                    <div className="d-flex justify-content-between align-items-center w-100">
                      <span className="pl-5px font-number">
                        {PriceHelper.formatVNDPositive(rowData[property])}
                      </span>
                      <i className="cursor-pointer fa-solid fa-circle-exclamation text-warning ml-5px"></i>
                    </div>
                  </OverlayTrigger>
                </>
              ) : (
                <>
                  {typeof rowData[property] === 'string' ||
                  property === 'ID Khách hàng'
                    ? rowData[property]
                    : PriceHelper.formatVND(rowData[property])}
                </>
              ),
            width: 220,
            sortable: false,
            rowSpan: ({ rowData }) => 1,
            mobileOptions: {
              visible: i < 4
            }
          })
        }
      }

      return rs
    }
    return [
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
        rowSpan: ({ rowData }) => checkRowSpan(rowData.ListOrders),
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Member.FullName',
        title: 'Khách hàng',
        dataKey: 'Member.FullName',
        cellRenderer: ({ rowData }) => rowData?.Member?.FullName,
        width: 250,
        sortable: false,
        rowSpan: ({ rowData }) => checkRowSpan(rowData.ListOrders),
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Member.Phone',
        title: 'Số điện thoại',
        dataKey: 'Member.Phone',
        width: 180,
        sortable: false,
        cellRenderer: ({ rowData }) => rowData?.Member?.Phone,
        rowSpan: ({ rowData }) => checkRowSpan(rowData.ListOrders),
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'TongNo',
        title: 'Tổng nợ',
        dataKey: 'TongNo',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.TongNo),
        width: 180,
        sortable: false,
        rowSpan: ({ rowData }) => checkRowSpan(rowData.ListOrders),
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'OrderId',
        title: 'ID đơn hàng',
        dataKey: 'OrderId',
        cellRenderer: ({ rowData }) => `#${rowData.OrderId}`,
        width: 160,
        sortable: false,
        rowSpan: ({ rowData }) =>
          rowData.ListDebt && rowData.ListDebt.length > 0
            ? rowData.ListDebt.length
            : 1
      },
      {
        key: 'StockName',
        title: 'Cơ sở',
        dataKey: 'StockName',
        width: 220,
        sortable: false,
        rowSpan: ({ rowData }) =>
          rowData.ListDebt && rowData.ListDebt.length > 0
            ? rowData.ListDebt.length
            : 1
      },
      {
        key: 'CreateDate',
        title: 'Ngày bán',
        dataKey: 'CreateDate',
        cellRenderer: ({ rowData }) =>
          rowData?.CreateDate
            ? moment(rowData.CreateDate).format('DD/MM/YYYY')
            : 'Chưa xác định',
        width: 180,
        sortable: false,
        rowSpan: ({ rowData }) =>
          rowData.ListDebt && rowData.ListDebt.length > 0
            ? rowData.ListDebt.length
            : 1
      },
      {
        key: 'OrderTongNo',
        title: 'Tổng số tiền nợ',
        dataKey: 'OrderTongNo',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.OrderTongNo),
        width: 180,
        sortable: false,
        rowSpan: ({ rowData }) =>
          rowData.ListDebt && rowData.ListDebt.length > 0
            ? rowData.ListDebt.length
            : 1
      },
      {
        key: 'ProdTitle',
        title: 'Tên sản phẩm',
        dataKey: 'ProdTitle',
        width: 200,
        sortable: false
      },
      {
        key: 'Qty',
        title: 'Số lượng',
        dataKey: 'Qty',
        width: 100,
        sortable: false
      },
      {
        key: 'ToPay',
        title: 'Thành tiền',
        dataKey: 'ToPay',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.ToPay),
        width: 180,
        sortable: false
      },
      {
        key: 'ConNo',
        title: 'Còn nợ',
        dataKey: 'ConNo',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.ConNo),
        width: 180,
        sortable: false
      },
      {
        key: 'DayToPay',
        title: 'Ngày thanh toán nợ',
        dataKey: 'DayToPay',
        cellRenderer: ({ rowData }) =>
          rowData.DayToPay ? moment(rowData.DayToPay).format('DD-MM-YYYY') : '',
        width: 180,
        sortable: false
      },
      {
        key: 'Desc',
        title: 'Ghi chú',
        dataKey: 'Desc',
        cellRenderer: ({ rowData }) => rowData.Desc,
        width: 250,
        sortable: false
      }
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ListData])

  const rowRenderer = ({ rowData, rowIndex, cells, columns, isScrolling }) => {
    if (Number(filters.ShowsType) !== 2 && isScrolling)
      return (
        <div className="pl-15px d-flex align-items">
          <div className="spinner spinner-primary w-40px"></div> Đang tải ...
        </div>
      )
    const indexList = [0, 1, 2, 3, 4, 5, 6]
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

  const checkRowSpan = ListOrder => {
    var totalArray = 0
    if (!ListOrder) return totalArray
    for (let keyItem of ListOrder) {
      totalArray += keyItem?.ListDebt?.length || 0
    }
    return totalArray > 1 ? totalArray : 1
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase font-size-xl fw-600">
            Báo cáo công nợ
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
        <div className="border-gray-200 px-20px py-15px border-bottom d-flex align-items-center justify-content-between">
          <div className="fw-500 font-size-lg">Danh sách công nợ</div>
          {Number(filters.ShowsType) !== 2 && (
            <>
              {width <= 1200 ? (
                <div className="fw-500 d-flex align-items-center">
                  Tổng tiền nợ
                  <OverlayTrigger
                    rootClose
                    trigger="click"
                    key="bottom"
                    placement="bottom"
                    overlay={
                      <Popover id={`popover-positioned-top`}>
                        <Popover.Body className="p-0">
                          <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                            <span>Tổng KH nợ</span>
                            <span>{Total.KH_NO}</span>
                          </div>
                          <div className="py-10px px-15px fw-600 font-size-md d-flex justify-content-between">
                            <span>Tổng ĐH nợ</span>
                            <span>{Total.DH_NO}</span>
                          </div>
                          <div className="py-10px px-15px fw-600 font-size-md d-flex justify-content-between">
                            <span>Tổng tiền nợ</span>
                            <span>{Total.TongNo}</span>
                          </div>
                        </Popover.Body>
                      </Popover>
                    }
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="font-size-xl fw-600 text-danger pl-5px font-number">
                        {PriceHelper.formatVNDPositive(Total.TongNo)}
                      </span>
                      <i className="cursor-pointer fa-solid fa-circle-exclamation text-danger ml-5px"></i>
                    </div>
                  </OverlayTrigger>
                </div>
              ) : (
                <div className="d-flex">
                  <div className="fw-500">
                    Tổng KH nợ{' '}
                    <span className="font-size-xl fw-600 text-danger pl-5px font-number">
                      {Total.KH_NO}
                    </span>
                  </div>
                  <div className="fw-500 pl-20px">
                    Tổng ĐH nợ{' '}
                    <span className="font-size-xl fw-600 text-danger pl-5px font-number">
                      {Total.DH_NO}
                    </span>
                  </div>
                  <div className="fw-500 pl-20px">
                    Tổng tiền nợ{' '}
                    <span className="font-size-xl fw-600 text-danger pl-5px font-number">
                      {PriceHelper.formatVND(Total.TongNo)}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <div className="p-20px">
          <ReactTableV7
            headerHeight={60}
            rowKey={Number(filters.ShowsType) !== 2 ? 'Ids' : 'ID Khách hàng'}
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
          filters={filters}
          formatText={formatText}
        />
      </div>
    </div>
  )
}

export default Home
