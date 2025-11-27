import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterList from 'src/components/Filter/FilterList'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import { PriceHelper } from 'src/helpers/PriceHelper'
import ModalViewMobile from './ModalViewMobile'
import reportsApi from 'src/api/reports.api'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import { uuidv4 } from '@nikitababko/id-generator'
import Text from 'react-texty'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'

import moment from 'moment'
import 'moment/locale/vi'
import moreApi from 'src/api/more.api'

moment.locale('vi')

const convertArray = (arrays, configs, filters) => {
  const newArray = []
  if (!arrays || arrays.length === 0) {
    return newArray
  }

  for (let [index, obj] of arrays.entries()) {
    let Threshold = null
    if (configs) {
      let index = configs.findIndex(x => x.ID === filters?.StockID)
      if (
        index > -1 &&
        configs[index].Children &&
        configs[index].Children.length > 0
      ) {
        let ThresholdIndex = configs[index].Children.findIndex(
          x => x.FromValue <= obj.TongThuc && obj.TongThuc < x.ToValue
        )
        if (ThresholdIndex > -1)
          Threshold = configs[index].Children[ThresholdIndex].Value
      } else {
        let index = configs.findIndex(x => x.ID === '-1')
        if (
          index > -1 &&
          configs[index].Children &&
          configs[index].Children.length > 0
        ) {
          let ThresholdIndex = configs[index].Children.findIndex(
            x => x.FromValue <= obj.TongThuc && obj.TongThuc < x.ToValue
          )
          if (ThresholdIndex > -1)
            Threshold = configs[index].Children[ThresholdIndex].Value
        }
      }
    }

    for (let [o, Staff] of obj.StaffsList.entries()) {
      let ThresholdRewards = 0
      if (Threshold) {
        if (Threshold <= 100) {
          ThresholdRewards = (Threshold * Staff.TongThuc) / 100
        } else {
          let StaffPercent = (Staff.TongThuc / obj.TongThuc) * 100
          ThresholdRewards = (StaffPercent * Threshold) / 100
          //
        }
      }
      for (let [k, order] of Staff.OrdersList.entries()) {
        const newObj = {
          ...order,
          CreateDateOrder: order.CreateDate,
          KhauTruOrder: order.KhauTru,
          ...Staff,
          TongStaff: Staff.Tong,
          TongThucStaff: Staff.TongThuc,
          KhauTruStaff: Staff.KhauTru,
          ThresholdRewards: Math.round(ThresholdRewards * 100) / 100,
          ...obj,
          rowIndex: index,
          Ids: uuidv4()
        }
        if (o === 0 && k === 0) {
        } else {
          delete newObj.StaffsList
        }
        if (k === 0) {
        } else {
          delete newObj.OrdersList
        }
        newArray.push(newObj)
      }
    }
  }
  return newArray
}

const convertArray2 = (arrays, configs, filters) => {
  const newArray = []
  if (!arrays || arrays.length === 0) {
    return newArray
  }

  for (let obj of arrays) {
    let Threshold = null
    if (configs) {
      let index = configs.findIndex(x => x.ID === filters?.StockID)
      if (
        index > -1 &&
        configs[index].Children &&
        configs[index].Children.length > 0
      ) {
        let ThresholdIndex = configs[index].Children.findIndex(
          x => x.FromValue <= obj.TongThuc && obj.TongThuc < x.ToValue
        )
        if (ThresholdIndex > -1)
          Threshold = configs[index].Children[ThresholdIndex].Value
      } else {
        let index = configs.findIndex(x => x.ID === '-1')
        if (
          index > -1 &&
          configs[index].Children &&
          configs[index].Children.length > 0
        ) {
          let ThresholdIndex = configs[index].Children.findIndex(
            x => x.FromValue <= obj.TongThuc && obj.TongThuc < x.ToValue
          )
          if (ThresholdIndex > -1)
            Threshold = configs[index].Children[ThresholdIndex].Value
        }
      }
    }

    let newObj = {
      ...obj,
      StaffsList: []
    }

    for (let Staff of obj.StaffsList) {
      let ThresholdRewards = 0
      if (Threshold) {
        if (Threshold <= 100) {
          ThresholdRewards = (Threshold * Staff.TongThuc) / 100
        } else {
          let StaffPercent = (Staff.TongThuc / obj.TongThuc) * 100
          ThresholdRewards = (StaffPercent * Threshold) / 100
          //
        }
      }
      newObj.StaffsList.push({
        ...Staff,
        ThresholdRewards: Math.round(ThresholdRewards * 100) / 100
      })
    }

    newArray.push(newObj)
  }
  return newArray
}

