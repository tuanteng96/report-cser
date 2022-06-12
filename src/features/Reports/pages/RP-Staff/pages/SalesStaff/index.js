import React, { Fragment, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterList from 'src/components/Filter/FilterList'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import { PriceHelper } from 'src/helpers/PriceHelper'
import BaseTablesCustom from 'src/components/Tables/BaseTablesCustom'
import ModalViewMobile from './ModalViewMobile'
import reportsApi from 'src/api/reports.api'
import { OverlayTrigger, Popover } from 'react-bootstrap'

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

const JSONData = {
  Total: 1,
  PCount: 1,
  Items: [
    {
      Id: 1, // tự sinh Id Key
      LuongCa_PPhi: {
        Tong_Luong: 5000000,
        DS_DV: [
          {
            Title: 'Chăm sóc da',
            ToPay: 100000
          }
        ],
        DS_PP: [
          {
            Title: 'Phụ phí 1',
            ToPay: 100000
          },
          {
            Title: 'Phụ phí 2',
            ToPay: 100000
          }
        ]
      },
      Staff: {
        ID: 2122,
        FullName: 'Nguyễn Tài Tuấn'
      },
      Member: {
        ID: 2456,
        FullName: 'Chu bá thông',
        Phone: '0971021196'
      },
      Ngay_Lam: '2022-06-03T14:11:39',
      DV_Goc: {
        ProdTitle: 'Dv tắm trắng',
        ProdId: 5462
      },
      The_DV: {
        CardTitle: 'Tắm trắng 10 buổi',
        CardId: 8754
      },
      ID_Buoi_Dv: 1252,
      StockName: 'Cser Hà Nội'
    }
  ]
}

function SalesStaff(props) {
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
    MemberID: '', // ID khách hàng
    StaffID: '', // ID nhân viên
    ServiceCardID: ''
  })
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ListData, setListData] = useState([])
  const [PageTotal, setPageTotal] = useState(0)
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

  const getListSalarys = (isLoading = true, callback) => {
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
      MemberID: filters.MemberID ? filters.MemberID.value : '',
      ServiceCardID: filters.ServiceCardID ? filters.ServiceCardID.value : ''
    }
    reportsApi
      .getListStaffSalarySV(newFilters)
      .then(({ data }) => {
        const { Items, Total } = {
          Items: data.result?.Items || JSONData.Items,
          Total: data.result?.Total || JSONData.Total
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
      getListSalarys()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    getListSalarys()
  }

  const OpenModalMobile = value => {
    setInitialValuesMobile(value)
    setIsModalMobile(true)
  }

  const HideModalMobile = () => {
    setInitialValuesMobile(null)
    setIsModalMobile(false)
  }
  console.log(ListData)
  return (
    <div className="py-main">
      <div className="mb-20px d-flex justify-content-between align-items-end">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Nhân viên doanh số
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
          <FilterList
            show={isFilter}
            filters={filters}
            onHide={onHideFilter}
            onSubmit={onFilter}
            onRefresh={onRefresh}
            loading={loading}
          />
        </div>
      </div>
      <div className="bg-white rounded mt-25px">
        <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between">
          <div className="fw-500 font-size-lg">
            Danh sách doanh số nhân viên
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
        <div className="p-20px">
          <BaseTablesCustom
            data={ListData}
            textDataNull="Không có dữ liệu."
            optionsMoible={{
              itemShow: 5,
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
                dataField: 'Staff',
                text: 'Tên nhân viên',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  row?.Staff?.FullName ? row.Staff.FullName : 'Chưa xác định',
                attrs: { 'data-title': 'Tên nhân viên' },
                headerStyle: () => {
                  return { minWidth: '220px', width: '220px' }
                }
              },
              {
                dataField: 'LuongCa_PPhi',
                text: 'Lương ca và phụ phí',
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
                          Chi tiết lương ca & phụ phí
                        </Popover.Header>
                        <Popover.Body className="p-0">
                          {(row.LuongCa_PPhi?.DS_DV &&
                            row.LuongCa_PPhi?.DS_DV.length > 0) ||
                          (row.LuongCa_PPhi?.DS_PP &&
                            row.LuongCa_PPhi?.DS_PP.length > 0) ? (
                            <Fragment>
                              {row.LuongCa_PPhi?.DS_DV.map((item, index) => (
                                <div
                                  className="py-10px px-15px fw-600 font-size-md border-top border-gray-200 d-flex justify-content-between"
                                  key={index}
                                >
                                  <span>{item.Title}</span>
                                  <span>
                                    {PriceHelper.formatVND(item.ToPay)}
                                  </span>
                                </div>
                              ))}
                              {row.LuongCa_PPhi?.DS_PP.map((item, index) => (
                                <div
                                  className="py-10px px-15px fw-600 font-size-md border-top border-gray-200 d-flex justify-content-between"
                                  key={index}
                                >
                                  <span>{item.Title}</span>
                                  <span>
                                    {PriceHelper.formatVND(item.ToPay)}
                                  </span>
                                </div>
                              ))}
                            </Fragment>
                          ) : (
                            <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                              <span>Không có dữ liệu</span>
                            </div>
                          )}
                        </Popover.Body>
                      </Popover>
                    }
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      {PriceHelper.formatVND(row.LuongCa_PPhi.Tong_Luong)}
                      <i className="fa-solid fa-circle-exclamation cursor-pointer text-warning"></i>
                    </div>
                  </OverlayTrigger>
                ),
                attrs: { 'data-title': 'Lương ca và phụ phí' },
                headerStyle: () => {
                  return { minWidth: '220px', width: '220px' }
                }
              },
              {
                dataField: 'Ngay_Lam',
                text: 'Ngày làm',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  row.Ngay_Lam
                    ? moment(row.Ngay_Lam).format('HH:mm DD-MM-YYYY')
                    : 'Chưa có',
                attrs: { 'data-title': 'Ngày làm' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                }
              },
              {
                dataField: 'MemberName',
                text: 'Khách hàng',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row?.Member?.FullName || 'Chưa có',
                attrs: { 'data-title': 'Khách hàng' },
                headerStyle: () => {
                  return { minWidth: '220px', width: '220px' }
                }
              },
              {
                dataField: 'MemberPhone',
                text: 'Số điện thoại',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row?.Member?.Phone || 'Chưa có',
                attrs: { 'data-title': 'Số điện thoại' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                }
              },
              {
                dataField: 'DV_Goc',
                text: 'Dịch vụ gốc',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  row.DV_Goc?.ProdTitle || 'Không có dịch vụ gốc',
                attrs: { 'data-title': 'Dịch vụ gốc' },
                headerStyle: () => {
                  return { minWidth: '220px', width: '220px' }
                }
              },
              {
                dataField: 'The_DV',
                text: 'Thẻ dịch vụ',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  row.The_DV?.CardTitle || 'Không có thẻ',
                attrs: { 'data-title': 'Thẻ dịch vụ' },
                headerStyle: () => {
                  return { minWidth: '250px', width: '250px' }
                }
              },
              {
                dataField: 'ID_Buoi_Dv',
                text: 'ID Buổi dịch vụ',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.ID_Buoi_Dv,
                attrs: { 'data-title': 'ID Buổi dịch vụ' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'PP',
                text: 'Phụ phí',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  row.LuongCa_PPhi?.DS_PP && row.LuongCa_PPhi?.DS_PP.length > 0
                    ? row.LuongCa_PPhi?.DS_PP.map(item => item.Title).join(', ')
                    : 'Không có phụ phí',
                attrs: { 'data-title': 'Phụ phí' },
                headerStyle: () => {
                  return { minWidth: '250px', width: '250px' }
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
                  return { minWidth: '220px', width: '220px' }
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

export default SalesStaff
