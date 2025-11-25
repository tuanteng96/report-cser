import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import { PriceHelper } from 'src/helpers/PriceHelper'
import ModalViewMobile from './ModalViewMobile'
import reportsApi from 'src/api/reports.api'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import Text from 'react-texty'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'

import moment from 'moment'
import 'moment/locale/vi'
import FilterListLUONG from 'src/components/Filter/FilterListLUONG'

moment.locale('vi')

const RenderSum = ({ Items, loading }) => {
  const columns = useMemo(() => {
    return [
      {
        key: 'index',
        title: 'STT',
        dataKey: 'index',
        cellRenderer: ({ rowIndex }) => rowIndex + 1,
        width: 60,
        sortable: false,
        align: 'center',
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'UserID',
        title: 'ID Nhân viên',
        dataKey: 'UserID',
        width: 150,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'UserFullName',
        title: 'Tên nhân viên',
        dataKey: 'UserFullName',
        width: 300,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Value',
        title: 'Tổng lương',
        dataKey: 'Value',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.Value),
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      }
    ]
  }, [])

  return (
    <div className="bg-white rounded mt-15px">
      <div className="border-gray-200 px-20px py-15px border-bottom d-flex align-items-center justify-content-between">
        <div className="fw-500 font-size-lg">Danh sách nhân viên lương ca</div>
        <div className="d-flex"></div>
      </div>
      <div className="p-20px">
        <ReactTableV7
          rowKey="ID"
          columns={columns}
          data={Items}
          loading={loading}
        />
      </div>
    </div>
  )
}

