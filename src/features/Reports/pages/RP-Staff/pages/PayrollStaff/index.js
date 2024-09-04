import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterList from 'src/components/Filter/FilterList'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import { PriceHelper } from 'src/helpers/PriceHelper'
import reportsApi from 'src/api/reports.api'
import ModalViewMobile from './ModalViewMobile'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import Text from 'react-texty'

import moment from 'moment'
import 'moment/locale/vi'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'
import clsx from 'clsx'
import { OverlayTrigger, Popover } from 'react-bootstrap'
moment.locale('vi')

const OverlayHH = ({ rowData, filters }) => {
  const [show, setShow] = useState(false)
  const [values, setValues] = useState(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    show && getDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show])

  const getDetail = () => {
    setLoading(true)
    reportsApi
      .getDetailPayroll(
        {
          UserID: rowData.Staff.ID,
          Mon: filters.Mon ? moment(filters.Mon).format('MM/YYYY') : ''
        },
        'HOA_HONG'
      )
      .then(({ data }) => {
        setValues(data ? data.filter(x => x.Value > 0) : null)
        setLoading(false)
      })
  }

  return (
    <OverlayTrigger
      rootClose
      trigger="click"
      key="bottom"
      placement="bottom"
      overlay={
        <Popover id={`popover-positioned-top` + rowData?.Staff.ID}>
          <Popover.Header className="py-10px text-uppercase fw-600" as="h3">
            Hoa hồng - {rowData?.Staff.FullName}
          </Popover.Header>
          <Popover.Body
            className="p-0"
            style={{
              maxHeight: '250px',
              overflow: 'auto'
            }}
          >
            {loading && (
              <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                <span>Đang tải ...</span>
              </div>
            )}
            {!loading && (
              <>
                {values &&
                  values.map((item, index) => (
                    <div
                      className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between"
                      key={index}
                    >
                      <span>{item.StockTitle}</span>
                      <span>{PriceHelper.formatVNDPositive(item.Value)}</span>
                    </div>
                  ))}
              </>
            )}
          </Popover.Body>
        </Popover>
      }
      onEntered={() => setShow(true)}
      onExited={() => setShow(false)}
    >
      <div className="d-flex justify-content-between w-100 align-items-center cursor-pointer">
        <div>{PriceHelper.formatVND(rowData.HOA_HONG)}</div>
        <div>
          <i className="fa-solid fa-circle-info text-warning"></i>
        </div>
      </div>
    </OverlayTrigger>
  )
}

const OverlayLCS = ({ rowData, filters }) => {
  const [show, setShow] = useState(false)
  const [values, setValues] = useState(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    show && getDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show])

  const getDetail = () => {
    setLoading(true)
    reportsApi
      .getDetailPayroll(
        {
          UserID: rowData.Staff.ID,
          Mon: filters.Mon ? moment(filters.Mon).format('MM/YYYY') : ''
        },
        'LUONG_CHINH_SACH'
      )
      .then(({ data }) => {
        setValues(data ? data.filter(x => x.Value > 0) : null)
        setLoading(false)
      })
  }

  return (
    <OverlayTrigger
      rootClose
      trigger="click"
      key="bottom"
      placement="bottom"
      overlay={
        <Popover id={`popover-positioned-top` + rowData?.Staff.ID}>
          <Popover.Header className="py-10px text-uppercase fw-600" as="h3">
            Lương chính sách - {rowData?.Staff.FullName}
          </Popover.Header>
          <Popover.Body
            className="p-0"
            style={{
              maxHeight: '250px',
              overflow: 'auto'
            }}
          >
            {loading && (
              <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                <span>Đang tải ...</span>
              </div>
            )}
            {!loading && (
              <>
                {values &&
                  values.map((item, index) => (
                    <div
                      className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between"
                      key={index}
                    >
                      <span>{item.StockTitle}</span>
                      <span>{PriceHelper.formatVNDPositive(item.Value)}</span>
                    </div>
                  ))}
              </>
            )}
          </Popover.Body>
        </Popover>
      }
      onEntered={() => setShow(true)}
      onExited={() => setShow(false)}
    >
      <div className="d-flex justify-content-between w-100 align-items-center cursor-pointer">
        <div>{PriceHelper.formatVND(rowData.LUONG_CHAM_CONG)}</div>
        <div>
          <i className="fa-solid fa-circle-info text-warning"></i>
        </div>
      </div>
    </OverlayTrigger>
  )
}

