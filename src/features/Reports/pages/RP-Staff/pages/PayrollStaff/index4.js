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
import { DatetimeHelpers } from 'src/helpers/DatetimeHelpers'
import PickerPay from './PickerPay'
import PayrollDetailTooltip from './components/PayrollDetailTooltip'
import AttendanceDetails from './components/AttendanceDetails'
import { calculateAttendanceSalary } from './helpers/calculateAttendanceSalary'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'

moment.locale('vi')

let NGUONG_TNCN = [
  {
    Min: 0,
    Max: 10000000,
    Value: 0,
    PercentDifference: 5
  },
  {
    Min: 10000000,
    Max: 30000000,
    Value: 500000,
    PercentDifference: 10
  },
  {
    Min: 30000000,
    Max: 60000000,
    Value: 2500000,
    PercentDifference: 20
  },
  {
    Min: 60000000,
    Max: 100000000,
    Value: 8500000,
    PercentDifference: 30
  },
  {
    Min: 100000000,
    Value: 20500000,
    PercentDifference: 35
  }
]

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
        <div>{PriceHelper.formatVND(rowData?.LUONG_TOUR)}</div>
        <div>
          <i className="fa-solid fa-circle-info text-warning"></i>
        </div>
      </div>
    </OverlayTrigger>
  )
}

const OverlayTHUONGPHAT = ({ rowData, Key, Title = '', Value }) => {
  return (
    <OverlayTrigger
      rootClose
      trigger="click"
      key="bottom"
      placement="bottom"
      overlay={
        <Popover id={`popover-positioned-top` + rowData?.User?.ID}>
          <Popover.Header className="py-10px text-uppercase fw-600" as="h3">
            {Title} - {rowData?.User?.FullName}
          </Popover.Header>
          <Popover.Body
            className="p-0"
            style={{
              maxHeight: '250px',
              overflow: 'auto'
            }}
          >
            {rowData[Key] &&
              rowData[Key].map((item, index) => (
                <div
                  className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between"
                  key={index}
                >
                  <div className="flex-1">
                    <div>{moment(item.CreateDate).format('DD/MM/YYYY')}</div>
                    {item.Desc && (
                      <div className="italic font-normal text-gray-600">
                        {item.Desc}
                      </div>
                    )}
                  </div>
                  <div className="w-[100px] text-right">
                    {PriceHelper.formatVNDPositive(item?.Value)}
                  </div>
                </div>
              ))}
          </Popover.Body>
        </Popover>
      }
    >
      <div className="cursor-pointer d-flex justify-content-between w-100 align-items-center">
        <div>{PriceHelper.formatVND(Value)}</div>
        <div>
          <i className="fa-solid fa-circle-info text-warning"></i>
        </div>
      </div>
    </OverlayTrigger>
  )
}

