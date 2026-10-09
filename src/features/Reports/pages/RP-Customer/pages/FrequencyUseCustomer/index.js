import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterToggle from 'src/components/Filter/FilterToggle'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import reportsApi from 'src/api/reports.api'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import ModalViewMobile from './ModalViewMobile'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import { uuidv4 } from '@nikitababko/id-generator'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'

import moment from 'moment'
import 'moment/locale/vi'
import { JsonFilter } from 'src/Json/JsonFilter'
import { Dropdown } from 'react-bootstrap'
import clsx from 'clsx'
import { useQuery } from '@tanstack/react-query'
import { PriceHelper } from 'src/helpers/PriceHelper'
import Text from 'react-texty'

moment.locale('vi')

var thisYear = new Date().getFullYear()
var start = new Date('1/1/' + thisYear)
var defaultStart = moment(start.valueOf()).toDate()

const convertArray = arrays => {
  const newArray = []
  if (!arrays || arrays.length === 0) {
    return newArray
  }
  for (let [index, obj] of arrays.entries()) {
    if (obj.ProdsList && obj.ProdsList.length > 0) {
      for (let [x, order] of obj.ProdsList.entries()) {
        const newObj = {
          ...order,
          CreateDateProd: order.CreateDate,
          TanSuatSDProd: order.TanSuatSD,
          ...obj,
          rowIndex: index,
          Ids: uuidv4(),
          rowSpanIndex: x
        }
        if (x !== 0) delete newObj.ProdsList
        newArray.push(newObj)
      }
    } else {
      newArray.push({
        rowIndex: index,
        Ids: uuidv4(),
        ...obj
      })
    }
  }
  return newArray
}

const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
  <span
    ref={ref}
    onClick={e => {
      e.preventDefault()
      onClick(e)
    }}
    className="flex items-center cursor-pointer text-uppercase font-size-xl fw-600"
  >
    {children}
  </span>
))