function SalesStaff(props) {
  const { CrStockID, Stocks, GlobalConfig } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || [],
    GlobalConfig: auth?.GlobalConfig
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    DateStart: new Date(), // Ngày bắt đầu
    DateEnd: new Date(), // Ngày kết thúc
    Pi: 1, // Trang hiện tại
    Ps: 15, // Số lượng item
    MemberID: '', // ID khách hàng
    StaffID: '', // ID nhân viên
    //ServiceCardID: '',
    CategoriesId: '', // ID 1 danh mục
    BrandId: '', //ID 1 nhãn hàng
    ProductId: '', // ID 1 SP, DV, NVL, ...
    KpiType: '',
    ProdOrService: ''
  })
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [ListData, setListData] = useState([])
  const [ListDataMobile, setListDataMobile] = useState([])
  const [TotalSales, setTotalSales] = useState({
    TongDoanhSo: 0,
    TongThucDoanhSo: 0,
    KhauTru: 0
  })
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
    getListSalarys()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListSalarys = async (isLoading = true, callback) => {
    isLoading && setLoading(true)

    let configs = null
    if (GlobalConfig?.Admin?.kpi_ngay) {
      let rs = await moreApi.getNameConfig('kpi_ngay')
      if (rs.data.data && rs.data.data.length > 0 && rs.data.data[0].Value) {
        configs = JSON.parse(rs.data.data[0].Value)
      }
    }

    reportsApi
      .getListStaffSales(BrowserHelpers.getRequestParamsList(filters))
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const {
            Items,
            Total,
            PCount,
            TongDoanhSo,
            TongThucDoanhSo,
            KhauTru
          } = {
            Items: data.result?.Items || [],
            Total: data.result?.Total || 0,
            PCount: data?.result?.PCount || 0,
            TongDoanhSo: data.result?.TongDoanhSo || 0,
            TongThucDoanhSo: data.result?.TongThucDoanhSo || 0,
            KhauTru: data.result?.KhauTru || 0
          }

          setListData(convertArray(Items, configs, filters))
          setListDataMobile(convertArray2(Items, configs, filters))
          setTotalSales({ TongDoanhSo, TongThucDoanhSo, KhauTru })
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
      getListSalarys()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    getListSalarys()
  }

  const onExport = () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        new Promise(async resolve => {
          let configs = null
          if (GlobalConfig?.Admin?.kpi_ngay) {
            let rs = await moreApi.getNameConfig('kpi_ngay')
            if (
              rs.data.data &&
              rs.data.data.length > 0 &&
              rs.data.data[0].Value
            ) {
              configs = JSON.parse(rs.data.data[0].Value)
            }
          }
          let result = await reportsApi.getListStaffSales(
            BrowserHelpers.getRequestParamsList(filters, {
              Total: PageTotal
            })
          )
          resolve({
            ...result,
            data: {
              ...result.data,
              configs: configs
            }
          })
        }),

      UrlName: '/nhan-vien/doanh-so'
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
        rowSpan: ({ rowData }) => AmountMember(rowData.StaffsList),
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'TongThuc',
        title: 'Tổng doanh số',
        dataKey: 'TongThuc',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.TongThuc),
        width: 150,
        sortable: false,
        rowSpan: ({ rowData }) => AmountMember(rowData.StaffsList),
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Staff.FullName',
        title: 'Nhân viên',
        dataKey: 'Staff.FullName',
        width: 250,
        sortable: false,
        rowSpan: ({ rowData }) =>
          rowData.OrdersList && rowData.OrdersList.length > 0
            ? rowData.OrdersList.length
            : 1
      },
      {
        key: 'Staff.StockTitle',
        title: 'Cơ sở nhân viên',
        dataKey: 'Staff.StockTitle',
        width: 250,
        sortable: false,
        rowSpan: ({ rowData }) =>
          rowData.OrdersList && rowData.OrdersList.length > 0
            ? rowData.OrdersList.length
            : 1
      },
      {
        key: 'TongThucStaff',
        title: 'Doanh số',
        dataKey: 'TongThucStaff',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.TongThucStaff),
        rowSpan: ({ rowData }) =>
          rowData.OrdersList && rowData.OrdersList.length > 0
            ? rowData.OrdersList.length
            : 1,
        width: 150,
        sortable: false
      },
      {
        key: 'ThresholdRewards',
        title: 'Thưởng',
        dataKey: 'ThresholdRewards',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.ThresholdRewards),
        rowSpan: ({ rowData }) =>
          rowData.OrdersList && rowData.OrdersList.length > 0
            ? rowData.OrdersList.length
            : 1,
        width: 150,
        sortable: false,
        hidden: !GlobalConfig?.Admin?.kpi_ngay || !filters.StockID
      },

      {
        key: 'ID',
        title: 'Đơn hàng',
        dataKey: 'ID',
        cellRenderer: ({ rowData }) => `#${rowData.ID}`,
        width: 120,
        sortable: false,
        className: ({ rowData }) =>
          rowData.tra_lai_don_hang ? 'bg-danger-o-90' : ''
      },
      {
        key: 'Member.FullName',
        title: 'Khách hàng',
        dataKey: 'Member.FullName',
        width: 250,
        sortable: false,
        className: ({ rowData }) =>
          rowData.tra_lai_don_hang ? 'bg-danger-o-90' : ''
      },
      {
        key: 'Member.Phone',
        title: 'Số điện thoại',
        dataKey: 'Member.Phone',
        width: 150,
        sortable: false,
        className: ({ rowData }) =>
          rowData.tra_lai_don_hang ? 'bg-danger-o-90' : ''
      },
      {
        key: 'GiaTriThuc',
        title: 'Doanh số',
        dataKey: 'GiaTriThuc',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.GiaTriThuc),
        width: 150,
        sortable: false,
        className: ({ rowData }) =>
          rowData.tra_lai_don_hang ? 'bg-danger-o-90' : ''
      },
      {
        key: 'Lines',
        title: 'Chi tiết',
        dataKey: 'Lines',
        cellRenderer: ({ rowData }) => (
          <Text tooltipMaxWidth={300}>
            {rowData.Lines.map(
              line =>
                `${line.ProdTitle} ( ${
                  line.GiaTri > 0
                    ? PriceHelper.formatVND(line.GiaTri)
                    : `- ${PriceHelper.formatVND(line.KhauTru)}`
                } )`
            ).join(', ')}
          </Text>
        ),
        width: 350,
        sortable: false,
        className: ({ rowData }) =>
          rowData.tra_lai_don_hang ? 'bg-danger-o-90' : ''
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const onPagesChange = ({ Pi, Ps }) => {
    setFilters({ ...filters, Pi, Ps })
  }

  const AmountMember = item => {
    var totalArray = 0
    if (!item) return totalArray
    for (let keyItem of item) {
      totalArray += keyItem.OrdersList.length
    }
    return totalArray > 0 ? totalArray : 1
  }

  const rowRenderer = ({ rowData, rowIndex, cells, columns, isScrolling }) => {
    // if (isScrolling)
    //   return (
    //     <div className="pl-15px d-flex align-items">
    //       <div className="spinner spinner-primary w-40px"></div> Đang tải ...
    //     </div>
    //   )
    let indexList = [0, 1, 2, 3, 4]
    if (GlobalConfig?.Admin?.kpi_ngay) {
      indexList.push(5)
    }

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
    return cells
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase font-size-xl fw-600">
            Nhân viên doanh số
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
          <div className="fw-500 font-size-lg">
            Danh sách doanh số nhân viên
          </div>
          <div className="fw-500 d-flex align-items-center ml-25px">
            Tổng doanh số
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
                    Chi tiết doanh số
                  </Popover.Header>
                  <Popover.Body className="p-0">
                    <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                      <span>Tổng</span>
                      <span>
                        {PriceHelper.formatVNDPositive(TotalSales.TongDoanhSo)}
                      </span>
                    </div>
                    <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                      <span>Khấu trừ</span>
                      <span className="text-danger">
                        {PriceHelper.formatVNDPositive(TotalSales.KhauTru)}
                      </span>
                    </div>
                  </Popover.Body>
                </Popover>
              }
            >
              <div className="d-flex justify-content-between align-items-center">
                <span className="font-size-xl fw-600 text-success pl-5px font-number">
                  {PriceHelper.formatVNDPositive(TotalSales.TongThucDoanhSo)}
                </span>
                <i className="cursor-pointer fa-solid fa-circle-exclamation text-success ml-5px"></i>
              </div>
            </OverlayTrigger>
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
          GlobalConfig={GlobalConfig}
          filters={filters}
        />
      </div>
    </div>
  )
}

export default SalesStaff
