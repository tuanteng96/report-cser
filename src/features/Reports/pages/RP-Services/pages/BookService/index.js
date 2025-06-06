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
import { PriceHelper } from 'src/helpers/PriceHelper'

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
    label: 'Khách hủy lịch',
    className: 'text-danger'
  },
  {
    value: 'KHACH_DEN',
    label: 'Khách có đến',
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
    UserServiceIDs: '',
    include: 'IsNewMember,OrderInDate'
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
          setListData(
            Items.map(item => ({
              ...item,
              Ids: uuidv4(),
              Desc: item.Desc
                ? item.Desc.replaceAll('\n', ' | ').replaceAll('</br>', ', ')
                : ''
            }))
          )
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
        cellRenderer: ({ rowData }) =>
          rowData?.Member?.MobilePhone !== '0000000000'
            ? rowData?.Member?.FullName
            : rowData?.FullName,
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
        cellRenderer: ({ rowData }) =>
          rowData?.Member?.MobilePhone !== '0000000000'
            ? rowData?.Member?.MobilePhone
            : rowData.Phone,
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
            <span
              className={clsx(
                rowData?.Desc &&
                  rowData?.Desc.toUpperCase().indexOf('TỰ ĐỘNG ĐẶT LỊCH') > -1
                  ? 'text-[#18c553]'
                  : stt[0].className
              )}
            >
              {rowData?.Desc &&
              rowData?.Desc.toUpperCase().indexOf('TỰ ĐỘNG ĐẶT LỊCH') > -1
                ? 'Đặt lịch dự kiến'
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
        key: 'OsUsedValue',
        title: 'Giá trị sử dụng',
        dataKey: 'OsUsedValue',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.OsUsedValue),
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
        key: 'IsNewMember',
        title: 'Trạng thái',
        dataKey: 'IsNewMember',
        cellRenderer: ({ rowData }) => (
          <>{rowData?.IsNewMember ? 'Khách mới' : 'Khách cũ'}</>
        ),
        width: 180,
        sortable: false
      },
      {
        key: 'OrderInDate',
        title: 'Đơn hàng',
        dataKey: 'OrderInDate',
        width: 250,
        sortable: false
      },
      {
        key: 'History',
        title: 'Lịch sử thay đổi',
        dataKey: 'History',
        cellRenderer: ({ rowData }) => (
          <>
            {rowData?.History?.Edit && rowData?.History?.Edit.length > 0 && (
              <>
                <OverlayTrigger
                  rootClose
                  trigger="click"
                  key="top"
                  placement="bottom"
                  overlay={
                    <Popover id={`popover-positioned-top`}>
                      <Popover.Body
                        className="p-0"
                        style={{
                          maxHeight: '300px',
                          overflow: 'auto'
                        }}
                      >
                        {rowData?.History?.Edit.sort(
                          (a, b) =>
                            moment(b.CreateDate, 'HH:mm DD-MM-YYYY').valueOf() -
                            moment(a.CreateDate, 'HH:mm DD-MM-YYYY').valueOf()
                        ).map((item, index) => (
                          <div
                            className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom"
                            key={index}
                          >
                            <div className="mb-2px">{item.CreateDate}</div>
                            <div
                              style={{
                                fontWeight: 400
                              }}
                            >
                              <div>
                                Dịch vụ{' '}
                                {item?.Booking?.Roots &&
                                item?.Booking?.Roots.length > 0
                                  ? item?.Booking?.Roots.map(x => x.label).join(
                                      ', '
                                    )
                                  : 'Chưa chọn dịch vụ'}
                              </div>
                              <div>
                                Thời gian :{' '}
                                {moment(
                                  item?.Booking?.BookDate,
                                  'YYYY-MM-DD HH:mm'
                                ).format('HH:mm DD-MM-YYYY')}
                              </div>
                              <div>
                                Trạng thái :{' '}
                                {item?.Booking?.Status
                                  ? ListStatus.filter(
                                      x => x.value === item?.Booking?.Status
                                    )[0].label
                                  : 'Chưa xác định'}
                              </div>
                              <div>
                                Thực hiện{' '}
                                {item?.Booking?.AtHome ? 'tại nhà' : 'tại spa'}
                              </div>
                              {item?.Booking?.UserServices &&
                                item?.Booking?.UserServices.length > 0 && (
                                  <div>
                                    Nhân viên thực hiện :{' '}
                                    {item?.Booking?.UserServices.map(
                                      x => x.label
                                    ).join(', ')}
                                  </div>
                                )}
                              {item?.Booking?.Desc && (
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: item?.Booking?.Desc.replaceAll(
                                      '\n',
                                      ' | '
                                    )
                                  }}
                                ></div>
                              )}

                              <div>Thay đổi từ {item?.Staff?.FullName}</div>
                            </div>
                          </div>
                        ))}
                      </Popover.Body>
                    </Popover>
                  }
                >
                  <div className="w-100 d-flex justify-content-between align-items-center">
                    <div>
                      Ngày{' '}
                      {
                        rowData?.History?.Edit[
                          rowData?.History?.Edit.length - 1
                        ].CreateDate
                      }
                    </div>
                    <i className="fa-solid fa-circle-exclamation text-warning"></i>
                  </div>
                </OverlayTrigger>
              </>
            )}
          </>
        ),
        width: 250,
        sortable: false
      },
      {
        key: 'Desc',
        title: 'Ghi chú',
        dataKey: 'Desc',
        width: 250,
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
        <div className="border-gray-200 px-20px py-15px border-bottom d-flex align-items-md-center justify-content-between flex-md-row">
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
                    <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                      <span>Khách đến</span>
                      <span>{SumTotal?.KHACH_DEN || 0}</span>
                    </div>
                    <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                      <span>Khách không đến</span>
                      <span>{SumTotal?.KHACH_KHONG_DEN || 0}</span>
                    </div>
                    <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                      <span>Xác nhận</span>
                      <span>{SumTotal?.XAC_NHAN || 0}</span>
                    </div>
                    <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                      <span>Đặt lịch dự kiến</span>
                      <span>{SumTotal?.XAC_NHAN_TU_DONG || 0}</span>
                    </div>
                    <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                      <span>Chưa xác nhận</span>
                      <span>{SumTotal?.CHUA_XAC_NHAN || 0}</span>
                    </div>
                    <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                      <span>Khách huỷ lịch</span>
                      <span>{SumTotal?.TU_CHOI || 0}</span>
                    </div>
                  </Popover.Body>
                </Popover>
              }
            >
              <i className="cursor-pointer fa-solid fa-circle-exclamation text-warning ml-5px font-size-h5"></i>
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
                Đặt lịch dự kiến
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
                Khách huỷ lịch
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
