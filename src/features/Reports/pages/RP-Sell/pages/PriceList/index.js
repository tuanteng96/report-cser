import React, { useEffect, useMemo, useState } from 'react'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import FilterList from 'src/components/Filter/FilterList'
import { useSelector } from 'react-redux'
import _ from 'lodash'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import reportsApi from 'src/api/reports.api'
import ModalViewMobile from './ModalViewMobile'
import { PriceHelper } from 'src/helpers/PriceHelper'
import Text from 'react-texty'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

function PriceList(props) {
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
  const [ListData, setListData] = useState([])
  const [loading, setLoading] = useState(false)
  const [PageTotal, setPageTotal] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [initialValuesMobile, setInitialValuesMobile] = useState(null)
  const [isModalMobile, setIsModalMobile] = useState(false)
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
    getListPriceSell()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const GeneralNewFilter = filters => {
    const newObj = {
      ...filters,
      DateStart: null,
      DateEnd: null,
      Manu: filters.BrandId ? filters.BrandId.value : '',
      Cate: filters.CategoriesId ? filters.CategoriesId.value : '',
      Type:
        filters.TypeCNHng && filters.TypeCNHng.length > 0
          ? filters.TypeCNHng.map(item => item.value).join(',')
          : ''
    }
    delete newObj.BrandId
    delete newObj.CategoriesId
    delete newObj.TypeCNHng
    return newObj
  }

  const getListPriceSell = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    const newFilters = GeneralNewFilter(filters)
    reportsApi
      .getListPriceSell(BrowserHelpers.getRequestParams(newFilters))
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const { Items, Total, PCount } = {
            Items: data.result?.Items || [],
            Total: data.result?.Total || 0,
            PCount: data?.result?.PCount || 0
          }
          setListData(Items)
          setLoading(false)
          setPageCount(PCount)
          setPageTotal(Total)
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
    getListPriceSell()
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
        key: 'ID',
        title: 'ID',
        dataKey: 'ID',
        cellRenderer: ({ rowData }) => <div>#{rowData.ID}</div>,
        width: 100,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Ten',
        title: 'Tên mặt hàng',
        dataKey: 'Ten',
        width: 250,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'MaSP',
        title: 'Mã',
        dataKey: 'MaSP',
        width: 150,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'gia_goc',
        title: 'Giá gốc',
        dataKey: 'gia_goc',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.gia_goc),
        width: 150,
        sortable: false
      },
      {
        key: 'NguyenGia',
        title: 'Nguyên giá',
        dataKey: 'NguyenGia',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.NguyenGia),
        width: 150,
        sortable: false
      },
      {
        key: 'GiaKM',
        title: 'Giá hiện tại',
        dataKey: 'GiaKM',
        cellRenderer: ({ rowData }) =>
          rowData?.GiaKM > 0
            ? PriceHelper.formatVND(rowData?.GiaKM)
            : PriceHelper.formatVND(rowData?.NguyenGia),
        width: 150,
        sortable: false
      },
      {
        key: 'TonKho',
        title: 'Tồn kho',
        dataKey: 'TonKho',
        cellRenderer: ({ rowData }) =>
          rowData?.TonKho || rowData?.TonKho === 0
            ? `${PriceHelper.formatVND(rowData?.TonKho)} ${
                rowData?.DonVi || ''
              }`
            : '',
        width: 100,
        sortable: false
      },
      {
        key: 'DanhMuc',
        title: 'Danh mục',
        dataKey: 'DanhMuc',
        width: 150,
        sortable: false
      },
      {
        key: 'NhanHang',
        title: 'Nhãn hàng',
        dataKey: 'NhanHang',
        width: 150,
        sortable: false
      },
      {
        key: 'hoa_hong_sale',
        title: 'Hoa hồng Sale',
        dataKey: 'hoa_hong_sale',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData?.hoa_hong_sale),
        width: 150,
        sortable: false
      },
      {
        key: 'hoa_hong_ktv',
        title: 'Hoa hồng KTV',
        dataKey: 'hoa_hong_ktv',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(rowData?.hoa_hong_ktv),
        width: 150,
        sortable: false
      },
      {
        key: 'luong_ca',
        title: 'Lương ca',
        dataKey: 'luong_ca',
        cellRenderer: ({ rowData }) => (
          <Text tooltipMaxWidth={300}>
            {rowData.luong_ca_dv_goc &&
              rowData.luong_ca_dv_goc.map((o, index) => (
                <span key={index}>
                  {o.RootTitle} -{' '}
                  {o.Luong_ca_cap_bac && o.Luong_ca_cap_bac.length > 0 ? (
                    <div>
                      {o.Luong_ca_cap_bac.map((x, idx) => (
                        <code className="fw-600 font-size-md px-2" key={idx}>
                          {x.LevelName} {PriceHelper.formatVND(x?.Salary)}
                        </code>
                      )).reduce((prev, curr) => [prev, ', ', curr])}
                    </div>
                  ) : (
                    <code className="fw-600 font-size-md px-2px">
                      Lương ca {PriceHelper.formatVND(o?.Luong_ca)}
                    </code>
                  )}
                </span>
              ))}
          </Text>
        ),
        width: 300,
        sortable: false,
        className: 'flex-fill'
      }
    ],
    [filters]
  )

  const onExport = () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getListPriceSell(
          BrowserHelpers.getRequestParams(GeneralNewFilter(filters), {
            Total: PageTotal
          })
        ),
      UrlName: '/ban-hang/gia-ban-san-pham-dich-vu'
    })
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
            Bảng giá sản phẩm, dịch vụ
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
          <div className="fw-500 font-size-lg">Danh sách sản phẩm, dịch vụ</div>
        </div>
        <div className="p-20px">
          <ReactTableV7
            rowKey="ID"
            filters={filters}
            columns={columns}
            data={ListData}
            loading={loading}
            pageCount={pageCount}
            onPagesChange={onPagesChange}
            optionMobile={{
              CellModal: cell => OpenModalMobile(cell)
            }}
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

export default PriceList
