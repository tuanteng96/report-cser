import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import FilterList from 'src/components/Filter/FilterList'
import BaseTablesCustom from 'src/components/Tables/BaseTablesCustom'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import reportsApi from 'src/api/reports.api'
import ModalViewMobile from './ModalViewMobile'
import { PriceHelper } from 'src/helpers/PriceHelper'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import { useWindowSize } from 'src/hooks/useWindowSize'

import moment from 'moment'
import 'moment/locale/vi'
import clsx from 'clsx'
moment.locale('vi')

const JSONData = {
  Total: 1,
  PCount: 1,
  TongThu: 20000000,
  TongGiaTri: 30000000,
  TongChi: 10000000,
  ConLai: 12000000,
  Items: [
    {
      Id: 12372, // ID khách hàng
      TenTheTien: 'Thẻ tiền 5tr',
      GiaBan: 15000000,
      TongGiaTri: 50000000,
      GiaTriChiTieuSP: 20000000,
      GiaTriChiTieuDV: 15000000,
      TongChiTieu: 3000000,
      DaChiTieuSP: 150000000,
      DaChiTieuDV: 20000000,
      TongConLai: 18000000,
      ConLaiSP: 2000000,
      ConLaiDV: 12000000,
      Member: {
        Id: 12372,
        FullName: 'Nguyễn Tài Tuấn',
        Phone: '0971021196'
      },
      IsExpired: true, // Hết hạn
      IsLock: true // Khóa
    },
    {
      Id: 12372, // ID khách hàng
      TenTheTien: 'Thẻ tiền 10tr',
      GiaBan: 15000000,
      TongGiaTri: 50000000,
      GiaTriChiTieuSP: 20000000,
      GiaTriChiTieuDV: 15000000,
      TongChiTieu: 3000000,
      DaChiTieuSP: 150000000,
      DaChiTieuDV: 20000000,
      TongConLai: 18000000,
      ConLaiSP: 2000000,
      ConLaiDV: 12000000,
      Member: {
        Id: 12372,
        FullName: 'Nguyễn Tài Tuấn',
        Phone: '0971021196'
      },
      IsExpired: false, // Hết hạn
      IsLock: false // Khóa
    }
  ]
}

