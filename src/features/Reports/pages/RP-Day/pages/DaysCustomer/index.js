import React, { useEffect, useMemo, useState } from 'react'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import { useSelector } from 'react-redux'
import Filter from 'src/components/Filter/Filter'
import _ from 'lodash'
import { uuidv4 } from '@nikitababko/id-generator'
import { PriceHelper } from 'src/helpers/PriceHelper'

import moment from 'moment'
import 'moment/locale/vi'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'

moment.locale('vi')

const jsonData = [
  {
    Ids: uuidv4(),
    rowIndex: 0,
    CreateDate: '2022-10-21T15:50:00',
    FullName: 'Nguyễn Tài Tuấn',
    Phone: '0971021196',
    TongThanhToan: 1580000,
    Vi: 500000,
    TheTien: 80000,
    No: 300000,
    CK: 300000,
    TM: 200000,
    QT: 150000,
    children: [
      {
        Ids: uuidv4(),
        id: `0-detail`,
        MajorList: [
          {
            Order: {
              ID: '83254',
              Prods: [
                {
                  Title: 'Kem trị nám',
                  Qty: 5
                },
                {
                  Title: 'Triệt lông',
                  Qty: 3
                }
              ],
              GiaTriDonHang: 1580000,
              ThanhToan: 1280000,
              Vi: 500000,
              TheTien: 300000,
              No: 300000,
              HoaHong: [
                {
                  FullName: 'Linh',
                  Bonus: 50000
                }
              ],
              DoanhSo: [
                {
                  FullName: 'Đức Hướng',
                  Bonus: 25000
                }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    Ids: uuidv4(),
    CreateDate: '2022-10-21T15:50:00',
    FullName: 'Nguyễn Tài Tuấn',
    Phone: '0971021196',
    TongThanhToan: 1580000,
    Vi: 500000,
    TheTien: 80000,
    No: 300000,
    CK: 300000,
    TM: 200000,
    QT: 150000,
    rowIndex: 1,
    children: [
      {
        Ids: uuidv4(),
        id: `1-detail`,
        MajorList: [
          {
            Order: {
              ID: '83254',
              Prods: [
                {
                  Title: 'Kem trị nám',
                  Qty: 5
                },
                {
                  Title: 'Triệt lông',
                  Qty: 3
                }
              ],
              GiaTriDonHang: 1580000,
              ThanhToan: 1280000,
              Vi: 500000,
              TheTien: 300000,
              No: 300000,
              HoaHong: [
                {
                  FullName: 'Linh',
                  Bonus: 50000
                }
              ],
              DoanhSo: [
                {
                  FullName: 'Đức Hướng',
                  Bonus: 25000
                }
              ]
            }
          }
        ]
      }
    ]
  }
]

const DetailRenderer = props => {
  const data = props.rowData.MajorList
  const columns = useMemo(
    () => [
      {
        key: 'ID',
        title: 'Đơn hàng',
        dataKey: 'ID',
        cellRenderer: ({ rowData }) => `Đơn hàng mới #${rowData.Order.ID}`,
        width: 150,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Prods',
        title: 'Sản phẩm',
        dataKey: 'Prods',
        cellRenderer: ({ rowData }) =>
          rowData.Order.Prods.map(item => `${item.Title} (x${item.Qty})`).join(
            ', '
          ),
        width: 220,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'GiaTriDonHang',
        title: 'Giá bán đơn hàng',
        dataKey: 'GiaTriDonHang',
        cellRenderer: ({ rowData }) => (
          <div>
            <div>Giá trị đơn hàng</div>
            <div>{PriceHelper.formatVND(rowData.Order.GiaTriDonHang)}</div>
          </div>
        ),
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'ThanhToan',
        title: 'Thanh toán',
        dataKey: 'ThanhToan',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.Order.ThanhToan),
        width: 200,
        sortable: false
      },
      {
        key: 'Vi',
        title: 'Thanh toán ví',
        dataKey: 'Vi',
        cellRenderer: ({ rowData }) => (
          <div>
            <div>Thanh toán ví</div>
            <div>{PriceHelper.formatVND(rowData.Order.Vi)}</div>
          </div>
        ),
        width: 200,
        sortable: false
      },
      {
        key: 'TheTien',
        title: 'Thanh toán thẻ tiền',
        dataKey: 'TheTien',
        cellRenderer: ({ rowData }) => (
          <div>
            <div>Thanh toán thẻ tiền</div>
            <div>{PriceHelper.formatVND(rowData.Order.TheTien)}</div>
          </div>
        ),
        width: 200,
        sortable: false
      },
      {
        key: 'No',
        title: 'Còn nợ',
        dataKey: 'No',
        cellRenderer: ({ rowData }) => (
          <div>
            <div>Còn nợ</div>
            <div>{PriceHelper.formatVND(rowData.Order.No)}</div>
          </div>
        ),
        width: 200,
        sortable: false
      },
      {
        key: 'HoaHong',
        title: 'Hoa hồng',
        dataKey: 'HoaHong',
        cellRenderer: ({ rowData }) => (
          <div>
            <div>Hoa hồng</div>
            {rowData.Order.HoaHong.map((item, index) => (
              <div key={index}>
                {item.FullName} {PriceHelper.formatVND(item.Bonus)}
              </div>
            ))}
          </div>
        ),
        width: 200,
        sortable: false
      },
      {
        key: 'DoanhSo',
        title: 'Doanh số',
        dataKey: 'DoanhSo',
        cellRenderer: ({ rowData }) => (
          <div>
            <div>Doanh số</div>
            {rowData.Order.DoanhSo.map((item, index) => (
              <div key={index}>
                {item.FullName} {PriceHelper.formatVND(item.Bonus)}
              </div>
            ))}
          </div>
        ),
        width: 200,
        sortable: false
      }
    ],
    []
  )

  return (
    <div className="p-15px w-100">
      <ReactTableV7
        rowKey="Ids"
        columns={columns}
        data={data}
        loading={false}
        pageCount={1}
        estimatedRowHeight={50}
        headerHeight={0}
      />
    </div>
  )
}

function DaysCustomer(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [StockName, setStockName] = useState('')
  const [loading, setLoading] = useState(false)
  const [ListData, setListData] = useState(jsonData)
  const [pageCount, setPageCount] = useState(0)
  const [isFilter, setIsFilter] = useState(false)
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    Pi: 1, // Trang hiện tại
    Ps: 15, // Số lượng item
    MemberID: '' // ID Khách hàng
  })

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

  const onOpenFilter = () => {
    setIsFilter(true)
  }

  const onHideFilter = () => {
    setIsFilter(false)
  }

  const onFilter = values => {
    if (_.isEqual(values, filters)) {
      //getAllDays()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    //getAllDays()
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
        cellRenderer: ({ rowData }) =>
          filters.Ps * (filters.Pi - 1) + (rowData.rowIndex + 1),
        width: 60,
        sortable: false,
        align: 'center',
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'CreateDate',
        title: 'Ngày',
        dataKey: 'CreateDate',
        cellRenderer: ({ rowData }) =>
          moment(rowData.CreateDate).format('HH:mm DD/MM/YYYY'),
        width: 150,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'FullName',
        title: 'Tên khách hàng',
        dataKey: 'FullName',
        width: 200,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Phone',
        title: 'Số điện thoại',
        dataKey: 'Phone',
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'TongThanhToan',
        title: 'Thanh toán',
        dataKey: 'TongThanhToan',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.TongThanhToan),
        width: 200,
        sortable: false
      },
      {
        key: 'Vi',
        title: 'Thanh toán ví',
        dataKey: 'Vi',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.Vi),
        width: 200,
        sortable: false
      },
      {
        key: 'TheTien',
        title: 'Thanh toán thẻ tiền',
        dataKey: 'TheTien',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.TheTien),
        width: 200,
        sortable: false
      },
      {
        key: 'No',
        title: 'Còn nợ',
        dataKey: 'No',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.TheTien),
        width: 200,
        sortable: false
      }
    ],
    [filters]
  )

  const rowRenderer = ({ rowData, cells }) => {
    if (rowData.MajorList)
      return <DetailRenderer rowData={rowData} cells={cells} />
    return cells
  }

  // const ExpandIcon = props => {
  //   let { expandable, expanded, onExpand } = props
  //   let cls = 'table__expandicon'

  //   if (expandable === false) {
  //     return null
  //   }

  //   if (expanded === true) {
  //     cls += ' expanded'
  //   }

  //   return (
  //     <span
  //       className={cls}
  //       onClick={() => {
  //         onExpand(!expanded)
  //       }}
  //     />
  //   )
  // }

  const AdvanceExpandIcon = cellProps => {
    console.log(cellProps)
    return <div></div>
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Khách hàng
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
      <Filter
        show={isFilter}
        filters={filters}
        onHide={onHideFilter}
        onSubmit={onFilter}
        onRefresh={onRefresh}
        loading={loading}
      />
      <div className="bg-white rounded">
        <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between">
          <div className="fw-500 font-size-lg">Danh sách khách hàng</div>
        </div>
        <div className="p-20px">
          <ReactTableV7
            expandColumnKey={columns[0].key}
            rowKey="Ids"
            filters={filters}
            columns={columns}
            data={ListData}
            loading={loading}
            pageCount={pageCount}
            onPagesChange={onPagesChange}
            rowRenderer={rowRenderer}
            estimatedRowHeight={50}
            // components={{
            //   ExpandIcon: AdvanceExpandIcon
            // }}
            rowEventHandlers={{
              onClick: ({ event }) => console.log(event)
            }}
            // optionMobile={{
            //   CellModal: cell => OpenModalMobile(cell)
            // }}
          />
        </div>
      </div>
    </div>
  )
}

export default DaysCustomer