function PayrollStaff4(props) {
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
      queryKey: ['ListPayroll4', filters],
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

        let { data: workmonths } = await reportsApi.getUserWork23({
          From: moment(filters.Mon).startOf('month').format('DD/MM/YYYY'),
          StockID: filters.StockID,
          To: moment(filters.Mon).endOf('month').format('DD/MM/YYYY'),
          key: ''
        })

        let { data: rsRoster } = await reportsApi.getRosters({
          pi: 1,
          filter: {
            Mon: moment(filters.Mon).startOf('month').format('YYYY-MM'),
            Status: '',
            StockID: filters.StockID
          }
        })

        let UsersRoster = null

        if (rsRoster?.items && rsRoster?.items.length > 0) {
          if (
            rsRoster?.items[0]?.Status &&
            rsRoster?.items[0]?.Data?.Users?.length > 0
          ) {
            UsersRoster = rsRoster?.items[0]?.Data?.Users
          }
        }

        let WorkOfMonth = Object.values(
          (workmonths?.list || []).reduce((acc, item) => {
            if (!acc[item.UserID]) {
              acc[item.UserID] = {
                ...item,
                Dates: []
              }
            }

            item.Dates?.forEach(dateItem => {
              const index = acc[item.UserID].Dates.findIndex(
                x => x.Date === dateItem.Date
              )

              if (index === -1) {
                acc[item.UserID].Dates.push(dateItem)
              } else {
                const oldItem = acc[item.UserID].Dates[index]

                // Ưu tiên item có WorkTrack
                if (!oldItem.WorkTrack && dateItem.WorkTrack) {
                  acc[item.UserID].Dates[index] = dateItem
                }
              }
            })

            return acc
          }, {})
        )

        let rs = await Promise.all(
          (timekeepings?.list || []).map(async item => {
            if (Array.isArray(item?.TrackValue?.List)) return item

            const { data: salary } = await reportsApi.userSalary({
              cmd: 'salary',
              userid: item?.User?.ID,
              mon: moment(filters.Mon).format('MM/YYYY')
            })

            if (!salary?.data) {
              throw new Error('Không tải được chi tiết chấm công nhân viên')
            }

            return {
              ...item,
              User: { ...item.User, ...salary.data.User },
              TrackValue: salary.data.TrackValue
            }
          })
        )

        rs = rs.map(item => ({
          ...item,
          Rosters:
            UsersRoster?.find(x => x.UserID === item?.User?.ID)?.Dates || []
        }))

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
          .map(item => {
            let newItem = { ...item }
            let userWorks = WorkOfMonth.find(x => x.UserID === item?.User?.ID)
            if (userWorks) {
              let { Dates } = userWorks

              newItem['WorkTrackDates'] = DatetimeHelpers.splitWorkTrackDates(
                Dates,
                null, //dayoff
                true,
                item.Rosters &&
                  item.Rosters.filter(
                    x => !x?.WorkShiftType || x?.WorkShiftType.length === 0
                  )
              )
            }
            return {
              ...newItem
            }
          })
          .map(item => {
            let newObj = { ...item }

            newObj['LUONG_CB'] = getValueByName({
              Items: item?.SETTINGS?.Settings,
              Name: 'LUONG'
            })

            newObj['TOI_DA_UNG_LUONG'] = getValueByName({
              Items: item?.SETTINGS?.Settings,
              Name: 'TOI_DA_UNG_LUONG'
            })

            newObj['PHU_CAP_THANG'] = getValueByName({
              Items: item?.SETTINGS?.Settings,
              Name: 'PHU_CAP'
            })

            newObj['NGAY_NGHI_CO_DINH'] = getValueByName({
              Items: item?.SETTINGS?.Settings,
              Name: 'NGAY_NGHI_CO_DINH',
              Key: 'ValueText'
            })

            newObj['TI_LE_DONG_BH'] = getValueByName({
              Items: item?.SETTINGS?.Settings,
              Name: 'TI_LE_DONG_BH'
            })

            newObj['LICH_NGHI_CO_DINH'] = DatetimeHelpers.countWeekdaysInMonth(
              moment(newObj.From, 'YYYY-MM-DD').format('MM/YYYY'),
              newObj['NGAY_NGHI_CO_DINH']
            )

            newObj['NGAY_KY_HOP_DONG'] = getValueByName({
              Items: item?.SETTINGS?.Settings,
              Name: 'NGAY_KY_HOP_DONG'
            })

            newObj['NGAY_CONG_THANG'] =
              moment(newObj.From, 'YYYY-MM-DD').daysInMonth() -
              newObj['LICH_NGHI_CO_DINH']

            newObj['LUONG_NGAY_CONG'] = RoundAmount(
              newObj['LUONG_CB'] / newObj['NGAY_CONG_THANG']
            )

            newObj['LUONG_TOUR'] = newObj?.BANGLUONGBC?.LUONG_CA || 0

            newObj['THUONG_DOANH_SO'] =
              item?.BANGLUONGBC?.THUONG_CustomType?.['Thưởng doanh số'] || 0

            newObj['THUONG_DOANH_SO_DS'] = item?.Bonus
              ? item?.Bonus.filter(x => x?.CustomType === 'Thưởng doanh số')
              : []

            newObj['THUONG_KHAC'] =
              item?.BANGLUONGBC?.THUONG_CustomType?.['Thưởng khác'] || 0

            newObj['THUONG_KHAC_DS'] = item?.Bonus
              ? item?.Bonus.filter(x => x?.CustomType === 'Thưởng khác')
              : []

            newObj['PHAT_KHAC'] =
              item?.BANGLUONGBC?.TRU_PHAT_CustomType?.['Phạt khác'] || 0

            newObj['PHAT_KHAC_DS'] = item?.Bonus
              ? item?.Bonus.filter(x => x?.CustomType === 'Phạt khác')
              : []

            newObj['LUONG_BHXH'] = getValueByName({
              Items: item?.SETTINGS?.Settings,
              Name: 'LUONG_NOP_BHXH'
            })

            newObj['TIEN_TRA_BHXH'] = Math.floor(
              (Number(newObj['LUONG_BHXH'] || 0) * 10.5) / 100
            )

            newObj['GIAM_TRU_GIA_CANH'] = getValueByName({
              Items: item?.SETTINGS?.Settings,
              Name: 'GIAM_TRU_GIA_CANH'
            })

            newObj = calculateAttendanceSalary(newObj)

            newObj['X2'] =
              newObj['LUONG_CB'] +
              newObj['PHU_CAP_THANG'] -
              ((newObj['DI_MUON_VE_SOM'] || 0) +
                (newObj['NGHI_TRU_LUONG_NOT_PHEP'] || 0) +
                (newObj['NGHI_TRU_LUONG'] || 0)) +
              ((newObj['DI_SOM_VE_MUON'] || 0) +
                (newObj['TANG_CA_OFF'] || 0) +
                (newObj['TANG_CA_LE'] || 0)) +
              newObj['LUONG_TOUR'] +
              newObj['THUONG_DOANH_SO'] +
              newObj['THUONG_KHAC'] -
              newObj['PHAT_KHAC']

            newObj['TONG_THU_NHAP'] = newObj['X2']

            newObj['THUC_NHAN'] = newObj['X2'] - newObj['TIEN_TRA_BHXH']

            newObj['LUONG_CHIU_THUE_TNCN'] =
              newObj['TONG_THU_NHAP'] -
              newObj['TIEN_TRA_BHXH'] -
              newObj['GIAM_TRU_GIA_CANH'] -
              15500000

            newObj['LUONG_CHIU_THUE_TNCN'] =
              newObj['LUONG_CHIU_THUE_TNCN'] > 0
                ? newObj['LUONG_CHIU_THUE_TNCN']
                : 0

            let THUE_TNCN = 0

            const NGUONG_TNCN_CURRENT = NGUONG_TNCN.find(
              item =>
                newObj['LUONG_CHIU_THUE_TNCN'] > item.Min &&
                (item.Max ? newObj['LUONG_CHIU_THUE_TNCN'] <= item.Max : true)
            )

            if (NGUONG_TNCN_CURRENT) {
              THUE_TNCN =
                NGUONG_TNCN_CURRENT.Value +
                (newObj['LUONG_CHIU_THUE_TNCN'] - NGUONG_TNCN_CURRENT.Min) *
                  (NGUONG_TNCN_CURRENT.PercentDifference / 100)
            }

            newObj['THUE_TNCN'] = THUE_TNCN

            newObj['TONG_LUONG_THUC_NHAN'] =
              newObj['THUC_NHAN'] - newObj['THUE_TNCN']

            newObj['TAM_UNG'] = item?.BANGLUONGBC?.DA_TRA || 0

            newObj['CON_LAI'] =
              newObj['TONG_LUONG_THUC_NHAN'] - newObj['TAM_UNG']

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

  const RoundAmount = price => {
    return Math.floor(price / 10) * 10
  }

  const getValueByName = ({ Items, Name, Key = 'Value' }) => {
    if (!Items || Items.length === 0 || !Name) return 0
    let index = Items.findIndex(x => x.Name === Name)
    return index > -1 ? Items[index][Key] : 0
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
      Url: '/nhan-vien/bang-luong-4',
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
          <div>
            <PickerPay data={data} CrStockID={CrStockID} refetch={refetch}>
              {({ open }) => (
                <button
                  onClick={open}
                  className={clsx(
                    'btn btn-primary fw-500',
                    isLoading && 'spinner spinner-white spinner-right'
                  )}
                  disabled={isLoading}
                  type="button"
                >
                  Trả lương
                </button>
              )}
            </PickerPay>
          </div>
        </div>
        <div className="p-20px">
          <div className="h-[500px] relative">
            <div className="overflow-x-auto border border-[#eee] relative h-full">
              <table className="min-w-full border-separate border-spacing-0">
                <thead className="sticky top-0 bg-[#f8f8f8] z-[10] border-b border-b-[#eee]">
                  <tr>
                    <th
                      rowSpan={2}
                      className="p-3 font-semibold text-left min-w-[60px] max-w-[60px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 font-number text-sm uppercase h-[50px] sticky top-0 left-0 bg-[#f8f8f8]"
                    >
                      STT
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[140px] max-w-[140px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm sticky top-0 left-[60px] bg-[#f8f8f8]"
                    >
                      Mã nhân viên
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[200px] max-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm sticky top-0 left-[200px] bg-[#f8f8f8]"
                    >
                      Tên nhân viên
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[200px] max-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Chức danh
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[200px] max-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Mã địa điểm hệ thống
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Lịch nghỉ cố định
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Ngày công tháng
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Lương ngày công
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Lương cơ bản
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Phụ cấp
                    </th>
                    <th
                      colSpan={6}
                      className="uppercase p-3 font-semibold text-center min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Chi tiết chấm công
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Lương Tour
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Thưởng doanh số
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Thưởng khác
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Phạt khác
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Tổng thu nhập
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Lương BHXH
                    </th>

                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Người lao động đóng 10.5%
                    </th>

                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Thực nhận
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Giảm trừ gia cảnh
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Lương chịu thuế TNCN
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Thuế TNCN
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Tổng lương thực nhận
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Đã tạm ứng lương
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Còn lại
                    </th>
                  </tr>
                  <tr>
                    <th className="uppercase p-3 font-semibold text-center min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] min-h-[50px] font-number text-sm">
                      <div>Đi muộn, về sớm</div>
                    </th>
                    <th className="uppercase p-3 font-semibold text-center min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] min-h-[50px] font-number text-sm">
                      <div>Đi sớm, về muộn</div>
                    </th>
                    <th className="uppercase p-3 font-semibold text-center min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] min-h-[50px] font-number text-sm">
                      <div>Tăng ca Off</div>
                    </th>
                    <th className="uppercase p-3 font-semibold text-center min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] min-h-[50px] font-number text-sm">
                      <div>Tăng ca lễ</div>
                    </th>
                    <th className="uppercase p-3 font-semibold text-center min-w-[200px] max-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] min-h-[50px] font-number text-sm">
                      <div>Nghỉ trừ lương có phép</div>
                    </th>
                    <th className="uppercase p-3 font-semibold text-center min-w-[220px] max-w-[220px] border-b border-b-[#eee] border-r border-r-[#eee] min-h-[50px] font-number text-sm">
                      <div>Nghỉ trừ lương không phép</div>
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
                          {rowData?.User?.YahooID}
                        </td>
                        <td className="p-3 bg-white max-w-[200px] min-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 sticky top-0 left-[200px]">
                          {rowData?.User?.FullName}
                        </td>
                        <td className="p-3 bg-white max-w-[200px] min-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {rowData?.User?.Address}
                        </td>
                        <td className="p-3 bg-white max-w-[200px] min-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {rowData?.BANGLUONGBC?.DiemQL &&
                          rowData?.BANGLUONGBC?.DiemQL.length > 0
                            ? rowData?.BANGLUONGBC?.DiemQL.map(
                                stock => stock.StockTitle
                              ).join(', ')
                            : 'Chưa xác định'}
                        </td>
                        <td className="p-3 bg-white max-w-[180px] min-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {rowData?.LICH_NGHI_CO_DINH}
                          {rowData?.NGAY_NGHI_CO_DINH ? (
                            <span className="pl-1">
                              ({rowData?.NGAY_NGHI_CO_DINH})
                            </span>
                          ) : (
                            <></>
                          )}
                        </td>
                        <td className="p-3 bg-white max-w-[180px] min-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {rowData?.NGAY_CONG_THANG}
                        </td>
                        <td className="p-3 bg-white max-w-[180px] min-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.LUONG_NGAY_CONG)}
                        </td>

                        <td className="p-3 bg-white max-w-[180px] min-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.LUONG_CB)}
                        </td>
                        <td className="p-3 bg-white max-w-[180px] min-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.PHU_CAP_THANG)}
                        </td>

                        <td className="p-3 bg-white max-w-[180px] min-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          <div className="flex items-center justify-between w-full gap-1">
                            {PriceHelper.formatVND(rowData?.DI_MUON_VE_SOM)}
                            <AttendanceDetails
                              id={`attendance-DI_MUON_VE_SOM-${rowData?.User?.ID}`}
                              title="Đi muộn, về sớm"
                              totalLabel="Tổng trừ"
                              total={rowData?.DI_MUON_VE_SOM}
                              trackValue={rowData?.TrackValue}
                              groups={[
                                { key: 'DI_MUON', title: 'Đi muộn' },
                                { key: 'VE_SOM', title: 'Về sớm' }
                              ]}
                            />
                          </div>
                        </td>
                        <td className="p-3 bg-white max-w-[180px] min-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          <div className="flex items-center justify-between w-full gap-1">
                            {PriceHelper.formatVND(rowData?.DI_SOM_VE_MUON)}
                            <AttendanceDetails
                              id={`attendance-DI_SOM_VE_MUON-${rowData?.User?.ID}`}
                              title="Đi sớm, về muộn"
                              totalLabel="Tổng cộng"
                              total={rowData?.DI_SOM_VE_MUON}
                              trackValue={rowData?.TrackValue}
                              groups={[
                                { key: 'DI_SOM', title: 'Đi sớm' },
                                { key: 'VE_MUON', title: 'Về muộn' }
                              ]}
                            />
                          </div>
                        </td>
                        <td className="p-3 bg-white max-w-[180px] min-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          <div className="flex items-center justify-between w-full gap-1">
                            {PriceHelper.formatVND(rowData?.TANG_CA_OFF)}
                            <PayrollDetailTooltip
                              id={`overtime-off-${rowData?.User?.ID}`}
                              title="Tăng ca OFF"
                              total={rowData?.TANG_CA_OFF}
                              totalLabel="Tổng tăng ca OFF"
                            >
                              <div className="mb-3">
                                <div>
                                  Lương giờ:{' '}
                                  {PriceHelper.formatVND(
                                    rowData?.LUONG_GIO_TANG_CA_OFF
                                  )}{' '}
                                  đ/giờ
                                </div>
                                <div className="mt-1">
                                  Số phút ÷ 60 × lương giờ × 2
                                </div>
                              </div>
                              {(rowData?.TrackValue?.CTV || []).map(
                                (item, index) => {
                                  const minutes =
                                    DatetimeHelpers.getTotalWorkingMinutes([
                                      item
                                    ])
                                  return (
                                    <div
                                      key={index}
                                      className="pb-3 mb-3 border-bottom"
                                    >
                                      <div className="fw-500">
                                        {item.CheckIn &&
                                        moment(item.CheckIn).isValid()
                                          ? moment(item.CheckIn).format(
                                              'DD/MM/YYYY'
                                            )
                                          : 'Chưa có ngày check-in'}
                                      </div>
                                      <div className="mt-1">
                                        IN:{' '}
                                        {item.CheckIn &&
                                        moment(item.CheckIn).isValid()
                                          ? moment(item.CheckIn).format('HH:mm')
                                          : '--:--'}{' '}
                                        - OUT:{' '}
                                        {item.CheckOut &&
                                        moment(item.CheckOut).isValid()
                                          ? moment(item.CheckOut).format(
                                              'HH:mm'
                                            )
                                          : '--:--'}
                                      </div>
                                      <div className="mt-1">
                                        {minutes} phút ÷ 60 ×{' '}
                                        {PriceHelper.formatVND(
                                          rowData?.LUONG_GIO_TANG_CA_OFF
                                        )}{' '}
                                        × 2 ={' '}
                                        {PriceHelper.formatVND(
                                          (minutes / 60) *
                                            (rowData?.LUONG_GIO_TANG_CA_OFF ||
                                              0) *
                                            2
                                        )}{' '}
                                        đ
                                      </div>
                                    </div>
                                  )
                                }
                              )}
                            </PayrollDetailTooltip>
                          </div>
                        </td>
                        <td className="p-3 bg-white max-w-[180px] min-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          <div className="flex items-center justify-between w-full gap-1">
                            {PriceHelper.formatVND(rowData?.TANG_CA_LE)}
                            <AttendanceDetails
                              id={`attendance-TANG_CA_LE-${rowData?.User?.ID}`}
                              title="Tăng ca lễ"
                              totalLabel="Tổng cộng"
                              total={rowData?.TANG_CA_LE}
                              trackValue={rowData}
                              groups={[
                                { key: 'TANG_CA_LE', title: 'Tăng ca lễ' }
                              ]}
                            />
                          </div>
                        </td>
                        <td className="p-3 bg-white max-w-[200px] min-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          <div className="flex items-center justify-between w-full gap-1">
                            {PriceHelper.formatVND(rowData?.NGHI_TRU_LUONG)}
                            <PayrollDetailTooltip
                              id={`leave-deduction-permitted-${rowData?.User?.ID}`}
                              title="Nghỉ trừ lương có phép"
                              dailySalary={rowData?.LUONG_NGAY_CONG}
                              total={rowData?.NGHI_TRU_LUONG}
                              groups={[
                                {
                                  title: 'Nghỉ thường — ngày thường (T2–T6)',
                                  dates:
                                    rowData?.WorkTrackDates?.weekdayLeave || [],
                                  multiplier: 1
                                },
                                {
                                  title: 'Nghỉ thường — cuối tuần (T7, CN)',
                                  dates:
                                    rowData?.WorkTrackDates?.weekendLeave || [],
                                  multiplier: 2
                                },
                                {
                                  title: 'Nghỉ có phép — ngày thường (T2–T6)',
                                  dates:
                                    rowData?.WorkTrackDates
                                      ?.weekdayPermittedLeave || [],
                                  multiplier: 1
                                },
                                {
                                  title: 'Nghỉ có phép — cuối tuần (T7, CN)',
                                  dates:
                                    rowData?.WorkTrackDates
                                      ?.weekendPermittedLeave || [],
                                  multiplier: 1
                                }
                              ]}
                            />
                          </div>
                        </td>
                        <td className="p-3 bg-white max-w-[220px] min-w-[220px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          <div className="flex items-center justify-between w-full gap-1">
                            {PriceHelper.formatVND(
                              rowData?.NGHI_TRU_LUONG_NOT_PHEP
                            )}
                            <PayrollDetailTooltip
                              id={`leave-deduction-unpermitted-${rowData?.User?.ID}`}
                              title="Nghỉ trừ lương không phép"
                              dailySalary={rowData?.LUONG_NGAY_CONG}
                              total={rowData?.NGHI_TRU_LUONG_NOT_PHEP}
                              groups={[
                                {
                                  title: 'Ngày thường (T2–T6)',
                                  dates:
                                    rowData?.WorkTrackDates?.weekdayNoLeave ||
                                    [],
                                  multiplier: 2
                                },
                                {
                                  title: 'Cuối tuần (T7, CN)',
                                  dates:
                                    rowData?.WorkTrackDates?.weekendNoLeave ||
                                    [],
                                  multiplier: 4
                                }
                              ]}
                            />
                          </div>
                        </td>

                        <td className="p-3 bg-white max-w-[180px] min-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          <OverlayLT rowData={rowData} filters={filters} />
                        </td>
                        <td className="p-3 bg-white max-w-[180px] min-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          <OverlayTHUONGPHAT
                            Title="Thưởng doanh số"
                            Value={rowData?.THUONG_DOANH_SO}
                            rowData={rowData}
                            Key="THUONG_DOANH_SO_DS"
                          />
                        </td>
                        <td className="p-3 bg-white max-w-[180px] min-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          <OverlayTHUONGPHAT
                            Title="Thưởng khác"
                            Value={rowData?.THUONG_KHAC}
                            rowData={rowData}
                            Key="THUONG_KHAC_DS"
                          />
                        </td>
                        <td className="p-3 bg-white max-w-[180px] min-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          <OverlayTHUONGPHAT
                            Title="Phạt khác"
                            Value={rowData?.PHAT_KHAC}
                            rowData={rowData}
                            Key="PHAT_KHAC_DS"
                          />
                        </td>

                        <td className="p-3 bg-white max-w-[180px] min-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.TONG_THU_NHAP)}
                        </td>

                        <td className="p-3 bg-white max-w-[180px] min-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.LUONG_BHXH)}
                        </td>

                        <td className="p-3 bg-white max-w-[180px] min-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.TIEN_TRA_BHXH)}
                        </td>
                        <td className="p-3 bg-white max-w-[180px] min-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.THUC_NHAN)}
                        </td>
                        <td className="p-3 bg-white max-w-[180px] min-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.GIAM_TRU_GIA_CANH)}
                        </td>
                        <td className="p-3 bg-white max-w-[180px] min-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.LUONG_CHIU_THUE_TNCN)}
                        </td>
                        <td className="p-3 bg-white max-w-[180px] min-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.THUE_TNCN)}
                        </td>
                        <td className="p-3 bg-white max-w-[180px] min-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.TONG_LUONG_THUC_NHAN)}
                        </td>
                        <td className="p-3 bg-white max-w-[180px] min-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.TAM_UNG)}
                        </td>
                        <td className="p-3 bg-white max-w-[180px] min-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.CON_LAI)}
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

export default PayrollStaff4