function FrequencyUseCustomer(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    DateStart: new Date(), // Ngày bắt đầu
    DateEnd: new Date(), // Ngày kết thúc
    Pi: 1, // Trang hiện tại
    Ps: 15, // Số lượng item
    MemberID: '', // ID Khách hàng
    GroupCustomerID: '', // ID Nhóm khách hàng
    SourceName: '', // Nguồn
    CateServiceIDs: '', // Danh mục dịch vụ
    ServiceIDs: '', // Danh mục dịch vụ
    DayService: '', // Khoảng thời gian không đến làm dịch vụ
    LastUsedFrom: null, // Ngày dùng cuối từ
    LastUsedTo: null, // Ngày dùng cuối đến
    Frequency: JsonFilter.FrequencyList[2], // Tần suất SD
    FrequencyDay: '', // Tuần suất theo ngày
    StatusServices: '',
    FrequencyDateStart: defaultStart,
    FrequencyDateEnd: moment().toDate(),
    View: 0
  })
  const [StockName, setStockName] = useState('')
  const [ListData, setListData] = useState([])
  const [ListDataMobile, setListDataMobile] = useState([])
  const [PageTotal, setPageTotal] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [isFilter, setIsFilter] = useState(false)
  const [initialValuesMobile, setInitialValuesMobile] = useState(null)
  const [isModalMobile, setIsModalMobile] = useState(false)
  const [View, setView] = useState(0)

  const [filters2, setFilters2] = useState({
    StockID: CrStockID || '',
    Pi: 1,
    Ps: 15,
    DateStart: moment().startOf('month').toDate(), //01/1/2026
    DateEnd: moment().endOf('month').toDate(),
    DvGoc: '',
    DvThe: '',
    MemberIDs: '',
    View: 1
  })

  useEffect(() => {
    let StockID = View === 0 ? filters.StockID : filters2.StockID
    const index = Stocks.findIndex(item => Number(item.ID) === Number(StockID))
    if (index > -1) {
      setStockName(Stocks[index].Title)
    } else {
      setStockName('Tất cả cơ sở')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, filters2])

  useEffect(() => {
    if (View === 0) {
      getListFrequencyUseCustomer()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, View])

  const { isLoading, data, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['FrequencyUseCustomer', filters2],
    queryFn: async () => {
      let rs = await reportsApi.getListCustomerFrequencyUse2(
        BrowserHelpers.getRequestParamsToggle(filters2)
      )
      return rs?.data?.result || null
    },
    keepPreviousData: true,
    enabled: View === 1
  })

  useEffect(() => {
    if (dataUpdatedAt && isFilter) {
      setIsFilter(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataUpdatedAt])

  const getListFrequencyUseCustomer = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    reportsApi
      .getListCustomerFrequencyUse(
        BrowserHelpers.getRequestParamsToggle(filters)
      )
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const { Members, Total, PCount } = {
            Members: data?.result?.Members || [],
            Total: data?.result?.Total || 0,
            PCount: data?.result?.PCount || 0
          }
          setListData(convertArray(Members))
          setListDataMobile(Members)
          setPageTotal(Total)
          setPageCount(PCount)
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
    if (View === 0) {
      if (_.isEqual(values, filters)) {
        getListFrequencyUseCustomer()
      } else {
        setFilters({ ...values, Pi: 1 })
      }
    }
    if (View === 1) {
      if (_.isEqual(values, filters2)) {
        refetch()
      } else {
        setFilters2({ ...values, Pi: 1 })
      }
    }
  }

  const onRefresh = () => {
    if (View === 0) {
      getListFrequencyUseCustomer()
    }

    if (View === 1) {
      refetch()
    }
  }

  const OpenModalMobile = value => {
    setInitialValuesMobile(value)
    setIsModalMobile(true)
  }

  const HideModalMobile = () => {
    setInitialValuesMobile(null)
    setIsModalMobile(false)
  }

  const onExport = () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        View === 0
          ? reportsApi.getListCustomerFrequencyUse(
              BrowserHelpers.getRequestParamsToggle(filters, {
                Total: PageTotal
              })
            )
          : reportsApi.getListCustomerFrequencyUse2(
              BrowserHelpers.getRequestParamsToggle(filters2, {
                Total: data?.Total
              })
            ),
      UrlName:
        View === 0
          ? '/khach-hang/tan-suat-su-dung'
          : '/khach-hang/tan-suat-thang'
    })
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
        rowSpan: ({ rowData }) =>
          rowData.ProdsList && rowData.ProdsList.length > 0
            ? rowData.ProdsList.length
            : 1,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'CreateDate',
        title: 'Ngày tạo',
        dataKey: 'CreateDate',
        cellRenderer: ({ rowData }) =>
          moment(rowData.CreateDate).format('HH:mm DD/MM/YYYY'),
        width: 150,
        sortable: false,
        rowSpan: ({ rowData }) =>
          rowData.ProdsList && rowData.ProdsList.length > 0
            ? rowData.ProdsList.length
            : 1,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'MemberFullName',
        title: 'Tên khách hàng',
        dataKey: 'MemberFullName',
        width: 220,
        sortable: false,
        rowSpan: ({ rowData }) =>
          rowData.ProdsList && rowData.ProdsList.length > 0
            ? rowData.ProdsList.length
            : 1,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'MemberPhone',
        title: 'Số điện thoại',
        dataKey: 'MemberPhone',
        width: 180,
        sortable: false,
        rowSpan: ({ rowData }) =>
          rowData.ProdsList && rowData.ProdsList.length > 0
            ? rowData.ProdsList.length
            : 1,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'StockName',
        title: 'Cơ sở',
        dataKey: 'StockName',
        width: 200,
        sortable: false,
        rowSpan: ({ rowData }) =>
          rowData.ProdsList && rowData.ProdsList.length > 0
            ? rowData.ProdsList.length
            : 1
      },
      {
        key: 'TanSuatSD',
        title: 'Tần suất sử dụng',
        dataKey: 'TanSuatSD',
        width: 200,
        sortable: false,
        cellRenderer: ({ rowData }) => rowData.TanSuatSD,
        rowSpan: ({ rowData }) =>
          rowData.ProdsList && rowData.ProdsList.length > 0
            ? rowData.ProdsList.length
            : 1
      },
      {
        key: 'CreateDateProd',
        title: 'Thời gian mua',
        dataKey: 'CreateDateProd',
        cellRenderer: ({ rowData }) =>
          rowData.CreateDateProd
            ? moment(rowData.CreateDateProd).format('HH:mm DD/MM/YYYY')
            : '',
        width: 180,
        sortable: false
      },
      {
        key: 'Title',
        title: 'Tên dịch vụ',
        dataKey: 'Title',
        width: 250,
        sortable: false
      },
      {
        key: 'LastUsedTime',
        title: 'TG dùng gần nhất',
        dataKey: 'LastUsedTime',
        cellRenderer: ({ rowData }) =>
          rowData.LastUsedTime
            ? moment(rowData.LastUsedTime).format('HH:mm DD/MM/YYYY')
            : '',
        width: 150,
        sortable: false
      },
      {
        key: 'TanSuatSDProd',
        title: 'Tần suất sử dụng',
        dataKey: 'TanSuatSDProd',
        width: 150,
        cellRenderer: ({ rowData }) => rowData.TanSuatSDProd,
        sortable: false
      }
    ],
    [filters]
  )

  const columns2 = useMemo(() => {
    let clms = [
      {
        key: 'index',
        title: 'STT',
        dataKey: 'index',
        cellRenderer: ({ rowData, rowIndex }) =>
          filters2.Ps * (filters2.Pi - 1) + (rowIndex + 1),
        width: 60,
        sortable: false,
        align: 'center',
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Member.ID',
        title: 'ID khách hàng',
        dataKey: 'Member.ID',
        width: 150,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Member.FullName',
        title: 'Tên khách hàng',
        dataKey: 'Member.FullName',
        width: 220,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Member.MobilePhone',
        title: 'Số điện thoại',
        dataKey: 'Member.MobilePhone',
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Member.ByStockID',
        title: 'Cơ sở',
        dataKey: 'Member.ByStockID',
        width: 250,
        cellRenderer: ({ rowData }) => {
          return (
            <Text tooltipMaxWidth={300}>
              {Stocks?.find(
                item => Number(item.ID) === Number(rowData?.Member?.ByStockID)
              )?.Title || ''}
            </Text>
          )
        },
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Present_vi',
        title: 'Ví',
        dataKey: 'Present_vi',
        cellRenderer: ({ rowData }) => {
          let Present = rowData?.Member?.Present
            ? JSON.parse(rowData?.Member?.Present)
            : null

          return PriceHelper.formatVND(Present?.nap_vi || 0)
        },
        width: 160,
        sortable: false
      },
      {
        key: 'Present_tt',
        title: 'Thẻ tiền',
        dataKey: 'Present_tt',
        cellRenderer: ({ rowData }) => {
          let Present = rowData?.Member?.Present
            ? JSON.parse(rowData?.Member?.Present)
            : null

          return PriceHelper.formatVND(Present?.the_tien_kha_dung || 0)
        },
        width: 160,
        sortable: false
      },
      {
        key: 'Present_cn',
        title: 'Công nợ',
        dataKey: 'Present_cn',
        cellRenderer: ({ rowData }) => {
          let Present = rowData?.Member?.Present
            ? JSON.parse(rowData?.Member?.Present)
            : null

          return PriceHelper.formatVND(Present?.no || 0)
        },
        width: 160,
        sortable: false
      },
      {
        key: 'Present_da_chi_tieu',
        title: 'Đã chi tiêu',
        dataKey: 'Present_da_chi_tieu',
        cellRenderer: ({ rowData }) => {
          let Present = rowData?.Member?.Present
            ? JSON.parse(rowData?.Member?.Present)
            : null

          return PriceHelper.formatVND(Present?.da_chi_tieu || 0)
        },
        width: 160,
        sortable: false
      },
      {
        key: 'Present_points',
        title: 'Tích điểm',
        dataKey: 'Present_points',
        cellRenderer: ({ rowData }) => {
          let Present = rowData?.Member?.Present
            ? JSON.parse(rowData?.Member?.Present)
            : null

          return PriceHelper.formatVND(Present?.points || 0)
        },
        width: 160,
        sortable: false
      },
      {
        key: 'Service',
        title: 'Dịch vụ còn',
        dataKey: 'Service',
        cellRenderer: ({ rowData }) => {
          return rowData?.Service && rowData?.Service.length > 0 ? (
            <Text tooltipMaxWidth={300}>
              {rowData?.Service.map(x => `${x.DichVuThe} (${x.Sobuoi})`).join(
                ', '
              )}
            </Text>
          ) : (
            <></>
          )
        },
        width: 300,
        sortable: false
      }
    ]
    if (data?.Mons) {
      for (let [i, mon] of data?.Mons.entries()) {
        clms.push({
          key: mon,
          title: mon,
          dataKey: mon,
          width: 130,
          sortable: false,
          cellRenderer: ({ rowData }) => rowData?.Mons?.[i]?.Qty || ''
        })
      }
    }
    return clms
  }, [filters2, data, Stocks])

  const rowRenderer = ({ rowData, rowIndex, cells, columns, isScrolling }) => {
    // if (isScrolling)
    //   return (
    //     <div className="pl-15px d-flex align-items">
    //       <div className="spinner spinner-primary w-40px"></div> Đang tải ...
    //     </div>
    //   )
    const indexList = [0, 1, 2, 3, 4, 5]

    if (rowData.rowSpanIndex > 0) {
      indexList.forEach(i => {
        const cell = cells[i]

        // replace nội dung cell bằng rỗng
        cells[i] = React.cloneElement(cell, {
          children: null,
          border: 'none'
        })
      })
    }

    for (let index of indexList) {
      const rowSpan = columns[index].rowSpan({ rowData, rowIndex })
      if (rowSpan > 1) {
        const cell = cells[index]
        const style = {
          ...cell.props.style,
          backgroundColor: '#fff',
          height: rowSpan * 50 - 1,
          alignSelf: 'flex-start',
          zIndex: 1
        }
        cells[index] = React.cloneElement(cell, { style })
      }
    }
    return cells
  }

  const onPagesChange = ({ Pi, Ps }) => {
    setFilters({ ...filters, Pi, Ps })
  }

  const onPagesChange2 = ({ Pi, Ps }) => {
    setFilters2({ ...filters2, Pi, Ps })
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex items-center flex-1">
          <Dropdown>
            <Dropdown.Toggle as={CustomToggle} id="dropdown-customers">
              <span className="flex gap-1 cursor-pointer text-uppercase font-size-xl fw-600">
                Tần suất sử dụng
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </span>
            </Dropdown.Toggle>

            <Dropdown.Menu className="a" align="end">
              <Dropdown.Item
                className={clsx(
                  'dropdown-item-active',
                  View === 0 && 'text-primary'
                )}
                onClick={() => setView(0)}
              >
                Xem theo kiểu 1
              </Dropdown.Item>
              <Dropdown.Item
                className={clsx(
                  'dropdown-item-active',
                  View === 1 && 'text-primary'
                )}
                onClick={() => setView(1)}
              >
                Xem theo kiểu 2
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

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
      <FilterToggle
        show={isFilter}
        filters={View === 0 ? filters : filters2}
        onHide={onHideFilter}
        onSubmit={onFilter}
        onRefresh={onRefresh}
        loading={View === 0 ? loading : isLoading}
        loadingExport={loadingExport}
        onExport={onExport}
      />
      <div className="bg-white rounded">
        <div className="border-gray-200 px-20px py-15px border-bottom d-flex align-items-center justify-content-between">
          <div className="fw-500 font-size-lg">Danh sách khách hàng</div>
        </div>
        <div className="p-20px">
          {View === 0 && (
            <ReactTableV7
              rowKey="Ids"
              useIsScrolling
              overscanRowCount={50}
              filters={filters}
              columns={columns}
              data={ListData}
              dataMobile={ListDataMobile}
              loading={loading}
              pageCount={pageCount}
              onPagesChange={onPagesChange}
              optionMobile={{
                CellModal: cell => OpenModalMobile(cell)
              }}
              rowRenderer={rowRenderer}
            />
          )}
          {View === 1 && (
            <ReactTableV7
              rowKey="Member.ID"
              filters={filters2}
              columns={columns2}
              data={data?.List || []}
              dataMobile={data?.List || []}
              loading={isLoading}
              pageCount={data?.PCount}
              onPagesChange={onPagesChange2}
              optionMobile={{
                CellModal: cell => OpenModalMobile(cell)
              }}
            />
          )}
        </div>
        <ModalViewMobile
          show={isModalMobile}
          onHide={HideModalMobile}
          data={initialValuesMobile}
          columns={View === 0 ? columns : columns2}
          View={View}
        />
      </div>
    </div>
  )
}

export default FrequencyUseCustomer
