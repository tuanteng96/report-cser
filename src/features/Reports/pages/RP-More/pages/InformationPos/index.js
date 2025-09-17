import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import _ from 'lodash'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import ReactApexChart from 'react-apexcharts'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useSelector } from 'react-redux'
import reportsApi from 'src/api/reports.api'
import FilterInformationPos from 'src/components/Filter/FilterInformationPos'
import LoadingChart from 'src/components/Loading/LoadingChart'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import { DevHelpers } from 'src/helpers/DevHelpers'

function InformationPos(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    MemberID: '',
    Pi: 1,
    Ps: 10,
    Criterias: null,
    FromDate: new Date(),
    ToDate: new Date()
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

  const {
    data,
    fetchNextPage,
    hasNextPage,
    refetch,
    isLoading,
    isRefetching,
    fetchStatus
  } = useInfiniteQuery({
    queryKey: ['InformationPos'],
    queryFn: async ({ pageParam = 1 }) => {
      let CriteriasList =
        filters.Criterias && filters.Criterias.length > 0
          ? filters.Criterias
          : Criterias?.data?.data || []
      let newFilters = {
        StockID: filters.StockID,
        MemberID:
          filters.MemberID && filters.MemberID.length > 0
            ? filters.MemberID.map(x => x.value).toString()
            : '',
        FromDate: filters.FromDate
          ? moment(filters.FromDate).format('YYYY-MM-DD')
          : null,
        ToDate: filters.ToDate
          ? moment(filters.ToDate).format('YYYY-MM-DD')
          : null,
        Pi: pageParam,
        Ps: 20
      }
      let { data } = await reportsApi.getMemberCustome(newFilters)

      let rs = []
      if (data && data?.lst?.length > 0) {
        for (let item of data?.lst) {
          let colors = [
            '#C62828',
            '#1E88E5',
            '#43A047',
            '#FDD835',
            '#8E24AA',
            '#F57C00',
            '#AD1457',
            '#039BE5',
            '#7CB342',
            '#FFEE58',
            '#6A1B9A',
            '#FB8C00',
            '#D81B60',
            '#00ACC1',
            '#9CCC65',
            '#FBC02D',
            '#512DA8',
            '#EF6C00',
            '#E53935',
            '#26C6DA',
            '#AED581',
            '#FFF176',
            '#9575CD',
            '#F4511E',
            '#B71C1C',
            '#2196F3',
            '#66BB6A',
            '#FFEB3B',
            '#7E57C2',
            '#FF7043',
            '#880E4F',
            '#1976D2',
            '#81C784',
            '#FFD54F',
            '#5E35B1',
            '#FF8A65'
          ]
          let obj = {
            series: [
              //   {
              //     name: 'High - 2013',
              //     data: [28, 29, 33, 36, 32, 32, 33]
              //   },
              //   {
              //     name: 'Low - 2013',
              //     data: [12, 11, 14, 18, 17, 13, 13]
              //   }
            ],
            options: {
              chart: {
                height: 450,
                type: 'line',
                dropShadow: {
                  enabled: true,
                  color: '#000',
                  top: 18,
                  left: 7,
                  blur: 10,
                  opacity: 0.5
                },
                zoom: {
                  enabled: false
                },
                toolbar: {
                  show: false
                }
              },
              colors: [],
              dataLabels: {
                enabled: true
              },
              stroke: {
                curve: 'smooth'
              },
              title: {
                text: item.FullName + ' - #' + item.MemberID,
                align: 'left'
              },
              grid: {
                borderColor: '#e7e7e7',
                row: {
                  colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                  opacity: 0.5
                }
              },
              markers: {
                size: 1
              },
              xaxis: {
                categories:
                  item.Items && item.Items.length > 0
                    ? item.Items.map(json => {
                        return moment(json.CreateDate).format('DD-MM-YYYY')
                      })
                    : [],
                title: {
                  text: ''
                }
              },
              yaxis: {
                title: {
                  text: ''
                },
                min: 0,
                max: 0
              },
              legend: {
                position: 'top',
                horizontalAlign: 'right',
                floating: true,
                offsetY: -25,
                offsetX: -5
              }
            }
          }

          for (let Criteria of CriteriasList) {
            obj.series.push({
              name: Criteria.title,
              data:
                item.Items && item.Items.length > 0
                  ? item.Items.map(json => {
                      let Value = 0
                      let newJSON = json[Criterias?.data?.key]
                        ? JSON.parse(json[Criterias?.data?.key])
                        : null
                      if (newJSON) {
                        let index = newJSON.findIndex(
                          x => x.title === Criteria.title
                        )

                        if (index > -1) Value = Number(newJSON[index].value)
                      }
                      return Value
                    })
                  : []
            })
          }

          let max = Math.max(
            ...obj.series.map(x => {
              return Math.max(...x.data)
            })
          )

          obj.options.colors = colors.slice(0, obj.series.length)
          obj.options.yaxis.max = max
          rs.push(obj)
        }
      }
      return data ? { ...data, lst: rs } : null
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.Pi === lastPage.pCount ? undefined : lastPage.Pi + 1
    },
    enabled: Boolean(Criterias?.data)
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
        <div className="flex-1">
          <span className="text-uppercase font-size-xl fw-600">
            Báo cáo thông tin khách hàng
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
      <FilterInformationPos
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
          loader={<p className="py-4 text-center">Đang tải thêm...</p>}
          scrollableTarget="scrollableDiv"
        >
          <>
            {isLoading && (
              <div
                className="relative bg-white rounded px-15px pt-15px"
                style={{
                  height: '450px'
                }}
              >
                <LoadingChart />
              </div>
            )}
            {!isLoading && (
              <>
                {Lists &&
                  Lists.map((item, index) => (
                    <div
                      className="bg-white rounded px-15px pt-15px"
                      key={index}
                    >
                      <ReactApexChart
                        options={item.options}
                        series={item.series}
                        type="line"
                        height={450}
                      />
                    </div>
                  ))}
              </>
            )}
          </>
        </InfiniteScroll>
      </div>
    </div>
  )
}

export default InformationPos