const OverlayLT = ({ rowData, filters }) => {
  const [show, setShow] = useState(false)
  const [values, setValues] = useState(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    show && getDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show])

  const getDetail = () => {
    setLoading(true)
    reportsApi
      .getDetailPayroll(
        {
          UserID: rowData.Staff.ID,
          Mon: filters.Mon ? moment(filters.Mon).format('MM/YYYY') : ''
        },
        'LUONG_TOUR'
      )
      .then(({ data }) => {
        setValues(data ? data.filter(x => x.Value > 0) : null)
        setLoading(false)
      })
  }

  return (
    <OverlayTrigger
      rootClose
      trigger="click"
      key="bottom"
      placement="bottom"
      overlay={
        <Popover id={`popover-positioned-top` + rowData?.Staff.ID}>
          <Popover.Header className="py-10px text-uppercase fw-600" as="h3">
            Lương Tour - {rowData?.Staff.FullName}
          </Popover.Header>
          <Popover.Body
            className="p-0"
            style={{
              maxHeight: '250px',
              overflow: 'auto'
            }}
          >
            {loading && (
              <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                <span>Đang tải ...</span>
              </div>
            )}
            {!loading && (
              <>
                {values &&
                  values.map((item, index) => (
                    <div
                      className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between"
                      key={index}
                    >
                      <span>{item.StockTitle}</span>
                      <span>{PriceHelper.formatVNDPositive(item.Value)}</span>
                    </div>
                  ))}
              </>
            )}
          </Popover.Body>
        </Popover>
      }
      onEntered={() => setShow(true)}
      onExited={() => setShow(false)}
    >
      <div className="d-flex justify-content-between w-100 align-items-center cursor-pointer">
        <div>{PriceHelper.formatVND(rowData.LUONG_CA)}</div>
        <div>
          <i className="fa-solid fa-circle-info text-warning"></i>
        </div>
      </div>
    </OverlayTrigger>
  )
}

const OverlayDS = ({ rowData, filters }) => {
  const [show, setShow] = useState(false)
  const [values, setValues] = useState(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    show && getDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show])

  const getDetail = () => {
    setLoading(true)
    reportsApi
      .getDetailPayroll(
        {
          UserID: rowData.Staff.ID,
          Mon: filters.Mon ? moment(filters.Mon).format('MM/YYYY') : ''
        },
        'DOANH_SO'
      )
      .then(({ data }) => {
        setValues(data ? data.filter(x => x.Value > 0) : null)
        setLoading(false)
      })
  }

  return (
    <OverlayTrigger
      rootClose
      trigger="click"
      key="bottom"
      placement="bottom"
      overlay={
        <Popover id={`popover-positioned-top` + rowData?.Staff.ID}>
          <Popover.Header className="py-10px text-uppercase fw-600" as="h3">
            Doanh số - {rowData?.Staff.FullName}
          </Popover.Header>
          <Popover.Body
            className="p-0"
            style={{
              maxHeight: '250px',
              overflow: 'auto'
            }}
          >
            {loading && (
              <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                <span>Đang tải ...</span>
              </div>
            )}
            {!loading && (
              <>
                {values &&
                  values.map((item, index) => (
                    <div
                      className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between"
                      key={index}
                    >
                      <span>{item.StockTitle}</span>
                      <span>{PriceHelper.formatVNDPositive(item.Value)}</span>
                    </div>
                  ))}
              </>
            )}
          </Popover.Body>
        </Popover>
      }
      onEntered={() => setShow(true)}
      onExited={() => setShow(false)}
    >
      <div className="d-flex justify-content-between w-100 align-items-center cursor-pointer">
        <div>{PriceHelper.formatVND(rowData.DOANH_SO_THANG)}</div>
        <div>
          <i className="fa-solid fa-circle-info text-warning"></i>
        </div>
      </div>
    </OverlayTrigger>
  )
}

