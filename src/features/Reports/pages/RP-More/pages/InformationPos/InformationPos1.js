import { uuidv4 } from '@nikitababko/id-generator'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import clsx from 'clsx'
import _ from 'lodash'
import moment from 'moment'
import React, { useEffect, useMemo, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useSelector } from 'react-redux'
import reportsApi from 'src/api/reports.api'
import FilterInformationPos1 from 'src/components/Filter/FilterInformationPos1'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import { DevHelpers } from 'src/helpers/DevHelpers'
import DropdownLink from './compoents/DropdownLink'

function round(num, decimals = 1) {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

const RenderTable = ({ Lists = [], item, filters }) => {
  let [isLoading, setIsLoading] = useState(false)

  const columns = useMemo(() => {
    let newColumns = [
      {
        key: 'title',
        title: 'Tiêu chí',
        dataKey: 'title',
        width: 300,
        sortable: false,
        mobileOptions: {
          visible: true
        },
        frozen: 'left'
      }
    ]
    if (Lists && Lists.length > 0) {
      for (let [i, item] of Lists[0].Dates.entries()) {
        newColumns.push({
          key: moment(item.CreateDate).format('DD-MM-YYYY'),
          title: moment(item.CreateDate).format('DD-MM-YYYY'),
          dataKey: moment(item.CreateDate).format('DD-MM-YYYY'),
          cellRenderer: ({ rowData }) => {
            return (
              <>
                {rowData.Dates[i][rowData.title] === ''
                  ? ''
                  : rowData.Dates[i][rowData.title] || '0'}
              </>
            )
          },
          width: 150,
          sortable: false,
          mobileOptions: {
            visible: true
          }
        })
      }
    }
    newColumns.push({
      key: 'ValueTypeText',
      title: 'Tăng/Giảm',
      dataKey: 'ValueTypeText',
      width: 160,
      sortable: false,
      mobileOptions: {
        visible: true
      },
      frozen: 'right'
    })

    return newColumns
  }, [Lists])

  const onExport = () => {
    setIsLoading(true)

    window?.EzsExportNoFechExcel({
      Title: `${item.FullName}`,
      filters,
      Url: '/khac/bao-cao-thong-tin-pos-1',
      Data: Lists,
      hideLoading: () => {
        setIsLoading(false)
      }
    })
  }

  return (
    <>
      <div className="border-gray-200 px-20px py-15px border-bottom d-flex align-items-center justify-content-between">
        <div className="fw-500 font-size-lg">{item.FullName}</div>
        <button
          disabled={isLoading}
          type="button"
          className={clsx(
            'btn btn-primary h-35px',
            isLoading && 'spinner spinner-white spinner-right'
          )}
          onClick={onExport}
        >
          Xuất Excel
        </button>
      </div>
      <div className="p-20px">
        <ReactTableV7
          rowKey="Ids"
          columns={columns}
          data={Lists || []}
          // optionMobile={{
          //   CellModal: cell => OpenModalMobile(cell)
          // }}
        />
      </div>
    </>
  )
}

function InformationPos1(props) {
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
                    Dates: item.Items
                      ? item.Items.sort((a, b) =>
                          moment(a.CreateDate).diff(moment(b.CreateDate))
                        ).map(o => {
                          let obj = { ...o }
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
        loading={isLoading || isRefetching}
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
                      <RenderTable
                        item={item}
                        Lists={item.List}
                        filters={filters}
                      />
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

export default InformationPos1
