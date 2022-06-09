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

const JSONData = {
  Total: 1,
  PCount: 1,
  TongNo: 5000000,
  Items: [
    {
      Id: 12344, // ID đơn hàng,
      CreateDate: '2022-06-03T14:11:39',
      TongNo: 2500000,
      ListDebt: [
        {
          ProdTitle: 'Tên Sản phẩm',
          ProdId: 1,
          Qty: 1,
          ToPay: 230000,
          ConNo: 200000
        }
      ]
    }
  ]
}

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
  const [TongNo, setTongNo] = useState(0)
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
      MemberID: filters.MemberID ? filters.MemberID.value : ''
    }
    reportsApi
      .getListDebt(newFilters)
      .then(({ data }) => {
        const { Items, Total, TongNo } = {
          Items: data.result?.Items || JSONData.Items,
          TongNo: data.result?.TongNo || JSONData.TongNo,
          Total: data.result?.Total || JSONData.Total
        }
        setListData(Items)
        setTongNo(TongNo)
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
      setFilters(values)
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

  return (
    <div className="py-main">
      <div className="mb-20px d-flex justify-content-between align-items-end">
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
          <FilterList
            show={isFilter}
            filters={filters}
            onHide={onHideFilter}
            onSubmit={onFilter}
            onRefresh={onRefresh}
            loading={loading}
          />
        </div>
      </div>
      <div className="bg-white rounded mt-25px">
        <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between">
          <div className="fw-500 font-size-lg">Danh sách công nợ</div>
          <div className="fw-500">
            Tổng nợ
            <span className="font-size-xl fw-600 text-danger pl-6px">
              {PriceHelper.formatVND(TongNo)}
            </span>
          </div>
        </div>
        <div className="p-20px">
          <ChildrenTables
            data={ListData}
            columns={[
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
                  minWidth: '200px',
                  width: '200px'
                }
              },
              {
                text: 'Số lượng',
                headerStyle: {
                  minWidth: '80px',
                  width: '80px'
                }
              },
              {
                text: 'Thành tiền',
                headerStyle: {
                  minWidth: '150px',
                  width: '150px'
                }
              },
              {
                text: 'Còn nợ',
                headerStyle: {
                  minWidth: '150px',
                  width: '150px'
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
                  attrs: { 'data-title': 'ID đơn hàng' },
                  formatter: row => `#${row.Id}`
                },
                {
                  attrs: { 'data-title': 'Ngày bán' },
                  formatter: row => moment(row.CreateDate).format('DD-MM-YYYY')
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
                  {item?.ListDebt &&
                    item?.ListDebt.map((order, orderIndex) => (
                      <tr key={orderIndex}>
                        {orderIndex === 0 && (
                          <Fragment>
                            <td
                              className="vertical-align-middle"
                              rowSpan={item?.ListDebt.length}
                            >
                              #{item.Id}
                            </td>
                            <td
                              className="vertical-align-middle"
                              rowSpan={item?.ListDebt.length}
                            >
                              {moment(item.CreateDate).format('DD-MM-YYYY')}
                            </td>
                            <td
                              className="vertical-align-middle"
                              rowSpan={item?.ListDebt.length}
                            >
                              {PriceHelper.formatVND(item.TongNo)}
                            </td>
                          </Fragment>
                        )}
                        <td>{order.ProdTitle}</td>
                        <td>{order.Qty}</td>
                        <td>{PriceHelper.formatVND(order.ToPay)}</td>
                        <td>{PriceHelper.formatVND(order.ConNo)}</td>
                      </tr>
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
