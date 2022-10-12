import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterList from 'src/components/Filter/FilterList'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import { PriceHelper } from 'src/helpers/PriceHelper'
import reportsApi from 'src/api/reports.api'
import ModalViewMobile from './ModalViewMobile'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import Text from 'react-texty'

import moment from 'moment'
import 'moment/locale/vi'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'
import clsx from 'clsx'
moment.locale('vi')

function PayrollStaff(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    Mon: new Date(), // Ngày bắt đầu
    Pi: 1, // Trang hiện tại
    Ps: 15 // Số lượng item
  })
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [ListData, setListData] = useState([])
  const [Total, setTotal] = useState({})
  const [PageTotal, setPageTotal] = useState(0)
  const [pageCount, setPageCount] = useState(0)
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
    reportsApi
      .getListStaffPayroll(BrowserHelpers.getRequestParamsList(filters))
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const { Items, Total, PCount, SumTotal } = {
            Items: data.result?.Items || [],
            Total: data.result?.Total || 0,
            PCount: data?.result?.PCount || 0,
            SumTotal: data.result?.Sum || {}
          }
          setListData(Items)
          setTotal({ ...Total, ...SumTotal })
          setLoading(false)
          setPageTotal(Total)
          setPageCount(PCount)
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
      getListPayroll()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    getListPayroll()
  }

  const onExport = () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getListStaffPayroll(
          BrowserHelpers.getRequestParamsList(filters, {
            Total: PageTotal
          })
        ),
      UrlName: '/nhan-vien/bang-luong'
    })
  }

  const columns = useMemo(
    () => [
      {
        key: 'index',
        title: 'STT',
        dataKey: 'index',
        cellRenderer: ({ rowIndex }) =>
          filters.Ps * (filters.Pi - 1) + (rowIndex + 1),
        width: 60,
        sortable: false,
        align: 'center',
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Id',
        title: 'ID',
        dataKey: 'Id',
        cellRenderer: ({ rowData }) => `#${rowData.Staff?.ID}`,
        width: 100,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Staff.FullName',
        title: 'Tên nhân viên',
        dataKey: 'Staff.FullName',
        width: 250,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'DiemQL',
        title: 'Cơ sở',
        dataKey: 'DiemQL',
        cellRenderer: ({ rowData }) => (
          <Text tooltipMaxWidth={300}>
            {rowData?.DiemQL && rowData?.DiemQL.length > 0
              ? rowData?.DiemQL.map(stock => stock.StockTitle).join(', ')
              : 'Chưa xác định'}
          </Text>
        ),
        width: 250,
        sortable: false
      },
      {
        key: 'LUONG_CAU_HINH',
        title: 'Lương chính sách',
        dataKey: 'LUONG_CAU_HINH',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.LUONG_CAU_HINH),
        footerRenderer: () => (
          <span className="text-success font-size-md font-number">
            {PriceHelper.formatVND(Total?.LUONG_CAU_HINH)}
          </span>
        ),
        width: 150,
        sortable: false
      },
      {
        key: 'PHU_CAP',
        title: 'Phụ cấp',
        dataKey: 'PHU_CAP',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.PHU_CAP),
        width: 150,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(Total?.PHU_CAP)}
          </span>
        )
      },
      {
        key: 'TRU_NGAY_NGHI',
        title: 'Ngày nghỉ',
        dataKey: 'TRU_NGAY_NGHI',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.TRU_NGAY_NGHI),
        width: 150,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number text-danger">
            {PriceHelper.formatVND(Total?.TRU_NGAY_NGHI)}
          </span>
        )
      },
      {
        key: 'THUONG',
        title: 'Thưởng',
        dataKey: 'THUONG',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.THUONG),
        width: 150,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(Total?.THUONG)}
          </span>
        )
      },
      {
        key: 'TRU_PHAT',
        title: 'Phạt',
        dataKey: 'TRU_PHAT',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.TRU_PHAT),
        width: 150,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number text-danger">
            {PriceHelper.formatVND(Total?.TRU_PHAT)}
          </span>
        )
      },
      {
        key: 'LUONG_CA',
        title: 'Lương Ca',
        dataKey: 'LUONG_CA',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.LUONG_CA),
        width: 150,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(Total?.LUONG_CA)}
          </span>
        )
      },
      {
        key: 'HOA_HONG',
        title: 'Hoa Hồng',
        dataKey: 'HOA_HONG',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.HOA_HONG),
        width: 150,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(Total?.HOA_HONG)}
          </span>
        )
      },
      {
        key: 'KPI_Hoa_hong',
        title: 'KPI Doanh số',
        dataKey: 'KPI_Hoa_hong',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.KPI_Hoa_hong),
        width: 150,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(Total?.KPI_Hoa_hong)}
          </span>
        )
      },
      {
        key: 'LUONG_DU_KIEN',
        title: 'Thu nhập dự kiến',
        dataKey: 'LUONG_DU_KIEN',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.LUONG_DU_KIEN),
        width: 150,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(Total?.LUONG_DU_KIEN)}
          </span>
        )
      },
      {
        key: 'GIU_LUONG',
        title: 'Giữ lương',
        dataKey: 'GIU_LUONG',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.GIU_LUONG),
        width: 150,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(Total?.GIU_LUONG)}
          </span>
        )
      },
      {
        key: 'THUC_TRA_DU_KIEN',
        title: 'Thực trả dự kiến',
        dataKey: 'THUC_TRA_DU_KIEN',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.THUC_TRA_DU_KIEN),
        width: 150,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(Total?.THUC_TRA_DU_KIEN)}
          </span>
        )
      },
      {
        key: 'TAM_UNG',
        title: 'Tạm ứng',
        dataKey: 'TAM_UNG',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData?.TAM_UNG - rowData?.HOAN_UNG),
        width: 150,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(Total?.TAM_UNG - Total?.HOAN_UNG)}
          </span>
        )
      },
      {
        key: 'Phai_Tra_Nhan_Vien',
        title: 'Phải trả nhân viên',
        dataKey: 'Phai_Tra_Nhan_Vien',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(
            rowData.THUC_TRA_DU_KIEN - (rowData.TAM_UNG - rowData.HOAN_UNG)
          ),
        width: 150,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number text-success">
            {PriceHelper.formatVND(
              Total?.THUC_TRA_DU_KIEN - (Total?.TAM_UNG - Total?.HOAN_UNG)
            )}
          </span>
        )
      },
      {
        key: 'DA_TRA',
        title: 'Đã trả',
        dataKey: 'DA_TRA',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.DA_TRA),
        width: 150,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(Total?.DA_TRA)}
          </span>
        )
      },
      {
        key: 'TON_GIU_LUONG',
        title: 'Tồn giữ lương',
        dataKey: 'TON_GIU_LUONG',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData.TON_GIU_LUONG),
        width: 150,
        sortable: false,
        footerRenderer: () => (
          <span className="font-size-md font-number">
            {PriceHelper.formatVND(Total?.TON_GIU_LUONG)}
          </span>
        )
      }
    ],
    [filters, Total]
  )

  const onPagesChange = ({ Pi, Ps }) => {
    setFilters({ ...filters, Pi, Ps })
  }

  const OpenModalMobile = value => {
    setInitialValuesMobile(value)
    setIsModalMobile(true)
  }

  const HideModalMobile = () => {
    setInitialValuesMobile(null)
    setIsModalMobile(false)
  }

  const headerRenderer = ({ cells, columns, headerIndex }) => {
    if (headerIndex === 0) {
      return cells
    }
    const groupCells = []
    columns.forEach((column, columnIndex) => {
      groupCells.push(
        <div
          className={clsx(
            cells[columnIndex].props.className,
            !column.footerRenderer && 'bg-stripes',
            'bg-gray-200'
          )}
          key={`header-group-cell-${column.key}`}
          style={{ ...cells[columnIndex].props.style }}
        >
          {column.footerRenderer && column.footerRenderer()}
        </div>
      )
    })
    return groupCells
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Bảng lương nhân viên
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
      <div className="bg-white rounded">
        <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between">
          <div className="fw-500 font-size-lg">Danh sách nhân viên</div>
        </div>
        <div className="p-20px">
          <ReactTableV7
            rowKey="Staff.ID"
            filters={filters}
            columns={columns}
            data={ListData}
            loading={loading}
            pageCount={pageCount}
            onPagesChange={onPagesChange}
            optionMobile={{
              CellModal: cell => OpenModalMobile(cell)
            }}
            headerHeight={[50, 50]}
            headerRenderer={headerRenderer}
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

export default PayrollStaff