function TotalCard(props) {
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
    MemberID: '',
    MoneyCardName: ''
  })
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ListData, setListData] = useState([])
  const [Total, setTotal] = useState({})
  const [PageTotal, setPageTotal] = useState(0)
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
    getListCustomer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListCustomer = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    const newFilters = {
      ...filters,
      DateStart: filters.DateStart
        ? moment(filters.DateStart).format('DD/MM/yyyy')
        : null,
      DateEnd: filters.DateEnd
        ? moment(filters.DateEnd).format('DD/MM/yyyy')
        : null,
      MemberID: filters.MemberID ? filters.MemberID.value : ''
    }
    reportsApi
      .getListTotalCard(newFilters)
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const { Items, Total } = {
            Items: data.result?.Items || JSONData.Items,
            Total: data.result?.Total || JSONData.Total
          }
          setTotal(data.result || JSONData)
          setListData(Items)
          setLoading(false)
          setPageTotal(Total)
          isFilter && setIsFilter(false)
          callback && callback()
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

  const onRefresh = () => {}

  const OpenModalMobile = value => {
    setInitialValuesMobile(value)
    setIsModalMobile(true)
  }

  const HideModalMobile = () => {
    setInitialValuesMobile(null)
    setIsModalMobile(false)
  }

  const rowStyle = (row, rowIndex) => {
    const styles = {}
    if (row?.IsExpired) {
      styles.backgroundColor = 'rgb(255 160 160)'
    }
    return styles
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Báo cáo thẻ tiền
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
      />
      <div className="bg-white rounded">
        <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between">
          <div className="fw-500 font-size-lg">Danh sách thẻ tiền</div>
          {width > 1200 ? (
            <div className="d-flex">
              <div className="fw-500">
                Tổng thu{' '}
                <span className="font-size-xl fw-600 text-success pl-5px font-number">
                  {PriceHelper.formatVND(Total?.TongThu)}
                </span>
              </div>
              <div className="fw-500 pl-20px">
                Tổng giá trị{' '}
                <span className="font-size-xl fw-600 text-success pl-5px font-number">
                  {PriceHelper.formatVND(Total?.TongGiaTri)}
                </span>
              </div>
              <div className="fw-500 pl-20px">
                Tổng chi{' '}
                <span className="font-size-xl fw-600 text-danger pl-5px font-number">
                  {PriceHelper.formatVND(Total?.TongChi)}
                </span>
              </div>
              <div className="fw-500 pl-20px">
                Còn lại{' '}
                <span className="font-size-xl fw-600 text-success pl-5px font-number">
                  {PriceHelper.formatVND(Total?.ConLai)}
                </span>
              </div>
            </div>
          ) : (
            <div className="fw-500 d-flex align-items-center">
              Còn lại
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
                      Chi tiết thẻ tiền
                    </Popover.Header>
                    <Popover.Body className="p-0">
                      <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                        <span>Tổng thu</span>
                        <span>
                          {PriceHelper.formatVNDPositive(Total.TongThu)}
                        </span>
                      </div>
                      <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                        <span>Tổng giá trị</span>
                        <span>
                          {PriceHelper.formatVNDPositive(Total.TongGiaTri)}
                        </span>
                      </div>
                      <div className="py-10px px-15px fw-600 font-size-md border-gray-200 d-flex justify-content-between">
                        <span>Tổng chi</span>
                        <span>
                          {PriceHelper.formatVNDPositive(Total.TongChi)}
                        </span>
                      </div>
                    </Popover.Body>
                  </Popover>
                }
              >
                <div className="d-flex justify-content-between align-items-center">
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {PriceHelper.formatVNDPositive(Total.ConLai)}
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
                setFilters({ ...filters, Ps: Ps })
              },
              onPageChange: page => {
                setListData([])
                const Pi = page
                setFilters({ ...filters, Pi: Pi })
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
                dataField: 'Id',
                text: 'ID',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => <div>#{row.Id}</div>,
                attrs: { 'data-title': 'ID' },
                headerStyle: () => {
                  return { minWidth: '100px', width: '100px' }
                }
              },
              {
                dataField: 'TenTheTien',
                text: 'Tên thẻ tiền',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => (
                  <div>
                    <span className="pr-5px">{row.TenTheTien}</span>
                    {row?.IsLock && (
                      <span className={clsx({ 'text-danger': row?.IsLock })}>
                        -
                        <span className="fw-600 font-size-smm pl-5px">
                          Đã Khóa
                        </span>
                      </span>
                    )}
                  </div>
                ),
                attrs: { 'data-title': 'Tên thẻ tiền' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                }
              },
              {
                dataField: 'GiaBan',
                text: 'Giá bán',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.GiaBan),
                attrs: { 'data-title': 'Giá bán' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'TongGiaTri',
                text: 'Tổng giá trị',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.TongGiaTri),
                attrs: { 'data-title': 'Tổng giá trị' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'GiaTriChiTieuSP',
                text: 'Giá trị chi tiêu SP',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVND(row.GiaTriChiTieuSP),
                attrs: { 'data-title': 'Giá trị chi tiêu SP' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'GiaTriChiTieuDV',
                text: 'Giá trị chi tiêu DV',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVND(row.GiaTriChiTieuDV),
                attrs: { 'data-title': 'Giá trị chi tiêu DV' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'TongChiTieu',
                text: 'Tổng chi tiêu',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVND(row.TongChiTieu),
                attrs: { 'data-title': 'Tổng chi tiêu' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'DaChiTieuSP',
                text: 'Đã chi tiêu SP',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVND(row.DaChiTieuSP),
                attrs: { 'data-title': 'Đã chi tiêu SP' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'DaChiTieuDV',
                text: 'Đã chi tiêu DV',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVND(row.DaChiTieuDV),
                attrs: { 'data-title': 'Đã chi tiêu DV' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'TongConLai',
                text: 'Tổng còn lại',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.TongConLai),
                attrs: { 'data-title': 'Tổng còn lại' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'ConLaiSP',
                text: 'Còn lại sản phẩm',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.ConLaiSP),
                attrs: { 'data-title': 'Còn lại sản phẩm' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'ConLaiDV',
                text: 'Còn lại dịch vụ',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.ConLaiDV),
                attrs: { 'data-title': 'Còn lại dịch vụ' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'FullName',
                text: 'Khách hàng',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row?.Member?.FullName || 'Chưa có',
                attrs: { 'data-title': 'Khách hàng' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                }
              },
              {
                dataField: 'Phone',
                text: 'Số điện thoại',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row?.Member?.Phone || 'Chưa có',
                attrs: { 'data-title': 'Số điện thoại' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                }
              }
            ]}
            loading={loading}
            keyField="Id"
            className="table-responsive-attr"
            classes="table-bordered"
            rowStyle={rowStyle}
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

export default TotalCard
