import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import reportsApi from 'src/api/reports.api'
import FilterList from 'src/components/Filter/FilterList'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import _ from 'lodash'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'
import { uuidv4 } from '@nikitababko/id-generator'
import { JsonFilter } from 'src/Json/JsonFilter'

import moment from 'moment'
import 'moment/locale/vi'
import clsx from 'clsx'
import { useWindowSize } from 'src/hooks/useWindowSize'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import ModalViewMobile from './ModalViewMobile'

moment.locale('vi')

const { ServiceStatusBook } = JsonFilter

const ListStatus = [
  {
    value: 'CHUA_XAC_NHAN',
    label: 'Chưa xác nhận',
    className: 'text-warning'
  },
  {
    value: 'XAC_NHAN',
    label: 'Đã xác nhận',
    className: 'text-primary'
  },
  {
    value: 'KHACH_KHONG_DEN',
    label: 'Khách không đến',
    className: 'text-danger'
  },
  {
    value: 'TU_CHOI',
    label: 'Từ chối đặt lịch',
    className: 'text-danger'
  },
  {
    value: 'KHACH_DEN',
    label: 'Khách đến',
    className: 'text-success'
  }
]

function BookService(props) {
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
    StatusBooking: [...ServiceStatusBook], //"XAC_NHAN","CHUA_XAC_NHAN","KHACH_KHONG_DEN","KHACH_DEN", "XAC_NHAN_TU_DONG"
    StatusMember: '', //KHACH_CU,KHACH_VANG_LAI_CO_TK,KHACH_MOI
    StatusBook: '', //CHUA_CHON,DA_CHON
    StatusAtHome: '', //TAI_NHA,TAI_SPA
    MemberID: '',
    UserID: '', //nv dat
    UserServiceIDs: ''
  })
  const [isFilter, setIsFilter] = useState(false)
  const [ListData, setListData] = useState([])
  const [SumTotal, setSumTotal] = useState(null)
  const [loading, setLoading] = useState(false)
  const [PageTotal, setPageTotal] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [loadingExport, setLoadingExport] = useState(false)
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
    getBookService()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getBookService = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    reportsApi
      .getBookService(BrowserHelpers.getRequestParamsList(filters))
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const { Items, Total, PCount, Sum } = {
            Items: data.result?.Items || [],
            Total: data.result?.Total || 0,
            PCount: data?.result?.PCount || 0,
            Sum: data?.result?.Sum || null
          }
          setListData(Items.map(item => ({ ...item, Ids: uuidv4() })))
          setSumTotal(Sum)
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
    getBookService()
  }

  const onExport = async () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getBookService(
          BrowserHelpers.getRequestParamsList(filters, {
            Total: PageTotal
          })
        ),
      UrlName: '/dich-vu/dat-lich'
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
        key: 'CreateDate',
        title: 'Ngày tạo',
        dataKey: 'CreateDate',
        cellRenderer: ({ rowData }) =>
          rowData.CreateDate &&
          moment(rowData.CreateDate).format('HH:mm DD-MM-YYYY'),
        width: 200,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'BookDate',
        title: 'Ngày đặt lịch',
        dataKey: 'BookDate',
        cellRenderer: ({ rowData }) =>
          rowData.BookDate &&
          moment(rowData.BookDate).format('HH:mm DD-MM-YYYY'),
        width: 200,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Stock.Title',
        title: 'Cơ sở',
        dataKey: 'Stock.Title',
        cellRenderer: ({ rowData }) => rowData?.Stock?.Title,
        width: 200,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Member.FullName',
        title: 'Khách hàng',
        dataKey: 'Member.FullName',
        cellRenderer: ({ rowData }) => rowData?.Member?.FullName,
        width: 200,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Member.MobilePhone',
        title: 'Số điện thoại',
        dataKey: 'Member.MobilePhone',
        cellRenderer: ({ rowData }) => rowData?.Member?.MobilePhone,
        width: 160,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'RootTitles',
        title: 'Dịch vụ',
        dataKey: 'RootTitles',
        width: 220,
        sortable: false
      },
      {
        key: 'Status',
        title: 'Trạng thái',
        dataKey: 'Status',
        cellRenderer: ({ rowData }) => {
          const stt = rowData?.Status
            ? ListStatus.filter(x => x.value === rowData?.Status)
            : ''
          return stt && stt.length > 0 ? (
            <span className={clsx(stt[0].className)}>
              {rowData?.Desc === 'Tự động đặt lịch'
                ? 'Xác nhận tự động'
                : stt[0].label}
            </span>
          ) : (
            ''
          )
        },
        width: 150,
        sortable: false
      },
      {
        key: 'AtHome',
        title: 'Thực hiện',
        dataKey: 'AtHome',
        width: 120,
        cellRenderer: ({ rowData }) => (rowData.AtHome ? 'Tại nhà' : 'Tại Spa'),
        sortable: false
      },
      {
        key: 'UserServices',
        title: 'Nhân viên thực hiện',
        dataKey: 'UserServices',
        cellRenderer: ({ rowData }) =>
          rowData.UserServices &&
          rowData.UserServices.length > 0 &&
          rowData.UserServices.map(x => x.FullName).join(', '),
        width: 220,
        sortable: false
      },
      {
        key: 'UserName',
        title: 'Nhân viên tạo',
        dataKey: 'UserName',
        cellRenderer: ({ rowData }) =>
          rowData.UserName ? rowData.UserName : 'Đặt lịch Online',
        width: 180,
        sortable: false
      },
      {
        key: 'BookCount',
        title: 'Đặt lịch thành công',
        dataKey: 'BookCount',
        cellRenderer: ({ rowData }) => (
          <>
            {rowData?.BookCount?.Done || 0} / {rowData?.BookCount?.Total || 0}
          </>
        ),
        width: 180,
        sortable: false
      },
      {
        key: 'Desc',
        title: 'Ghi chú',
        dataKey: 'Desc',
        width: 200,
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
            Báo cáo đặt lịch
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
          <div className="fw-500 font-size-lg">Danh sách đặt lịch</div>
          {width < 1200 && (
            <OverlayTrigger
              rootClose
              trigger="click"
              key="top"
              placement="bottom"
              overlay={
                <Popover id={`popover-positioned-top`}>
                  <Popover.Body className="p-0">
                    <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                      <span>Khách đến</span>
                      <span>{SumTotal?.KHACH_DEN || 0}</span>
                    </div>
                    <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                      <span>Khách không đến</span>
                      <span>{SumTotal?.KHACH_KHONG_DEN || 0}</span>
                    </div>
                    <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                      <span>Xác nhận</span>
                      <span>{SumTotal?.XAC_NHAN || 0}</span>
                    </div>
                    <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                      <span>Xác nhận tự động</span>
                      <span>{SumTotal?.XAC_NHAN_TU_DONG || 0}</span>
                    </div>
                    <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                      <span>Chưa xác nhận</span>
                      <span>{SumTotal?.CHUA_XAC_NHAN || 0}</span>
                    </div>
                    <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                      <span>Từ chối đặt lịch</span>
                      <span>{SumTotal?.TU_CHOI || 0}</span>
                    </div>
                  </Popover.Body>
                </Popover>
              }
            >
              <i className="fa-solid fa-circle-exclamation cursor-pointer text-warning ml-5px font-size-h5"></i>
            </OverlayTrigger>
          )}
          {width >= 1200 && (
            <div className="d-flex">
              <div className="fw-500 pr-15px">
                Tổng
                <span className="font-size-xl fw-600 text-success pl-5px font-number">
                  {PageTotal || 0}
                </span>
              </div>
              <div className="fw-500 pr-15px">
                Khách đến
                <span className="font-size-xl fw-600 text-success pl-5px font-number">
                  {SumTotal?.KHACH_DEN || 0}
                </span>
              </div>
              <div className="fw-500 pr-15px">
                Khách không đến
                <span className="font-size-xl fw-600 text-danger pl-5px font-number">
                  {SumTotal?.KHACH_KHONG_DEN || 0}
                </span>
              </div>
              <div className="fw-500 pr-15px">
                Xác nhận
                <span className="font-size-xl fw-600 text-success pl-5px font-number">
                  {SumTotal?.XAC_NHAN || 0}
                </span>
              </div>
              <div className="fw-500 pr-15px">
                Xác nhận tự động
                <span className="font-size-xl fw-600 text-success pl-5px font-number">
                  {SumTotal?.XAC_NHAN_TU_DONG || 0}
                </span>
              </div>
              <div className="fw-500 pr-15px">
                Chưa xác nhận
                <span className="font-size-xl fw-600 text-success pl-5px font-number">
                  {SumTotal?.CHUA_XAC_NHAN || 0}
                </span>
              </div>
              <div className="fw-500">
                Từ chối đặt lịch
                <span className="font-size-xl fw-600 text-danger pl-5px font-number">
                  {SumTotal?.TU_CHOI || 0}
                </span>
              </div>
            </div>
          )}
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
        <ModalViewMobile
          show={isModalMobile}
          onHide={HideModalMobile}
          data={initialValuesMobile}
        />
      </div>
    </div>
  )
}

export default BookService
