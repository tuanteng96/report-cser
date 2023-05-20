import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import reportsApi from 'src/api/reports.api'
import FilterList from 'src/components/Filter/FilterList'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import _ from 'lodash'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'

import moment from 'moment'
import 'moment/locale/vi'
import { PriceHelper } from 'src/helpers/PriceHelper'
import ModalViewMobile from './ModalViewMobile'
import { OverlayTrigger, Popover } from 'react-bootstrap'

moment.locale('vi')

function BanksOrders(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [StockName, setStockName] = useState('')
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    DateStart: new Date(), // Ngày bắt đầu
    DateEnd: new Date(), // Ngày kết thúc
    Bank: '',
    Pi: 1, // Trang hiện tại
    Ps: 15 // Số lượng item
  })
  const [isFilter, setIsFilter] = useState(false)
  const [ListData, setListData] = useState([])
  const [Banks, setBanks] = useState([])
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
    getListBanksOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListBanksOrders = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    reportsApi
      .getListBanksOrder(BrowserHelpers.getRequestParamsList(filters))
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const { Items, Total, PCount, BanksList } = {
            Items: data.result?.Items || [],
            Total: data.result?.Total || 0,
            PCount: data.result?.PCount || 0,
            BanksList: data?.result?.Banks || []
          }
          setListData(
            Items.map(x => {
              let obj = { ...x }
              if (x.BankValue) {
                for (let bank of x.BankValue) {
                  obj[bank.ma_nh || 'KHAC'] = bank.Value
                }
              }

              return obj
            })
          )
          setBanks(
            BanksList.map(x => ({
              ...x,
              label: x.ngan_hang,
              value: x.ngan_hang
            }))
          )
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

  const columns = useMemo(() => {
    let newColumns = [
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
        key: 'CreateDate',
        title: 'Thời gian',
        dataKey: 'CreateDate',
        cellRenderer: ({ rowData }) =>
          rowData.CreateDate
            ? moment(rowData.CreateDate).format('HH:mm DD-MM-YYYY')
            : '',
        width: 200,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'ID',
        title: 'Mã đơn hàng',
        dataKey: 'ID',
        width: 160,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'KhachHang',
        title: 'Khách hàng',
        dataKey: 'KhachHang',
        width: 200,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'TongGiaTri',
        title: 'Tổng giá trị',
        dataKey: 'TongGiaTri',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData?.TongGiaTri),
        width: 160,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      }
    ]
    if (Banks) {
      for (let bank of Banks) {
        let obj = {
          key: bank.ma_nh || 'KHAC',
          title: bank.ngan_hang || 'KHAC',
          dataKey: bank.ma_nh || 'KHAC',
          cellRenderer: ({ rowData }) =>
            PriceHelper.formatVND(rowData[bank.ma_nh || 'KHAC']),
          width: 250,
          sortable: false
        }
        newColumns.push(obj)
      }
    }
    return [
      ...newColumns,
      {
        key: 'Desc',
        title: 'Ghi chú',
        dataKey: 'Desc',
        width: 250,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      }
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, Banks])

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
    getListBanksOrders()
  }

  const OpenModalMobile = value => {
    setInitialValuesMobile(value)
    setIsModalMobile(true)
  }

  const HideModalMobile = () => {
    setInitialValuesMobile(null)
    setIsModalMobile(false)
  }

  const onExport = async () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getListBanksOrder(
          BrowserHelpers.getRequestParamsList(filters, {
            Total: PageTotal
          })
        ),
      UrlName: '/bao-cao-thu-chi/cac-phuong-thuc-thanh-toan'
    })
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase font-size-xl fw-600 text-truncate max-w-250px max-w-md-auto d-block d-md-inline">
            TT Các phương thức chuyển khoản
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
        <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-md-center justify-content-between flex-md-row">
          <div className="fw-500 font-size-lg">
            Danh sách các phương thức chuyển khoản
          </div>
          <div className="fw-500 d-flex align-items-center">
            Tổng
            <OverlayTrigger
              rootClose
              trigger="click"
              key="top"
              placement="auto"
              overlay={
                <Popover id={`popover-positioned-top`}>
                  <Popover.Header
                    className="py-10px text-uppercase fw-600"
                    as="h3"
                  >
                    Chi tiết
                  </Popover.Header>
                  <Popover.Body className="p-0">
                    {Banks &&
                      Banks.map((item, index) => (
                        <div
                          className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between"
                          key={index}
                        >
                          <span className="w-60">{item.ngan_hang}</span>
                          <span className="flex-1 text-end">
                            {PriceHelper.formatVNDPositive(item.Value)}
                          </span>
                        </div>
                      ))}
                  </Popover.Body>
                </Popover>
              }
            >
              <div className="d-flex justify-content-between align-items-center">
                <span className="font-size-xl fw-600 text-success pl-5px font-number">
                  {PriceHelper.formatVNDPositive(
                    Banks && Banks.reduce((n, { Value }) => n + Value, 0)
                  )}
                </span>
                <i className="fa-solid fa-circle-exclamation cursor-pointer text-warning ml-5px"></i>
              </div>
            </OverlayTrigger>
          </div>
        </div>
        <div className="p-20px">
          <ReactTableV7
            rowKey="ID"
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
        <ModalViewMobile
          show={isModalMobile}
          onHide={HideModalMobile}
          data={initialValuesMobile}
        />
      </div>
    </div>
  )
}

export default BanksOrders
