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
import { PriceHelper } from 'src/helpers/PriceHelper'

import moment from 'moment'
import 'moment/locale/vi'
import ModalViewMobile from './ModalViewMobile'
import { OverlayTrigger, Popover } from 'react-bootstrap'

moment.locale('vi')

function InventoryService(props) {
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
    TenDichvu: '',
    MaDonHang: '',
    Loai: {
      label: 'Còn',
      value: 'Con'
    }
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
    getInventoryService()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getInventoryService = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    reportsApi
      .getInventoryService(BrowserHelpers.getRequestParamsList(filters))
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
    getInventoryService()
  }

  const onExport = async () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getInventoryService(
          BrowserHelpers.getRequestParamsList(filters, {
            Total: PageTotal
          })
        ),
      UrlName: '/dich-vu/ton-dich-vu'
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
        key: 'NgayMua',
        title: 'Ngày mua',
        dataKey: 'NgayMua',
        cellRenderer: ({ rowData }) =>
          moment(rowData.NgayMua).format('HH:mm DD-MM-YYYY'),
        width: 200,
        sortable: false
      },
      {
        key: 'MaDonHang',
        title: 'Mã đơn hàng',
        dataKey: 'MaDonHang',
        width: 150,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Ten_dich_vu',
        title: 'Tên dịch vụ',
        dataKey: 'Ten_dich_vu',
        width: 300,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'SoLuong',
        title: 'Số lượng',
        dataKey: 'SoLuong',
        width: 120,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Da_su_dung',
        title: 'Đã sử dụng',
        dataKey: 'Da_su_dung',
        width: 120,
        sortable: false
      },
      {
        key: 'Tong_buoi',
        title: 'Tổng số buổi',
        dataKey: 'Tong_buoi',
        width: 120,
        sortable: false
      },
      {
        key: 'Tong_tien',
        title: 'Tổng số tiền',
        dataKey: 'Tong_tien',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.Tong_tien),
        width: 180,
        sortable: false
      },
      {
        key: 'Da_Thanh_toan',
        title: 'Đã thanh toán',
        dataKey: 'Da_Thanh_toan',
        cellRenderer: ({ rowData }) => (
          <OverlayTrigger
            rootClose
            trigger="click"
            key="top"
            placement="top"
            overlay={
              <Popover id={`popover-positioned-top`}>
                <Popover.Body className="p-0">
                  <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                    <span>Tiền mặt</span>
                    <span>{PriceHelper.formatVND(rowData?.tien_mat)}</span>
                  </div>
                  <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                    <span>Chuyển khoản</span>
                    <span>{PriceHelper.formatVND(rowData?.ck)}</span>
                  </div>
                  <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                    <span>Quẹt thẻ</span>
                    <span>{PriceHelper.formatVND(rowData?.qt)}</span>
                  </div>
                </Popover.Body>
              </Popover>
            }
          >
            <div className="d-flex justify-content-between align-items-center w-100">
              {PriceHelper.formatVND(rowData.Da_Thanh_toan)}
              <i className="fa-solid fa-circle-exclamation cursor-pointer text-warning"></i>
            </div>
          </OverlayTrigger>
        ),
        width: 180,
        sortable: false
      },
      {
        key: 'Vi',
        title: 'Ví',
        dataKey: 'Vi',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.Vi),
        width: 180,
        sortable: false
      },
      {
        key: 'The_tien',
        title: 'Thẻ tiền',
        dataKey: 'The_tien',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.The_tien),
        width: 180,
        sortable: false
      },
      {
        key: 'Cong_no',
        title: 'Công nợ',
        dataKey: 'Cong_no',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.Cong_no),
        width: 180,
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
            Tồn dịch vụ
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
          <div className="fw-500 font-size-lg">Danh sách tồn dịch vụ</div>
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

export default InventoryService
