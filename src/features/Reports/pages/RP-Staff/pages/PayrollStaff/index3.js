import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterList from 'src/components/Filter/FilterList'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import { PriceHelper } from 'src/helpers/PriceHelper'
import reportsApi from 'src/api/reports.api'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import moment from 'moment'
import 'moment/locale/vi'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import clsx from 'clsx'
import { useQuery } from '@tanstack/react-query'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'

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
          UserID: rowData.User.ID,
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
        <Popover id={`popover-positioned-top` + rowData?.User.ID}>
          <Popover.Header className="py-10px text-uppercase fw-600" as="h3">
            Hoa hồng - {rowData?.User.FullName}
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
                      className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between"
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
      <div className="cursor-pointer d-flex justify-content-between w-100 align-items-center">
        <div>{PriceHelper.formatVND(rowData?.BANGLUONGBC?.HOA_HONG)}</div>
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
          UserID: rowData.User.ID,
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
        <Popover id={`popover-positioned-top` + rowData?.User.ID}>
          <Popover.Header className="py-10px text-uppercase fw-600" as="h3">
            Lương Tour - {rowData?.User.FullName}
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
                      className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between"
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
      <div className="cursor-pointer d-flex justify-content-between w-100 align-items-center">
        <div>{PriceHelper.formatVND(rowData?.BANGLUONGBC?.LUONG_CA)}</div>
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
          UserID: rowData.User.ID,
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
        <Popover id={`popover-positioned-top` + rowData?.User.ID}>
          <Popover.Header className="py-10px text-uppercase fw-600" as="h3">
            Doanh số - {rowData?.User.FullName}
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
                      className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between"
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
      <div className="cursor-pointer d-flex justify-content-between w-100 align-items-center">
        <div>{PriceHelper.formatVND(rowData?.BANGLUONGBC?.DOANH_SO_THANG)}</div>
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
          UserID: rowData.User.ID,
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
        <Popover id={`popover-positioned-top` + rowData?.User?.ID}>
          <Popover.Header className="py-10px text-uppercase fw-600" as="h3">
            Tổng lương chấm công - {rowData?.User.FullName}
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
                      className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between"
                      key={index}
                    >
                      <span>{item.StockTitle}</span>
                      <span>
                        {PriceHelper.formatVNDPositive(
                          (item?.Qty / (item?.Qty + 1)) *
                            rowData?.TONG_LUONG_CHAM_CONG
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
      <div className="cursor-pointer d-flex justify-content-between w-100 align-items-center">
        <div>{PriceHelper.formatVND(rowData?.TONG_LUONG_CHAM_CONG)}</div>
        <div>
          <i className="fa-solid fa-circle-info text-warning"></i>
        </div>
      </div>
    </OverlayTrigger>
  )
}

function getPercentValue(ranges, value) {
  const item = ranges.find(([from, to]) => {
    if (from === null) return value >= to
    if (to === null) return value >= from

    return value >= from && value < to
  })
  if (!item)
    return {
      from: 0,
      to: 0,
      percent: 0,
      amount: 0
    }

  const [from, to, percent] = item

  return {
    from,
    to,
    percent,
    amount: Math.floor((value * percent) / 100)
  }
}

