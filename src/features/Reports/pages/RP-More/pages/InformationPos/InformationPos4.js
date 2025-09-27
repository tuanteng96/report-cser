import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import _ from 'lodash'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useSelector } from 'react-redux'
import reportsApi from 'src/api/reports.api'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import { DevHelpers } from 'src/helpers/DevHelpers'
import DropdownLink from './compoents/DropdownLink'
import FilterInformationPos4 from 'src/components/Filter/FilterInformationPos4'
import ReactECharts from 'echarts-for-react'

function round(num, decimals = 1) {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

const RenderTable = ({ item, filters }) => {
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
          name: filters?.Criterias?.label || '',
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
    if (item.Items && item.Items.length > 0) {
      newOtps.xAxis.data = item.Items.map(x =>
        moment(x.CreateDate).format('DD-MM-YYYY')
      )
      newOtps.series[0].data = item.Items.map(x => Number(x['Value'] || 0))
    }
    setOptions(newOtps)
  }, [item])

  let ValueType = ''
  let Value = ''

  if (item.Items.length > 1) {
    Value = round(
      Number(item.Items[item.Items.length - 1]['Value']) -
        Number(item.Items[0]['Value']),
      1
    )

    ValueType =
      Value >= 0 ? `Tăng ${Math.abs(Value)}` : `Giảm ${Math.abs(Value)}`
  }

  return (
    <>
      <div className="border-gray-200 px-20px py-15px border-bottom d-flex align-items-center justify-content-between">
        <div className="flex gap-1 fw-500 font-size-lg">
          {item.FullName} ({item.Items.length}b)
          {ValueType && <span>({ValueType})</span>}
          {item.Items.length > 1 && (
            <span>
              ({item.Items[0].Value} / {item.Items[item.Items.length - 1].Value}
              )
            </span>
          )}
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

function InformationPos4(props) {
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

  useEffect(() => {
    if (Criterias.data && Criterias?.data?.data?.length > 0) {
      setFilters(prevState => ({
        ...prevState,
        Criterias: Criterias?.data?.data[0]
      }))
    }
  }, [Criterias.data])

  const {
    data,
    fetchNextPage,
    hasNextPage,
    refetch,
    isLoading,
    isRefetching,
    fetchStatus,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['InformationPos1', filters],
    queryFn: async ({ pageParam = 1 }) => {
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

      let { data } = await reportsApi.getMemberCustome(newFilters)

      let rs = []

      if (data && data?.lst?.length > 0) {
        for (let item of data?.lst) {
          let newItems = {
            ...item,
            Items: item.Items.sort((a, b) =>
              moment(a.CreateDate).diff(moment(b.CreateDate))
            ).map(k => {
              let newObj = { ...k, Value: 0 }
              if (k[Key]) {
                let parse = JSON.parse(k[Key])

                let index = parse.findIndex(
                  x => x.title === filters.Criterias?.value
                )
                if (index > -1) newObj.Value = Number(parse[index].value)
              }
              return newObj
            })
          }
          rs.push(newItems)
        }
      }
      return data ? { ...data, lst: rs } : null
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.Pi === lastPage.pCount ? undefined : lastPage.Pi + 1
    },
    enabled: Boolean(Criterias?.data && filters.Criterias)
  })

  const Lists = data?.pages ? data?.pages.flatMap(page => page?.lst || []) : []

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
      <FilterInformationPos4
        Criterias={Criterias}
        show={isFilter}
        filters={filters}
        onHide={onHideFilter}
        onSubmit={onFilter}
        onRefresh={refetch}
        loading={isLoading || isRefetching}
      />
      <div
        className="overflow-auto h-100 px-main py-main"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
        id="scrollableDiv"
      >
        <InfiniteScroll
          dataLength={Lists?.length}
          next={fetchNextPage}
          hasMore={!!hasNextPage}
          loader={
            isFetchingNextPage && (
              <p className="py-4 text-center">Đang tải thêm...</p>
            )
          }
          scrollableTarget="scrollableDiv"
        >
          <>
            {isLoading && <div>Đang tải ...</div>}
            {!isLoading && (
              <>
                {Lists &&
                  Lists.map((item, index) => (
                    <div
                      className="mb-20px last:!mb-0 bg-white rounded"
                      key={index}
                    >
                      <RenderTable item={item} filters={filters} />
                    </div>
                  ))}
                {(!Lists || Lists.length === 0) && <div>Không có dữ liệu</div>}
              </>
            )}
          </>
        </InfiniteScroll>
      </div>
    </div>
  )
}

export default InformationPos4
