import { uuidv4 } from '@nikitababko/id-generator'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import _ from 'lodash'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import reportsApi from 'src/api/reports.api'
import FilterInformationPos1 from 'src/components/Filter/FilterInformationPos1'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import { DevHelpers } from 'src/helpers/DevHelpers'
import ReactECharts from 'echarts-for-react'
import DropdownLink from './compoents/DropdownLink'

function round(num, decimals = 1) {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

const RenderTable = ({ item }) => {
  let [options, setOptions] = useState({
    title: { show: false },
    tooltip: { trigger: 'axis' },
    grid: {
      left: 60, // giữ khoảng trống cho trục Y
      right: 15,
      bottom: 50,
      top: 20
    },
    xAxis: {
      type: 'category',
      data: [] // Ngày
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: value => `${value}` // ➕ Hậu tố "ml"
      }
    },
    dataZoom: [
      {
        type: 'slider',
        xAxisIndex: 0,
        startValue: 0,
        endValue: 12, // chỉ hiển thị 50% ban đầu
        show: true,
        zoomLock: true
      },
      {
        type: 'inside',
        xAxisIndex: 0,
        startValue: 0,
        endValue: 12,
        zoomLock: true
      }
    ],
    series: [
      {
        name: 'Tổng',
        type: 'bar',
        stack: 'total',
        data: [], // data
        label: {
          show: true,
          position: 'inside' // hiển thị phía trên cột
        },
        itemStyle: {
          color: 'rgb(255,183,197)'
        },
        emphasis: {
          focus: 'none',
          itemStyle: {
            opacity: 1,
            color: 'rgb(255,183,197)'
          }
        }
      }
    ]
  })

  useEffect(() => {
    let newOtps = {
      title: { show: false },
      tooltip: { trigger: 'axis' },
      grid: {
        left: 60, // giữ khoảng trống cho trục Y
        right: 15,
        bottom: 50,
        top: 20
      },
      xAxis: {
        type: 'category',
        data: [] // Ngày
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: value => `${value}` // ➕ Hậu tố "ml"
        }
      },
      dataZoom: [
        {
          type: 'slider',
          xAxisIndex: 0,
          startValue: 0,
          endValue: 12, // chỉ hiển thị 50% ban đầu
          show: false,
          zoomLock: true
        },
        {
          type: 'inside',
          xAxisIndex: 0,
          startValue: 0,
          endValue: 12,
          zoomLock: true
        }
      ],
      series: [
        {
          name: item?.title || '',
          type: 'bar',
          stack: 'total',
          data: [], // data
          label: {
            show: true,
            position: 'inside' // hiển thị phía trên cột
          },
          itemStyle: {
            color: 'rgb(255,183,197)'
          },
          emphasis: {
            focus: 'none',
            itemStyle: {
              opacity: 1,
              color: 'rgb(255,183,197)'
            }
          }
        }
      ]
    }
    if (item.Dates && item.Dates.length > 0) {
      newOtps.xAxis.data = item.Dates.map(x =>
        moment(x.CreateDate).format('DD-MM-YYYY')
      )
      newOtps.series[0].data = item.Dates.map(x => Number(x[item.title] || 0))
    }
    setOptions(newOtps)
  }, [item])

  return (
    <>
      <div className="border-gray-200 px-20px py-15px border-bottom d-flex align-items-center justify-content-between">
        <div className="fw-500 font-size-lg">
          {item.FullName} - {item.title}
        </div>
      </div>
      <div className="p-20px">
        {options.series[0].data.length === 0 && (
          <div
            className="items-center justify-center d-flex"
            style={{ height: '500px' }}
          >
            Không có dữ liệu
          </div>
        )}
        {options.series[0].data.length > 0 && (
          <ReactECharts option={options} style={{ height: '500px' }} />
        )}
      </div>
    </>
  )
}

