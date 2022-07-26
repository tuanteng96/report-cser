import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import { PriceHelper } from 'src/helpers/PriceHelper'
import ModalViewMobile from '../OverviewCustomer/ModalViewMobile'
import BaseTablesCustom from 'src/components/Tables/BaseTablesCustom'
import { useWindowSize } from 'src/hooks/useWindowSize'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import _ from 'lodash'
import FilterToggle from 'src/components/Filter/FilterToggle'
import reportsApi from 'src/api/reports.api'

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
    Ps: 10, // Số lượng item
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
    DayToServices: '' // Số buổi còn lại đến
  })
  const [StockName, setStockName] = useState('')
  const [ListData, setListData] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [PageTotal, setPageTotal] = useState(0)
  const [TotalOl, setTotalOl] = useState(0)
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

  const GeneralNewFilter = filters => {
    return {
      ...filters,
      DateStart: filters.DateStart
        ? moment(filters.DateStart).format('DD/MM/yyyy')
        : null,
      DateEnd: filters.DateEnd
        ? moment(filters.DateEnd).format('DD/MM/yyyy')
        : null,
      BirthDateStart: filters.BirthDateStart
        ? moment(filters.BirthDateStart).format('DD/MM/yyyy')
        : null,
      BirthDateEnd: filters.BirthDateEnd
        ? moment(filters.BirthDateEnd).format('DD/MM/yyyy')
        : filters.BirthDateStart
        ? moment(filters.BirthDateStart).format('DD/MM/yyyy')
        : null,
      GroupCustomerID: filters.GroupCustomerID
        ? filters.GroupCustomerID.value
        : '',
      StatusMonetCard: filters.StatusMonetCard
        ? filters.StatusMonetCard.value
        : '',
      StatusWallet: filters.StatusWallet ? filters.StatusWallet.value : '',
      SourceName: filters.SourceName ? filters.SourceName.value : '',
      BrandOrderID: filters.BrandOrderID ? filters.BrandOrderID.value : '',
      ProductOrderID: filters.ProductOrderID
        ? filters.ProductOrderID.value
        : '',
      TypeOrder: filters.TypeOrder
        ? filters.TypeOrder.map(item => item.value).join(',')
        : '',
      DateOrderStart: filters.DateOrderStart
        ? moment(filters.DateOrderStart).format('DD/MM/yyyy')
        : null,
      DateOrderEnd: filters.DateOrderEnd
        ? moment(filters.DateOrderEnd).format('DD/MM/yyyy')
        : filters.DateOrderStart
        ? moment(filters.DateOrderStart).format('DD/MM/yyyy')
        : null,
      StatusServices: filters.StatusServices
        ? filters.StatusServices.map(item => item.value).join(',')
        : '',
      TypeServices: filters.TypeServices
        ? filters.TypeServices.map(item => item.value).join(',')
        : ''
    }
  }

  const getListGeneralCustomer = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    const newFilters = GeneralNewFilter(filters)
    reportsApi
      .getListCustomerGeneral(newFilters)
      .then(({ data }) => {
        const { Members, Total, TotalOnline } = {
          Members: data?.result?.Members || [],
          Total: data?.result?.Total || 0,
          TotalOnline: data?.result?.TotalOnline || 0
        }
        setListData(Members)
        setTotalOl(TotalOnline)
        setLoading(false)
        setPageTotal(Total)
        callback && callback()
      })
      .catch(error => console.log(error))
  }

  const onOpenFilter = () => {
    setIsFilter(true)
  }

  const onHideFilter = () => {
    setIsFilter(false)
  }

  const onPageChange = Pi => {
    setFilters({ ...filters, Pi: Pi })
  }

  const onSizePerPageChange = Ps => {
    setFilters({ ...filters, Ps: Ps })
  }

  const onFilter = values => {
    if (_.isEqual(values, filters)) {
      getListGeneralCustomer()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onExport = () => {
    setLoadingExport(true)
    const newFilters = GeneralNewFilter({ ...filters, Ps: 1000 })
    reportsApi
      .getListCustomerGeneral(newFilters)
      .then(({ data }) => {
        window?.EzsExportExcel &&
          window?.EzsExportExcel({
            Url: '/khach-hang/tong-hop',
            Data: data,
            hideLoading: () => setLoadingExport(false)
          })
      })
      .catch(error => console.log(error))
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
                        <span>{PriceHelper.formatVNDPositive(PageTotal)}</span>
                      </div>
                      <div className="py-10px px-15px fw-600 font-size-md d-flex justify-content-between">
                        <span>KH đến từ Online</span>
                        <span>{PriceHelper.formatVNDPositive(TotalOl)}</span>
                      </div>
                    </Popover.Body>
                  </Popover>
                }
              >
                <div className="d-flex justify-content-between align-items-center">
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {PriceHelper.formatVNDPositive(PageTotal)}
                  </span>
                  <i className="fa-solid fa-circle-exclamation cursor-pointer text-success ml-5px"></i>
                </div>
              </OverlayTrigger>
            </div>
          )}
        </div>
        <div className="p-20px">
          <BaseTablesCustom
            data={ListData}
            textDataNull="Không có dữ liệu."
            optionsMoible={{
              itemShow: 4,
              CallModal: row => OpenModalMobile(row)
            }}
            options={{
              custom: true,
              totalSize: PageTotal,
              page: filters.Pi,
              sizePerPage: filters.Ps,
              alwaysShowAllBtns: true,
              onSizePerPageChange: sizePerPage => {
                setListData([])
                const Ps = sizePerPage
                onSizePerPageChange(Ps)
              },
              onPageChange: page => {
                setListData([])
                const Pi = page
                onPageChange(Pi)
              }
            }}
            columns={[
              {
                dataField: '',
                text: 'STT',
                formatter: (cell, row, rowIndex) => (
                  <span className="font-number">
                    {filters.Ps * (filters.Pi - 1) + (rowIndex + 1)}
                  </span>
                ),
                headerStyle: () => {
                  return { width: '60px' }
                },
                headerAlign: 'center',
                style: { textAlign: 'center' },
                attrs: { 'data-title': 'STT' }
              },
              {
                dataField: 'CreateDate',
                text: 'Ngày tạo',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  moment(row.CreateDate).format('HH:mm DD/MM/YYYY'),
                attrs: { 'data-title': 'Ngày tạo' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'FullName',
                text: 'Tên khách hàng',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => (
                  <div>
                    <span className="font-number text-muted font-size-xs mr-5px">
                      [#{row.Id}]
                    </span>
                    {row.FullName}
                  </div>
                ),
                attrs: { 'data-title': 'Tên' },
                headerStyle: () => {
                  return { minWidth: '250px', width: '250px' }
                }
              },
              {
                dataField: 'MobilePhone',
                text: 'Số điện thoại',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  row.MobilePhone || 'Không có số điện thoại',
                attrs: { 'data-title': 'Số điện thoại' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'Email',
                text: 'Email',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.Email || 'Không có Email',
                attrs: { 'data-title': 'Email' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'BirthDate',
                text: 'Ngày sinh',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  row.BirthDate
                    ? moment(row.BirthDate).format('DD/MM/YYYY')
                    : 'Không có',
                attrs: { 'data-title': 'Ngày sinh' },
                headerStyle: () => {
                  return { minWidth: '120px', width: '120px' }
                }
              },
              {
                dataField: 'Gender',
                text: 'Giới tính',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  row.Gender === 0 ? (
                    'Nam'
                  ) : (
                    <>{row.Gender === 1 ? 'Nữ' : 'Chưa xác định'}</>
                  ),
                attrs: { 'data-title': 'Giới tính' },
                headerStyle: () => {
                  return { minWidth: '100px', width: '100px' }
                }
              },
              {
                dataField: 'HomeAddress',
                text: 'Địa chỉ',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.HomeAddress || 'Không có',
                attrs: { 'data-title': 'Địa chỉ' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                }
              },
              {
                dataField: 'DistrictsName',
                text: 'Quận Huyện',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.DistrictsName || 'Không có',
                attrs: { 'data-title': 'Quận huyện' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'ProvincesName',
                text: 'Tỉnh / Thành phố',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.ProvincesName || 'Không có',
                attrs: { 'data-title': 'Tỉnh / TP' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'ByStockName',
                text: 'Cơ sở',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.ByStockName || 'Chưa có',
                attrs: { 'data-title': 'Cơ sở' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'GroupCustomerName',
                text: 'Nhóm khách hàng',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.GroupCustomerName || 'Chưa có',
                attrs: { 'data-title': 'Nhóm khách hàng' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'Source',
                text: 'Nguồn',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.Source || 'Chưa có',
                attrs: { 'data-title': 'Nguồn' },
                headerStyle: () => {
                  return { minWidth: '100px', width: '100px' }
                }
              },
              {
                dataField: 'HandCardID',
                text: 'Mã thẻ',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.HandCardID || 'Chưa có',
                attrs: { 'data-title': 'Mã thẻ' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'ByUserName',
                text: 'Nhân viên chăm sóc',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.ByUserName || 'Chưa có',
                attrs: { 'data-title': 'Nhân viên chăm sóc' },
                headerStyle: () => {
                  return { minWidth: '250px', width: '250px' }
                }
              },
              {
                dataField: 'vi_dien_tu',
                text: 'Ví',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.vi_dien_tu),
                attrs: { 'data-title': 'Ví' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'cong_no',
                text: 'Công nợ',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.cong_no),
                attrs: { 'data-title': 'Công nợ' },
                headerStyle: () => {
                  return { minWidth: '100px', width: '100px' }
                }
              },
              {
                dataField: 'the_tien',
                text: 'Thẻ tiền',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.the_tien),
                attrs: { 'data-title': 'Thẻ tiền' },
                headerStyle: () => {
                  return { minWidth: '100px', width: '100px' }
                }
              }
            ]}
            loading={loading}
            keyField="Id"
            className="table-responsive-attr"
            classes="table-bordered"
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
