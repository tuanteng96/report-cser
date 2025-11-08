import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterList from 'src/components/Filter/FilterList'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import { PriceHelper } from 'src/helpers/PriceHelper'
import reportsApi from 'src/api/reports.api'

import moment from 'moment'
import 'moment/locale/vi'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import clsx from 'clsx'
import { useQuery } from '@tanstack/react-query'
moment.locale('vi')

let NGUONG_TNCN = [
  {
    Min: 0,
    Max: 5000000,
    Value: 0,
    PercentDifference: 5
  },
  {
    Min: 5000000,
    Max: 10000000,
    Value: 250000,
    PercentDifference: 10
  },
  {
    Min: 10000000,
    Max: 18000000,
    Value: 750000,
    PercentDifference: 15
  },
  {
    Min: 18000000,
    Max: 32000000,
    Value: 1950000,
    PercentDifference: 20
  },
  {
    Min: 32000000,
    Max: 52000000,
    Value: 4750000,
    PercentDifference: 25
  },
  {
    Min: 52000000,
    Max: 80000000,
    Value: 9750000,
    PercentDifference: 30
  },
  {
    Min: 80000000,
    Value: 18150000,
    PercentDifference: 35
  }
]

function PayrollStaff2(props) {
  const { CrStockID, Stocks, GlobalConfig } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || [],
    GlobalConfig: auth?.GlobalConfig
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

  const { isLoading, data, refetch } = useQuery({
    queryKey: ['ListPayroll2', filters],
    queryFn: async () => {
      let { data: configs } = await reportsApi.getConfigSalary({
        Mon: filters.Mon ? moment(filters.Mon).format('MM/YYYY') : '',
        StockID: filters.StockID ? [filters.StockID] : Stocks.map(x => x.ID),
        StocksRoles: filters.StocksRoles
      })

      let { data: others } = await reportsApi.getConfigSalaryOther({
        pi: 1,
        ps: configs?.lst?.length || 0,
        filter: {
          //"ID": ",2,3",
          Status: '',
          Mon: filters.Mon ? moment(filters.Mon).format('MM/YYYY') : ''
        },
        StocksRoles: filters.StocksRoles
      })

      let { data: payrolls } = await reportsApi.getListStaffPayroll({
        ...BrowserHelpers.getRequestParamsList(filters),
        Ps: configs?.lst?.length || 0,
        StocksRoles: filters.StocksRoles
      })

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

      if (others?.items && others?.items.length > 0) {
        rs = rs.map(item => {
          let newObj = {
            ...item,
            PHAT_SINH_KHAC: 0
          }
          let index = others?.items.findIndex(
            x => item?.User?.ID === x?.UserID && Number(x.Status) === 3
          )
          if (index > -1) {
            newObj.PHAT_SINH_KHAC = others?.items[index]?.Value || 0 // Phụ cấp gửi xe
          }
          return newObj
        })
      }

      rs = rs
        .map(item => ({
          ...item
          // NGAY_CONG: getValueByName({
          //   Items: item?.SETTINGS?.Settings,
          //   Name: 'NGAY_CONG'
          // })
        }))
        .map(item => {
          let newObj = { ...item }
          let LUONG_NOP_BHXH = getValueByName({
            Items: item?.SETTINGS?.Settings,
            Name: 'LUONG_NOP_BHXH'
          })
          let DK_PHU_CAP_CHUYEN_CAN = getValueByName({
            Items: item?.SETTINGS?.Settings,
            Name: 'DK_PHU_CAP_CHUYEN_CAN'
          })
          let NGAY_CONG_SETUP = getValueByName({
            Items: item?.SETTINGS?.Settings,
            Name: 'NGAY_CONG'
          })
          let NGAY_NGHI_SETUP = getValueByName({
            Items: item?.SETTINGS?.Settings,
            Name: 'NGAY_NGHI'
          })

          newObj['TINH_THEO_CONG'] = NGAY_CONG_SETUP > 0 || NGAY_NGHI_SETUP > 0

          newObj['GIAM_TRU_GIA_CANH'] = getValueByName({
            Items: item?.SETTINGS?.Settings,
            Name: 'GIAM_TRU_GIA_CANH'
          })
          newObj['PHU_CAP_CHUC_VU'] = getValueByName({
            Items: item?.SETTINGS?.Settings,
            Name: 'PHU_CAP_CHUC_VU'
          })
          newObj['PHU_CAP_THAM_NIEN'] = getValueByName({
            Items: item?.SETTINGS?.Settings,
            Name: 'PHU_CAP_THAM_NIEN'
          })
          newObj['PHU_CAP_AN_TRUA'] = RoundAmount(
            (getValueByName({
              Items: item?.SETTINGS?.Settings,
              Name: 'PHU_CAP_TIEN_AN'
            }) /
              item?.NGAY_CONG) *
              Math.round(item?.TrackValue?.WorkQty)
          )

          let WorkTimeSetting = item?.User?.WorkTimeSetting
            ? JSON.parse(item?.User?.WorkTimeSetting)
            : null

          newObj['NGAY_CONG_THUC_TE'] = item?.TrackValue?.WorkQty || 0

          newObj['LUONG_THEO_NGAY_CONG'] = RoundAmount(
            (item?.LUONG_CO_BAN_THANG / item?.NGAY_CONG) *
              newObj.NGAY_CONG_THUC_TE
          )
          newObj['GIO_PARTIME'] =
            Math.floor(((item?.TrackValue?.WorkMinutes || 0) / 60) * 10) / 10

          newObj['LUONG_THEO_GIO'] = RoundAmount(
            (WorkTimeSetting?.SalaryHours || 0) * newObj.GIO_PARTIME
          )

          if (
            Number(item?.TrackValue?.SO_LAN_DI_MUON_CN || 0) +
              Number(item?.TrackValue?.SO_LAN_VE_SOM_CN || 0) <
            DK_PHU_CAP_CHUYEN_CAN
          ) {
            newObj['PHU_CAP_CHUYEN_CAN'] = getValueByName({
              Items: item?.SETTINGS?.Settings,
              Name: 'PHU_CAP_CHUYEN_CAN'
            })
          } else {
            newObj['PHU_CAP_CHUYEN_CAN'] = 0
          }

          newObj['DK_PHU_CAP_CHUYEN_CAN'] = DK_PHU_CAP_CHUYEN_CAN
          newObj['LUONG_NOP_BHXH'] = LUONG_NOP_BHXH

          newObj['NSD_LD_TRA'] = {
            '17_5_percent': RoundAmount(LUONG_NOP_BHXH * (17.5 / 100)),
            '3_percent': RoundAmount(LUONG_NOP_BHXH * (3 / 100)),
            '1_percent': RoundAmount(LUONG_NOP_BHXH * (1 / 100)),
            total:
              RoundAmount(LUONG_NOP_BHXH * (17.5 / 100)) +
              RoundAmount(LUONG_NOP_BHXH * (3 / 100)) +
              RoundAmount(LUONG_NOP_BHXH * (1 / 100))
          }
          newObj['NLD_TRA'] = {
            '8_percent': RoundAmount(LUONG_NOP_BHXH * (8 / 100)),
            '1_5_percent': RoundAmount(LUONG_NOP_BHXH * (1.5 / 100)),
            '1_percent': RoundAmount(LUONG_NOP_BHXH * (1 / 100)),
            total:
              RoundAmount(LUONG_NOP_BHXH * (8 / 100)) +
              RoundAmount(LUONG_NOP_BHXH * (1.5 / 100)) +
              RoundAmount(LUONG_NOP_BHXH * (1 / 100))
          }

          newObj['PHU_CAP_NGOAI_GIO'] =
            item?.TrackValue.DI_SOM + item?.TrackValue.VE_MUON
          newObj['PHAT_DI_TRE_VE_SOM'] =
            item?.TrackValue.DI_MUON + item?.TrackValue.VE_SOM

          newObj['TONG_PHU_CAP'] =
            (newObj.PHU_CAP_CHUC_VU || 0) +
            (newObj.PHU_CAP_THAM_NIEN || 0) +
            (newObj.PHU_CAP_CHUYEN_CAN || 0) +
            (newObj.PHU_CAP_AN_TRUA || 0) +
            (item?.BANGLUONGBC?.PHU_CAP || 0) +
            (newObj?.PHU_CAP_NGOAI_GIO || 0) +
            (item?.PHAT_SINH_KHAC || 0) // Phụ cấp gửi xe

          newObj['TONG_LUONG_THANG'] = 0

          if (newObj.TINH_THEO_CONG) {
            newObj['TONG_LUONG_THANG'] += newObj.LUONG_THEO_NGAY_CONG || 0
          } else {
            newObj['TONG_LUONG_THANG'] += newObj.LUONG_THEO_GIO || 0
          }

          newObj['TONG_LUONG_THANG'] +=
            newObj['TONG_PHU_CAP'] +
            (item?.BANGLUONGBC?.LUONG_CA || 0) +
            (item?.BANGLUONGBC?.HOA_HONG_Sanpham || 0) +
            (item?.BANGLUONGBC?.HOA_HONG_Dichvu || 0) +
            (item?.BANGLUONGBC?.HOA_HONG_Thetien || 0) +
            (item?.BANGLUONGBC?.HOA_HONG_Phuphi || 0) +
            (item?.BANGLUONGBC?.HOA_HONG_NVL || 0) -
            (Math.abs(newObj.PHAT_DI_TRE_VE_SOM || 0) +
              Math.abs(item?.BANGLUONGBC?.TRU_PHAT || 0)) +
            (item?.BANGLUONGBC?.THUONG || 0) +
            (item?.BANGLUONGBC?.KPI_Hoa_hong || 0)

          let THU_NHAP_TINH_THUE =
            newObj['TONG_LUONG_THANG'] -
            newObj['NLD_TRA'].total -
            11000000 -
            newObj['GIAM_TRU_GIA_CANH']

          THU_NHAP_TINH_THUE = THU_NHAP_TINH_THUE > 0 ? THU_NHAP_TINH_THUE : 0

          let THUE_TNCN = 0

          const NGUONG_TNCN_CURRENT = NGUONG_TNCN.find(
            item =>
              THU_NHAP_TINH_THUE > item.Min &&
              (item.Max ? THU_NHAP_TINH_THUE <= item.Max : true)
          )
          if (NGUONG_TNCN_CURRENT) {
            THUE_TNCN = RoundAmount(
              NGUONG_TNCN_CURRENT.Value +
                (THU_NHAP_TINH_THUE - NGUONG_TNCN_CURRENT.Min) *
                  (NGUONG_TNCN_CURRENT.PercentDifference / 100)
            )
          }

          let LUONG_NV_THUC_NHAN = RoundAmount(
            Number(newObj['TONG_LUONG_THANG']) -
              Number(newObj['NLD_TRA'].total) -
              Number(THUE_TNCN) -
              Number(
                Math.abs(item?.BANGLUONGBC?.TAM_UNG || 0) -
                  Math.abs(item?.BANGLUONGBC?.HOAN_UNG || 0)
              )
          )

          let TONG_QUY_LUONG_CTY_TRA =
            Number(LUONG_NV_THUC_NHAN) + Number(newObj['NSD_LD_TRA'].total)

          return {
            ...newObj,
            THU_NHAP_TINH_THUE,
            THUE_TNCN,
            LUONG_NV_THUC_NHAN,
            TONG_QUY_LUONG_CTY_TRA
          }
        })
      return rs.filter(x => x?.User?.Gender > 0)
    },
    keepPreviousData: true,
    enabled: typeof filters.StocksRoles !== 'undefined'
  })

  const RoundAmount = price => {
    return Math.round(price / 1000) * 1000
  }

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
      Url: '/nhan-vien/bang-luong-2',
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
        loading={isLoading}
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
                    <th
                      rowSpan={2}
                      className="p-3 font-semibold text-left min-w-[60px] max-w-[60px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 font-number text-sm uppercase h-[50px] sticky top-0 left-0 bg-[#f8f8f8]"
                    >
                      STT
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[100px] max-w-[100px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm sticky top-0 left-[60px] bg-[#f8f8f8]"
                    >
                      ID
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[200px] max-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm sticky top-0 left-[160px] bg-[#f8f8f8]"
                    >
                      Tên nhân viên
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[200px] max-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm sticky top-0 left-[360px] bg-[#f8f8f8]"
                    >
                      Cấp bậc
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[200px] max-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Cơ sở
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
                      Ngày công chuẩn
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Công thực tế
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Lương theo ngày công
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Giờ partime
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Lương theo giờ
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Phụ cấp chức vụ
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Phụ cấp thâm niên
                    </th>
                    {GlobalConfig?.Admin?.chiphikhacbangluong && (
                      <th
                        rowSpan={2}
                        className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                      >
                        {GlobalConfig?.Admin?.chiphikhacbangluong}
                      </th>
                    )}

                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Phụ cấp chuyên cần
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Phụ cấp ăn trưa
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Phụ cấp tháng
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Tiền Tour
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      HH sản phẩm
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      HH dịch vụ
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      HH bán thẻ
                    </th>
                    {!GlobalConfig?.Admin?.bc_an_hhpp_hhnvl && (
                      <>
                        <th
                          rowSpan={2}
                          className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                        >
                          HH phụ phí
                        </th>
                        <th
                          rowSpan={2}
                          className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                        >
                          HH NVL
                        </th>
                      </>
                    )}

                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Phụ cấp ngoài giờ
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Phạt đi trễ, về sớm
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
                      Thưởng khác
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
                      Tổng phụ cấp
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Tổng lương tháng
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Lương nộp BHXH
                      <div>(Salary applied for SI, HI)</div>
                    </th>

                    <th
                      colSpan={4}
                      className="uppercase p-3 font-semibold text-center text-danger min-w-[250px] max-w-[250px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Người sử dụng lao động trả 21.5% (Payments Paid by
                      Employer)
                    </th>
                    <th
                      colSpan={4}
                      className="uppercase p-3 font-semibold text-center min-w-[250px] max-w-[250px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Người lao động trả 10,5% (Payments Paid by Employee)
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
                      Thu nhập tính thuế
                      <div>(acessable income)</div>
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      TTNCN
                      <div>(PIT)</div>
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Tạm ứng
                      <div>(Advance)</div>
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Lương nhân viên thực nhận
                    </th>
                    <th
                      rowSpan={2}
                      className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                    >
                      Tổng quỹ lương CTY trả
                    </th>
                  </tr>
                  <tr>
                    {/* ------- */}
                    <th className="uppercase p-3 font-semibold text-center text-danger min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 min-h-[50px] font-number text-sm">
                      <div>BHXH 17.5%</div>
                      <div>(Soc. Ins 17.5%)</div>
                    </th>
                    <th className="uppercase p-3 font-semibold text-center text-danger min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 min-h-[50px] font-number text-sm">
                      <div>BHYT 3%</div>
                      <div>(Health. Ins 3%)</div>
                    </th>
                    <th className="uppercase p-3 font-semibold text-center text-danger min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 min-h-[50px] font-number text-sm">
                      <div>BHTN 1%</div>
                      <div>(Unem.Ins 1%)</div>
                    </th>
                    <th className="uppercase p-3 font-semibold text-center text-danger min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 min-h-[50px] font-number text-sm">
                      Tổng BH (Total)
                    </th>
                    {/* ------- */}
                    {/* ------- */}
                    <th className="uppercase p-3 font-semibold text-center min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 min-h-[50px] font-number text-sm">
                      <div>BHXH 8%</div>
                      <div>(Soc. Ins 8%)</div>
                    </th>
                    <th className="uppercase p-3 font-semibold text-center min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 min-h-[50px] font-number text-sm">
                      <div>BHYT 1.5%</div>
                      <div>(Health. Ins 1.5%)</div>
                    </th>
                    <th className="uppercase p-3 font-semibold text-center min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 min-h-[50px] font-number text-sm">
                      <div>BHTN 1%</div>
                      <div>(Unem.Ins 1%)</div>
                    </th>
                    <th className="uppercase p-3 font-semibold text-center min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] min-h-[50px] font-number text-sm">
                      Tổng BH (Total)
                    </th>
                    {/* ------- */}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data &&
                    data.map((rowData, index) => (
                      <tr key={index}>
                        <td className="p-3 bg-white max-w-[60px] min-w-[60px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 sticky top-0 left-0">
                          {index + 1}
                        </td>
                        <td className="p-3 bg-white max-w-[100px] min-w-[100px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 sticky top-0 left-[60px]">
                          #{rowData?.User?.ID}
                        </td>
                        <td className="p-3 bg-white max-w-[200px] min-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 sticky top-0 left-[160px]">
                          {rowData?.User?.FullName}
                        </td>
                        <td className="p-3 bg-white max-w-[200px] min-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 sticky top-0 left-[360px]">
                          {rowData?.User?.Level}
                        </td>
                        <td className="p-3 bg-white max-w-[200px] min-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {rowData?.BANGLUONGBC?.DiemQL &&
                          rowData?.BANGLUONGBC?.DiemQL.length > 0
                            ? rowData?.BANGLUONGBC?.DiemQL.map(
                                stock => stock.StockTitle
                              ).join(', ')
                            : 'Chưa xác định'}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {rowData?.TINH_THEO_CONG
                            ? PriceHelper.formatVND(rowData?.LUONG_CO_BAN_THANG)
                            : ''}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {rowData?.TINH_THEO_CONG ? rowData?.NGAY_CONG : ''}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {rowData?.TINH_THEO_CONG > 0
                            ? rowData?.NGAY_CONG_THUC_TE
                            : ''}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {rowData?.TINH_THEO_CONG
                            ? PriceHelper.formatVND(
                                rowData.LUONG_THEO_NGAY_CONG
                              )
                            : ''}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {!rowData?.TINH_THEO_CONG
                            ? PriceHelper.formatVND(rowData?.GIO_PARTIME)
                            : ''}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {!rowData?.TINH_THEO_CONG
                            ? PriceHelper.formatVND(rowData?.LUONG_THEO_GIO)
                            : ''}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.PHU_CAP_CHUC_VU)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.PHU_CAP_THAM_NIEN)}
                        </td>
                        {GlobalConfig?.Admin?.chiphikhacbangluong && (
                          <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                            {PriceHelper.formatVND(rowData?.PHAT_SINH_KHAC)}
                          </td>
                        )}
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.PHU_CAP_CHUYEN_CAN)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.PHU_CAP_AN_TRUA)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.BANGLUONGBC?.PHU_CAP)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(
                            rowData?.BANGLUONGBC?.LUONG_CA
                          )}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(
                            rowData?.BANGLUONGBC?.HOA_HONG_Sanpham
                          )}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(
                            rowData?.BANGLUONGBC?.HOA_HONG_Dichvu
                          )}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(
                            rowData?.BANGLUONGBC?.HOA_HONG_Thetien
                          )}
                        </td>
                        {!GlobalConfig?.Admin?.bc_an_hhpp_hhnvl && (
                          <>
                            <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                              {PriceHelper.formatVND(
                                rowData?.BANGLUONGBC?.HOA_HONG_Phuphi
                              )}
                            </td>
                            <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                              {PriceHelper.formatVND(
                                rowData?.BANGLUONGBC?.HOA_HONG_NVL
                              )}
                            </td>
                          </>
                        )}

                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.PHU_CAP_NGOAI_GIO)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.PHAT_DI_TRE_VE_SOM)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(
                            rowData?.BANGLUONGBC?.TRU_PHAT
                          )}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.BANGLUONGBC?.THUONG)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(
                            rowData?.BANGLUONGBC?.KPI_Hoa_hong
                          )}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.TONG_PHU_CAP)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.TONG_LUONG_THANG)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.LUONG_NOP_BHXH)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(
                            rowData?.NSD_LD_TRA['17_5_percent']
                          )}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(
                            rowData?.NSD_LD_TRA['3_percent']
                          )}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(
                            rowData?.NSD_LD_TRA['1_percent']
                          )}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.NSD_LD_TRA['total'])}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.NLD_TRA['8_percent'])}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(
                            rowData?.NLD_TRA['1_5_percent']
                          )}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.NLD_TRA['1_percent'])}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.NLD_TRA['total'])}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.GIAM_TRU_GIA_CANH)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.THU_NHAP_TINH_THUE)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.THUE_TNCN)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(
                            rowData?.BANGLUONGBC?.TAM_UNG -
                              rowData?.BANGLUONGBC?.HOAN_UNG
                          )}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(rowData?.LUONG_NV_THUC_NHAN)}
                        </td>
                        <td className="p-3 bg-white max-w-[150px] min-w-[150px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                          {PriceHelper.formatVND(
                            rowData?.TONG_QUY_LUONG_CTY_TRA
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
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

export default PayrollStaff2
