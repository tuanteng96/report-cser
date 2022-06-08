import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import _ from 'lodash'
import FilterList from 'src/components/Filter/FilterList'
import reportsApi from 'src/api/reports.api'
import BaseTablesCustom from 'src/components/Tables/BaseTablesCustom'
import { PriceHelper } from 'src/helpers/PriceHelper'
import ModalViewMobile from './ModalViewMobile'
import clsx from 'clsx'
import { OverlayTrigger, Popover } from 'react-bootstrap'

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

function ListSell(props) {
  const { CrStockID } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || ''
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    DateStart: new Date(), // Ngày bắt đầu
    DateEnd: new Date(), // Ngày kết thúc
    Pi: 1, // Trang hiện tại
    Ps: 10, // Số lượng item
    Voucher: '', // Trạng thái
    Payment: '', // Bảo hành
    IsMember: '' // ID nhân viên
  })
  const [ListData, setListData] = useState([])
  const [isFilter, setIsFilter] = useState(false)
  const [loading, setLoading] = useState(false)
  const [PageTotal, setPageTotal] = useState(0)
  const [initialValuesMobile, setInitialValuesMobile] = useState(null)
  const [isModalMobile, setIsModalMobile] = useState(false)

  useEffect(() => {
    getListServices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListServices = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    const newFilters = {
      ...filters,
      DateStart: filters.DateStart
        ? moment(filters.DateStart).format('DD/MM/yyyy')
        : null,
      DateEnd: filters.DateEnd
        ? moment(filters.DateEnd).format('DD/MM/yyyy')
        : null,
      StaffID: filters.StaffID ? filters.StaffID.value : '',
      GroupCustomerID: filters.GroupCustomerID
        ? filters.GroupCustomerID.value
        : '',
      SourceName: filters.SourceName ? filters.SourceName.value : '',
      ProvincesID: filters.ProvincesID ? filters.ProvincesID.value : '',
      DistrictsID: filters.DistrictsID ? filters.DistrictsID.value : '',
      Status: filters.Status ? filters.Status.value : '',
      Warranty: filters.Warranty ? filters.Warranty.value : ''
    }
    reportsApi
      .getListSell(newFilters)
      .then(({ data }) => {
        const { Items, Total } = {
          Items: data.result?.Items || [],
          Total: data.result?.Total || 0
        }
        setListData(Items)
        setLoading(false)
        setPageTotal(Total)
        isFilter && setIsFilter(false)
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

  const onFilter = values => {
    if (_.isEqual(values, filters)) {
      getListServices()
    } else {
      setFilters(values)
    }
  }

  const onRefresh = () => {
    getListServices()
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
    <div className="bg-white rounded mt-25px">
      <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between">
        <div className="fw-500 font-size-lg">Danh sách đơn hàng</div>
        <button
          type="button"
          className="btn btn-primary p-0 w-35px h-30px"
          onClick={onOpenFilter}
        >
          <i className="fa-regular fa-filter-list font-size-md mt-5px"></i>
        </button>
      </div>
      <FilterList
        show={isFilter}
        filters={filters}
        onHide={onHideFilter}
        onSubmit={onFilter}
        onRefresh={onRefresh}
        loading={loading}
      />
      <div className="p-20px">
        <BaseTablesCustom
          data={ListData}
          textDataNull="Không có dữ liệu."
          optionsMoible={{
            itemShow: 2,
            CallModal: row => OpenModalMobile(row),
            columns: [
              {
                dataField: 'CreateDate',
                text: 'Ngày',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  moment(row.CreateDate).format('HH:mm DD/MM/YYYY'),
                attrs: { 'data-title': 'Ngày' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'MemberName',
                text: 'Khách hàng',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.MemberName || 'Không có tên',
                attrs: { 'data-title': 'Khách hàng' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                }
              },
              {
                dataField: 'TotalValue',
                text: 'Tổng tiền',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.TotalValue),
                attrs: { 'data-title': 'Tổng tiền' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              }
            ]
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
              text: 'Mã đơn hàng',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => <div>#{row.Id}</div>,
              attrs: { 'data-title': 'ID' },
              headerStyle: () => {
                return { minWidth: '120px', width: '120px' }
              }
            },
            {
              dataField: 'StockName',
              text: 'Cơ sở',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => row.StockName || 'Chưa có',
              attrs: { 'data-title': 'Cơ sở' },
              headerStyle: () => {
                return { minWidth: '200px', width: '200px' }
              }
            },
            {
              dataField: 'CreateDate',
              text: 'Ngày',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) =>
                moment(row.CreateDate).format('HH:mm DD/MM/YYYY'),
              attrs: { 'data-title': 'Ngày' },
              headerStyle: () => {
                return { minWidth: '150px', width: '150px' }
              }
            },
            {
              dataField: 'MemberName',
              text: 'Khách hàng',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => row.MemberName || 'Không có tên',
              attrs: { 'data-title': 'Khách hàng' },
              headerStyle: () => {
                return { minWidth: '200px', width: '200px' }
              }
            },
            {
              dataField: 'MemberPhone',
              text: 'Số điện thoại',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => row.MemberPhone || 'Không có',
              attrs: { 'data-title': 'Số điện thoại' },
              headerStyle: () => {
                return { minWidth: '200px', width: '200px' }
              }
            },
            {
              dataField: 'Value',
              text: 'Nguyên giá',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => PriceHelper.formatVND(row.Value),
              attrs: { 'data-title': 'Nguyên giá' },
              headerStyle: () => {
                return { minWidth: '180px', width: '180px' }
              }
            },
            {
              dataField: 'ReducedValue',
              text: 'Giảm giá',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) =>
                PriceHelper.formatValueVoucher(row.ReducedValue),
              attrs: { 'data-title': 'Giảm giá' },
              headerStyle: () => {
                return { minWidth: '200px', width: '200px' }
              }
            },
            {
              dataField: 'TotalValue',
              text: 'Tổng tiền',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => PriceHelper.formatVND(row.TotalValue),
              attrs: { 'data-title': 'Tổng tiền' },
              headerStyle: () => {
                return { minWidth: '180px', width: '180px' }
              }
            },
            {
              dataField: 'VoucherCode',
              text: 'Voucher',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => row.VoucherCode || 'Chưa có',
              attrs: { 'data-title': 'Voucher' },
              headerStyle: () => {
                return { minWidth: '200px', width: '200px' }
              }
            },
            {
              dataField: 'ToPay',
              text: 'Cần thanh toán',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => PriceHelper.formatVND(row.ToPay),
              attrs: { 'data-title': 'Cần thanh toán' },
              headerStyle: () => {
                return { minWidth: '180px', width: '180px' }
              }
            },
            {
              dataField: 'DaThToan',
              text: 'Đã thanh toán',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => (
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
                        Chi tiết thanh toán #{row.Id}
                      </Popover.Header>
                      <Popover.Body className="p-0">
                        <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                          <span>Tiền mặt</span>
                          <span>{PriceHelper.formatVND(row.DaThToan_TM)}</span>
                        </div>
                        <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                          <span>Chuyển khoản</span>
                          <span>{PriceHelper.formatVND(row.DaThToan_CK)}</span>
                        </div>
                        <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                          <span>Quẹt thẻ</span>
                          <span>{PriceHelper.formatVND(row.DaThToan_QT)}</span>
                        </div>
                      </Popover.Body>
                    </Popover>
                  }
                >
                  <div className="d-flex justify-content-between align-items-center">
                    {PriceHelper.formatVND(row.DaThToan)}
                    <i className="fa-solid fa-circle-exclamation cursor-pointer text-warning"></i>
                  </div>
                </OverlayTrigger>
              ),
              attrs: { 'data-title': 'Thanh toán' },
              headerStyle: () => {
                return { minWidth: '180px', width: '180px' }
              }
            },
            {
              dataField: 'DaThToan_Vi',
              text: 'Ví',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) =>
                PriceHelper.formatVNDPositive(row.DaThToan_Vi),
              attrs: { 'data-title': 'Ví' },
              headerStyle: () => {
                return { minWidth: '180px', width: '180px' }
              }
            },
            {
              dataField: 'DaThToan_ThTien',
              text: 'Thẻ tiền',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) =>
                PriceHelper.formatVNDPositive(row.DaThToan_ThTien),
              attrs: { 'data-title': 'Thẻ tiền' },
              headerStyle: () => {
                return { minWidth: '180px', width: '180px' }
              }
            },
            {
              dataField: 'ConNo',
              text: 'Còn nợ',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) =>
                PriceHelper.formatVNDPositive(row.ConNo),
              attrs: { 'data-title': 'Còn nợ' },
              headerStyle: () => {
                return { minWidth: '180px', width: '180px' }
              }
            },
            {
              dataField: 'IsNewMember',
              text: 'Loại',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => (
                <span
                  className={`${clsx({
                    'text-success': row.IsNewMember === 1
                  })} fw-500`}
                >
                  Khách {row.IsNewMember === 0 ? 'Cũ' : 'Mới'}
                </span>
              ),
              attrs: { 'data-title': 'Loại' },
              headerStyle: () => {
                return { minWidth: '150px', width: '150px' }
              }
            },
            {
              dataField: '#',
              text: '#',
              headerAlign: 'center',
              style: { textAlign: 'center' },
              formatter: (cell, row) => (
                <OverlayTrigger
                  rootClose
                  trigger="click"
                  placement="top"
                  overlay={
                    <Popover className="popover-md">
                      <Popover.Body className="p-0">
                        {row.lines &&
                          row.lines.map((item, index) => (
                            <div
                              className={clsx('p-12px', {
                                'border-bottom': row.lines.length - 1 !== index
                              })}
                              key={index}
                            >
                              <div className="fw-500 mb-2px">
                                {item.ProdTitle}
                              </div>
                              <div className="d-flex justify-content-between">
                                <div className="text-muted">
                                  SL{' '}
                                  <span className="fw-500 text-dark">
                                    x {item.QTy}
                                  </span>
                                </div>
                                <div className="fw-500">
                                  {PriceHelper.formatVND(item.Topay)}
                                </div>
                              </div>
                            </div>
                          ))}
                      </Popover.Body>
                    </Popover>
                  }
                >
                  <button type="button" className="btn btn-xs btn-primary">
                    Xem đơn hàng
                  </button>
                </OverlayTrigger>
              ),
              attrs: { 'data-title': '#' },
              headerStyle: () => {
                return { minWidth: '112px', width: '112px' }
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
  )
}

export default ListSell