const OverlayKPI = ({ rowData, filters }) => {
  const [show, setShow] = useState(false)
  const [values, setValues] = useState(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    show && getDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show])

  const getDetail = () => {
    setLoading(true)
    reportsApi
      .getDetailPayroll(
        {
          UserID: rowData.Staff.ID,
          Mon: filters.Mon ? moment(filters.Mon).format('MM/YYYY') : ''
        },
        'DOANH_SO'
      )
      .then(({ data }) => {
        if (data && data.length > 0) {
          let newsKPIS = data ? data.filter(x => x.Value > 0) : null
          if (newsKPIS && newsKPIS.length > 0) {
            let result = []
            for (let item of newsKPIS) {
              let x = 0
              let y = rowData.DOANH_SO_THANG > 30000000 ? 500000 : -500000
              if (
                15000000 <= rowData.DOANH_SO_THANG &&
                rowData.DOANH_SO_THANG < 30000000
              ) {
                x = 5
              } else if (
                45000000 <= rowData.DOANH_SO_THANG &&
                rowData.DOANH_SO_THANG < 60000000
              ) {
                x = 6
              } else if (
                60000000 <= rowData.DOANH_SO_THANG &&
                rowData.DOANH_SO_THANG < 1000000000
              ) {
                x = 7
              }
              result.push({
                ...item,
                x,
                y
              })
            }
            setValues(result)
          }
        }
        setLoading(false)
      })
  }
  return (
    <OverlayTrigger
      rootClose
      trigger="click"
      key="bottom"
      placement="bottom"
      overlay={
        <Popover id={`popover-positioned-top` + rowData?.Staff.ID}>
          <Popover.Header className="py-10px text-uppercase fw-600" as="h3">
            KPI - {rowData?.Staff.FullName}
          </Popover.Header>
          <Popover.Body
            className="p-0"
            style={{
              maxHeight: '250px',
              overflow: 'auto'
            }}
          >
            {loading && (
              <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                <span>Đang tải ...</span>
              </div>
            )}
            {!loading && (
              <>
                <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                  <span>Doanh số cơ sở chính</span>
                  <span>
                    {PriceHelper.formatVND(
                      rowData.DOANH_SO_THANG >= 30000000 ? 500000 : -500000
                    )}
                  </span>
                </div>
                {values &&
                  values.map((item, index) => (
                    <div
                      className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between"
                      key={index}
                    >
                      <span>{item.StockTitle}</span>
                      <span>
                        {PriceHelper.formatVNDPositive(
                          (item.Value * item.x) / 100
                        )}
                      </span>
                    </div>
                  ))}
              </>
            )}
          </Popover.Body>
        </Popover>
      }
      onEntered={() => setShow(true)}
      onExited={() => setShow(false)}
    >
      <div className="d-flex justify-content-between w-100 align-items-center cursor-pointer">
        <div>{PriceHelper.formatVND(rowData.KPI_Hoa_hong)}</div>
        <div>
          <i className="fa-solid fa-circle-info text-warning"></i>
        </div>
      </div>
    </OverlayTrigger>
  )
}