function InformationPos2(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    MemberID: '',
    Pi: 1,
    Ps: 5,
    Criterias: null,
    FromDate: moment().startOf('month').toDate(),
    ToDate: moment().endOf('month').toDate()
  })
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)

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

  const Criterias = useQuery({
    queryKey: ['CriteriasList'],
    queryFn: async () => {
      const { data } = await axios.get(
        (DevHelpers.isDevelopment()
          ? process.env.REACT_APP_API_URL
          : window.API || '') +
          `/brand/global/json-information.json?` +
          new Date().getTime()
      )
      let rs = []
      if (data?.configs && data?.configs.length > 0) {
        rs = data?.configs
          .filter(x => x.filter)
          .map(x => ({
            ...x,
            label: x.title,
            value: x.title
          }))
      }
      return (
        {
          data: rs,
          key: data?.key || ''
        } || null
      )
    }
  })

  const { data, refetch, isLoading, fetchStatus } = useQuery({
    queryKey: ['InformationPos2', filters],
    queryFn: async ({ pageParam = 1 }) => {
      let CriteriasList =
        filters.Criterias && filters.Criterias.length > 0
          ? filters.Criterias
          : Criterias?.data?.data || []
      let newFilters = {
        StockID: filters.StockID,
        MemberID: filters.MemberID?.value || '',
        FromDate: filters.FromDate
          ? moment(filters.FromDate).format('YYYY-MM-DD')
          : null,
        ToDate: filters.ToDate
          ? moment(filters.ToDate).format('YYYY-MM-DD')
          : null,
        Pi: pageParam,
        Ps: 5
      }

      let Key = Criterias?.data?.key || 'Data1'

      if (!filters.MemberID?.value) return []

      let { data } = await reportsApi.getMemberCustome(newFilters)

      let rs = []

      if (data && data?.lst?.length > 0) {
        for (let item of data?.lst) {
          let newItems = {
            ...item,
            List: CriteriasList
              ? CriteriasList.filter(x => x.filter).map(x => {
                  let newObj = {
                    ...x,
                    Ids: uuidv4(),
                    FullName: filters.MemberID?.label || '',
                    Dates: item.Items
                      ? item.Items.sort((a, b) =>
                          moment(a.CreateDate).diff(moment(b.CreateDate))
                        ).map(o => {
                          let obj = {
                            ...o
                          }
                          let parseData = obj[Key] ? JSON.parse(obj[Key]) : []
                          let index = parseData.findIndex(
                            k => x.title === k.title
                          )
                          if (index > -1) {
                            obj[x.label] = parseData[index]?.value
                              ? Number(parseData[index].value)
                              : 0
                          } else {
                            obj[x.label] = 0
                          }
                          return obj
                        })
                      : [],
                    ValueTypeText: '',
                    ValueType: ''
                  }

                  if (
                    newObj.Dates &&
                    newObj.Dates.length > 1 &&
                    newObj.Dates.some(k => Number(k[x.title]) > 0)
                  ) {
                    let Value = round(
                      Number(newObj.Dates[newObj.Dates.length - 1][x.title]) -
                        Number(newObj.Dates[0][x.title]),
                      1
                    )
                    newObj.ValueType = Value
                    newObj.ValueTypeText =
                      Value >= 0 ? `Tăng (${Value})` : `Giảm (${Value})`
                  }

                  return newObj
                })
              : []
          }
          rs.push(newItems)
        }
      }

      return rs && rs.length > 0
        ? rs[0].List
        : CriteriasList.filter(x => x.filter).map(x => ({
            ...x,
            Dates: [],
            Ids: uuidv4(),
            FullName: filters.MemberID?.label || ''
          }))
    },
    enabled: Boolean(Criterias?.data)
  })

  useEffect(() => {
    if (isFilter && fetchStatus === 'idle') setIsFilter(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchStatus])

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
      setFilters(prevState => ({ ...prevState, ...values }))
    }
  }

  return (
    <div className="h-100 d-flex flex-column">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex items-center flex-1">
          <DropdownLink />
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
      <FilterInformationPos1
        Criterias={Criterias}
        show={isFilter}
        filters={filters}
        onHide={onHideFilter}
        onSubmit={onFilter}
        onRefresh={refetch}
        loading={isLoading}
        limitDateType="THEO_THANG"
        limitEndMonth={true}
      />
      <div
        className="overflow-auto h-100 px-main py-main"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {filters.MemberID?.value ? (
          <>
            {isLoading && <div>Đang tải ...</div>}
            {!isLoading && (
              <>
                {data &&
                  data.map((item, index) => (
                    <div
                      className="mb-20px last:!mb-0 bg-white rounded"
                      key={index}
                    >
                      <RenderTable
                        item={item}
                        Lists={item.List}
                        filters={filters}
                      />
                    </div>
                  ))}
              </>
            )}
          </>
        ) : (
          <div>Bạn vui lòng chọn khách hàng ở bộ lọc.</div>
        )}
      </div>
    </div>
  )
}

export default InformationPos2
