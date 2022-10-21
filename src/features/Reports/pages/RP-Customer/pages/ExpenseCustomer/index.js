import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterToggle from 'src/components/Filter/FilterToggle'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import { PriceHelper } from 'src/helpers/PriceHelper'
import reportsApi from 'src/api/reports.api'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import ModalViewMobile from './ModalViewMobile'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'
import { uuidv4 } from '@nikitababko/id-generator'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
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
    for (let [x, order] of obj.OrdersList.entries()) {
      const newObj = {
        ...order,
        ...obj,
        CoSoMuaHang: order.StockName,
        NgayMuaHang: order.CreateDate,
        rowIndex: index,
        Id: uuidv4()
      }
      if (x !== 0) delete newObj.OrdersList
      newArray.push(newObj)
    }
  }
  return newArray
}

function ExpenseCustomer(props) {
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
    StockOrderID: '', // Cơ sở mua
    MemberID: '', // ID Khách hàng
    GroupCustomerID: '', // ID Nhóm khách hàng
    SourceName: '', // Nguồn
    DateOrderStart: null, // Bắt đầu mua hàng
    DateOrderEnd: null, // Kết thúc mua hàng
    TypeOrder: '', // Phát sinh mua (SP / DV / THE_TIEN / PP / NVL)
    BrandOrderID: '', // Phát sinh mua theo nhãn hàng
    ProductOrderID: '', // Phát sinh mua theo mặt hàng
    PriceFromOrder: '', // Mức chi tiêu từ
    PriceToOrder: '' // Mức chi tiêu đến
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
    getListExpenseCustomer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListExpenseCustomer = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    reportsApi
      .getListCustomerExpense(BrowserHelpers.getRequestParamsToggle(filters))
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
          setListDataMobile(Members)
          setListData(convertArray(Members))
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
      getListExpenseCustomer()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    getListExpenseCustomer()
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
        reportsApi.getListCustomerExpense(
          BrowserHelpers.getRequestParamsToggle(filters, { Total: PageTotal })
        ),
      UrlName: '/khach-hang/chi-tieu'
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
          filters.Ps * (filters.Pi - 1) + rowData.rowIndex + 1,
        width: 60,
        sortable: false,
        align: 'center',
        rowSpan: ({ rowData }) =>
          rowData.OrdersList && rowData.OrdersList.length > 0
            ? rowData.OrdersList.length
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
          rowData.OrdersList && rowData.OrdersList.length > 0
            ? rowData.OrdersList.length
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
          rowData.OrdersList && rowData.OrdersList.length > 0
            ? rowData.OrdersList.length
            : 1,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'MemberPhone',
        title: 'Số điện thoại',
        dataKey: 'MemberPhone',
        width: 150,
        sortable: false,
        rowSpan: ({ rowData }) =>
          rowData.OrdersList && rowData.OrdersList.length > 0
            ? rowData.OrdersList.length
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
          rowData.OrdersList && rowData.OrdersList.length > 0
            ? rowData.OrdersList.length
            : 1
      },
      {
        key: 'TongChiTieu',
        title: 'Tổng tiền chi tiêu',
        dataKey: 'TongChiTieu',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.TongChiTieu),
        width: 150,
        sortable: false,
        rowSpan: ({ rowData }) =>
          rowData.OrdersList && rowData.OrdersList.length > 0
            ? rowData.OrdersList.length
            : 1
      },
      {
        key: 'NgayMuaHang',
        title: 'Thời gian mua hàng',
        dataKey: 'NgayMuaHang',
        cellRenderer: ({ rowData }) =>
          rowData.NgayMuaHang
            ? moment(rowData.NgayMuaHang).format('HH:mm DD/MM/YYYY')
            : '',
        width: 180,
        sortable: false
      },
      {
        key: 'CoSoMuaHang',
        title: 'Cở sở mua hàng',
        dataKey: 'CoSoMuaHang',
        width: 180,
        sortable: false
      },
      {
        key: 'ID',
        title: 'Mã đơn hàng',
        dataKey: 'ID',
        width: 120,
        sortable: false
      },
      {
        key: 'Prods',
        title: 'Mặt hàng mua',
        dataKey: 'Prods',
        cellRenderer: ({ rowData }) => (
          <Text tooltipMaxWidth={300}>
            {rowData.Prods && rowData.Prods.length > 0
              ? rowData.Prods.map(prod => `${prod.name} (x${prod.qty})`).join(
                  ', '
                )
              : 'Không có mặt hàng.'}
          </Text>
        ),
        width: 250,
        sortable: false,
        resizable: true
      },
      {
        key: 'DoanhSo',
        title: 'Doanh số',
        dataKey: 'DoanhSo',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.DoanhSo),
        width: 150,
        sortable: false
      },
      {
        key: 'GiamGia',
        title: 'Giảm giá',
        dataKey: 'GiamGia',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.GiamGia),
        width: 150,
        sortable: false
      },
      {
        key: 'DaThanhToan',
        title: 'Đã thanh toán',
        dataKey: 'DaThanhToan',
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
                  Chi tiết thanh toán #{rowData.ID}
                </Popover.Header>
                <Popover.Body className="p-0">
                  <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                    <span>Tiền mặt</span>
                    <span>{PriceHelper.formatVND(rowData.TM)}</span>
                  </div>
                  <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                    <span>Chuyển khoản</span>
                    <span>{PriceHelper.formatVND(rowData.CK)}</span>
                  </div>
                  <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                    <span>Quẹt thẻ</span>
                    <span>{PriceHelper.formatVND(rowData.QT)}</span>
                  </div>
                </Popover.Body>
              </Popover>
            }
          >
            <div className="d-flex justify-content-between align-items-center w-100">
              {PriceHelper.formatVND(rowData.DaThanhToan)}
              <i className="fa-solid fa-circle-exclamation cursor-pointer text-warning"></i>
            </div>
          </OverlayTrigger>
        ),
        width: 180,
        sortable: false
      },
      {
        key: 'TheTien',
        title: 'Thẻ tiền',
        dataKey: 'TheTien',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.TheTien),
        width: 150,
        sortable: false
      },
      {
        key: 'Vi',
        title: 'Ví',
        dataKey: 'Vi',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.Vi),
        width: 150,
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

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Khách hàng chi tiêu
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

export default ExpenseCustomer