function PayrollStaff3(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    Mon: new Date(), // Ngày bắt đầu
    Pi: 1, // Trang hiện tại
    Ps: 15 // Số lượng item
    //Shows: '0'
  })
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)

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

  const { isLoading, isSuccess, isFetching, data, refetch, error, isError } =
    useQuery({
      queryKey: ['ListPayroll3', filters],
      queryFn: async () => {
        let { data: configs } = await reportsApi.getConfigSalary({
          Mon: filters.Mon ? moment(filters.Mon).format('MM/YYYY') : '',
          StockID: filters.StockID ? [filters.StockID] : Stocks.map(x => x.ID),
          StocksRoles: filters.StocksRoles
        })

        let { data: payrolls } = await reportsApi.getListStaffPayroll({
          ...BrowserHelpers.getRequestParamsList(filters),
          Ps: configs?.lst?.length || 0,
          StocksRoles: filters.StocksRoles
        })

        if (payrolls?.isRight) {
          throw new Error(payrolls?.error || 'Có lỗi xảy ra')
        }

        let { data: timekeepings } = await reportsApi.getMonSalary({
          mon: filters.Mon ? moment(filters.Mon).format('MM/YYYY') : '',
          pi: 1,
          ps: configs?.lst?.length || 0,
          stockid: filters.StockID || '',
          StocksRoles: filters.StocksRoles
        })

        let rs = [...timekeepings?.list]

        if (payrolls?.result?.Items && payrolls?.result?.Items.length > 0) {
          rs = rs.map(item => {
            let newObj = {
              ...item,
              BANGLUONGBC: null
            }
            let index = payrolls?.result?.Items.findIndex(
              x => item?.User?.ID === x?.Staff?.ID
            )
            if (index > -1) {
              newObj.BANGLUONGBC = payrolls?.result?.Items[index]
            }
            return newObj
          })
        }

        rs = rs.map(item => ({
          ...item,
          DOANH_SO_THANG_CO_SO:
            timekeepings?.sum?.find(x => x.StockID === item?.User?.StockID)
              ?.Total || 0
        }))

        if (configs?.lst && configs?.lst.length > 0) {
          rs = rs.map(item => {
            let newObj = {
              ...item,
              SETTINGS: null
            }
            let index = configs?.lst.findIndex(
              x => item?.User?.ID === x?.User?.ID
            )
            if (index > -1) {
              newObj.SETTINGS = configs?.lst[index]
            }
            return newObj
          })
        }

        rs = rs
          .map(item => ({
            ...item
          }))
          .map(item => {
            let newObj = { ...item }
            let LUONG_NOP_BHXH = getValueByName({
              Items: item?.SETTINGS?.Settings,
              Name: 'LUONG_NOP_BHXH'
            })

            newObj['GIAM_TRU_GIA_CANH'] = getValueByName({
              Items: item?.SETTINGS?.Settings,
              Name: 'GIAM_TRU_GIA_CANH'
            })

            newObj['BAC'] = getValueByName({
              Items: item?.SETTINGS?.Settings,
              Name: 'BAC'
            })

            newObj['CHI_TIEU_THAO_TAC'] = getValueByName({
              Items: item?.SETTINGS?.Settings,
              Name: 'CHI_TIEU_THAO_TAC'
            })

            newObj['CHI_TIEU_THANG'] = getValueByName({
              Items: item?.SETTINGS?.Settings,
              Name: 'CHI_TIEU_THANG'
            })

            newObj['LUONG_CB'] = getValueByName({
              Items: item?.SETTINGS?.Settings,
              Name: 'LUONG'
            })

            newObj['LUONG_DONG_BH'] = getValueByName({
              Items: item?.SETTINGS?.Settings,
              Name: 'LUONG_DONG_BH'
            })

            newObj['TI_LE_DONG_BH'] = getValueByName({
              Items: item?.SETTINGS?.Settings,
              Name: 'TI_LE_DONG_BH'
            })

            newObj['LUONG_THEO_NANG_LUC'] =
              newObj['LUONG_CB'] - newObj['LUONG_DONG_BH']
            if (newObj['LUONG_THEO_NANG_LUC'] < 0) {
              newObj['LUONG_THEO_NANG_LUC'] = 0
            }

            let TY_LE_KPI =
              (item?.BANGLUONGBC?.DOANH_SO_THANG / newObj['CHI_TIEU_THANG']) *
                100 || 0

            if (TY_LE_KPI >= 50) {
              newObj['LUONG_THEO_NANG_LUC_KPI'] =
                newObj['LUONG_THEO_NANG_LUC'] || 0
            } else {
              newObj['LUONG_THEO_NANG_LUC_KPI'] = Math.floor(
                ((newObj['LUONG_THEO_NANG_LUC'] || 0) * TY_LE_KPI) / 100
              )
            }

            newObj['KPI_1'] = 0
            newObj['KPI_2'] = 0
            newObj['KPI_3'] = 0
            newObj['PHAN_TRAM_DOANH_SO'] = 0

            if (newObj?.User?.Address === 'Kỹ thuật viên') {
              if (
                newObj?.BANGLUONGBC?.TourSalaryRatio >=
                newObj?.CHI_TIEU_THAO_TAC
              ) {
                let TI_LE_KTV =
                  newObj?.BANGLUONGBC?.DOANH_SO_THANG / newObj?.CHI_TIEU_THANG
                if (TI_LE_KTV >= 1 && TI_LE_KTV < 1.2) {
                  newObj['KPI_1'] = 500000
                }
                if (TI_LE_KTV >= 1.2 && TI_LE_KTV < 1.5) {
                  newObj['KPI_2'] = 1000000
                }
                if (TI_LE_KTV >= 1.5) {
                  newObj['KPI_3'] = 2000000
                }
              }

              newObj['PHAN_TRAM_DOANH_SO'] = getPercentValue(
                [
                  [30000000, 35000000, 3],
                  [35000000, 40000000, 3.3],
                  [40000000, 45000000, 3.5],
                  [45000000, 50000000, 3.8],
                  [50000000, 55000000, 4.0],
                  [55000000, 60000000, 4.4],
                  [null, 60000000, 5]
                ],
                newObj?.BANGLUONGBC?.DOANH_SO_THANG
              ).amount
            }

            if (newObj?.User?.Address === 'Chủ quán') {
              newObj['PHAN_TRAM_DOANH_SO'] = getPercentValue(
                [
                  [150000000, 180000000, 1],
                  [180000000, 210000000, 1.5],
                  [210000000, 240000000, 2],
                  [240000000, 270000000, 2.5],
                  [270000000, 300000000, 2.8],
                  [300000000, 400000000, 3],
                  [null, 400000000, 3.5]
                ],
                newObj?.DOANH_SO_THANG_CO_SO
              ).amount
            }

            if (newObj?.User?.Address === 'Cửa hàng trưởng') {
              newObj['PHAN_TRAM_DOANH_SO'] = getPercentValue(
                [
                  [150000000, 200000000, 1],
                  [200000000, 250000000, 1.5],
                  [250000000, 300000000, 2],
                  [300000000, 400000000, 3],
                  [400000000, 500000000, 4],
                  [500000000, 600000000, 5],
                  [null, 600000000, 6]
                ],
                newObj?.DOANH_SO_THANG_CO_SO
              ).amount
            }

            newObj['TONG_LUONG_CHAM_CONG'] =
              Math.floor(
                ((newObj['LUONG_DONG_BH'] + newObj['LUONG_THEO_NANG_LUC_KPI']) /
                  27) *
                  item?.TrackValue?.WorkQty
              ) || 0

            newObj['TONG_TANG_CA_THEM_GIO'] = Math.floor(
              item?.TrackValue?.DI_SOM + item?.TrackValue?.VE_MUON
            )

            newObj['THUONG_PHU_CAP'] =
              item?.BANGLUONGBC?.THUONG_CustomType?.['Thưởng phụ cấp'] || 0

            newObj['KPI_4'] =
              item?.BANGLUONGBC?.THUONG_CustomType?.['Thưởng kpi4'] || 0

            newObj['KPI_5'] =
              item?.BANGLUONGBC?.THUONG_CustomType?.['Thưởng kpi5'] || 0

            newObj['KPI_6'] =
              item?.BANGLUONGBC?.THUONG_CustomType?.['Thưởng kpi6'] || 0

            newObj['TONG_THU_NHAP'] =
              (newObj?.TONG_LUONG_CHAM_CONG || 0) +
              (newObj?.TONG_TANG_CA_THEM_GIO || 0) +
              (newObj?.THUONG_PHU_CAP || 0) +
              (newObj?.BANGLUONGBC?.LUONG_CA || 0) +
              (newObj?.BANGLUONGBC?.HOA_HONG || 0) +
              (newObj?.PHAN_TRAM_DOANH_SO || 0) +
              (newObj?.KPI_1 || 0) +
              (newObj?.KPI_2 || 0) +
              (newObj?.KPI_3 || 0) +
              (newObj?.KPI_4 || 0) +
              (newObj?.KPI_5 || 0) +
              (newObj?.KPI_6 || 0)

            newObj['PHAT_DI_TRE_VE_SOM'] = Math.round(
              item?.TrackValue.DI_MUON + item?.TrackValue.VE_SOM
            )

            newObj['DONG_PHUC'] =
              item?.BANGLUONGBC?.TRU_PHAT_CustomType?.['Đồng phục'] || 0

            newObj['TONG_LUONG_CO_SO_PHAI_CHI'] =
              (newObj?.TONG_THU_NHAP || 0) -
              (newObj?.PHAT_DI_TRE_VE_SOM || 0) -
              (newObj?.DONG_PHUC || 0)

            newObj['PHAT_VI_PHAM_QUY_CHE'] =
              item?.BANGLUONGBC?.TRU_PHAT_CustomType?.['Phạt vi phạm'] || 0

            newObj['PHAT_HINH_TUONG'] =
              item?.BANGLUONGBC?.TRU_PHAT_CustomType?.['Phạt hình tượng'] || 0

            newObj['GIU_LUONG'] = getValueByName({
              Items: item?.SETTINGS?.Settings,
              Name: 'GIU_LUONG'
            })

            newObj['TAM_UNG'] = item?.BANGLUONGBC?.TAM_UNG || 0

            newObj['TIEN_BANG'] =
              item?.BANGLUONGBC?.TRU_PHAT_CustomType?.['Tiền bằng'] || 0

            newObj['TONG_LUONG_SAU_PHAT'] =
              (newObj['TONG_LUONG_CO_SO_PHAI_CHI'] || 0) -
              newObj['PHAT_VI_PHAM_QUY_CHE'] -
              newObj['PHAT_HINH_TUONG'] -
              newObj['GIU_LUONG'] -
              newObj['TAM_UNG'] -
              newObj['TIEN_BANG']

            newObj['TIEN_TRA_BHXH'] = Math.floor(
              ((LUONG_NOP_BHXH || 0) * (newObj['TI_LE_DONG_BH'] || 0)) / 100
            )

            newObj['THUE_TNCN'] =
              item?.BANGLUONGBC?.TRU_PHAT_CustomType?.[
                'Thuế thu nhập cá nhân'
              ] || 0

            newObj['KHAC'] =
              item?.BANGLUONGBC?.TRU_PHAT_CustomType?.['Khác'] || 0

            newObj['PHAI_TRA_NHAN_VIEN'] =
              newObj['TONG_LUONG_SAU_PHAT'] -
              newObj['TIEN_TRA_BHXH'] -
              newObj['THUE_TNCN'] -
              newObj['KHAC']

            return {
              ...newObj
            }
          })

        return rs
      },
      keepPreviousData: true,
      enabled: typeof filters.StocksRoles !== 'undefined',
      retry: false
    })

  useEffect(() => {
    if (isSuccess && !isFetching) {
      setIsFilter(false)
    }
  }, [isSuccess, isFetching])

  useEffect(() => {
    if (isError) {
      PermissionHelpers.ErrorAccess(error?.message || 'Có lỗi xảy ra')
    }
  }, [isError, error])

  const getValueByName = ({ Items, Name }) => {
    if (!Items || Items.length === 0 || !Name) return 0
    let index = Items.findIndex(x => x.Name === Name)
    return index > -1 ? Items[index].Value : 0
  }

  const onOpenFilter = () => {
    setIsFilter(true)
  }

  const onHideFilter = () => {
    setIsFilter(false)
  }

  const onFilter = values => {
    if (_.isEqual(values, filters)) {
      refetch()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = refetch

  const onExport = async () => {
    setLoadingExport(true)

    // Đợi 1 tick để React render loading xong
    await new Promise(resolve => setTimeout(resolve, 50))

    window?.EzsExportNoFechExcel({
      Title: `Bảng lương tháng ${moment(filters.Mon).format('MM/YYYY')}`,
      filters,
      Url: '/nhan-vien/bang-luong-3',
      Data: data || [],
      hideLoading: () => {
        setLoadingExport(false)
      }
    })
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase font-size-xl fw-600">
            Bảng lương nhân viên
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
        loading={isFetching}
        loadingExport={loadingExport}
        onExport={onExport}
        updateStocksRole={val => {
          setFilters(prevState => ({
            ...prevState,
            StocksRoles: val ? val.map(x => x.value).toString() : ''
          }))
        }}
      />
      <div className="bg-white rounded">
        <div className="border-gray-200 px-20px py-15px border-bottom d-flex align-items-center justify-content-between">
          <div className="fw-500 font-size-lg">Danh sách nhân viên</div>
        </div>
        <div className="p-20px">
          <div className="h-[500px] relative">
            <div className="overflow-x-auto border border-[#eee] relative h-full">
              <table className="min-w-full border-separate border-spacing-0">
                <thead className="sticky top-0 bg-[#f8f8f8] z-[10] border-b border-b-[#eee]">
                  <tr>
                    {/* sticky top-0 left-0 bg-[#f8f8f8] */}
                    <th className="p-3 font-semibold text-left min-w-[60px] max-w-[60px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 font-number text-sm uppercase h-[50px] sticky top-0 left-0 bg-[#f8f8f8]">
                      STT
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[140px] max-w-[140px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm sticky top-0 left-[60px] bg-[#f8f8f8]">
                      Mã nhân viên
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[200px] max-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm sticky top-0 left-[200px] bg-[#f8f8f8]">
                      Tên nhân viên
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[200px] max-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      Cơ sở
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[200px] max-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      Vị trí
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[120px] max-w-[120px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      Bậc
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      Chỉ tiêu thao tác
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      Hệ số Tour
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      Chỉ tiêu tháng
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      Lương thoả thuận
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      LCB
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      Lương theo năng lực
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      Doanh số
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      Số công
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[200px] max-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      Lương theo năng lực theo KPI
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[200px] max-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      Tổng lương chấm công
                    </th>

                    <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      Tổng tăng ca, thêm giờ
                    </th>

                    <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      Thưởng / Phụ cấp
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      Tiền thao tác
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      HH sản phẩm
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      % doanh số
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      KPI 1
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      KPI 2
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      KPI 3
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      KPI 4
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      KPI 5
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      KPI 6
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      Tổng thu nhập
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      Phạt đi trễ, về sớm
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      Đồng phục
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      Tổng lương cơ sở phải chi
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      Phạt vi phạm quy định chế tài
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      Phạt hình tượng
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      Giữ lương
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      Tạm ứng
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      Tiền bằng
                    </th>

                    <th className="uppercase p-3 font-semibold text-left min-w-[250px] max-w-[250px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      Tổng lương sau phạt
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[250px] max-w-[250px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      BHXH 10.5%
                    </th>

                    <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      Thuế TNCN
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      Khác
                    </th>
                    <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                      Phải trả nhân viên
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data &&
                    data.map((rowData, index) => (
                      <tr key={index}>
                        <td className="p-3 bg-white max-w-[60px] min-w-[60px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 sticky top-0 left-0">
                          {index + 1}
                        </td>
                        <td className="p-3 bg-white max-w-[140px] min-w-[140px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 sticky top-0 left-[60px]">
                          {rowData?.User?.ID}
                        </td>
                        <td className="p-3 bg-white max-w-[200px] min-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 sticky top-0 left-[200px]">
                          {rowData?.User?.FullName}
                        </td>
                        <td className="p-3 bg-white max-w-[200px] min-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {rowData?.BANGLUONGBC?.DiemQL &&
                          rowData?.BANGLUONGBC?.DiemQL.length > 0
                            ? rowData?.BANGLUONGBC?.DiemQL.map(
                                stock => stock.StockTitle
                              ).join(', ')
                            : 'Chưa xác định'}
                        </td>
                        <td className="p-3 bg-white max-w-[200px] min-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {rowData?.User?.Address}
                        </td>
                        <td className="p-3 bg-white max-w-[120px] min-w-[120px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {rowData?.BAC ? `Bậc ${rowData?.BAC}` : ''}
                        </td>
                        <td className="p-3 bg-white max-w-[180px] min-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {rowData?.CHI_TIEU_THAO_TAC}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {rowData?.BANGLUONGBC?.TourSalaryRatio}
                        </td>
                        <td className="p-3 bg-white max-w-[180px] min-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.CHI_TIEU_THANG)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.LUONG_CB)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.LUONG_DONG_BH)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.LUONG_THEO_NANG_LUC)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          <OverlayDS rowData={rowData} filters={filters} />
                          {/* {PriceHelper.formatVND(
                            rowData?.BANGLUONGBC?.DOANH_SO_THANG
                          )} */}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {rowData?.TrackValue?.WorkQty}
                        </td>
                        <td className="p-3 bg-white max-w-[200px] min-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(
                            rowData.LUONG_THEO_NANG_LUC_KPI
                          )}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {/* {PriceHelper.formatVND(rowData?.TONG_LUONG_CHAM_CONG)} */}
                          <OverlayLCS rowData={rowData} filters={filters} />
                        </td>

                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(
                            rowData?.TONG_TANG_CA_THEM_GIO
                          )}
                        </td>

                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.THUONG_PHU_CAP)}
                        </td>
                        {/* <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.PHU_CAP_AN_TRUA)}
                        </td> */}
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          <OverlayLT rowData={rowData} filters={filters} />
                          {/* {PriceHelper.formatVND(
                            rowData?.BANGLUONGBC?.LUONG_CA
                          )} */}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          <OverlayHH rowData={rowData} filters={filters} />
                          {/* {PriceHelper.formatVND(
                            rowData?.BANGLUONGBC?.HOA_HONG
                          )} */}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.PHAN_TRAM_DOANH_SO)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.KPI_1)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.KPI_2)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.KPI_3)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.KPI_4)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.KPI_5)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.KPI_6)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.TONG_THU_NHAP)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.PHAT_DI_TRE_VE_SOM)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.DONG_PHUC)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(
                            rowData?.TONG_LUONG_CO_SO_PHAI_CHI
                          )}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.PHAT_VI_PHAM_QUY_CHE)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.PHAT_HINH_TUONG)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.GIU_LUONG)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.TAM_UNG)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.TIEN_BANG)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.TONG_LUONG_SAU_PHAT)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.TIEN_TRA_BHXH)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.THUE_TNCN)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.KHAC)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.PHAI_TRA_NHAN_VIEN)}
                        </td>
                      </tr>
                    ))}
                </tbody>
                {/* <tfoot className="sticky bottom-0 left-0 bg-white border-t border-t-[#eee]">
                  <tr>
                    <td colSpan="5">TỔNG CỘNG</td>
                    <td>250,000</td>
                  </tr>
                </tfoot> */}
              </table>
            </div>
            <div
              role="status"
              className={clsx(
                'absolute left-0 top-0 flex items-center justify-center w-full transition bg-white/70 h-full',
                !isLoading ? 'opacity-0 invisible -z-10' : 'z-10'
              )}
            >
              <svg
                aria-hidden="true"
                className="w-8 h-8 mr-2 text-gray-300 animate-spin dark:text-gray-600 fill-blue-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  className="fill-muted"
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PayrollStaff3
