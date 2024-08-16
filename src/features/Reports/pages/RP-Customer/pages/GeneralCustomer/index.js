import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import { PriceHelper } from 'src/helpers/PriceHelper'
import ModalViewMobile from '../OverviewCustomer/ModalViewMobile'
import { useWindowSize } from 'src/hooks/useWindowSize'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import _ from 'lodash'
import reportsApi from 'src/api/reports.api'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import Text from 'react-texty'
import FilterListAdvancedMb from 'src/components/Filter/FilterListAdvancedMb'
import moment from 'moment'
import 'moment/locale/vi'

moment.locale('vi')

function GeneralCustomer(props) {
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
    BirthDateStart: null,
    BirthDateEnd: null,
    GroupCustomerID: '', // ID Nhóm khách hàng
    SourceName: '', // ID Thành phố
    StatusWallet: '', // Tình trạng ví
    StatusMonetCard: '', // Tình trạng thẻ tiền
    DateOrderStart: null, // Bắt đầu mua hàng
    DateOrderEnd: null, // Kết thúc mua hàng
    StockOrderID: '', // Điểm mua hàng
    TypeOrder: '', // Phát sinh mua (SP / DV / THE_TIEN / PP / NVL)
    BrandOrderID: '', // Phát sinh mua theo nhãn hàng
    ProductOrderID: '', // Phát sinh mua theo nhãn hàng
    PriceFromOrder: '', // Mức chi tiêu từ
    PriceToOrder: '', // Mức chi tiêu đến
    StatusServices: '',
    TypeServices: '',
    DayFromServices: '', // Số buổi còn lại từ
    DayToServices: '', // Số buổi còn lại đến
    MemberID: '',
    ShowsX: '2'
  })
  const [StockName, setStockName] = useState('')
  const [ListData, setListData] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [PageTotal, setPageTotal] = useState(0)
  const [TotalOl, setTotalOl] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [totalShows, setTotalShows] = useState({ TongSL: 0, TongThanhTien: 0 })
  const [isFilter, setIsFilter] = useState(false)
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
    getListGeneralCustomer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListGeneralCustomer = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    reportsApi
      .getListCustomerGeneral(BrowserHelpers.getRequestParamsToggle(filters))
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const { Members, Total, TotalOnline, PCount, TongSL, TongThanhTien } =
            {
              Members: data?.result?.Members || data?.result?.Items || [],
              Total: data?.result?.Total || 0,
              TotalOnline: data?.result?.TotalOnline || 0,
              PCount: data?.result?.PCount || 0,
              TongSL: data?.result?.TongSL || 0,
              TongThanhTien: data?.result?.TongThanhTien || 0
            }
          setListData(Members)
          setPageCount(PCount)
          setTotalOl(TotalOnline)
          setLoading(false)
          setPageTotal(Total)
          setTotalShows({ TongSL, TongThanhTien })
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
      getListGeneralCustomer()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onExport = () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getListCustomerGeneral(
          BrowserHelpers.getRequestParamsToggle(filters, { Total: PageTotal })
        ),
      UrlName: '/khach-hang/tong-hop'
    })
  }

  const onRefresh = () => {
    getListGeneralCustomer()
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

  const columns = useMemo(() => {
    if (filters.ShowsX === '2') {
      return [
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
          }
        },
        {
          key: 'Ten_KH',
          title: 'Tên khách hàng',
          dataKey: 'Ten_KH',
          width: 250,
          sortable: false,
          mobileOptions: {
            visible: true
          }
        },
        {
          key: 'SDT',
          title: 'Số điện thoại',
          dataKey: 'SDT',
          width: 150,
          sortable: false
        },
        {
          key: 'Ten_SP',
          title: 'Tên sản phẩm',
          dataKey: 'Ten_SP',
          width: 250,
          sortable: false,
          mobileOptions: {
            visible: true
          }
        },
        {
          key: 'SL',
          title: 'Số lượng',
          dataKey: 'SL',
          width: 100,
          sortable: false
        },
        {
          key: 'Don_gia',
          title: 'Đơn giá',
          dataKey: 'Don_gia',
          width: 200,
          sortable: false,
          cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.Don_gia)
        },
        {
          key: 'Thanh_tien',
          title: 'Thành tiền',
          dataKey: 'Thanh_tien',
          width: 200,
          sortable: false,
          cellRenderer: ({ rowData }) =>
            PriceHelper.formatVND(rowData.Thanh_tien)
        },
        {
          key: 'OrderID',
          title: 'Đơn hàng ID',
          dataKey: 'OrderID',
          width: 150,
          sortable: false
        },
        {
          key: 'Co_so',
          title: 'Cơ sở mua',
          dataKey: 'Co_so',
          width: 250,
          sortable: false
        }
      ]
    }
    return [
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
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'FullName',
        title: 'Tên khách hàng',
        dataKey: 'FullName',
        width: 200,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'MobilePhone',
        title: 'Số điện thoại',
        dataKey: 'MobilePhone',
        width: 150,
        sortable: false
      },
      {
        key: 'Email',
        title: 'Email',
        dataKey: 'Email',
        cellRenderer: ({ rowData }) => rowData.Email || 'Chưa có',
        width: 200,
        sortable: false
      },
      {
        key: 'BirthDate',
        title: 'Ngày sinh',
        dataKey: 'BirthDate',
        cellRenderer: ({ rowData }) =>
          rowData.BirthDate
            ? moment(rowData.BirthDate).format('DD/MM/YYYY')
            : 'Chưa có',
        width: 150,
        sortable: false
      },
      {
        key: 'Gender',
        title: 'Giới tính',
        dataKey: 'Gender',
        width: 120,
        sortable: false
      },
      {
        key: 'HomeAddress',
        title: 'Địa chỉ',
        dataKey: 'HomeAddress',
        width: 250,
        sortable: false,
        cellRenderer: ({ rowData }) => (
          <Text tooltipMaxWidth={300}>{rowData.HomeAddress || 'Chưa có'}</Text>
        )
      },
      {
        key: 'DistrictsName',
        title: 'Quận huyện',
        dataKey: 'DistrictsName',
        width: 250,
        sortable: false,
        cellRenderer: ({ rowData }) => (
          <Text tooltipMaxWidth={300}>
            {rowData.DistrictsName || 'Chưa có'}
          </Text>
        )
      },
      {
        key: 'ProvincesName',
        title: 'Tỉnh / Thành phố',
        dataKey: 'ProvincesName',
        width: 250,
        sortable: false,
        cellRenderer: ({ rowData }) => (
          <Text tooltipMaxWidth={300}>
            {rowData.ProvincesName || 'Chưa có'}
          </Text>
        )
      },
      {
        key: 'ByStockName',
        title: 'Cơ sở',
        dataKey: 'ByStockName',
        width: 180,
        sortable: false
      },
      {
        key: 'GroupCustomerName',
        title: 'Nhóm khách hàng',
        dataKey: 'GroupCustomerName',
        width: 200,
        sortable: false,
        cellRenderer: ({ rowData }) => (
          <Text tooltipMaxWidth={300}>
            {rowData.GroupCustomerName || 'Chưa có'}
          </Text>
        )
      },
      {
        key: 'Source',
        title: 'Nguồn',
        dataKey: 'Source',
        width: 150,
        sortable: false,
        cellRenderer: ({ rowData }) => (
          <Text tooltipMaxWidth={300}>
            {rowData.Source || 'Không xác định'}
          </Text>
        )
      },
      {
        key: 'HandCardID',
        title: 'Mã thẻ',
        dataKey: 'HandCardID',
        width: 150,
        sortable: false,
        cellRenderer: ({ rowData }) => (
          <Text tooltipMaxWidth={300}>{rowData.HandCardID || 'Chưa có'}</Text>
        )
      },
      {
        key: 'ByUserName',
        title: 'Nhân viên chăm sóc',
        dataKey: 'ByUserName',
        width: 200,
        sortable: false,
        cellRenderer: ({ rowData }) => (
          <Text tooltipMaxWidth={300}>{rowData.ByUserName || 'Chưa có'}</Text>
        )
      },
      {
        key: 'vi_dien_tu',
        title: 'Ví',
        dataKey: 'vi_dien_tu',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.vi_dien_tu),
        width: 120,
        sortable: false
      },
      {
        key: 'cong_no',
        title: 'Công nợ',
        dataKey: 'cong_no',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.cong_no),
        width: 120,
        sortable: false
      },
      {
        key: 'the_tien',
        title: 'Thẻ tiền',
        dataKey: 'the_tien',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.the_tien),
        width: 120,
        sortable: false
      }
    ]
  }, [filters])

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Khách hàng tổng hợp
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
      <FilterListAdvancedMb
        show={isFilter}
        filters={filters}
        onHide={onHideFilter}
        onSubmit={onFilter}
        onRefresh={onRefresh}
        loading={loading}
        loadingExport={loadingExport}
        onExport={onExport}
        regimes={[
          {
            label: 'Nhanh',
            value: '2'
          },
          {
            label: 'Tiêu Chuẩn',
            value: '0'
          }
        ]}
      />
      <div className="bg-white rounded">
        <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between">
          <div className="fw-500 font-size-lg">Danh sách khách hàng</div>
          {filters.ShowsX === '2' ? (
            <>
              {width > 1200 ? (
                <div className="d-flex">
                  <div className="fw-500">
                    Tổng SL
                    <span className="font-size-xl fw-600 text-success pl-5px font-number">
                      {totalShows.TongSL}
                    </span>
                  </div>
                  <div className="fw-500 pl-20px">
                    Tổng thành tiền
                    <span className="font-size-xl fw-600 text-success pl-5px font-number">
                      {PriceHelper.formatVND(totalShows.TongThanhTien)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="fw-500 d-flex align-items-center">
                  Tổng SL
                  <OverlayTrigger
                    rootClose
                    trigger="click"
                    key="bottom"
                    placement="bottom"
                    overlay={
                      <Popover id={`popover-positioned-top`}>
                        <Popover.Body className="p-0">
                          <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                            <span>Tổng SL</span>
                            <span>{totalShows.TongSL}</span>
                          </div>
                          <div className="py-10px px-15px fw-600 font-size-md d-flex justify-content-between">
                            <span>Tổng thành tiền</span>
                            <span>
                              {PriceHelper.formatVND(totalShows.TongThanhTien)}
                            </span>
                          </div>
                        </Popover.Body>
                      </Popover>
                    }
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="font-size-xl fw-600 text-success pl-5px font-number">
                        {totalShows.TongSL}
                      </span>
                      <i className="fa-solid fa-circle-exclamation cursor-pointer text-success ml-5px"></i>
                    </div>
                  </OverlayTrigger>
                </div>
              )}
            </>
          ) : (
            <>
              {width > 1200 ? (
                <div className="d-flex">
                  <div className="fw-500">
                    Tổng KH
                    <span className="font-size-xl fw-600 text-success pl-5px font-number">
                      {PageTotal}
                    </span>
                  </div>
                  <div className="fw-500 pl-20px">
                    KH đến từ Online
                    <span className="font-size-xl fw-600 text-success pl-5px font-number">
                      {TotalOl}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="fw-500 d-flex align-items-center">
                  Tổng KH
                  <OverlayTrigger
                    rootClose
                    trigger="click"
                    key="bottom"
                    placement="bottom"
                    overlay={
                      <Popover id={`popover-positioned-top`}>
                        <Popover.Body className="p-0">
                          <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                            <span>Tổng KH</span>
                            <span>{PageTotal}</span>
                          </div>
                          <div className="py-10px px-15px fw-600 font-size-md d-flex justify-content-between">
                            <span>KH đến từ Online</span>
                            <span>{TotalOl}</span>
                          </div>
                        </Popover.Body>
                      </Popover>
                    }
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="font-size-xl fw-600 text-success pl-5px font-number">
                        {PageTotal}
                      </span>
                      <i className="fa-solid fa-circle-exclamation cursor-pointer text-success ml-5px"></i>
                    </div>
                  </OverlayTrigger>
                </div>
              )}
            </>
          )}
        </div>
        <div className="p-20px">
          <ReactTableV7
            rowKey="MobilePhone"
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

export default GeneralCustomer
