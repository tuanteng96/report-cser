import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterList from 'src/components/Filter/FilterList'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'
import { PriceHelper } from 'src/helpers/PriceHelper'
import reportsApi from 'src/api/reports.api'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import { uuidv4 } from '@nikitababko/id-generator'
import Text from 'react-texty'

import moment from 'moment'
import 'moment/locale/vi'

moment.locale('vi')

function ActualSell(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    Pi: 1, // Trang hiện tại
    Ps: 15, // Số lượng item
    DateStart: new Date(),
    DateEnd: new Date()
  })
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [ListData, setListData] = useState({
    Total: [],
    NewForSale: [],
    Pay: []
  })
  const [loading, setLoading] = useState(false)
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

  useEffect(() => {
    getListActual()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const convertoPrecision = number => {
    if (isNaN(number)) return false
    return Number(number.toFixed(2))
  }

  const getListActual = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    reportsApi
      .getListActualSell(BrowserHelpers.getRequestParamsList(filters))
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          if (data.result) {
            const newList = { Total: [], NewForSale: [], Pay: [] }
            for (var key in data.result) {
              let newArray = []
              const item = data.result[key]
              var TONG_TM_CK_QT = 0
              var TONG_Wallet_MoneyCard = 0
              for (var x in data.result[key]) {
                TONG_TM_CK_QT +=
                  (data.result[key][x]?.ck || 0) +
                  (data.result[key][x]?.qt || 0) +
                  (data.result[key][x]?.tm || 0)
                TONG_Wallet_MoneyCard +=
                  (data.result[key][x]?.vi || 0) +
                  (data.result[key][x]?.tt || 0)
              }
              newArray = [
                {
                  Type: 'Tổng thu bán hàng',
                  Total: item.tong_thu,
                  TM_CK_QT: TONG_TM_CK_QT,
                  Wallet_MoneyCard: TONG_Wallet_MoneyCard,
                  ID: uuidv4()
                },
                {
                  Type: 'Sản phẩm & NVL',
                  Total: item?.sp_nvl?.tong || 0,
                  TM_CK_QT:
                    item?.sp_nvl?.ck + item?.sp_nvl?.qt + item?.sp_nvl?.tm,
                  Wallet_MoneyCard: item?.sp_nvl?.vi + item?.sp_nvl?.tt,
                  ID: uuidv4(),
                  TotalPercent: convertoPrecision(
                    (item?.sp_nvl?.tong / item.tong_thu) * 100
                  ),
                  TM_CK_QTPercent: convertoPrecision(
                    ((item?.sp_nvl?.ck + item?.sp_nvl?.qt + item?.sp_nvl?.tm) /
                      TONG_TM_CK_QT) *
                      100
                  ),
                  Wallet_MoneyCardPercent: convertoPrecision(
                    ((item?.sp_nvl?.vi + item?.sp_nvl?.tt) /
                      TONG_Wallet_MoneyCard) *
                      100
                  )
                },
                {
                  Type: 'Dịch vụ & Phụ phí',
                  Total: item?.dv_pp?.tong || 0,
                  TM_CK_QT: item?.dv_pp?.ck + item?.dv_pp?.qt + item?.dv_pp?.tm,
                  Wallet_MoneyCard: item?.dv_pp?.vi + item?.dv_pp?.tt,
                  ID: uuidv4(),
                  TotalPercent: convertoPrecision(
                    (item?.dv_pp?.tong / item.tong_thu) * 100
                  ),
                  TM_CK_QTPercent: convertoPrecision(
                    ((item?.dv_pp?.ck + item?.dv_pp?.qt + item?.dv_pp?.tm) /
                      TONG_TM_CK_QT) *
                      100
                  ),
                  Wallet_MoneyCardPercent: convertoPrecision(
                    ((item?.dv_pp?.vi + item?.dv_pp?.tt) /
                      TONG_Wallet_MoneyCard) *
                      100
                  )
                },
                {
                  Type: 'Thẻ tiền',
                  Total: item?.the_tien?.tong || 0,
                  TM_CK_QT:
                    item?.the_tien?.ck +
                    item?.the_tien?.qt +
                    item?.the_tien?.tm,
                  Wallet_MoneyCard: item?.the_tien?.vi + item?.the_tien?.tt,
                  ID: uuidv4(),
                  TotalPercent: convertoPrecision(
                    (item?.the_tien?.tong / item.tong_thu) * 100
                  ),
                  TM_CK_QTPercent: convertoPrecision(
                    ((item?.the_tien?.ck +
                      item?.the_tien?.qt +
                      item?.the_tien?.tm) /
                      TONG_TM_CK_QT) *
                      100
                  ),
                  Wallet_MoneyCardPercent: convertoPrecision(
                    ((item?.the_tien?.vi + item?.the_tien?.tt) /
                      TONG_Wallet_MoneyCard) *
                      100
                  )
                }
              ]
              if (key === 'tong') {
                newList.Total = newArray
              }
              if (key === 'ban_moi') {
                newList.NewForSale = newArray
              }
              if (key === 'thu_no') {
                newList.Pay = newArray
              }
            }
            setListData(newList)
          }
          setLoading(false)
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
      onRefresh()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    getListActual()
  }

  const onExport = () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getListActualSell(
          BrowserHelpers.getRequestParamsList(filters, {
            Total: 1000
          })
        ),
      UrlName: '/ban-hang/doanh-so-thuc-thu'
    })
  }

  const columns = useMemo(
    () => [
      {
        key: 'Type',
        title: 'Loại',
        dataKey: 'Type',
        width: 200,
        sortable: false,
        //align: 'center',
        mobileOptions: {
          visible: true
        },
        frozen: 'left'
      },
      {
        key: 'Total',
        title: 'Tổng',
        dataKey: 'Total',
        cellRenderer: ({ rowData }) => (
          <div className="d-flex justify-content-between w-100">
            <Text tooltipMaxWidth={280} className="flex-1 pr-5px">
              {PriceHelper.formatVND(rowData?.Total)}
            </Text>
            <div className="w-65px">
              {rowData.TotalPercent ? (
                <code>{rowData.TotalPercent} %</code>
              ) : (
                ''
              )}
            </div>
          </div>
        ),
        width: 220,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'TM_CK_QT',
        title: 'TM/CK/QT',
        dataKey: 'TM_CK_QT',
        width: 220,
        cellRenderer: ({ rowData }) => (
          <div className="d-flex justify-content-between w-100">
            <Text tooltipMaxWidth={280} className="flex-1 pr-5px">
              {PriceHelper.formatVND(rowData?.TM_CK_QT)}
            </Text>
            <div className="w-65px">
              {rowData.TM_CK_QTPercent ? (
                <code>{rowData.TM_CK_QTPercent} %</code>
              ) : (
                ''
              )}
            </div>
          </div>
        ),
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Wallet_MoneyCard',
        title: 'Ví, Thẻ tiền',
        dataKey: 'Wallet_MoneyCard',
        cellRenderer: ({ rowData }) => (
          <div className="d-flex justify-content-between w-100">
            <Text tooltipMaxWidth={280} className="flex-1 pr-5px">
              {PriceHelper.formatVND(rowData?.Wallet_MoneyCard)}
            </Text>
            <div className="w-65px">
              {rowData.Wallet_MoneyCardPercent ? (
                <code>{rowData.Wallet_MoneyCardPercent} %</code>
              ) : (
                ''
              )}
            </div>
          </div>
        ),
        width: 220,
        sortable: false,
        mobileOptions: {
          visible: true
        },
        style: {
          flexGrow: '1'
        }
      }
      // {
      //   key: 'No',
      //   title: 'Nợ phát sinh',
      //   dataKey: 'No',
      //   cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData?.No),
      //   width: 130,
      //   sortable: false,
      //   mobileOptions: {
      //     visible: true
      //   }
      // }
    ],
    []
  )

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Doanh số thực thu
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
      <div className="row">
        <div className="col-xxxl-6">
          <div className="bg-white rounded overflow-hidden">
            <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between">
              <div className="fw-500 font-size-lg text-primary text-uppercase">
                Tổng
              </div>
            </div>
            <div className="p-20px">
              <ReactTableV7
                rowKey="ID"
                columns={columns}
                data={ListData.Total}
                loading={loading}
                pageCount={1}
                maxHeight={250}
                //onPagesChange={onPagesChange}
                // optionMobile={{
                //   CellModal: cell => OpenModalMobile(cell)
                // }}
              />
            </div>
          </div>
        </div>
        <div className="col-xxxl-6 mt-15px mt-xxxl-0">
          <div className="bg-white rounded">
            <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between">
              <div className="fw-500 font-size-lg text-success text-uppercase">
                Bán mới
              </div>
            </div>
            <div className="p-20px">
              <ReactTableV7
                rowKey="ID"
                columns={columns}
                data={ListData.NewForSale}
                loading={loading}
                pageCount={1}
                maxHeight={250}
                //onPagesChange={onPagesChange}
                // optionMobile={{
                //   CellModal: cell => OpenModalMobile(cell)
                // }}
              />
            </div>
          </div>
        </div>
        <div className="col-xxxl-6 mt-15px">
          <div className="bg-white rounded">
            <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between">
              <div className="fw-500 font-size-lg text-danger text-uppercase">
                Thanh toán nợ
              </div>
            </div>
            <div className="p-20px">
              <ReactTableV7
                rowKey="ID"
                columns={columns}
                data={ListData.Pay}
                loading={loading}
                pageCount={1}
                maxHeight={250}
                //onPagesChange={onPagesChange}
                // optionMobile={{
                //   CellModal: cell => OpenModalMobile(cell)
                // }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActualSell
