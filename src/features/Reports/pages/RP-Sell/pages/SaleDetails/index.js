import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import LoadingSkeleton from './LoadingSkeleton'
import reportsApi from 'src/api/reports.api'
import FilterList from 'src/components/Filter/FilterList'
import ElementEmpty from 'src/components/Empty/ElementEmpty'
import { PriceHelper } from 'src/helpers/PriceHelper'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useWindowSize } from 'src/hooks/useWindowSize'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import { Dropdown, OverlayTrigger, Popover } from 'react-bootstrap'
import { ArrayHeplers } from 'src/helpers/ArrayHeplers'
import { JsonFilter } from 'src/Json/JsonFilter'

import moment from 'moment'
import 'moment/locale/vi'
import PickerView from './PickerView'
import clsx from 'clsx'
import { useQuery } from '@tanstack/react-query'
import FilterListSales from 'src/components/Filter/FilterListSales'
import ReactECharts from 'echarts-for-react'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'

moment.locale('vi')

let { TimeToRealList } = JsonFilter

const perfectScrollbarOptions = {
  wheelSpeed: 2,
  wheelPropagation: false
}

const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
  <span
    ref={ref}
    onClick={e => {
      e.preventDefault()
      onClick(e)
    }}
    className="flex items-center cursor-pointer text-uppercase font-size-xl fw-600"
  >
    {children}
  </span>
))

const ColumnChart = ({
  dataSource = [],
  valueKey = 'Qty',
  gridLeft = 30,
  Title = 'So sánh số lượng'
}) => {
  const option = useMemo(() => {
    const fmtRange = (from, to) =>
      `${moment(from).format('DD-MM-YYYY')} → ${moment(to).format(
        'DD-MM-YYYY'
      )}`

    // 1) X axis = TypeTitle
    const xCats = dataSource.map(x => x.TypeTitle)

    // 2) Union tất cả range (From-To) từ mọi TypeTitle
    const ranges = []
    const seen = new Set()

    dataSource.forEach(t => {
      ;(t.SumList || []).forEach(s => {
        const key = fmtRange(s.From, s.To)
        if (!seen.has(key)) {
          seen.add(key)
          ranges.push({ key, from: moment(s.From) })
        }
      })
    })

    // sort theo From tăng dần
    ranges.sort((a, b) => a.from.valueOf() - b.from.valueOf())
    const rangeKeys = ranges.map(r => r.key)

    // 3) map[typeTitle][rangeKey] = sum(valueKey)
    const map = {}
    dataSource.forEach(t => {
      const m = {}
      ;(t.SumList || []).forEach(s => {
        const k = fmtRange(s.From, s.To)
        m[k] = (m[k] || 0) + (Number(s[valueKey]) || 0)
      })
      map[t.TypeTitle] = m
    })

    // 4) series: mỗi range = 1 màu, data theo xCats
    const series = rangeKeys.map(rk => ({
      name: rk, // legend = từng khoảng
      type: 'bar',
      barMaxWidth: 22,
      data: xCats.map(typeTitle => map[typeTitle]?.[rk] || 0)
    }))

    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { top: 10, type: 'scroll' }, // nhiều range thì scroll legend
      grid: { left: gridLeft, right: 20, top: 80, bottom: 80 },

      xAxis: {
        type: 'category',
        data: xCats,
        axisLabel: { margin: 10, show: true }
      }, // Sản phẩm, Dịch vụ
      yAxis: {
        type: 'value',
        name: valueKey === 'Qty' ? 'Số lượng' : 'Doanh số',
        minInterval: valueKey === 'Qty' ? 1 : 0
        //max: (value) => Math.max(5, value.max * 2)
      },
      dataZoom: [
        {
          type: 'slider',
          xAxisIndex: 0,
          start: 0,
          end: 60,
          filterMode: 'none',
          zoomLock: true,
          handleSize: 0,
          handleStyle: { opacity: 0 },
          moveHandleSize: 0,
          showDetail: false,
          brushSelect: false
        },
        {
          type: 'inside',
          xAxisIndex: 0,
          zoomOnMouseWheel: false,
          moveOnMouseWheel: true,
          moveOnMouseMove: true,
          filterMode: 'none',
          zoomLock: true,
          preventDefaultMouseMove: false
        }
      ],

      series
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource, valueKey])

  return (
    <div className="bg-white rounded p-20px mb-20px">
      <ReactECharts
        option={option}
        style={{
          height: '500px',
          width: '100%',
          minHeight: '500px',
          touchAction: 'pan-y'
        }}
        notMerge
        lazyUpdate
      />
      <div className="mt-6 text-xl font-semibold text-center uppercase">
        {Title}
      </div>
    </div>
  )
}

function getTimeBlocks(DateStart, DateEnd, Type) {
  const startInput = moment(DateStart, 'YYYY-MM-DD')
  const endInput = moment(DateEnd, 'YYYY-MM-DD')

  if (!startInput.isValid() || !endInput.isValid())
    throw new Error('Date không hợp lệ')

  if (startInput.isAfter(endInput)) throw new Error('DateStart phải <= DateEnd')

  const blocks = []
  let index = 1
  let cursor

  switch (Type) {
    case 1: // Tuần (Thứ 2 → CN)
      cursor = startInput.clone().startOf('isoWeek')
      break
    case 2: // Tháng
      cursor = startInput.clone().startOf('month')
      break
    case 3: // Quý
      cursor = startInput.clone().startOf('quarter')
      break
    case 4: // Năm
      cursor = startInput.clone().startOf('year')
      break
    default:
      throw new Error('Type không hợp lệ')
  }

  while (cursor.isSameOrBefore(endInput)) {
    let periodStart = cursor.clone()
    let periodEnd

    let label = ''

    if (Type === 1) {
      periodEnd = cursor.clone().endOf('isoWeek')
      label = `Week ${index}`
      cursor.add(1, 'week')
    }

    if (Type === 2) {
      periodEnd = cursor.clone().endOf('month')
      label = cursor.format('MM/YYYY')
      cursor.add(1, 'month')
    }

    if (Type === 3) {
      periodEnd = cursor.clone().endOf('quarter')
      label = `Q${cursor.quarter()}/${cursor.year()}`
      cursor.add(1, 'quarter')
    }

    if (Type === 4) {
      periodEnd = cursor.clone().endOf('year')
      label = cursor.format('YYYY')
      cursor.add(1, 'year')
    }

    // Cắt block theo DateStart / DateEnd
    const blockStart = moment.max(periodStart, startInput)
    const blockEnd = moment.min(periodEnd, endInput)

    if (blockStart.isSameOrBefore(blockEnd)) {
      blocks.push({
        index,
        start: blockStart.format('YYYY-MM-DD'),
        end: blockEnd.format('YYYY-MM-DD'),
        label
      })
      index++
    }
  }

  return blocks
}