function PayrollStaff(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    Mon: new Date(), // Ngày bắt đầu
    Pi: 1, // Trang hiện tại
    Ps: 15, // Số lượng item
    Shows: '0'
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
    getListPayroll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListPayroll = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    reportsApi
      .getListStaffPayroll(BrowserHelpers.getRequestParamsList(filters))
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const { Items, Total, PCount, SumTotal } = {
            Items: data.result?.Items
              ? data.result?.Items.map(x => ({ ...x, IDs: x?.Staff?.ID }))
              : [],
            Total: data.result?.Total || 0,
            PCount: data?.result?.PCount || 0,
            SumTotal: data.result?.Sum || {}
          }
          setListData(Items)
          setTotal({ ...Total, ...SumTotal })
          setLoading(false)
          setPageTotal(Total)
          setPageCount(PCount)
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
      getListPayroll()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    getListPayroll()
  }

  const onExport = () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getListStaffPayroll(
          BrowserHelpers.getRequestParamsList(filters, {
            Total: PageTotal
          })
        ),
      UrlName: '/nhan-vien/bang-luong'
    })
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
        key: 'Id',
        title: 'ID',
        dataKey: 'Id',
        cellRenderer: ({ rowData }) => `#${rowData.Staff?.ID}`,
        width: 100,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Staff.FullName',
        title: 'Tên nhân viên',
        dataKey: 'Staff.FullName',
        width: 250,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'DiemQL',
        title: 'Cơ sở',
        dataKey: 'DiemQL',
        cellRenderer: ({ rowData }) => (
          <Text tooltipMaxWidth={300}>
            {rowData?.DiemQL && rowData?.DiemQL.length > 0
              ? rowData?.DiemQL.map(stock => stock.StockTitle).join(', ')
              : 'Chưa xác định'}
          </Text>
        ),
        width: 250,
        sortable: false
      },
      {
        key: 'LUONG_CHAM_CONG',
        title: 'Lương chính sách',
        dataKey: 'LUONG_CHAM_CONG',
        cellRenderer: ({ rowData }) => (
          <OverlayLCS rowData={rowData} filters={filters} />
        ),
        footerRenderer: () => (
          <span className="text-success font-size-md font-number">
            {PriceHelper.formatVND(Total?.LUONG_CHAM_CONG)}
          </span>
        ),
        width: 150,
        sortable: false
      },
      {
        key: 'PHU_CAP',
        title: 'Phụ cấp',
        dataKey: 'PHU_CAP',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.PHU_CAP),
        width: 150,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(Total?.PHU_CAP)}
          </span>
        )
      },
      // {
      //   key: 'TRU_NGAY_NGHI',
      //   title: 'Ngày nghỉ',
      //   dataKey: 'TRU_NGAY_NGHI',
      //   cellRenderer: ({ rowData }) =>
      //     PriceHelper.formatVND(rowData.TRU_NGAY_NGHI),
      //   width: 150,
      //   sortable: false,
      //   footerRenderer: () => (
      //     <span className="font-size-md font-number text-danger">
      //       {PriceHelper.formatVND(Total?.TRU_NGAY_NGHI)}
      //     </span>
      //   )
      // },
      {
        key: 'THUONG',
        title: 'Thưởng',
        dataKey: 'THUONG',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.THUONG),
        width: 150,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(Total?.THUONG)}
          </span>
        )
      },
      {
        key: 'TRU_PHAT',
        title: 'Phạt',
        dataKey: 'TRU_PHAT',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.TRU_PHAT),
        width: 150,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number text-danger">
            {PriceHelper.formatVND(Total?.TRU_PHAT)}
          </span>
        )
      },
      {
        key: 'LUONG_CA_CAI_DAT',
        title: 'Lương ca cài đặt',
        dataKey: 'LUONG_CA_CAI_DAT',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.LUONG_CA_CAI_DAT),
        width: 150,
        sortable: false,
        hidden: Number(filters.Shows) === 0
      },
      {
        key: 'LUONG_CA_EXTRA',
        title: 'Thưởng KH chọn',
        dataKey: 'LUONG_CA_EXTRA',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.LUONG_CA_EXTRA),
        width: 150,
        sortable: false,
        hidden: Number(filters.Shows) === 0
      },
      {
        key: 'LUONG_CA',
        title: 'Lương Tour',
        dataKey: 'LUONG_CA',
        cellRenderer: ({ rowData }) => (
          <OverlayLT rowData={rowData} filters={filters} />
        ),
        width: 180,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(Total?.LUONG_CA)}
          </span>
        )
      },
      {
        key: 'HOA_HONG_Sanpham',
        title: 'HH Sản phẩm',
        dataKey: 'HOA_HONG_Sanpham',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.HOA_HONG_Sanpham),
        width: 150,
        sortable: false,
        hidden: Number(filters.Shows) === 0
      },
      {
        key: 'HOA_HONG_Dichvu',
        title: 'HH Dịch vụ',
        dataKey: 'HOA_HONG_Dichvu',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.HOA_HONG_Dichvu),
        width: 150,
        sortable: false,
        hidden: Number(filters.Shows) === 0
      },
      {
        key: 'GiaTri_Thetien',
        title: 'HH Thẻ tiền',
        dataKey: 'GiaTri_Thetien',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.GiaTri_Thetien),
        width: 150,
        sortable: false,
        hidden: Number(filters.Shows) === 0
      },
      {
        key: 'HOA_HONG_NVL',
        title: 'HH NVL',
        dataKey: 'HOA_HONG_NVL',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.HOA_HONG_NVL),
        width: 150,
        sortable: false,
        hidden: Number(filters.Shows) === 0
      },
      {
        key: 'HOA_HONG_Phuphi',
        title: 'HH Phụ phí',
        dataKey: 'HOA_HONG_Phuphi',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.HOA_HONG_Phuphi),
        width: 150,
        sortable: false,
        hidden: Number(filters.Shows) === 0
      },
      {
        key: 'HOA_HONG',
        title: 'Hoa Hồng',
        dataKey: 'HOA_HONG',
        cellRenderer: ({ rowData }) => (
          <OverlayHH rowData={rowData} filters={filters} />
        ),

        width: 150,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(Total?.HOA_HONG)}
          </span>
        )
      },
      {
        key: 'DOANH_SO_THANG',
        title: 'Doanh số',
        dataKey: 'DOANH_SO_THANG',
        cellRenderer: ({ rowData }) => (
          <OverlayDS rowData={rowData} filters={filters} />
        ),
        width: 150,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(Total?.DOANH_SO_THANG)}
          </span>
        )
      },
      {
        key: 'KPI_Hoa_hong',
        title: 'KPI',
        dataKey: 'KPI_Hoa_hong',
        cellRenderer: ({ rowData }) =>
          window?.top?.GlobalConfig?.Admin?.chi_tiet_cong ? (
            <OverlayKPI rowData={rowData} filters={filters} />
          ) : (
            PriceHelper.formatVND(rowData?.KPI_Hoa_hong)
          ),
        width: 150,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(Total?.KPI_Hoa_hong)}
          </span>
        )
      },
      {
        key: 'LUONG_DU_KIEN',
        title: 'Thu nhập dự kiến',
        dataKey: 'LUONG_DU_KIEN',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.LUONG_DU_KIEN),
        width: 150,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(Total?.LUONG_DU_KIEN)}
          </span>
        )
      },
      {
        key: 'GIU_LUONG',
        title: 'Giữ lương',
        dataKey: 'GIU_LUONG',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.GIU_LUONG),
        width: 150,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(Total?.GIU_LUONG)}
          </span>
        )
      },
      {
        key: 'THUC_TRA_DU_KIEN',
        title: 'Thực trả dự kiến',
        dataKey: 'THUC_TRA_DU_KIEN',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.THUC_TRA_DU_KIEN),
        width: 150,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(Total?.THUC_TRA_DU_KIEN)}
          </span>
        )
      },
      {
        key: 'TAM_UNG',
        title: 'Tạm ứng',
        dataKey: 'TAM_UNG',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData?.TAM_UNG - rowData?.HOAN_UNG),
        width: 150,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(Total?.TAM_UNG - Total?.HOAN_UNG)}
          </span>
        )
      },
      {
        key: 'Phai_Tra_Nhan_Vien',
        title: 'Phải trả nhân viên',
        dataKey: 'Phai_Tra_Nhan_Vien',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(
            rowData.THUC_TRA_DU_KIEN - (rowData.TAM_UNG - rowData.HOAN_UNG)
          ),
        width: 150,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number text-success">
            {PriceHelper.formatVND(
              Total?.THUC_TRA_DU_KIEN - (Total?.TAM_UNG - Total?.HOAN_UNG)
            )}
          </span>
        )
      },
      {
        key: 'DA_TRA',
        title: 'Đã trả',
        dataKey: 'DA_TRA',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.DA_TRA),
        width: 150,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(Total?.DA_TRA)}
          </span>
        )
      },
      {
        key: 'TON_GIU_LUONG',
        title: 'Tồn giữ lương',
        dataKey: 'TON_GIU_LUONG',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.TON_GIU_LUONG),
        width: 150,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(Total?.TON_GIU_LUONG)}
          </span>
        )
      }
    ],
    [filters, Total]
  )

  const onPagesChange = ({ Pi, Ps }) => {
    setFilters({ ...filters, Pi, Ps })
  }

  const OpenModalMobile = value => {
    setInitialValuesMobile(value)
    setIsModalMobile(true)
  }

  const HideModalMobile = () => {
    setInitialValuesMobile(null)
    setIsModalMobile(false)
  }

  const headerRenderer = ({ cells, columns, headerIndex }) => {
    if (headerIndex === 0) {
      return cells
    }
    const groupCells = []
    columns.forEach((column, columnIndex) => {
      groupCells.push(
        <div
          className={clsx(
            cells[columnIndex].props.className,
            !column.footerRenderer && 'bg-stripes',
            'bg-gray-200'
          )}
          key={`header-group-cell-${column.key}`}
          style={{ ...cells[columnIndex].props.style }}
        >
          {column.footerRenderer && column.footerRenderer()}
        </div>
      )
    })
    return groupCells
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Bảng lương nhân viên
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
          <div className="fw-500 font-size-lg">Danh sách nhân viên</div>
        </div>
        <div className="p-20px">
          <ReactTableV7
            rowKey="IDs"
            filters={filters}
            columns={columns}
            data={ListData}
            loading={loading}
            pageCount={pageCount}
            onPagesChange={onPagesChange}
            optionMobile={{
              CellModal: cell => OpenModalMobile(cell)
            }}
            headerHeight={[50, 50]}
            headerRenderer={headerRenderer}
          />
        </div>
        <ModalViewMobile
          show={isModalMobile}
          onHide={HideModalMobile}
          data={initialValuesMobile}
          filters={filters}
        />
      </div>
    </div>
  )
}

export default PayrollStaff
