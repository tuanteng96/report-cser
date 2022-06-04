import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterList from 'src/components/Filter/FilterList'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import BaseTablesCustom from 'src/components/Tables/BaseTablesCustom'
import { PriceHelper } from 'src/helpers/PriceHelper'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import clsx from 'clsx'
import ModalViewMobile from './ModalViewMobile'
import reportsApi from 'src/api/reports.api'

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

function Returns(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    DateStart: new Date(), // Ngày bắt đầu
    DateEnd: new Date(), // Ngày kết thúc
    Pi: 1, // Trang hiện tại
    Ps: 10 // Số lượng item
  })
  const [StockName, setStockName] = useState('')
  const [loading, setLoading] = useState(false)
  const [isFilter, setIsFilter] = useState(false)
  const [ListData, setListData] = useState([])
  const [PageTotal, setPageTotal] = useState(0)
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
    getListReturns()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListReturns = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    const newFilters = {
      ...filters,
      DateStart: filters.DateStart
        ? moment(filters.DateStart).format('DD/MM/yyyy')
        : null,
      DateEnd: filters.DateEnd
        ? moment(filters.DateEnd).format('DD/MM/yyyy')
        : null
    }
    reportsApi
      .getListReturns(newFilters)
      .then(({ data }) => {
        const { Items, Total } = data.result
        setListData(Items)
        setLoading(false)
        setPageTotal(Total)
        isFilter && setIsFilter(false)
        callback && callback()
      })
      .catch(error => console.log(error))
  }

  const onFilter = values => {
    if (_.isEqual(values, filters)) {
      getListReturns()
    } else {
      setFilters(values)
    }
  }

  const onRefresh = () => {
    getListReturns()
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
            Trả hàng
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
          <div className="fw-500 font-size-lg">Danh sách trả hàng</div>
        </div>
        <div className="p-20px">
          <BaseTablesCustom
            data={ListData}
            textDataNull="Không có dữ liệu."
            optionsMoible={{
              itemShow: 5,
              CallModal: row => OpenModalMobile(row)
            }}
            options={{
              custom: true,
              totalSize: PageTotal,
              page: filters.Pi,
              sizePerPage: filters.Ps,
              alwaysShowAllBtns: true,
              onSizePerPageChange: sizePerPage => {
                setListData([])
                const Ps = sizePerPage
                setFilters({ ...filters, Ps: Ps })
              },
              onPageChange: page => {
                setListData([])
                const Pi = page
                setFilters({ ...filters, Pi: Pi })
              }
            }}
            columns={[
              {
                dataField: '',
                text: 'STT',
                formatter: (cell, row, rowIndex) => (
                  <span className="font-number">
                    {filters.Ps * (filters.Pi - 1) + (rowIndex + 1)}
                  </span>
                ),
                headerStyle: () => {
                  return { width: '60px' }
                },
                headerAlign: 'center',
                style: { textAlign: 'center' },
                attrs: { 'data-title': 'STT' }
              },
              {
                dataField: 'Id',
                text: 'Mã đơn hàng',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => <div>#{row.Id}</div>,
                attrs: { 'data-title': 'ID' },
                headerStyle: () => {
                  return { minWidth: '120px', width: '120px' }
                }
              },
              {
                dataField: 'StockName',
                text: 'Cơ sở',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.StockName || 'Chưa có',
                attrs: { 'data-title': 'Cơ sở' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                }
              },
              {
                dataField: 'CreateDate',
                text: 'Ngày',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  moment(row.CreateDate).format('HH:mm DD/MM/YYYY'),
                attrs: { 'data-title': 'Ngày' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'MemberName',
                text: 'Khách hàng',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.MemberName || 'Không có tên',
                attrs: { 'data-title': 'Khách hàng' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                }
              },
              {
                dataField: 'MemberPhone',
                text: 'Số điện thoại',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.MemberPhone || 'Không có',
                attrs: { 'data-title': 'Số điện thoại' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                }
              },
              {
                dataField: 'ToPay',
                text: 'Giá trị',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.ToPay),
                attrs: { 'data-title': 'Cần thanh toán' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'lines',
                text: 'Sản phẩm trả lại',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  row.lines &&
                  row.lines
                    .map(item => `${item.ProdTitle} (${item.QTy})`)
                    .join(', '),
                attrs: { 'data-title': 'Sản phẩm trả lại' },
                headerStyle: () => {
                  return { minWidth: '220px', width: '220px' }
                }
              },
              {
                dataField: '#',
                text: '#',
                headerAlign: 'center',
                style: { textAlign: 'center' },
                formatter: (cell, row) => (
                  <OverlayTrigger
                    rootClose
                    trigger="click"
                    placement="top"
                    overlay={
                      <Popover className="popover-md">
                        <Popover.Header>Đơn hàng #{row.Id}</Popover.Header>
                        <Popover.Body className="p-0">
                          {row.lines &&
                            row.lines.map((item, index) => (
                              <div
                                className={clsx('p-12px', {
                                  'border-bottom':
                                    row.lines.length - 1 !== index
                                })}
                                key={index}
                              >
                                <div className="fw-500 mb-2px">
                                  {item.ProdTitle}
                                </div>
                                <div className="d-flex justify-content-between">
                                  <div className="text-muted">
                                    SL{' '}
                                    <span className="fw-500 text-dark">
                                      x {item.QTy}
                                    </span>
                                  </div>
                                  <div className="fw-500">
                                    {PriceHelper.formatVND(item.Topay)}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </Popover.Body>
                      </Popover>
                    }
                  >
                    <button type="button" className="btn btn-xs btn-primary">
                      Xem đơn hàng
                    </button>
                  </OverlayTrigger>
                ),
                attrs: { 'data-title': '#' },
                headerStyle: () => {
                  return { minWidth: '112px', width: '112px' }
                }
              }
            ]}
            loading={loading}
            keyField="Id"
            className="table-responsive-attr"
            classes="table-bordered"
          />
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

export default Returns
