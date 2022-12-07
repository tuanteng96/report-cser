import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterList from 'src/components/Filter/FilterList'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'
import { PriceHelper } from 'src/helpers/PriceHelper'

const newListData = [
  {
    Type: 'Tổng thu bán hàng',
    Total: 5000000,
    TM_CK_QT: 200000,
    Wallet_MoneyCard: 30000,
    No: 20000
  },
  {
    Type: 'Sản phẩm & NVL',
    Total: 5000000,
    TM_CK_QT: 200000,
    Wallet_MoneyCard: 30000,
    No: 20000
  },
  {
    Type: 'Dịch vụ & Phụ phí',
    Total: 5000000,
    TM_CK_QT: 200000,
    Wallet_MoneyCard: 30000,
    No: 20000
  },
  {
    Type: 'Thẻ tiền',
    Total: 5000000,
    TM_CK_QT: 200000,
    Wallet_MoneyCard: 30000,
    No: 20000
  }
]

function ActualSell(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    Pi: 1, // Trang hiện tại
    Ps: 15, // Số lượng item
    Key: '',
    CategoriesId: '',
    BrandId: '',
    TypeCNHng: ''
  })
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [ListData, setListData] = useState(newListData)
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)

  const onOpenFilter = () => {
    setIsFilter(true)
  }

  const onHideFilter = () => {
    setIsFilter(false)
  }

  const onFilter = values => {
    if (_.isEqual(values, filters)) {
      //onRefresh()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {}

  const onExport = () => {}

  const columns = useMemo(
    () => [
      {
        key: 'Type',
        title: 'Loại',
        dataKey: 'Type',
        width: 160,
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
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData?.Total),
        width: 130,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'TM_CK_QT',
        title: 'TM/CK/QT',
        dataKey: 'TM_CK_QT',
        width: 130,
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData?.TM_CK_QT),
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Wallet_MoneyCard',
        title: 'Ví, Thẻ tiền',
        dataKey: 'Wallet_MoneyCard',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData?.Wallet_MoneyCard),
        width: 130,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'No',
        title: 'Nợ phát sinh',
        dataKey: 'No',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData?.No),
        width: 130,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      }
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
        <div className="col-md-4">
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
                data={ListData}
                loading={loading}
                pageCount={1}
                //onPagesChange={onPagesChange}
                // optionMobile={{
                //   CellModal: cell => OpenModalMobile(cell)
                // }}
              />
            </div>
          </div>
        </div>
        <div className="col-md-4">
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
                data={ListData}
                loading={loading}
                pageCount={1}
                //onPagesChange={onPagesChange}
                // optionMobile={{
                //   CellModal: cell => OpenModalMobile(cell)
                // }}
              />
            </div>
          </div>
        </div>
        <div className="col-md-4">
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
                data={ListData}
                loading={loading}
                pageCount={1}
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
