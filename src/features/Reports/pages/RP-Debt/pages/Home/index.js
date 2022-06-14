import React, { Fragment, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterList from 'src/components/Filter/FilterList'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import { PriceHelper } from 'src/helpers/PriceHelper'
import ChildrenTables from 'src/components/Tables/ChildrenTables'
import reportsApi from 'src/api/reports.api'
import ModalViewMobile from './ModalViewMobile'

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

function Home(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    DateStart: new Date(), // Ngày bắt đầu
    DateEnd: new Date(), // Ngày kết thúc
    Pi: 1, // Trang hiện tại
    Ps: 10, // Số lượng item
    TypeCN: ''
  })
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ListData, setListData] = useState([])
  const [Total, setTotal] = useState({
    DH_NO: 0,
    KH_NO: 0,
    TongNo: 0
  })
  const [PageTotal, setPageTotal] = useState(1)
  const [initialValuesMobile, setInitialValuesMobile] = useState(null)
  const [isModalMobile, setIsModalMobile] = useState(false)

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
    getListDebt()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListDebt = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    const newFilters = {
      ...filters,
      DateStart: filters.DateStart
        ? moment(filters.DateStart).format('DD/MM/yyyy')
        : null,
      DateEnd: filters.DateEnd
        ? moment(filters.DateEnd).format('DD/MM/yyyy')
        : null,
      TypeCN:
        filters.TypeCN && filters.TypeCN.length > 0
          ? filters.TypeCN.map(item => item.value).join(',')
          : ''
    }
    reportsApi
      .getListDebt(newFilters)
      .then(({ data }) => {
        const { Items, Total, TongNo, DH_NO, KH_NO } = {
          Items: data.result?.Items || [],
          TongNo: data.result?.TongNo || 0,
          DH_NO: (data.result?.DH_NO && data.result?.DH_NO.length) || 0,
          KH_NO: (data.result?.KH_NO && data.result?.KH_NO.length) || 0,
          Total: data.result?.Total || 0
        }
        setListData(Items)
        setTotal({ TongNo, DH_NO, KH_NO })
        setLoading(false)
        setPageTotal(Total)
        isFilter && setIsFilter(false)
        callback && callback()
      })
      .catch(error => console.log(error))
  }

  const onFilter = values => {
    if (_.isEqual(values, filters)) {
      getListDebt()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    getListDebt()
  }

  const onOpenFilter = () => {
    setIsFilter(true)
  }

  const onHideFilter = () => {
    setIsFilter(false)
  }

  const OpenModalMobile = value => {
    setInitialValuesMobile(value)
    setIsModalMobile(true)
  }

  const HideModalMobile = () => {
    setInitialValuesMobile(null)
    setIsModalMobile(false)
  }

  const checkRowSpan = ListOrder => {
    var totalArray = 0
    if (!ListOrder) return totalArray
    for (let keyItem of ListOrder) {
      totalArray += keyItem?.ListDebt?.length || 0
    }
    return totalArray
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Báo cáo công nợ
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
      />
      <div className="bg-white rounded">
        <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between">
          <div className="fw-500 font-size-lg">Danh sách công nợ</div>
          <div className="d-flex">
            <div className="fw-500">
              Tổng KH nợ{' '}
              <span className="font-size-xl fw-600 text-danger pl-5px font-number">
                {Total.KH_NO}
              </span>
            </div>
            <div className="fw-500 pl-20px">
              Tổng ĐH nợ{' '}
              <span className="font-size-xl fw-600 text-danger pl-5px font-number">
                {Total.DH_NO}
              </span>
            </div>
            <div className="fw-500 pl-20px">
              Tổng tiền nợ{' '}
              <span className="font-size-xl fw-600 text-danger pl-5px font-number">
                {PriceHelper.formatVND(Total.TongNo)}
              </span>
            </div>
          </div>
        </div>
        <div className="p-20px">
          <ChildrenTables
            data={ListData}
            columns={[
              {
                text: 'STT',
                headerStyle: {
                  minWidth: '60px',
                  width: '60px',
                  textAlign: 'center'
                },
                attrs: { 'data-title': 'STT' }
              },
              {
                text: 'Tên khách hàng',
                headerStyle: {
                  minWidth: '200px',
                  width: '200px'
                },
                attrs: { 'data-title': 'Tên khách hàng' }
              },
              {
                text: 'Số điện thoại',
                headerStyle: {
                  minWidth: '200px',
                  width: '200px'
                },
                attrs: { 'data-title': 'Số điện thoại' }
              },
              {
                text: 'Tổng nợ',
                headerStyle: {
                  minWidth: '200px',
                  width: '200px'
                },
                attrs: { 'data-title': 'Tổng nợ' }
              },
              {
                text: 'ID Đơn hàng',
                headerStyle: {
                  minWidth: '160px',
                  width: '160px'
                },
                attrs: { 'data-title': 'Đơn hàng' }
              },
              {
                text: 'Ngày bán',
                headerStyle: {
                  minWidth: '160px',
                  width: '160px'
                },
                attrs: { 'data-title': 'Ngày bán' }
              },
              {
                text: 'Tổng số tiền nợ',
                headerStyle: {
                  minWidth: '180px',
                  width: '180px'
                },
                attrs: { 'data-title': 'Tổng số tiền nợ' }
              },
              {
                text: 'Tên sản phẩm',
                headerStyle: {
                  minWidth: '250px',
                  width: '250px'
                }
              },
              {
                text: 'Số lượng',
                headerStyle: {
                  minWidth: '100px',
                  width: '100px'
                }
              },
              {
                text: 'Thành tiền',
                headerStyle: {
                  minWidth: '180px',
                  width: '180px'
                }
              },
              {
                text: 'Còn nợ',
                headerStyle: {
                  minWidth: '180px',
                  width: '180px'
                }
              }
            ]}
            options={{
              totalSize: PageTotal,
              page: filters.Pi,
              sizePerPage: filters.Ps,
              sizePerPageList: [10, 25, 30, 50],
              onPageChange: page => {
                setListData([])
                const Pi = page
                setFilters({ ...filters, Pi: Pi })
              },
              onSizePerPageChange: sizePerPage => {
                setListData([])
                const Ps = sizePerPage
                setFilters({ ...filters, Ps: Ps })
              }
            }}
            optionsMoible={{
              itemShow: 0,
              CallModal: row => OpenModalMobile(row),
              columns: [
                {
                  attrs: { 'data-title': 'STT' },
                  formatter: (row, index) => (
                    <span className="font-number">
                      {filters.Ps * (filters.Pi - 1) + (index + 1)}
                    </span>
                  )
                },
                {
                  attrs: { 'data-title': 'Tên khách hàng' },
                  formatter: row => row?.Member?.FullName || 'Chưa xác định'
                },
                {
                  attrs: { 'data-title': 'Số điện thoại' },
                  formatter: row => row?.Member?.Phone || 'Chưa xác định'
                },
                {
                  attrs: { 'data-title': 'Tổng số tiền nợ' },
                  formatter: row => PriceHelper.formatVND(row.TongNo)
                }
              ]
            }}
            loading={loading}
          >
            {ListData &&
              ListData.map((item, index) => (
                <Fragment key={index}>
                  {item?.ListOrders &&
                    item?.ListOrders.map((order, orderIndex) => (
                      <Fragment key={orderIndex}>
                        {order?.ListDebt &&
                          order?.ListDebt.map((itemDebt, debtIndex) => (
                            <tr key={debtIndex}>
                              {orderIndex === 0 && debtIndex === 0 && (
                                <Fragment>
                                  <td
                                    className="vertical-align-middle text-center"
                                    rowSpan={checkRowSpan(
                                      item?.ListOrders || []
                                    )}
                                  >
                                    <span className="font-number">
                                      {filters.Ps * (filters.Pi - 1) +
                                        (index + 1)}
                                    </span>
                                  </td>
                                  <td
                                    className="vertical-align-middle"
                                    rowSpan={checkRowSpan(
                                      item?.ListOrders || []
                                    )}
                                  >
                                    {item?.Member?.FullName || 'Chưa xác định'}
                                  </td>
                                  <td
                                    className="vertical-align-middle"
                                    rowSpan={checkRowSpan(
                                      item?.ListOrders || []
                                    )}
                                  >
                                    {item?.Member?.Phone || 'Chưa xác định'}
                                  </td>
                                  <td
                                    className="vertical-align-middle"
                                    rowSpan={checkRowSpan(
                                      item?.ListOrders || []
                                    )}
                                  >
                                    {PriceHelper.formatVND(item.TongNo)}
                                  </td>
                                </Fragment>
                              )}

                              {debtIndex === 0 && (
                                <Fragment>
                                  <td
                                    className="vertical-align-middle"
                                    rowSpan={order?.ListDebt.length}
                                  >
                                    #{order.Id}
                                  </td>
                                  <td
                                    className="vertical-align-middle"
                                    rowSpan={order?.ListDebt.length}
                                  >
                                    {moment(order.CreateDate).format(
                                      'DD-MM-YYYY'
                                    )}
                                  </td>
                                  <td
                                    className="vertical-align-middle"
                                    rowSpan={order?.ListDebt.length}
                                  >
                                    {PriceHelper.formatVND(order.TongNo)}
                                  </td>
                                </Fragment>
                              )}

                              <td>{itemDebt.ProdTitle}</td>
                              <td>{itemDebt.Qty}</td>
                              <td>{PriceHelper.formatVND(itemDebt.ToPay)}</td>
                              <td>{PriceHelper.formatVND(itemDebt.ConNo)}</td>
                            </tr>
                          ))}
                      </Fragment>
                    ))}
                </Fragment>
              ))}
          </ChildrenTables>
        </div>
        <ModalViewMobile
          show={isModalMobile}
          onHide={HideModalMobile}
          data={initialValuesMobile}
        />
      </div>
    </div>
  )
}

export default Home
