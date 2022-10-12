import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterList from 'src/components/Filter/FilterList'
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

moment.locale('vi')

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
    ServiceCardID: ''
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
            Tong_Luong_Tat_ca_nhan_vien
          } = {
            Items: data.result?.Items || [],
            Total: data.result?.Total || 0,
            PCount: data.result?.PCount || 0,
            Tong_Luong: data.result?.Tong_Luong || 0,
            Tong_DV: data.result?.Tong_DV || 0,
            Tong_PP: data.result?.Tong_PP || 0,
            Tong_Luong_Tat_ca_nhan_vien:
              data.result?.Tong_Luong_Tat_ca_nhan_vien || 0
          }
          setListData(Items)
          setTotal({
            Tong_Luong,
            Tong_DV,
            Tong_PP,
            Tong_Luong_Tat_ca_nhan_vien
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
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getListStaffSalarySV(
          BrowserHelpers.getRequestParamsToggle(filters, { Total: PageTotal })
        ),
      UrlName: '/nhan-vien/luong-ca-dich-vu'
    })
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
              <Popover id={`popover-positioned-top`}>
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
                    rowData.LuongCa_PPhi?.DS_PP.length > 0) ? (
                    <Fragment>
                      {rowData.LuongCa_PPhi?.DS_DV.map((item, index) => (
                        <div
                          className="py-10px px-15px fw-600 font-size-md border-top border-gray-200 d-flex justify-content-between"
                          key={index}
                        >
                          <span>{item.Title}</span>
                          <span>{PriceHelper.formatVND(item.ToPay)}</span>
                        </div>
                      ))}
                      {rowData.LuongCa_PPhi?.DS_PP.map((item, index) => (
                        <div
                          className="py-10px px-15px fw-600 font-size-md border-top border-gray-200 d-flex justify-content-between w-100"
                          key={index}
                        >
                          <span>{item.Title}</span>
                          <span>{PriceHelper.formatVND(item.ToPay)}</span>
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
            <div className="d-flex justify-content-between align-items-center w-100">
              {PriceHelper.formatVND(rowData.LuongCa_PPhi.Tong_Luong)}
              <i className="fa-solid fa-circle-exclamation cursor-pointer text-warning pl-5px"></i>
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
        key: 'ID_Buoi_Dv',
        title: 'ID Buổi dịch vụ',
        dataKey: 'ID_Buoi_Dv',
        width: 150,
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
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Báo cáo lương ca dịch vụ
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
        <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between">
          <div className="fw-500 font-size-lg">Danh sách lương ca dịch vụ</div>
          <div className="d-flex">
            {/* <div className="fw-500 d-flex align-items-center">
              Tổng lương NV
              <span className="font-size-xl fw-600 text-success pl-5px font-number">
                {PriceHelper.formatVNDPositive(Total.Tong_Luong_Tat_ca_nhan_vien)}
              </span>
            </div> */}
            <div className="fw-500 d-flex align-items-center ml-25px">
              Tổng lương
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
                      <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                        <span>Tổng lương dịch vụ</span>
                        <span>
                          {PriceHelper.formatVNDPositive(Total.Tong_DV)}
                        </span>
                      </div>
                      <div className="py-10px px-15px fw-600 font-size-md border-gray-200 d-flex justify-content-between">
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
                  <i className="fa-solid fa-circle-exclamation cursor-pointer text-success ml-5px"></i>
                </div>
              </OverlayTrigger>
            </div>
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
    </div>
  )
}

export default SalaryServices
