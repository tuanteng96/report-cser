import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import reportsApi from 'src/api/reports.api'
import ModalViewMobile from './ModalViewMobile'
import { PriceHelper } from 'src/helpers/PriceHelper'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import { useWindowSize } from 'src/hooks/useWindowSize'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'
import FilterCourse from 'src/components/Filter/FilterCourse'

import moment from 'moment'
import 'moment/locale/vi'

moment.locale('vi')

function CourseReport(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    Pi: 1,
    Ps: 10,
    filter: {
      Status: '',
      DayToPay: [],
      DayStatus: [],
      FromDayStatus: '',
      ToDayStatus: '',
      FromDebt: '',
      ToDebt: '',
      Tags: '',
      no: '', //no | khong
      Places: ""
    },
    filterCourse: {
      StockID: CrStockID, // coso
      ID: '',
      Tags: '',
    },
    order: {
      CreateDate: 'desc'
    }
  })
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [ListData, setListData] = useState([])
  const [Total, setTotal] = useState({})
  const [PageTotal, setPageTotal] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [initialValuesMobile, setInitialValuesMobile] = useState(null)
  const [isModalMobile, setIsModalMobile] = useState(false)
  const { width } = useWindowSize()

  useEffect(() => {
    const index = Stocks.findIndex(
      item => Number(item.ID) === Number(filters.filterCourse.StockID)
    )
    if (index > -1) {
      setStockName(Stocks[index].Title)
    } else {
      setStockName('Tất cả cơ sở')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  useEffect(() => {
    getListCourses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListCourses = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    reportsApi
      .getListCourses(BrowserHelpers.getRequestParamsCourse({ ...filters }))
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const { Items, Total, PCount } = {
            Items: data?.result?.Items
              ? data?.result?.Items.map(x => ({ ...x, ID: x.Member.ID }))
              : [],
            Total: data?.result?.Total || 0,
            PCount: data?.result?.Pcount || 0
          }
          setTotal(data?.result)
          setPageCount(PCount)
          setListData(Items)
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
      setFilters(prevState => ({ ...prevState, ...values, Pi: 1 }))
    }
  }

  const onRefresh = () => {
    getListCourses()
  }

  const onExport = () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getListCourses(
          BrowserHelpers.getRequestParamsCourse(filters, {
            Total: PageTotal
          })
        ),
      UrlName: '/khac/bao-cao-khoa-hoc'
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

  const onPagesChange = ({ Pi, Ps }) => {
    setFilters({ ...filters, Pi, Ps })
  }

  const columns = useMemo(
    () => [
      {
        key: 'index',
        title: 'STT',
        dataKey: 'index',
        cellRenderer: ({ rowIndex }) =>
          filters.Ps * (filters.Pi - 1) + (rowIndex + 1),
        width: 60,
        sortable: false,
        align: 'center',
        mobileOptions: {
          visible: true
        },
        frozen: width > 1024 ? 'left' : false
      },
      {
        key: 'Member.FullName',
        title: 'Học viên',
        dataKey: 'Member.FullName',
        cellRenderer: ({ rowData }) => rowData?.Member.FullName,
        width: 250,
        sortable: false,
        mobileOptions: {
          visible: true
        },
        frozen: width > 1024 ? 'left' : false
      },
      {
        key: 'Member.MobilePhone',
        title: 'Số điện thoại',
        dataKey: 'Member.MobilePhone',
        cellRenderer: ({ rowData }) => rowData?.Member.MobilePhone,
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Member.BirthDate',
        title: 'Ngày sinh',
        dataKey: 'Member.BirthDate',
        cellRenderer: ({ rowData }) =>
          rowData?.Member?.BirthDate
            ? moment(rowData.Member.BirthDate).format('DD/MM/YYYY')
            : '',
        width: 180,
        sortable: false
      },
      {
        key: 'Member.HomeAddress',
        title: 'Địa chỉ',
        dataKey: 'Member.HomeAddress',
        width: 300,
        sortable: false
      },
      {
        key: 'CourseMember.Places',
        title: 'KTX',
        dataKey: 'CourseMember.Places',
        width: 280,
        sortable: false
      },
      {
        key: 'Course.Title',
        title: 'Tên lớp',
        dataKey: 'Course.Title',
        cellRenderer: ({ rowData }) => rowData?.Course.Title,
        width: 250,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Course.Tags',
        title: 'Tags khoá học',
        dataKey: 'Course.Tags',
        cellRenderer: ({ rowData }) => rowData?.Course.Tags,
        width: 250,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'CourseMember.Tags',
        title: 'Tags học viên',
        dataKey: 'CourseMember.Tags',
        cellRenderer: ({ rowData }) => rowData?.CourseMember.Tags,
        width: 250,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'OrderItem.ToPay',
        title: 'Tổng tiền',
        dataKey: 'OrderItem.ToPay',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData?.OrderItem?.ToPay),
        width: 150,
        sortable: false
      },
      {
        key: 'CPayed',
        title: 'Đã thanh toán',
        dataKey: 'CPayed',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.CPayed),
        width: 150,
        sortable: false
      },
      {
        key: 'RemainPay',
        title: 'Nợ',
        dataKey: 'RemainPay',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.RemainPay),
        width: 150,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'CourseMember.DayToPay',
        title: 'Ngày hẹn TT',
        dataKey: 'CourseMember.DayToPay',
        cellRenderer: ({ rowData }) =>
          rowData.CourseMember?.DayToPay
            ? moment(rowData.CourseMember.DayToPay).format('DD-MM-YYYY')
            : '',
        width: 150,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'CourseMember.CreateDate',
        title: 'Ngày nhập học',
        dataKey: 'CourseMember.CreateDate',
        cellRenderer: ({ rowData }) =>
          rowData?.CourseMember?.CreateDate ? moment(rowData?.CourseMember?.CreateDate).format('DD-MM-YYYY') : '',
        width: 150,
        sortable: false
      },
      {
        key: 'TotalCheck',
        title: 'Số buổi đã học',
        dataKey: 'TotalCheck',
        cellRenderer: ({ rowData }) => Number(rowData?.TotalCheck || 0),
        width: 150,
        sortable: false
      },
      {
        key: 'CourseMember.Status',
        title: 'Trạng thái',
        dataKey: 'CourseMember.Status',
        cellRenderer: ({ rowData }) => (
          <>
            {Number(rowData?.CourseMember?.Status) === 1 && (
              <span className="text-success fw-500">Đã tốt nghiệp</span>
            )}
            {Number(rowData?.CourseMember?.Status) === 2 && (
              <span className="text-warning fw-500">Chưa tốt nghiệp</span>
            )}
            {Number(rowData?.CourseMember?.Status) === 3 && (
              <span className="text-danger fw-500">Đang tạm dừng</span>
            )}
            {Number(rowData?.CourseMember?.Status) === 4 && (
              <span className="text-danger fw-500">Chờ tốt nghiệp</span>
            )}
          </>
        ),
        width: 150,
        sortable: false
      },
      {
        key: 'DayStatus',
        title: 'Thời gian đổi trạng thái',
        dataKey: 'DayStatus',
        cellRenderer: ({ rowData }) =>
          rowData?.CourseMember?.DayStatus &&
          rowData?.CourseMember?.DayStatus !== '1900-01-01T00:00:00'
            ? moment(rowData.CourseMember.DayStatus).format('HH:mm DD-MM-YYYY')
            : '',
        width: 200,
        sortable: false
      },
      {
        key: 'CourseMember.Desc',
        title: 'Ghi chú',
        dataKey: 'CourseMember.Desc',
        width: 250,
        sortable: false
      }
    ],
    [filters, width]
  )

  //   const rowClassName = ({ rowData }) => {
  //     if (rowData?.IsExpired) {
  //       return 'bg-danger-o-90'
  //     }
  //   }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase font-size-xl fw-600">
            Báo cáo khoá học
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
      <FilterCourse
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
          <div className="fw-500 font-size-lg">Danh sách học viên</div>
          {width > 1200 ? (
            <div className="d-flex">
              <div className="fw-500">
                Tổng học viên{' '}
                <span className="font-size-xl fw-600 text-success pl-5px font-number">
                  {Total?.Total}
                </span>
              </div>
              <div className="fw-500 pl-20px">
                Tổng tiền{' '}
                <span className="font-size-xl fw-600 text-success pl-5px font-number">
                  {PriceHelper.formatVND(Total?.TongTien)}
                </span>
              </div>
              <div className="fw-500 pl-20px">
                Tổng thanh toán{' '}
                <span className="font-size-xl fw-600 text-success pl-5px font-number">
                  {PriceHelper.formatVND(Total?.TongThanhToan)}
                </span>
              </div>
              <div className="fw-500 pl-20px">
                Nợ{' '}
                <span className="font-size-xl fw-600 text-danger pl-5px font-number">
                  {PriceHelper.formatVND(Total?.TongNo)}
                </span>
              </div>
            </div>
          ) : (
            <div className="fw-500 d-flex align-items-center">
              Nợ
              <OverlayTrigger
                rootClose
                trigger="click"
                key="bottom"
                placement="bottom"
                overlay={
                  <Popover id={`popover-positioned-top`}>
                    <Popover.Header
                      className="py-10px text-uppercase fw-600"
                      as="h3"
                    >
                      Chi tiết khoá học
                    </Popover.Header>
                    <Popover.Body className="p-0">
                      <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                        <span>Tổng học viên</span>
                        <span>
                          {PriceHelper.formatVNDPositive(Total.Total)}
                        </span>
                      </div>
                      <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                        <span>Tổng tiền</span>
                        <span>
                          {PriceHelper.formatVNDPositive(Total.TongTien)}
                        </span>
                      </div>
                      <div className="border-gray-200 py-10px px-15px fw-600 font-size-md d-flex justify-content-between">
                        <span>Tổng thanh toán</span>
                        <span>
                          {PriceHelper.formatVNDPositive(Total.TongThanhToan)}
                        </span>
                      </div>
                    </Popover.Body>
                  </Popover>
                }
              >
                <div className="d-flex justify-content-between align-items-center">
                  <span className="font-size-xl fw-600 text-danger pl-5px font-number">
                    {PriceHelper.formatVNDPositive(Total.TongNo)}
                  </span>
                  <i className="cursor-pointer fa-solid fa-circle-exclamation text-warning ml-5px"></i>
                </div>
              </OverlayTrigger>
            </div>
          )}
        </div>
        <div className="p-20px">
          <ReactTableV7
            rowKey="ID"
            filters={filters}
            columns={columns}
            data={ListData}
            loading={loading}
            pageCount={pageCount}
            onPagesChange={onPagesChange}
            optionMobile={{
              CellModal: cell => OpenModalMobile(cell)
            }}
            //rowClassName={rowClassName}
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

export default CourseReport