function SaleDetails(props) {
  const { CrStockID, Stocks, GlobalConfig } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || [],
    GlobalConfig: auth?.GlobalConfig
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    DateStart: new Date(), // Ngày,
    DateEnd: new Date(), // Ngày,
    BrandIds: '',
    CategoriesIds: '',
    ProductIds: '',
    TimeToReal: TimeToRealList[1],
    ShowsType: '1',
    Pi: 1,
    Ps: 20
  })
  const [filters2, setFilters2] = useState({
    StockID: CrStockID || '', // ID Stock
    DateStart: moment().startOf('isoWeek').toDate(), // Ngày,
    DateEnd: moment().endOf('isoWeek').toDate(), // Ngày,
    ProdOrService: null, //null, 0,1,2,3,4
    ProductId: '',
    TypeDate: 1,
    CategoriesIds: ''
  })
  const [StockName, setStockName] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [isFilter, setIsFilter] = useState(false)
  const [dataResult, setDataResult] = useState({
    SP_NVL: [], //1
    DV_PP: [], //2
    TT: [] //3
  })
  const [Total, setTotal] = useState({
    SL: 0,
    DS: 0,
    TongThanhToan: 0,
    TongThanhToanSP_NVL: 0,
    TongThanhToanDV_PP: 0,
    TongThanhToanTT: 0
  })
  const [heighElm, setHeightElm] = useState({
    Content: 'calc(100% - 55px)',
    Box: 'calc(100% - 120px)'
  })
  const [View, setView] = useState(0)
  const { width } = useWindowSize()

  useEffect(() => {
    if (width < 991 && width > 0) {
      setHeightElm({
        Content: 'auto',
        Box: '350px'
      })
    }
  }, [width])

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
    View === 0 && getSalesDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, View])

  const ChartSales2 = useQuery({
    queryKey: ['ChartSales2', filters2],
    queryFn: async () => {
      let BlockTimes = getTimeBlocks(
        filters2.DateStart,
        filters2.DateEnd,
        filters2.TypeDate
      )
      let { data } = await reportsApi.getChartSalesDetail2({
        StockID: filters2.StockID,
        ProdOrService:
          filters2.ProdOrService?.value === ''
            ? null
            : filters2.ProdOrService?.value,
        ProdIDs: filters2.ProductId?.value || '',
        BlockTimes: BlockTimes.map(x => [x.start, x.end]),
        CategoriesIds: filters2?.CategoriesIds
          ? filters2?.CategoriesIds.map(x => x.value).toString()
          : '',
        Ps: 10000
      })

      const result = Array.from(
        (data?.Items || [])
          .reduce((map, cur) => {
            const key = cur.ProdType

            if (!map.has(key)) {
              // clone object đầu tiên
              map.set(key, {
                ProdType: cur.ProdType,
                TypeTitle: cur.TypeTitle,
                SumList: cur.SumList.map(x => ({ ...x }))
              })
            } else {
              // cộng SumList theo index
              cur.SumList.forEach((item, idx) => {
                map.get(key).SumList[idx].Qty += item.Qty
                map.get(key).SumList[idx].ToPay += item.ToPay
              })
            }

            return map
          }, new Map())
          .values()
      )

      return result
    },
    keepPreviousData: true,
    enabled: View === 1
  })

  const getTotalBlocks = Items => {
    let newItems = Items.map(x => ({
      ...x,
      Items: x.Items.filter(k => k.isSum)
    }))

    const result = newItems.reduce((acc, curr) => {
      const blockTimes = curr.Items[0].BlockTimes

      blockTimes.forEach((item, index) => {
        if (!acc[index]) {
          acc[index] = { Qty: 0, actualAmount: 0 }
        }

        acc[index].Qty += item.Qty
        acc[index].actualAmount += item.actualAmount
      })

      return acc
    }, [])
    return result
  }

  const { isLoading, data, refetch } = useQuery({
    queryKey: ['SalesProductService2', filters2],
    queryFn: async () => {
      let BlockTimes = getTimeBlocks(
        filters2.DateStart,
        filters2.DateEnd,
        filters2.TypeDate
      )
      let rs = []
      let index = 0

      for (let item of BlockTimes) {
        index = index + 1
        let { data } = await reportsApi.getListSalesDetail2({
          StockID: filters2.StockID,
          ProdOrService:
            filters2.ProdOrService?.value === ''
              ? null
              : filters2.ProdOrService?.value,
          ProdIDs: filters2.ProductId?.value || '',
          BlockTime: [item.start, item.end],
          CategoriesIds: filters2?.CategoriesIds
            ? filters2?.CategoriesIds.map(x => x.value).toString()
            : '',
          Ps: 10000
        })

        rs.push({
          ...item,
          Items: data?.Items
            ? Array.from(
                data?.Items.reduce((map, item) => {
                  const key = item.ProdID

                  if (!map.has(key)) {
                    map.set(key, { ...item })
                  } else {
                    map.get(key).Qty += item.Qty
                    map.get(key).ToPay += item.ToPay
                  }

                  return map
                }, new Map()).values()
              )
            : []
        })

        if (index !== BlockTimes.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      let newRs = Array.from(
        rs
          .flatMap(x => x.Items) // lấy tất cả Items
          .reduce((map, item) => {
            if (!map.has(item.ProdID)) {
              map.set(item.ProdID, item) // giữ item đầu tiên
            }
            return map
          }, new Map())
          .values()
      )
        .map(x => ({
          ...x,
          BlockTimes: Array(BlockTimes.length)
            .fill()
            .map(x => ({
              Qty: 0,
              actualAmount: 0
            }))
        }))
        .map(prod => {
          let newProd = {
            ...prod
          }
          for (let time of rs) {
            let ProdID = time.Items.find(x => x.ProdID === prod.ProdID)
            if (ProdID) {
              newProd.BlockTimes[time.index - 1].Qty = ProdID.Qty || 1
              newProd.BlockTimes[time.index - 1].actualAmount = ProdID.ToPay
            }
          }
          return newProd
        })
        .sort((a, b) => a.ProdType - b.ProdType)

      newRs = Array.from(
        newRs
          .reduce((map, item) => {
            const key = item.ProdType

            if (!map.has(key)) {
              map.set(key, {
                ProdType: key,
                TypeTitle: item.TypeTitle,
                Items: [item]
              })
            } else {
              map.get(key).Items.push(item)
            }

            return map
          }, new Map())
          .values()
      ).map(x => {
        let newObj = { ...x }

        newObj.Items.push({
          isSum: true,
          ProdCode: '',
          ProdTitle: newObj.TypeTitle,
          BlockTimes: newObj.Items.reduce((acc, cur) => {
            cur.BlockTimes.forEach((item, index) => {
              if (!acc[index]) {
                acc[index] = { Qty: 0, actualAmount: 0 }
              }
              acc[index].Qty += item.Qty
              acc[index].actualAmount += item.actualAmount
            })
            return acc
          }, [])
        })
        return newObj
      })

      let BlockTimesAll = getTotalBlocks(newRs)

      let SumAll = {
        ProdType: 0,
        TypeTitle: 'Tất cả',
        Items: [
          {
            isTotal: true,
            ProdTitle: 'Tổng',
            ProdCode: '',
            BlockTimes: BlockTimesAll
          }
        ]
      }
      newRs.push(SumAll)

      let TotalAll = BlockTimesAll.reduce(
        (acc, item) => {
          acc.Qty += item.Qty
          acc.actualAmount += item.actualAmount
          return acc
        },
        { Qty: 0, actualAmount: 0 }
      )

      return {
        Items: newRs,
        BlockTimes,
        TotalAll
      }
    },
    keepPreviousData: true,
    enabled: View === 1
  })

  useEffect(() => {
    if (View === 1) {
      if (!isLoading && !ChartSales2.isLoading && isFilter) {
        setIsFilter(false)
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, ChartSales2.isLoading, View])

  const GeneralNewFilter = filters => {
    return {
      ...filters,
      DateStart: filters.DateStart
        ? moment(filters.DateStart).format('DD/MM/yyyy')
        : null,
      DateEnd: filters.DateEnd
        ? moment(filters.DateEnd).format('DD/MM/yyyy')
        : null,
      Voucher: filters.Voucher ? filters.Voucher.value : '',
      Payment: filters.Payment ? filters.Payment.value : '',
      IsMember: filters.IsMember ? filters.IsMember.value : '',
      BrandIds:
        filters.BrandIds && filters.BrandIds.length > 0
          ? filters.BrandIds.map(item => item.value).join(',')
          : '',
      CategoriesIds:
        filters.CategoriesIds && filters.CategoriesIds.length > 0
          ? filters.CategoriesIds.map(item => item.value).join(',')
          : '',
      ProductIds:
        filters.ProductIds && filters.ProductIds.length > 0
          ? filters.ProductIds.map(item => item.value).join(',')
          : '',
      TimeToReal: filters.TimeToReal ? filters.TimeToReal.value : ''
    }
  }

  const useSalesProduct = useQuery({
    queryKey: ['SalesProductService3', filters],
    queryFn: async () => {
      let rs = await reportsApi.getListSalesDetail2({
        StockID: filters.StockID,
        ProdOrService: filters.ProdOrService?.value || '',
        ProdIDs: filters.ProductIds
          ? filters.ProductIds.map(x => x.value).toString()
          : '',
        BlockTime: [
          moment(filters.DateStart).format('YYYY-MM-DD'),
          moment(filters.DateEnd).format('YYYY-MM-DD')
        ],
        TagsOrder: filters?.TagsOrder?.value || '',
        IsMember: filters?.IsMember !== '' ? filters?.IsMember : '',
        Pi: filters.Pi,
        Ps: filters.Ps || 20
      })
      return {
        ...rs?.data,
        Items: rs?.data?.Items.map(item => {
          let obj = { ...item }
          let Stock = Stocks.find(x => x.ID === item.StockID)
          if (Stock) {
            obj.StockTitle = Stock?.Title
            let newDesc = Stock.DescSEO ? JSON.parse(Stock.DescSEO) : null
            if (newDesc && newDesc.place && newDesc.place.length > 0) {
              obj.StockCity = newDesc.place[0].Title
            }

            obj.StockCode = Stock.TitleSEO || ''
          }
          return obj
        })
      }
    },
    keepPreviousData: true,
    enabled: filters.ShowsType === '4'
  })

  useEffect(() => {
    if ((isFilter || isLoading) && !useSalesProduct?.isLoading) {
      setLoading(false)
      setIsFilter(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useSalesProduct?.isLoading])

  const getSalesDetail = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    const newFilters = GeneralNewFilter(filters)

    if (filters.ShowsType !== '4') {
      reportsApi
        .getListSalesDetail(newFilters)
        .then(({ data }) => {
          if (data.isRight) {
            PermissionHelpers.ErrorAccess(data.error)
            setLoading(false)
          } else {
            let obj = {
              SP_NVL:
                (data?.result &&
                  data?.result.filter(item => item.Format === 1)) ||
                [],
              DV_PP:
                (data?.result &&
                  data?.result.filter(item => item.Format === 2)) ||
                [],
              TT:
                (data?.result &&
                  data?.result.filter(item => item.Format === 3)) ||
                []
            }

            setTotal(prevState => ({
              ...prevState,
              DS: ArrayHeplers.totalKeyArray(data?.result, 'SumTopay'),
              SL: ArrayHeplers.totalKeyArray(data?.result, 'SumQTy'),
              TongThanhToan: ArrayHeplers.totalKeyArray(
                data?.result
                  ? data?.result.map(x => ({
                      ThanhToan: x.CK + x.QT + x.TM + x.TT + x.Vi
                    }))
                  : [],
                'ThanhToan'
              ),
              TongThanhToanSP_NVL: ArrayHeplers.totalKeyArray(
                obj.SP_NVL.map(x => ({
                  ThanhToan: x.CK + x.QT + x.TM + x.TT + x.Vi
                })),
                'ThanhToan'
              ),
              TongThanhToanDV_PP: ArrayHeplers.totalKeyArray(
                obj.DV_PP.map(x => ({
                  ThanhToan: x.CK + x.QT + x.TM + x.TT + x.Vi
                })),
                'ThanhToan'
              ),
              TongThanhToanTT: ArrayHeplers.totalKeyArray(
                obj.TT.map(x => ({
                  ThanhToan: x.CK + x.QT + x.TM + x.TT + x.Vi
                })),
                'ThanhToan'
              )
            }))

            setDataResult(obj)
            setLoading(false)
            isFilter && setIsFilter(false)
            callback && callback()
            PermissionHelpers.HideErrorAccess()
          }
        })
        .catch(error => console.log(error))
    }
  }

  const onFilter = values => {
    if (View === 0) {
      if (_.isEqual(values, filters)) {
        getSalesDetail()
      } else {
        setFilters({ ...values, Pi: 1 })
      }
    } else {
      if (_.isEqual(values, filters2)) {
        refetch()
      } else {
        setFilters2({ ...values, Pi: 1 })
      }
    }
  }

  const onExport = async () => {
    setLoadingExport(true)
    if (View === 0) {
      const newFilters = GeneralNewFilter(
        ArrayHeplers.getFilterExport({ ...filters })
      )
      if (filters.ShowsType === '2' || filters.ShowsType === '3') {
        reportsApi
          .getListSalesOnStock({
            From: moment(filters.DateStart).format('YYYY-MM-DD'),
            To: moment(filters.DateEnd).format('YYYY-MM-DD'),
            StockID: filters.StockID ? [filters.StockID] : [],
            ProductIds:
              filters.ProductIds && filters.ProductIds.length > 0
                ? filters.ProductIds.map(item => item.value).join(',')
                : ''
          })
          .then(({ data }) => {
            window?.EzsExportExcel &&
              window?.EzsExportExcel({
                Url: '/ban-hang/sp-dv-ban-ra',
                Data: {
                  ...data,
                  param: {
                    Body: filters
                  }
                },
                hideLoading: () => setLoadingExport(false)
              })
          })
      } else if (filters.ShowsType === '4') {
        reportsApi
          .getListSalesDetail2({
            StockID: filters.StockID,
            ProdOrService: filters.ProdOrService?.value || '',
            ProdIDs: filters.ProductId?.value || '',
            BlockTime: [
              moment(filters.DateStart).format('YYYY-MM-DD'),
              moment(filters.DateEnd).format('YYYY-MM-DD')
            ],
            TagsOrder: filters?.TagsOrder?.value || '',
            IsMember: filters?.IsMember !== '' ? filters?.IsMember : '',
            Pi: 1,
            Ps: useSalesProduct?.data?.Total,
            ShowsType: filters.ShowsType
          })
          .then(rs => {
            window?.EzsExportExcel &&
              window?.EzsExportExcel({
                Url: '/ban-hang/sp-dv-ban-ra',
                Data: {
                  result: rs?.data?.Items
                    ? rs?.data?.Items?.map(item => {
                        let obj = { ...item }
                        let Stock = Stocks.find(x => x.ID === item.StockID)
                        if (Stock) {
                          obj.StockTitle = Stock?.Title
                          let newDesc = Stock.DescSEO
                            ? JSON.parse(Stock.DescSEO)
                            : null
                          if (
                            newDesc &&
                            newDesc.place &&
                            newDesc.place.length > 0
                          ) {
                            obj.StockCity = newDesc.place[0].Title
                          }

                          obj.StockCode = Stock.TitleSEO || ''
                        }
                        return obj
                      })
                    : [],
                  param: {
                    Body: filters
                  }
                },
                hideLoading: () => setLoadingExport(false)
              })
          })
      } else {
        reportsApi
          .getListSalesDetail(newFilters)
          .then(({ data }) => {
            window?.EzsExportExcel &&
              window?.EzsExportExcel({
                Url: '/ban-hang/sp-dv-ban-ra',
                Data: data,
                hideLoading: () => setLoadingExport(false)
              })
          })
          .catch(error => console.log(error))
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 50))

      window?.EzsExportNoFechExcel({
        Title: `Sản phẩm dịch, dịch vụ bán ra ${moment(
          filters2.DateStart
        ).format('DD/MM/YYYY')} - ${moment(filters2.DateEnd).format(
          'DD/MM/YYYY'
        )}`,
        filters,
        Url: '/ban-hang/sp-dv-ban-ra-2',
        Data: data || null,
        hideLoading: () => {
          setLoadingExport(false)
        }
      })
    }
  }

  const onRefresh = () => {
    if (View === 1) {
      refetch()
      ChartSales2.refetch()
      return
    } else {
      getSalesDetail()
    }
  }

  const onOpenFilter = () => {
    setIsFilter(true)
  }

  const onHideFilter = () => {
    setIsFilter(false)
  }

  const sumTotalDS = data => {
    return data
      ? data.reduce((accumulator, object) => {
          return accumulator + object.SumTopay
        }, 0)
      : 0
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
        key: 'ID',
        title: 'ID',
        dataKey: 'ID',
        width: 100,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'StockTitle',
        title: 'Cơ sở',
        dataKey: 'StockTitle',
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'StockCode',
        title: 'Mã cơ sở',
        dataKey: 'StockCode',
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        },
        hidden: !GlobalConfig?.Admin?.dinh_dang_ma_don_nhap_xuat_kho
      },
      {
        key: 'StockCity',
        title: 'Vùng (Thành phố)',
        dataKey: 'StockCity',
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'CreateDate',
        title: 'Ngày',
        dataKey: 'CreateDate',
        cellRenderer: ({ rowData }) =>
          moment(rowData.CreateDate).format('HH:mm DD/MM/YYYY'),
        width: 150,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'OrderID',
        title: 'Mã đơn hàng',
        dataKey: 'OrderID',
        cellRenderer: ({ rowData }) => <div>{rowData.OrderID}</div>,
        width: 120,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'SenderID',
        title: 'ID khách',
        dataKey: 'SenderID',
        width: 100,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'SenderName',
        title: 'Tên khách hàng',
        dataKey: 'SenderName',
        width: 200,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'SenderPhone',
        title: 'Số điện thoại',
        dataKey: 'SenderPhone',
        width: 150,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'ProdID',
        title: 'ID mặt hàng',
        dataKey: 'ProdID',
        width: 120,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'ProdCode',
        title: 'Mã mặt hàng',
        dataKey: 'ProdCode',
        width: 150,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'ProdTitle',
        title: 'Tên mặt hàng',
        dataKey: 'ProdTitle',
        width: 250,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'ProdOrService',
        title: 'Loại',
        dataKey: 'ProdOrService',
        cellRenderer: ({ rowData }) => {
          let Type = ''
          if (rowData.ProdOrService === 0) Type = 'Sản phẩm'
          if (rowData.ProdOrService === 1) Type = 'Dịch vụ'
          if (rowData.ProdOrService === 2) Type = 'Phụ phí'
          if (rowData.ProdOrService === 3) Type = 'Nguyên vật liệu'
          if (rowData.ProdOrService === 4) Type = 'Thẻ tiền'
          return Type
        },
        width: 150,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'TypeTitle',
        title: 'Nhóm phân loại',
        dataKey: 'TypeTitle',
        width: 200,
        sortable: false
      },
      {
        key: 'Qty',
        title: 'Số lượng',
        dataKey: 'Qty',
        width: 100,
        sortable: false
      },
      {
        key: 'Price',
        title: 'Giá gốc',
        dataKey: 'Price',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.Price),
        width: 150,
        sortable: false
      },
      {
        key: 'PriceQty',
        title: 'Thành tiền',
        dataKey: 'PriceQty',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.Price * rowData.Qty),
        width: 150,
        sortable: false
      },
      {
        key: 'PriceOrder',
        title: 'Giá giảm',
        dataKey: 'PriceOrder',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.PriceOrder),
        width: 150,
        sortable: false
      },
      {
        key: 'VoucherValue',
        title: 'Voucher',
        dataKey: 'VoucherValue',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.VoucherValue),
        width: 200,
        sortable: false
      },
      {
        key: 'PriceSVoucher',
        title: 'Giá sau Voucher',
        dataKey: 'PriceSVoucher',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.ToMoney - rowData.VoucherValue),
        width: 180,
        sortable: false
      },
      {
        key: 'CustomeDiscount',
        title: 'Giảm giá cả đơn',
        dataKey: 'CustomeDiscount',
        cellRenderer: ({ rowData }) =>
          rowData.CustomeDiscount > 100
            ? PriceHelper.formatVND(rowData.CustomeDiscount)
            : `${rowData.CustomeDiscount}%`,
        width: 200,
        sortable: false
      },
      {
        key: 'ToPay',
        title: 'Tổng tiền',
        dataKey: 'ToPay',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.ToPay),
        width: 180,
        sortable: false
      },
      {
        key: 'CPayed',
        title: 'TM/CK/QT',
        dataKey: 'CPayed',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.CPayed),
        width: 150,
        sortable: false
      },
      {
        key: 'MPayed',
        title: 'Ví / Thẻ tiền',
        dataKey: 'MPayed',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.MPayed),
        width: 150,
        sortable: false
      },
      {
        key: 'Cpayed-cpayedreal',
        title: 'Trả hàng / KTT',
        dataKey: 'Cpayed-cpayedreal',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(
            Math.abs((rowData.Cpayed || 0) - (rowData.CPayedReal || 0))
          ),
        width: 150,
        sortable: false
      },
      {
        key: 'Topay-Cpayed-Mpayed',
        title: 'Còn nợ',
        dataKey: 'Topay-Cpayed-Mpayed',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(
            Math.abs(
              (rowData.Topay || 0) -
                Math.abs(rowData.CPayed || 0) -
                Math.abs(rowData.MPayed || 0)
            )
          ),
        width: 150,
        sortable: false
      },
      {
        key: 'IsNewMember',
        title: 'Loại',
        dataKey: 'IsNewMember',
        cellRenderer: ({ rowData }) => (
          <span
            className={`${clsx({
              'text-success': rowData.IsNewMember === 1
            })} fw-500`}
          >
            Khách {rowData.IsNewMember === 0 ? 'Cũ' : 'Mới'}
          </span>
        ),
        width: 250,
        sortable: false,
        hidden: !GlobalConfig?.Admin?.tagorder_show
      },
      {
        key: 'TagOrder',
        title: 'Tags đơn hàng',
        dataKey: 'TagOrder',
        width: 250,
        sortable: false,
        hidden: !GlobalConfig?.Admin?.tagorder_show
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters.ShowsType === 4, filters.Pi]
  )

  return (
    <div
      className={clsx(
        'py-main d-flex flex-column',
        View === 0 && filters.ShowsType !== '4' && 'h-100'
      )}
    >
      <div className="subheader d-flex justify-content-between align-items-center flex-shrink-1">
        <div className="flex items-center flex-1">
          <Dropdown>
            <Dropdown.Toggle as={CustomToggle} id="dropdown-customers">
              <span className="flex gap-1 cursor-pointer text-uppercase font-size-xl fw-600">
                Sản phẩm, dịch vụ bán ra
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </span>
            </Dropdown.Toggle>

            <Dropdown.Menu className="a" align="end">
              <Dropdown.Item
                className={clsx(
                  'dropdown-item-active',
                  View === 0 && 'text-primary'
                )}
                onClick={() => setView(0)}
              >
                Xem theo kiểu 1
              </Dropdown.Item>
              <Dropdown.Item
                className={clsx(
                  'dropdown-item-active',
                  View === 1 && 'text-primary'
                )}
                onClick={() => setView(1)}
              >
                Xem theo kiểu 2
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

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

      {View === 0 && (
        <FilterList
          ShowsKey={{
            value: '4',
            Keys: GlobalConfig?.Admin?.tagorder_show
              ? ['ProdOrService', 'ProductIds', 'IsMember', 'TagsOrder']
              : ['ProdOrService', 'ProductIds']
          }}
          show={isFilter}
          filters={filters}
          onHide={onHideFilter}
          onSubmit={onFilter}
          onRefresh={onRefresh}
          loading={loading}
          loadingExport={loadingExport}
          onExport={onExport}
          optionsAdd={[
            {
              label: 'Nâng cao 2',
              value: '3'
            },
            {
              label: 'Danh sách',
              value: '4'
            }
          ]}
        />
      )}
      {View === 1 && (
        <FilterListSales
          show={isFilter}
          filters={filters2}
          onHide={onHideFilter}
          onSubmit={onFilter}
          onRefresh={refetch}
          loading={isLoading}
          loadingExport={loadingExport}
          onExport={onExport}
        />
      )}

      {View === 0 && (
        <>
          {filters.ShowsType === '4' && (
            <div className="bg-white rounded">
              <div className="border-gray-200 px-20px py-15px border-bottom d-flex align-items-center justify-content-between flex-column flex-md-row">
                <div className="fw-500 font-size-lg">
                  Danh sách sản phẩm, dịch vụ
                </div>
              </div>
              <div className="p-20px">
                <ReactTableV7
                  rowKey="ID"
                  filters={filters}
                  columns={columns}
                  data={useSalesProduct?.data?.Items || []}
                  loading={useSalesProduct?.isLoading}
                  pageCount={useSalesProduct?.data?.Pcount || 0}
                  onPagesChange={onPagesChange}
                  // optionMobile={{
                  //   CellModal: cell => OpenModalMobile(cell)
                  // }}
                />
              </div>
            </div>
          )}

          {filters.ShowsType !== '4' && (
            <>
              {loading && <LoadingSkeleton />}
              <div className="bg-white mb-15px">
                <div className="border-gray-200 px-20px py-15px d-flex align-items-center justify-content-between">
                  <div className="fw-500 font-size-lg">
                    Danh sách SP, DV bán ra
                  </div>
                  {width <= 1200 ? (
                    <div className="fw-500 d-flex align-items-center">
                      <OverlayTrigger
                        rootClose
                        trigger="click"
                        key="bottom"
                        placement="bottom"
                        overlay={
                          <Popover id={`popover-positioned-top`}>
                            <Popover.Body className="p-0">
                              <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                <span>Tổng thanh toán</span>
                                <span>
                                  {PriceHelper.formatVNDPositive(
                                    Total.TongThanhToan
                                  )}
                                </span>
                              </div>
                              <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                <span>Thanh toán Sản phẩm / NVL</span>
                                <span>
                                  {PriceHelper.formatVNDPositive(
                                    Total.TongThanhToanSP_NVL
                                  )}
                                </span>
                              </div>
                              <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                <span>Thanh toán Dịch vụ / PP</span>
                                <span>
                                  {PriceHelper.formatVNDPositive(
                                    Total.TongThanhToanDV_PP
                                  )}
                                </span>
                              </div>
                              <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                <span>Thanh toán Thẻ tiền</span>
                                <span>
                                  {PriceHelper.formatVNDPositive(
                                    Total.TongThanhToanTT
                                  )}
                                </span>
                              </div>
                              <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                <span>Tổng số lượng</span>
                                <span>
                                  {PriceHelper.formatVNDPositive(Total.SL)}
                                </span>
                              </div>
                              <div className="py-10px px-15px fw-600 font-size-md d-flex justify-content-between">
                                <span>Tổng tiền</span>
                                <span>
                                  {PriceHelper.formatVNDPositive(Total.DS)}
                                </span>
                              </div>
                            </Popover.Body>
                          </Popover>
                        }
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="font-size-xl fw-600 pl-5px font-number text-success">
                            {PriceHelper.formatVNDPositive(Total.DS)}
                          </span>
                          <i className="cursor-pointer fa-solid fa-circle-exclamation text-warning ml-5px"></i>
                        </div>
                      </OverlayTrigger>
                    </div>
                  ) : (
                    <div className="d-flex">
                      <div className="fw-500">
                        Tổng số lượng{' '}
                        <span className="font-size-xl fw-600 pl-5px font-number text-success">
                          {PriceHelper.formatVND(Total.SL)}
                        </span>
                      </div>
                      <div className="fw-500 pl-20px">
                        Tổng tiền{' '}
                        <span className="font-size-xl fw-600 pl-5px font-number text-success">
                          {PriceHelper.formatVND(Total.DS)}
                        </span>
                      </div>
                      <div className="fw-500 d-flex align-items-center">
                        <OverlayTrigger
                          rootClose
                          trigger="click"
                          key="bottom"
                          placement="bottom"
                          overlay={
                            <Popover id={`popover-positioned-top`}>
                              <Popover.Body className="p-0">
                                <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                  <span>Thanh toán Sản phẩm / NVL</span>
                                  <span>
                                    {PriceHelper.formatVNDPositive(
                                      Total.TongThanhToanSP_NVL
                                    )}
                                  </span>
                                </div>
                                <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                  <span>Thanh toán Dịch vụ / PP</span>
                                  <span>
                                    {PriceHelper.formatVNDPositive(
                                      Total.TongThanhToanDV_PP
                                    )}
                                  </span>
                                </div>
                                <div className="py-10px px-15px fw-600 font-size-md d-flex justify-content-between">
                                  <span>Thanh toán Thẻ tiền</span>
                                  <span>
                                    {PriceHelper.formatVNDPositive(
                                      Total.TongThanhToanTT
                                    )}
                                  </span>
                                </div>
                              </Popover.Body>
                            </Popover>
                          }
                        >
                          <div className="fw-500 pl-20px">
                            Tổng thanh toán{' '}
                            <span className="font-size-xl fw-600 pl-5px font-number text-success">
                              {PriceHelper.formatVND(Total.TongThanhToan)}
                            </span>
                            <i className="align-text-top cursor-pointer fa-solid fa-circle-exclamation text-warning ml-5px"></i>
                          </div>
                        </OverlayTrigger>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {!loading && (
                <div className="flex-grow-1">
                  <div className="h-auto row h-lg-100">
                    <div className="col-lg-4 mb-15px mb-lg-0 h-100">
                      <div className="bg-white rounded h-100">
                        <div className="px-20px pt-20px">
                          <div className="d-flex justify-content-between">
                            <div>
                              <div className="fw-500 font-size-lg">
                                Sản phẩm / NVL
                              </div>
                              <div className="text-muted font-size-smm">
                                Tổng{' '}
                                {(dataResult.SP_NVL &&
                                  dataResult.SP_NVL.length) ||
                                  0}{' '}
                                sản phẩm, NVL
                              </div>
                            </div>
                            <div>
                              <div className="font-number fw-600 font-size-lg">
                                {PriceHelper.formatVNDPositive(
                                  sumTotalDS(dataResult.SP_NVL)
                                )}
                              </div>
                              <div className="text-center text-muted font-size-smm">
                                Tổng doanh số
                              </div>
                            </div>
                          </div>
                          <div className="mt-12px">
                            <div className="d-flex justify-content-between py-12px">
                              <div className="flex-1 text-muted2 text-uppercase font-size-smm fw-500 pr-20px pr-sm-15px">
                                Tên mặt hàng
                              </div>
                              <div className="text-center text-muted2 text-uppercase font-size-smm fw-500 w-40px pr-15px">
                                SL
                              </div>
                              <div className="text-muted2 text-uppercase font-size-smm fw-500 w-70px w-sm-100px text-end">
                                Doanh số
                              </div>
                              <div className="text-muted2 text-uppercase font-size-smm fw-500 w-100px w-sm-120px text-end">
                                Thực thu
                              </div>
                            </div>
                          </div>
                        </div>
                        <PerfectScrollbar
                          options={perfectScrollbarOptions}
                          className="scroll px-20px pb-20px"
                          style={{
                            position: 'relative',
                            maxHeight: heighElm.Box
                          }}
                        >
                          {dataResult.SP_NVL && dataResult.SP_NVL.length > 0 ? (
                            <Fragment>
                              {dataResult.SP_NVL.map((item, index) => (
                                <div
                                  className={`${
                                    dataResult.SP_NVL.length - 1 === index
                                      ? 'pt-12px'
                                      : 'py-12px'
                                  } border-top border-gray-200 d-flex`}
                                  key={index}
                                >
                                  <PickerView item={item} filters={filters}>
                                    {({ open }) => (
                                      <div
                                        className="flex-1 cursor-pointer font-size-md fw-500 pr-20px pr-sm-15px"
                                        onClick={open}
                                      >
                                        {item.ProdTitle}
                                      </div>
                                    )}
                                  </PickerView>
                                  <div className="text-center w-40px fw-500 pr-15px">
                                    {item.SumQTy}
                                  </div>
                                  <div className="fw-500 w-70px w-sm-100px text-end">
                                    {PriceHelper.formatVND(item.SumTopay)}
                                  </div>
                                  <div className="fw-500 w-100px w-sm-120px text-end">
                                    <OverlayTrigger
                                      rootClose
                                      trigger="click"
                                      key="bottom"
                                      placement="bottom"
                                      overlay={
                                        <Popover id={`popover-positioned-top`}>
                                          <Popover.Body className="p-0">
                                            <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                              <span>Chuyển khoản</span>
                                              <span>
                                                {PriceHelper.formatVNDPositive(
                                                  item.CK
                                                )}
                                              </span>
                                            </div>
                                            <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                              <span>Quẹt thẻ</span>
                                              <span>
                                                {PriceHelper.formatVNDPositive(
                                                  item.QT
                                                )}
                                              </span>
                                            </div>
                                            <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                              <span>Tiền mặt</span>
                                              <span>
                                                {PriceHelper.formatVNDPositive(
                                                  item.TM
                                                )}
                                              </span>
                                            </div>
                                          </Popover.Body>
                                        </Popover>
                                      }
                                    >
                                      <div>
                                        <div className="d-flex justify-content-end align-items-center">
                                          <span>
                                            {PriceHelper.formatVNDPositive(
                                              item.CK + item.QT + item.TM
                                            )}
                                          </span>
                                          <i className="cursor-pointer fa-solid fa-circle-exclamation text-warning ml-5px"></i>
                                        </div>
                                      </div>
                                    </OverlayTrigger>
                                    {Number(item.Vi + item.TT) > 0 && (
                                      <OverlayTrigger
                                        rootClose
                                        trigger="click"
                                        key="bottom"
                                        placement="bottom"
                                        overlay={
                                          <Popover
                                            id={`popover-positioned-top`}
                                          >
                                            <Popover.Body className="p-0">
                                              <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                                <span>Ví</span>
                                                <span>
                                                  {PriceHelper.formatVNDPositive(
                                                    item.Vi
                                                  )}
                                                </span>
                                              </div>
                                              <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                                <span>Thẻ tiền</span>
                                                <span>
                                                  {PriceHelper.formatVNDPositive(
                                                    item.TT
                                                  )}
                                                </span>
                                              </div>
                                            </Popover.Body>
                                          </Popover>
                                        }
                                      >
                                        <div>
                                          <div className="d-flex justify-content-end align-items-center">
                                            <span>
                                              {PriceHelper.formatVNDPositive(
                                                item.Vi + item.TT
                                              )}
                                            </span>
                                            <i className="cursor-pointer fa-solid fa-circle-exclamation text-warning ml-5px"></i>
                                          </div>
                                        </div>
                                      </OverlayTrigger>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </Fragment>
                          ) : (
                            <ElementEmpty />
                          )}
                        </PerfectScrollbar>
                      </div>
                    </div>
                    <div className="col-lg-4 mb-15px mb-lg-0 h-100">
                      <div className="bg-white rounded h-100">
                        <div className="px-20px pt-20px">
                          <div className="d-flex justify-content-between">
                            <div>
                              <div className="fw-500 font-size-lg">
                                Dịch vụ / PP
                              </div>
                              <div className="text-muted font-size-smm">
                                Tổng{' '}
                                {(dataResult.DV_PP &&
                                  dataResult.DV_PP.length) ||
                                  0}{' '}
                                dịch vụ, Phụ phí
                              </div>
                            </div>
                            <div>
                              <div className="font-number fw-600 font-size-lg">
                                {PriceHelper.formatVNDPositive(
                                  sumTotalDS(dataResult.DV_PP)
                                )}
                              </div>
                              <div className="text-center text-muted font-size-smm">
                                Tổng doanh số
                              </div>
                            </div>
                          </div>
                          <div className="mt-12px">
                            <div className="d-flex justify-content-between py-12px">
                              <div className="flex-1 text-muted2 text-uppercase font-size-smm fw-500 pr-20px pr-sm-15px">
                                Tên mặt hàng
                              </div>
                              <div className="text-center text-muted2 text-uppercase font-size-smm fw-500 w-40px pr-15px">
                                SL
                              </div>
                              <div className="text-muted2 text-uppercase font-size-smm fw-500 w-70px w-sm-100px text-end">
                                Doanh số
                              </div>
                              <div className="text-muted2 text-uppercase font-size-smm fw-500 w-100px w-sm-120px text-end">
                                Thực thu
                              </div>
                            </div>
                          </div>
                        </div>
                        <PerfectScrollbar
                          options={perfectScrollbarOptions}
                          className="scroll px-20px pb-20px"
                          style={{
                            position: 'relative',
                            maxHeight: heighElm.Box
                          }}
                        >
                          {dataResult.DV_PP.length > 0 ? (
                            <Fragment>
                              {dataResult.DV_PP &&
                                dataResult.DV_PP.map((item, index) => (
                                  <div
                                    className={`${
                                      dataResult.DV_PP.length - 1 === index
                                        ? 'pt-12px'
                                        : 'py-12px'
                                    } border-top border-gray-200 d-flex`}
                                    key={index}
                                  >
                                    <PickerView item={item} filters={filters}>
                                      {({ open }) => (
                                        <div
                                          className="flex-1 cursor-pointer font-size-md fw-500 pr-20px pr-sm-15px"
                                          onClick={open}
                                        >
                                          {item.ProdTitle}
                                        </div>
                                      )}
                                    </PickerView>
                                    <div className="text-center w-40px fw-500 pr-15px">
                                      {item.SumQTy}
                                    </div>
                                    <div className="fw-500 w-100px text-end">
                                      {PriceHelper.formatVND(item.SumTopay)}
                                    </div>
                                    <div className="fw-500 w-100px w-sm-120px text-end">
                                      <OverlayTrigger
                                        rootClose
                                        trigger="click"
                                        key="bottom"
                                        placement="bottom"
                                        overlay={
                                          <Popover
                                            id={`popover-positioned-top`}
                                          >
                                            <Popover.Body className="p-0">
                                              <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                                <span>Chuyển khoản</span>
                                                <span>
                                                  {PriceHelper.formatVNDPositive(
                                                    item.CK
                                                  )}
                                                </span>
                                              </div>
                                              <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                                <span>Quẹt thẻ</span>
                                                <span>
                                                  {PriceHelper.formatVNDPositive(
                                                    item.QT
                                                  )}
                                                </span>
                                              </div>
                                              <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                                <span>Tiền mặt</span>
                                                <span>
                                                  {PriceHelper.formatVNDPositive(
                                                    item.TM
                                                  )}
                                                </span>
                                              </div>
                                            </Popover.Body>
                                          </Popover>
                                        }
                                      >
                                        <div>
                                          <div className="d-flex justify-content-end align-items-center">
                                            <span>
                                              {PriceHelper.formatVNDPositive(
                                                item.CK + item.QT + item.TM
                                              )}
                                            </span>
                                            <i className="cursor-pointer fa-solid fa-circle-exclamation text-warning ml-5px"></i>
                                          </div>
                                        </div>
                                      </OverlayTrigger>
                                      {Number(item.Vi + item.TT) > 0 && (
                                        <OverlayTrigger
                                          rootClose
                                          trigger="click"
                                          key="bottom"
                                          placement="bottom"
                                          overlay={
                                            <Popover
                                              id={`popover-positioned-top`}
                                            >
                                              <Popover.Body className="p-0">
                                                <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                                  <span>Ví</span>
                                                  <span>
                                                    {PriceHelper.formatVNDPositive(
                                                      item.Vi
                                                    )}
                                                  </span>
                                                </div>
                                                <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                                  <span>Thẻ tiền</span>
                                                  <span>
                                                    {PriceHelper.formatVNDPositive(
                                                      item.TT
                                                    )}
                                                  </span>
                                                </div>
                                              </Popover.Body>
                                            </Popover>
                                          }
                                        >
                                          <div>
                                            <div className="d-flex justify-content-end align-items-center">
                                              <span>
                                                {PriceHelper.formatVNDPositive(
                                                  item.Vi + item.TT
                                                )}
                                              </span>
                                              <i className="cursor-pointer fa-solid fa-circle-exclamation text-warning ml-5px"></i>
                                            </div>
                                          </div>
                                        </OverlayTrigger>
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </Fragment>
                          ) : (
                            <ElementEmpty />
                          )}
                        </PerfectScrollbar>
                      </div>
                    </div>
                    <div className="col-lg-4 h-100">
                      <div className="bg-white rounded h-100">
                        <div className="px-20px pt-20px">
                          <div className="d-flex justify-content-between">
                            <div>
                              <div className="fw-500 font-size-lg">
                                Thẻ tiền
                              </div>
                              <div className="text-muted font-size-smm">
                                Tổng{' '}
                                {(dataResult.TT && dataResult.TT.length) || 0}{' '}
                                thẻ tiền
                              </div>
                            </div>
                            <div>
                              <div className="font-number fw-600 font-size-lg">
                                {PriceHelper.formatVNDPositive(
                                  sumTotalDS(dataResult.TT)
                                )}
                              </div>
                              <div className="text-center text-muted font-size-smm">
                                Tổng doanh số
                              </div>
                            </div>
                          </div>
                          <div className="mt-12px">
                            <div className="d-flex justify-content-between py-12px">
                              <div className="flex-1 text-muted2 text-uppercase font-size-smm fw-500 pr-20px pr-sm-15px">
                                Tên mặt hàng
                              </div>
                              <div className="text-center text-muted2 text-uppercase font-size-smm fw-500 w-40px pr-15px">
                                SL
                              </div>
                              <div className="text-muted2 text-uppercase font-size-smm fw-500 w-70px w-sm-100px text-end">
                                Doanh số
                              </div>
                              <div className="text-muted2 text-uppercase font-size-smm fw-500 w-100px w-sm-120px text-end">
                                Thực thu
                              </div>
                            </div>
                          </div>
                        </div>
                        <PerfectScrollbar
                          options={perfectScrollbarOptions}
                          className="scroll px-20px pb-20px"
                          style={{
                            position: 'relative',
                            maxHeight: heighElm.Box
                          }}
                        >
                          {dataResult.TT && dataResult.TT.length > 0 ? (
                            <Fragment>
                              {dataResult.TT.map((item, index) => (
                                <div
                                  className={`${
                                    dataResult.TT.length - 1 === index
                                      ? 'pt-12px'
                                      : 'py-12px'
                                  } border-top border-gray-200 d-flex`}
                                  key={index}
                                >
                                  <PickerView item={item} filters={filters}>
                                    {({ open }) => (
                                      <div
                                        className="flex-1 cursor-pointer font-size-md fw-500 pr-20px pr-sm-15px"
                                        onClick={open}
                                      >
                                        {item.ProdTitle}
                                      </div>
                                    )}
                                  </PickerView>
                                  <div className="text-center w-40px fw-500 pr-15px">
                                    {item.SumQTy}
                                  </div>
                                  <div className="fw-500 w-100px text-end">
                                    {PriceHelper.formatVND(item.SumTopay)}
                                  </div>
                                  <div className="fw-500 w-100px w-sm-120px text-end">
                                    <OverlayTrigger
                                      rootClose
                                      trigger="click"
                                      key="bottom"
                                      placement="bottom"
                                      overlay={
                                        <Popover id={`popover-positioned-top`}>
                                          <Popover.Body className="p-0">
                                            <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                              <span>Chuyển khoản</span>
                                              <span>
                                                {PriceHelper.formatVNDPositive(
                                                  item.CK
                                                )}
                                              </span>
                                            </div>
                                            <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                              <span>Quẹt thẻ</span>
                                              <span>
                                                {PriceHelper.formatVNDPositive(
                                                  item.QT
                                                )}
                                              </span>
                                            </div>
                                            <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                              <span>Tiền mặt</span>
                                              <span>
                                                {PriceHelper.formatVNDPositive(
                                                  item.TM
                                                )}
                                              </span>
                                            </div>
                                          </Popover.Body>
                                        </Popover>
                                      }
                                    >
                                      <div>
                                        <div className="d-flex justify-content-end align-items-center">
                                          <span>
                                            {PriceHelper.formatVNDPositive(
                                              item.CK + item.QT + item.TM
                                            )}
                                          </span>
                                          <i className="cursor-pointer fa-solid fa-circle-exclamation text-warning ml-5px"></i>
                                        </div>
                                      </div>
                                    </OverlayTrigger>
                                    {Number(item.Vi + item.TT) > 0 && (
                                      <OverlayTrigger
                                        rootClose
                                        trigger="click"
                                        key="bottom"
                                        placement="bottom"
                                        overlay={
                                          <Popover
                                            id={`popover-positioned-top`}
                                          >
                                            <Popover.Body className="p-0">
                                              <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                                <span>Ví</span>
                                                <span>
                                                  {PriceHelper.formatVNDPositive(
                                                    item.Vi
                                                  )}
                                                </span>
                                              </div>
                                              <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                                <span>Thẻ tiền</span>
                                                <span>
                                                  {PriceHelper.formatVNDPositive(
                                                    item.TT
                                                  )}
                                                </span>
                                              </div>
                                            </Popover.Body>
                                          </Popover>
                                        }
                                      >
                                        <div>
                                          <div className="d-flex justify-content-end align-items-center">
                                            <span>
                                              {PriceHelper.formatVNDPositive(
                                                item.Vi + item.TT
                                              )}
                                            </span>
                                            <i className="cursor-pointer fa-solid fa-circle-exclamation text-warning ml-5px"></i>
                                          </div>
                                        </div>
                                      </OverlayTrigger>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </Fragment>
                          ) : (
                            <ElementEmpty />
                          )}
                        </PerfectScrollbar>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
      {View === 1 && (
        <div>
          <ColumnChart dataSource={ChartSales2?.data || []} />
          <ColumnChart
            gridLeft={100}
            dataSource={ChartSales2?.data || []}
            valueKey="ToPay"
            Title="So sánh doanh số"
          />

          <div className="bg-white rounded">
            <div className="border-gray-200 px-20px py-15px border-bottom d-flex align-items-center justify-content-between">
              <div className="fw-500 font-size-lg">Danh sách mặt hàng</div>
            </div>
            <div className="p-20px">
              <div className="h-[500px] relative">
                <div className="overflow-x-auto border border-[#eee] relative h-full">
                  <table
                    className="min-w-full border-separate border-spacing-0"
                    id="tb-2"
                  >
                    <thead className="sticky top-0 bg-[#f8f8f8] z-[10] border-b border-b-[#eee]">
                      <tr>
                        <th
                          rowSpan={2}
                          className="p-3 font-semibold text-left min-w-[200px] max-w-[200px] lg:min-w-[200px] lg:max-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 font-number text-sm uppercase h-[50px] lg:sticky lg:top-0 lg:left-0 bg-[#f8f8f8]"
                        >
                          Danh mục
                        </th>
                        <th
                          rowSpan={2}
                          className="uppercase p-3 font-semibold text-left min-w-[230px] max-w-[230px] lg:min-w-[300px] lg:max-w-[300px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm lg:sticky lg:top-0 lg:left-[120px] bg-[#f8f8f8]"
                        >
                          Mặt hàng
                        </th>
                        {data?.BlockTimes?.map((item, index) => (
                          <th
                            key={index}
                            colSpan={2}
                            className="uppercase p-3 font-semibold min-w-[200px] max-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm"
                          >
                            <div className="flex justify-center gap-2">
                              {moment(item.start, 'YYYY-MM-DD').format(
                                'DD/MM/YYYY'
                              )}
                              <span>-</span>
                              {moment(item.end, 'YYYY-MM-DD').format(
                                'DD/MM/YYYY'
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                      <tr>
                        {data?.BlockTimes?.map((_, index) => (
                          <Fragment key={index}>
                            <th className="uppercase p-3 font-semibold text-center lg:min-w-[180px] lg:max-w-[180px] min-w-[120px] max-w-[120px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 min-h-[50px] font-number text-sm">
                              Số lượng
                            </th>
                            <th className="uppercase p-3 font-semibold text-center lg:min-w-[180px] lg:max-w-[180px] min-w-[120px] max-w-[120px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 min-h-[50px] font-number text-sm">
                              Doanh số
                            </th>
                          </Fragment>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data?.Items &&
                        data?.Items?.map((item, index) => (
                          <Fragment key={index}>
                            {item?.Items?.map((prod, i) => (
                              <tr key={i}>
                                <td
                                  className={clsx(
                                    'p-3 min-w-[200px] max-w-[200px] lg:min-w-[200px] lg:max-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 lg:sticky lg:top-0 lg:left-0'
                                  )}
                                >
                                  {!prod.isTotal &&
                                    !prod?.isSum &&
                                    item?.TypeTitle}
                                </td>
                                <td
                                  className={clsx(
                                    'p-3 min-w-[230px] max-w-[230px] lg:min-w-[300px] lg:max-w-[300px]  border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 lg:sticky lg:top-0 lg:left-[120px]',
                                    prod?.isSum &&
                                      'bg-[#f2e783] font-semibold uppercase',
                                    prod?.isTotal &&
                                      'bg-danger text-white font-semibold uppercase'
                                  )}
                                >
                                  {prod?.ProdTitle}
                                  {prod?.isTotal ? (
                                    <span className="pl-1.5">
                                      ({data?.TotalAll?.Qty || 0} /{' '}
                                      {PriceHelper.formatVND(
                                        data?.TotalAll?.actualAmount || 0
                                      )}
                                      )
                                    </span>
                                  ) : (
                                    <></>
                                  )}
                                </td>
                                {prod?.BlockTimes?.map((block, idx) => (
                                  <Fragment key={idx}>
                                    <td
                                      className={clsx(
                                        'p-3 lg:min-w-[180px] lg:max-w-[180px] min-w-[120px] max-w-[120px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0',
                                        prod?.isSum &&
                                          'bg-[#f2e783] uppercase font-bold',
                                        prod?.isTotal &&
                                          'bg-danger text-white uppercase font-bold'
                                      )}
                                    >
                                      {block?.Qty || 0}
                                    </td>
                                    <td
                                      className={clsx(
                                        'p-3 lg:min-w-[180px] lg:max-w-[180px] min-w-[120px] max-w-[120px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0',
                                        prod?.isSum &&
                                          'bg-[#f2e783] uppercase font-bold',
                                        prod?.isTotal &&
                                          'bg-danger text-white uppercase font-bold'
                                      )}
                                    >
                                      {PriceHelper.formatVND(
                                        block?.actualAmount
                                      )}
                                    </td>
                                  </Fragment>
                                ))}
                              </tr>
                            ))}
                          </Fragment>
                        ))}
                      {(!data?.Items || data?.Items.length === 0) && (
                        <tr>
                          <td className="p-4">Không có dữ liệu.</td>
                        </tr>
                      )}
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
      )}
    </div>
  )
}

export default SaleDetails