function SalaryServices(props) {
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
    MemberID: '', // ID khách hàng
    StaffID: '', // ID nhân viên
    ServiceCardID: '',
    ShowsX: '1'
  })
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [ListData, setListData] = useState([])
  const [Total, setTotal] = useState({
    Tong_Luong: 0,
    Tong_DV: 0,
    Tong_PP: 0,
    Tong_Luong_Tat_ca_nhan_vien: 0
  })
  const [PageTotal, setPageTotal] = useState(0)
  const [pageCount, setPageCount] = useState(0)
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
    if (filters.ShowsX === '1' || filters.ShowsX === '3') {
      reportsApi
        .getListStaffSalarySV(BrowserHelpers.getRequestParamsList(filters))
        .then(({ data }) => {
          if (data.isRight) {
            PermissionHelpers.ErrorAccess(data.error)
            setLoading(false)
          } else {
            const {
              Items,
              Total,
              PCount,
              Tong_Luong,
              Tong_DV,
              Tong_PP,
              Tong_Luong_Tat_ca_nhan_vien,
              sum
            } = {
              Items: data.result?.Items || data.result?.List || [],
              Total: data.result?.Total || 0,
              PCount: data.result?.PCount || 0,
              Tong_Luong: data.result?.Tong_Luong || 0,
              Tong_DV: data.result?.Tong_DV || 0,
              Tong_PP: data.result?.Tong_PP || 0,
              Tong_Luong_Tat_ca_nhan_vien:
                data.result?.Tong_Luong_Tat_ca_nhan_vien || 0,
              sum: data.result?.sum || []
            }
            setListData(Items)
            setTotal({
              Tong_Luong,
              Tong_DV,
              Tong_PP,
              Tong_Luong_Tat_ca_nhan_vien,
              sum
            })
            setPageCount(PCount)
            setLoading(false)
            setPageTotal(Total)
            isFilter && setIsFilter(false)
            callback && callback()
            PermissionHelpers.HideErrorAccess()
          }
        })
        .catch(error => console.log(error))
    } else {
      let newFilters = {
        ...BrowserHelpers.getRequestParamsList(filters),
        ReceiverUserID: 0,
        SourceID: ''
      }
      newFilters.ReceiverUserID = newFilters.StaffID
      newFilters.From = moment(newFilters.DateStart, 'DD/MM/YYYY').format(
        'YYYY-MM-DD'
      )
      newFilters.To = moment(newFilters.DateEnd, 'DD/MM/YYYY').format(
        'YYYY-MM-DD'
      )

      delete newFilters.StaffID
      delete newFilters.ShowsX
      delete newFilters.ServiceCardID
      delete newFilters.DateStart
      delete newFilters.DateEnd

      reportsApi
        .getListStaffTip(newFilters)
        .then(({ data }) => {
          if (data.isRight) {
            PermissionHelpers.ErrorAccess(data.error)
            setLoading(false)
          } else {
            const { Items, Total, PCount, Tong_Luong } = {
              Items: data?.List || [],
              Total: data?.Total || 0,
              PCount: data.result?.PCount || 0,
              Tong_Luong: data?.Total || 0
            }
            setListData(Items)
            setTotal({
              Tong_Luong
            })
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

  const onExport = () => {
    if (filters.ShowsX === '1' || filters.ShowsX === '3') {
      PermissionHelpers.ExportExcel({
        FuncStart: () => setLoadingExport(true),
        FuncEnd: () => setLoadingExport(false),
        FuncApi: () =>
          reportsApi.getListStaffSalarySV(
            BrowserHelpers.getRequestParamsList(filters, { Total: PageTotal })
          ),
        UrlName: '/nhan-vien/luong-ca-dich-vu'
      })
    } else {
      let newFilters = {
        ...BrowserHelpers.getRequestParamsList(filters, { Total: PageTotal }),
        ReceiverUserID: 0,
        SourceID: ''
      }
      newFilters.ReceiverUserID = newFilters.StaffID
      newFilters.From = moment(newFilters.DateStart, 'DD/MM/YYYY').format(
        'YYYY-MM-DD'
      )
      newFilters.To = moment(newFilters.DateEnd, 'DD/MM/YYYY').format(
        'YYYY-MM-DD'
      )

      delete newFilters.StaffID
      delete newFilters.ShowsX
      delete newFilters.ServiceCardID
      delete newFilters.DateStart
      delete newFilters.DateEnd

      PermissionHelpers.ExportExcel({
        FuncStart: () => setLoadingExport(true),
        FuncEnd: () => setLoadingExport(false),
        FuncApi: () =>
          new Promise(async resolve => {
            let result = await reportsApi.getListStaffTip(
              BrowserHelpers.getRequestParamsList(filters, { Total: PageTotal })
            )
            resolve({
              data: {
                result: {
                  ...result?.data,
                  Items: result?.data?.List || []
                },
                param: {
                  Body: filters
                }
              }
            })
          }),
        UrlName: '/nhan-vien/luong-ca-dich-vu-tip'
      })
    }
  }

  const onPagesChange = ({ Pi, Ps }) => {
    setFilters({ ...filters, Pi, Ps })
  }

  const sumTotal = (data, key) => {
    return data
      ? data.reduce((accumulator, object) => {
          return accumulator + object[key]
        }, 0)
      : 0
  }

  const wrapSalaryUser = arr => {
    let rs = []
    if (!arr || arr.length === 0) return rs
    for (let item of arr) {
      let index = rs.findIndex(x => x.StaffID === item.StaffID)
      if (index > -1) {
        rs[index].Items = [...rs[index].Items, item]
      } else {
        rs.push({
          StaffID: item.StaffID,
          StaffName: item.StaffName,
          Items: [item]
        })
      }
    }

    return rs
  }

  const columns = useMemo(() => {
    if (filters.ShowsX === '1') {
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
          key: 'Staffs',
          title: 'Tên nhân viên',
          dataKey: 'Staffs',
          cellRenderer: ({ rowData }) => (
            <Text tooltipMaxWidth={300}>
              {rowData?.Staffs &&
                rowData?.Staffs.map(staff => staff.FullName).join(', ')}
            </Text>
          ),
          width: 220,
          sortable: false,
          mobileOptions: {
            visible: true
          }
        },
        {
          key: 'LuongCa_PPhi',
          title: 'Lương ca và phụ phí',
          dataKey: 'LuongCa_PPhi',
          cellRenderer: ({ rowData }) => (
            <OverlayTrigger
              rootClose
              trigger="click"
              key="top"
              placement="top"
              overlay={
                <Popover
                  id={`popover-positioned-top`}
                  style={{ minWidth: '320px' }}
                >
                  <Popover.Header
                    className="py-10px text-uppercase fw-600"
                    as="h3"
                  >
                    Chi tiết lương ca & phụ phí
                  </Popover.Header>
                  <Popover.Body className="p-0">
                    {(rowData.LuongCa_PPhi?.DS_DV &&
                      rowData.LuongCa_PPhi?.DS_DV.length > 0) ||
                    (rowData.LuongCa_PPhi?.DS_PP &&
                      rowData.LuongCa_PPhi?.DS_PP.length > 0) ||
                    (wrapSalaryUser(rowData?.Salary?.salaryList) &&
                      wrapSalaryUser(rowData?.Salary?.salaryList).length >
                        0) ? (
                      <Fragment>
                        {rowData.LuongCa_PPhi?.DS_DV.map((item, index) => (
                          <div
                            className="border-gray-200 py-10px px-15px fw-600 font-size-md border-top d-flex justify-content-between"
                            key={index}
                          >
                            <span>{item.Title}</span>
                            <span>
                              {PriceHelper.formatVND(
                                rowData?.LuongCa_PPhi?.Tong_DV ||
                                  rowData?.LuongCa_PPhi?.Tong_DV_Extra
                              )}
                            </span>
                          </div>
                        ))}
                        {rowData.LuongCa_PPhi?.DS_PP.map((item, index) => (
                          <div
                            className="border-gray-200 py-10px px-15px fw-600 font-size-md border-top d-flex justify-content-between w-100"
                            key={index}
                          >
                            <span>{item.Title}</span>
                            <span>{PriceHelper.formatVND(item.ToPay)}</span>
                          </div>
                        ))}
                        {wrapSalaryUser(rowData?.Salary?.salaryList) &&
                          wrapSalaryUser(rowData?.Salary?.salaryList).length >
                            1 &&
                          wrapSalaryUser(rowData?.Salary?.salaryList).map(
                            (item, index) => (
                              <div
                                className="border-gray-200 py-10px px-15px fw-600 font-size-md border-top d-flex justify-content-between w-100"
                                key={index}
                              >
                                <span>{item.StaffName}</span>
                                <span>
                                  {PriceHelper.formatVND(
                                    sumTotal(item.Items, 'Value')
                                  )}
                                </span>
                              </div>
                            )
                          )}
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
              <div className="d-flex justify-content-end justify-content-md-between align-items-center w-100">
                {PriceHelper.formatVND(rowData?.LuongCa_PPhi?.Tong_Luong)}
                <i className="cursor-pointer fa-solid fa-circle-exclamation text-warning pl-5px"></i>
              </div>
            </OverlayTrigger>
          ),
          width: 220,
          sortable: false,
          mobileOptions: {
            visible: true
          }
        },
        {
          key: 'Ngay_Lam',
          title: 'Ngày làm',
          dataKey: 'Ngay_Lam',
          cellRenderer: ({ rowData }) =>
            rowData.Ngay_Lam
              ? moment(rowData.Ngay_Lam).format('HH:mm DD-MM-YYYY')
              : 'Không xác định',
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
          width: 220,
          sortable: false
        },
        {
          key: 'Member.Phone',
          title: 'Số điện thoại',
          dataKey: 'Member.Phone',
          width: 200,
          sortable: false
        },
        {
          key: 'DV_Goc.ProdTitle',
          title: 'Dịch vụ gốc',
          dataKey: 'DV_Goc.ProdTitle',
          width: 250,
          sortable: false
        },
        {
          key: 'The_DV.CardTitle',
          title: 'Thẻ dịch vụ',
          dataKey: 'The_DV.CardTitle',
          width: 250,
          sortable: false
        },
        {
          key: 'ID_DH',
          title: 'ID Đơn hàng',
          dataKey: 'ID_DH',
          cellRenderer: ({ rowData }) => {
            let OrderID =
              rowData?.Salary?.salaryList &&
              rowData?.Salary?.salaryList.length > 0
                ? rowData?.Salary?.salaryList[0].OrderID
                : ''
            return OrderID
          },
          width: 150,
          sortable: false
        },
        {
          key: 'ID_Buoi_Dv',
          title: 'ID Buổi dịch vụ',
          dataKey: 'ID_Buoi_Dv',
          width: 150,
          sortable: false
        },
        {
          key: 'giabuoi',
          title: 'Giá buổi',
          dataKey: 'giabuoi',
          cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.giabuoi),
          width: 180,
          sortable: false
        },
        {
          key: 'DS_PP',
          title: 'Phụ phí',
          dataKey: 'DS_PP',
          cellRenderer: ({ rowData }) => (
            <Text tooltipMaxWidth={300}>
              {rowData.LuongCa_PPhi?.DS_PP &&
              rowData.LuongCa_PPhi?.DS_PP.length > 0
                ? rowData.LuongCa_PPhi?.DS_PP.map(item => item.Title).join(', ')
                : ''}
            </Text>
          ),
          width: 250,
          sortable: false
        },
        {
          key: 'StockName',
          title: 'Cơ sở',
          dataKey: 'StockName',
          width: 220,
          sortable: false
        }
      ]
    } else if (filters.ShowsX === '3') {
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
          key: 'OrderServiceID',
          title: 'ID Dịch vụ',
          dataKey: 'OrderServiceID',
          width: 150,
          sortable: false,
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
              : 'Không xác định',
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
          width: 220,
          sortable: false
        },
        {
          key: 'UserFullName',
          title: 'Tên nhân viên',
          dataKey: 'UserFullName',
          width: 220,
          sortable: false,
          mobileOptions: {
            visible: true
          }
        },
        {
          key: 'Value',
          title: 'Tổng lương',
          dataKey: 'Value',
          cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.Value),
          width: 180,
          sortable: false
        },
        {
          key: 'ValueSetup',
          title: 'Theo Setup',
          dataKey: 'ValueSetup',
          cellRenderer: ({ rowData }) =>
            PriceHelper.formatVND(rowData.ValueSetup),
          width: 180,
          sortable: false
        },
        {
          key: 'Extra',
          title: 'Extra',
          dataKey: 'Extra',
          cellRenderer: ({ rowData }) =>
            PriceHelper.formatVND(rowData.ValueExtra),
          width: 180,
          sortable: false
        },
        {
          key: 'Root.Title',
          title: 'Dịch vụ gốc',
          dataKey: 'Root.Title',
          width: 250,
          sortable: false
        },
        {
          key: 'Prod.Title',
          title: 'Thẻ dịch vụ',
          dataKey: 'Prod.Title',
          width: 250,
          sortable: false
        },
        {
          key: 'Member.FullName',
          title: 'Khách hàng',
          dataKey: 'Member.FullName',
          width: 220,
          sortable: false
        },
        {
          key: 'Member.MobilePhone',
          title: 'Số điện thoại',
          dataKey: 'Member.MobilePhone',
          width: 200,
          sortable: false
        }
      ]
    } else {
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
          key: 'ReceiverName',
          title: 'Tên nhân viên',
          dataKey: 'ReceiverName',
          width: 300,
          sortable: false,
          mobileOptions: {
            visible: true
          }
        },
        {
          key: 'CreateDate',
          title: 'Thời gian',
          dataKey: 'CreateDate',
          cellRenderer: ({ rowData }) => (
            <>{moment(rowData.CreateDate).format('HH:mm DD-MM-YYYY')}</>
          ),
          width: 200,
          sortable: false,
          mobileOptions: {
            visible: true
          }
        },
        {
          key: 'StockTitle',
          title: 'Cơ sở',
          dataKey: 'StockTitle',
          width: 300,
          sortable: false,
          mobileOptions: {
            visible: true
          }
        },
        {
          key: 'Value',
          title: 'Tiền TIP',
          dataKey: 'Value',
          cellRenderer: ({ rowData }) => (
            <>{PriceHelper.formatVND(rowData?.Value)}</>
          ),
          width: 200,
          sortable: false,
          mobileOptions: {
            visible: true
          }
        },
        {
          key: 'Desc',
          title: 'Nội dung',
          dataKey: 'Desc',
          width: 250,
          sortable: false,
          mobileOptions: {
            visible: true
          }
        }
      ]
    }
  }, [filters])

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
          <span className="text-uppercase font-size-xl fw-600">
            Báo cáo lương ca dịch vụ
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
      <FilterListLUONG
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
          <div className="fw-500 font-size-lg">Danh sách lương ca dịch vụ</div>
          <div className="d-flex">
            {/* <div className="fw-500 d-flex align-items-center">
              Tổng lương NV
              <span className="font-size-xl fw-600 text-success pl-5px font-number">
                {PriceHelper.formatVNDPositive(Total.Tong_Luong_Tat_ca_nhan_vien)}
              </span>
            </div> */}
            {filters.ShowsX !== '3' && (
              <div className="fw-500 d-flex align-items-center ml-25px">
                {filters.ShowsX === '1' ? 'Tổng lương' : 'Tổng tip'}
                {filters.ShowsX === '1' ? (
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
                          Chi tiết tổng lương
                        </Popover.Header>
                        <Popover.Body className="p-0">
                          <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                            <span>Tổng lương dịch vụ</span>
                            <span>
                              {PriceHelper.formatVNDPositive(Total.Tong_DV)}
                            </span>
                          </div>
                          <div className="border-gray-200 py-10px px-15px fw-600 font-size-md d-flex justify-content-between">
                            <span>Tổng lương phụ phí</span>
                            <span>
                              {PriceHelper.formatVNDPositive(Total.Tong_PP)}
                            </span>
                          </div>
                        </Popover.Body>
                      </Popover>
                    }
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="font-size-xl fw-600 text-success pl-5px font-number">
                        {PriceHelper.formatVNDPositive(Total.Tong_Luong)}
                      </span>
                      <i className="cursor-pointer fa-solid fa-circle-exclamation text-success ml-5px"></i>
                    </div>
                  </OverlayTrigger>
                ) : (
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="font-size-xl fw-600 text-success pl-5px font-number">
                      {PriceHelper.formatVNDPositive(Total.Tong_Luong)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
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
          />
        </div>
        <ModalViewMobile
          show={isModalMobile}
          onHide={HideModalMobile}
          data={initialValuesMobile}
        />
      </div>
      {filters.ShowsX === '3' && (
        <RenderSum Items={Total?.sum || []} loading={loading} />
      )}
    </div>
  )
}

export default SalaryServices
