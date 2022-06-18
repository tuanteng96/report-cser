import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterList from 'src/components/Filter/FilterList'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import BaseTablesCustom from 'src/components/Tables/BaseTablesCustom'
import ModalViewMobile from './ModalViewMobile'
import reportsApi from 'src/api/reports.api'

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

const JSONData = {
  Total: 1,
  PCount: 1,
  Items: [
    {
      ProdId: 12357,
      ProdTitle: 'Serum A',
      Code: '2540HU',
      Unit: 1500,
      SUnit: 'ml',
      UsageList: [
        {
          Title: 'Triệt lông',
          Unit: 500,
          SUnit: 'ml'
        },
        {
          Title: 'Chăm sóc da',
          Unit: 200,
          SUnit: 'ml'
        }
      ],
      UsageWarning: {
        Unit: 100,
        SUnit: 'ml'
      }
    },
    {
      ProdId: 12358,
      ProdTitle: 'Serum B',
      Code: '2540HB',
      Unit: 1200,
      SUnit: 'ml',
      UsageList: [
        {
          Title: 'Triệt lông 2',
          Unit: 500,
          SUnit: 'ml'
        },
        {
          Title: 'Chăm sóc da 2',
          Unit: 200,
          SUnit: 'ml'
        }
      ],
      UsageWarning: null
    }
  ]
}

function Attrition(props) {
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
    CategoriesTK: '', // 0 => SP, 1 => NVL
    ProdIDs: '', // Danh sách SP, NVL
    TypeTH: '' // 0 => Đã dùng, 1 => Dự kiến
  })
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [ListData, setListData] = useState([])
  const [PageTotal, setPageTotal] = useState(0)
  const [loading, setLoading] = useState(false)
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
    getListPayroll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListPayroll = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    const newFilters = {
      ...filters,
      Mon: filters.Mon ? moment(filters.Mon).format('MM/yyyy') : null
    }
    reportsApi
      .getInventoryAttrition(newFilters)
      .then(({ data }) => {
        const { Items, Total } = {
          Items: data.result?.Items || JSONData.Items,
          Total: data.result?.Total || JSONData.Total
        }
        setListData(Items)
        setLoading(false)
        setPageTotal(Total)
        isFilter && setIsFilter(false)
        callback && callback()
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
      //getListPayroll()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    //getListPayroll()
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
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Tiêu hao
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
          <div className="fw-500 font-size-lg">Danh sách tiêu hao</div>
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
                dataField: 'ProdTitle',
                text: 'Tên',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row?.ProdTitle || 'Chưa xác định',
                attrs: { 'data-title': 'Tên' },
                headerStyle: () => {
                  return { minWidth: '250px', width: '250px' }
                }
              },
              {
                dataField: 'Code',
                text: 'Mã',
                formatter: (cell, row) => row?.Code || 'Chưa xác định',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                attrs: { 'data-title': 'Mã' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'Unit',
                text: 'Số lượng tiêu hao',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  row?.Unit ? `${row?.Unit} ${row?.SUnit}` : 'Chưa xác định',
                attrs: { 'data-title': 'Số lượng tiêu hao' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'UsageList',
                text: 'Tỉ lệ vào các dịch vụ',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  row?.UsageList
                    ? row?.UsageList.map(
                        item => `${item.Title} (${item?.Unit} ${item?.SUnit})`
                      ).join(', ')
                    : 'Chưa xác định',
                attrs: { 'data-title': 'Tỉ lệ vào các dịch vụ' },
                headerStyle: () => {
                  return { minWidth: '270px', width: '270px' }
                }
              },
              {
                dataField: 'UsageListWarning',
                text: 'Cảnh báo thiếu NVL',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  row?.UsageWarning &&
                  `${row?.UsageWarning?.Unit} ${row?.UsageWarning?.SUnit}`,
                attrs: { 'data-title': 'Cảnh báo thiếu NVL' },
                headerStyle: () => {
                  return { minWidth: '250px', width: '250px' }
                },
                style: (cell, row, rowIndex, colIndex) => {
                  const styles = {}
                  if (row?.UsageWarning) {
                    styles.backgroundColor = 'rgb(255, 160, 160)'
                    styles.fontWeight = '600'
                  }
                  return styles
                }
              }
            ]}
            loading={loading}
            keyField="ProdId"
            className="table-responsive-attr"
            classes="table-bordered"
            footerClasses="bg-light"
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

export default Attrition