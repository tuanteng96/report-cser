import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import _ from 'lodash'
import moment from 'moment'
import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import reportsApi from 'src/api/reports.api'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import { DevHelpers } from 'src/helpers/DevHelpers'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'
import FilterInformationPos3 from 'src/components/Filter/FilterInformationPos3'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import DropdownLink from './compoents/DropdownLink'

function round(num, decimals = 1) {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

function InformationPos3(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    MemberID: '',
    Pi: 1,
    Ps: 20,
    Criterias: null,
    FromDate: moment().startOf('month').toDate(),
    ToDate: moment().endOf('month').toDate()
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

  const { data, refetch, isLoading, fetchStatus } = useQuery({
    queryKey: ['InformationPos3', filters],
    queryFn: async () => {
      //filters.Criterias?.value
      let newFilters = {
        StockID: filters.StockID,
        MemberID: filters.MemberID?.value || '',
        FromDate: filters.FromDate
          ? moment(filters.FromDate).format('YYYY-MM-DD')
          : null,
        ToDate: filters.ToDate
          ? moment(filters.ToDate).format('YYYY-MM-DD')
          : null,
        Pi: filters.Pi,
        Ps: filters.Ps
      }

      let Key = Criterias?.data?.key || 'Data1'

      let { data } = await reportsApi.getMemberCustome(newFilters)

      let rs = []

      if (data.lst && data.lst.length > 0) {
        rs = data.lst.map(item => ({
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
        }))
      }

      return data ? { ...data, lst: rs } : null
    },
    enabled: Boolean(Criterias?.data && filters.Criterias)
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

  const onPagesChange = ({ Pi, Ps }) => {
    setFilters({ ...filters, Pi, Ps })
  }

  const columns = useMemo(
    () => [
      {
        key: 'index',
        title: 'STT',
        dataKey: 'index',
        cellRenderer: ({ rowIndex }) => {
          return filters.Ps * (filters.Pi - 1) + (rowIndex + 1)
        },
        width: 60,
        sortable: false,
        align: 'center',
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'MemberID',
        title: 'Mã KH',
        dataKey: 'MemberID',
        width: 100,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'FullName',
        title: 'Tên khách hàng',
        dataKey: 'FullName',
        width: 250,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'MobilePhone',
        title: 'Số điện thoại',
        dataKey: 'MobilePhone',
        width: 200,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Birth',
        title: 'Tuổi',
        dataKey: 'Birth',
        cellRenderer: ({ rowData }) =>
          rowData?.BirthDate
            ? moment().diff(moment(rowData?.BirthDate), 'years')
            : '',
        width: 150,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Count',
        title: 'Số buổi',
        dataKey: 'Count',
        width: 100,
        cellRenderer: ({ rowData }) => rowData?.Items.length,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'first',
        title: 'Số đo đầu',
        dataKey: 'first',
        width: 120,
        cellRenderer: ({ rowData }) => rowData?.Items[0].Value,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'last',
        title: 'Số đo cuối',
        dataKey: 'last',
        width: 120,
        cellRenderer: ({ rowData }) =>
          rowData?.Items.length > 1
            ? Number(rowData?.Items[rowData?.Items.length - 1].Value)
            : '',
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Type',
        title: 'Tăng/Giảm',
        dataKey: 'Type',
        width: 120,
        cellRenderer: ({ rowData }) => {
          if (rowData?.Items.length <= 1) return ''
          let Value = round(
            Number(rowData?.Items[rowData?.Items.length - 1]['Value']) -
              Number(rowData?.Items[0]['Value']),
            1
          )
          return Value > 0 ? 'Tăng' : 'Giảm'
        },
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'TypeValue',
        title: 'Giá trị',
        dataKey: 'TypeValue',
        width: 120,
        cellRenderer: ({ rowData }) => {
          if (rowData?.Items.length <= 1) return ''
          let Value = round(
            Number(rowData?.Items[rowData?.Items.length - 1]['Value']) -
              Number(rowData?.Items[0]['Value']),
            1
          )
          return Math.abs(Value)
        },
        sortable: false,
        mobileOptions: {
          visible: true
        }
      }
    ],
    [filters]
  )

  const onExport = () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        new Promise(async resolve => {
          let params = BrowserHelpers.getRequestParams(filters, {
            Total: data?.Total
          })
          let newFilters = {
            StockID: filters.StockID,
            MemberID: filters.MemberID?.value || '',
            FromDate: filters.FromDate
              ? moment(filters.FromDate).format('YYYY-MM-DD')
              : null,
            ToDate: filters.ToDate
              ? moment(filters.ToDate).format('YYYY-MM-DD')
              : null,
            Pi: filters.Pi,
            Ps: params.Ps
          }
          let { data: rs } = await reportsApi.getMemberCustome(newFilters)

          resolve({
            data: {
              param: {
                Body: filters
              },
              result: rs
            }
          })
        }),
      UrlName: '/khac/bao-cao-thong-tin-pos-3'
    })
  }

  return (
    <div className="px-main">
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
      <FilterInformationPos3
        Criterias={Criterias}
        show={isFilter}
        filters={filters}
        onHide={onHideFilter}
        onSubmit={onFilter}
        onRefresh={refetch}
        loading={isLoading}
        loadingExport={loadingExport}
        onExport={onExport}
      />
      <div className="py-main">
        <div className="bg-white rounded">
          <div className="border-gray-200 px-20px py-15px border-bottom d-flex align-items-center justify-content-between">
            <div className="fw-500 font-size-lg">Danh sách khách hàng</div>
          </div>
          <div className="p-20px">
            <ReactTableV7
              rowKey={'MemberID'}
              filters={filters}
              columns={columns}
              data={data?.lst || []}
              loading={isLoading}
              pageCount={data?.pCount}
              onPagesChange={onPagesChange}
              // optionMobile={{
              //   CellModal: cell => OpenModalMobile(cell)
              // }}
              // overscanRowCount={50}
            />
          </div>
          {/* <ModalViewMobile
          show={isModalMobile}
          onHide={HideModalMobile}
          data={initialValuesMobile}
        /> */}
        </div>
      </div>
    </div>
  )
}

export default InformationPos3
