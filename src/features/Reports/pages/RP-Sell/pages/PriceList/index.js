import React, { useEffect, useState } from 'react'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import FilterList from 'src/components/Filter/FilterList'
import { useSelector } from 'react-redux'
import _ from 'lodash'
import BaseTablesCustom from 'src/components/Tables/BaseTablesCustom'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import reportsApi from 'src/api/reports.api'
import ModalViewMobile from './ModalViewMobile'
import { ArrayHeplers } from 'src/helpers/ArrayHeplers'
import { PriceHelper } from 'src/helpers/PriceHelper'

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
    Ps: 10, // Số lượng item
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
      .getListPriceSell(newFilters)
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const { Items, Total } = {
            Items: data.result?.Items || [],
            Total: data.result?.Total || 0
          }
          setListData(Items)
          setLoading(false)
          setPageTotal(Total)
          isFilter && setIsFilter(false)
          callback && callback()
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

  const onExport = () => {
    setLoadingExport(true)
    const newFilters = GeneralNewFilter(
      ArrayHeplers.getFilterExport({ ...filters }, PageTotal)
    )
    reportsApi
      .getListPriceSell(newFilters)
      .then(({ data }) => {
        window?.EzsExportExcel &&
          window?.EzsExportExcel({
            Url: '/ban-hang/gia-ban-san-pham-dich-vu',
            Data: data,
            hideLoading: () => setLoadingExport(false)
          })
      })
      .catch(error => console.log(error))
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
          <BaseTablesCustom
            data={ListData}
            textDataNull="Không có dữ liệu."
            optionsMoible={{
              itemShow: 2,
              CallModal: row => OpenModalMobile(row),
              columns: [
                {
                  dataField: 'FullName',
                  text: 'Tên mặt hàng',
                  //headerAlign: "center",
                  //style: { textAlign: "center" },
                  formatter: (cell, row) => row.Ten || 'Không có tên',
                  attrs: { 'data-title': 'Tên mặt hàng' },
                  headerStyle: () => {
                    return { minWidth: '200px', width: '200px' }
                  }
                },
                {
                  dataField: 'Mã',
                  text: 'Mã',
                  //headerAlign: "center",
                  //style: { textAlign: "center" },
                  formatter: (cell, row) => row.MaSP || 'Không có mã',
                  attrs: { 'data-title': 'Mã' },
                  headerStyle: () => {
                    return { minWidth: '200px', width: '200px' }
                  }
                }
              ]
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
                setFilters({ ...filters, Ps: Ps, Pi: 1 })
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
                dataField: 'ID',
                text: 'ID',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => <div>#{row.ID}</div>,
                attrs: { 'data-title': 'ID' },
                headerStyle: () => {
                  return { minWidth: '80px', width: '80px' }
                }
              },
              {
                dataField: 'Ten',
                text: 'Tên mặt hàng',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.Ten || 'Chưa có',
                attrs: { 'data-title': 'Tên mặt hàng' },
                headerStyle: () => {
                  return { minWidth: '250px', width: '250px' }
                }
              },
              {
                dataField: 'MaSP',
                text: 'Mã',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row?.MaSP,
                attrs: { 'data-title': 'Mã' },
                headerStyle: () => {
                  return { minWidth: '120px', width: '120px' }
                }
              },
              {
                dataField: 'NguyenGia',
                text: 'Nguyên giá',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row?.NguyenGia),
                attrs: { 'data-title': 'Nguyên giá' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'GiaKM',
                text: 'Giá hiện tại',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  row?.GiaKM > 0
                    ? PriceHelper.formatVND(row?.GiaKM)
                    : PriceHelper.formatVND(row?.NguyenGia),
                attrs: { 'data-title': 'Giá hiện tại' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'TonKho',
                text: 'Tồn kho',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  row?.TonKho || row?.TonKho === 0
                    ? `${PriceHelper.formatVND(row?.TonKho)} ${
                        row?.DonVi || ''
                      }`
                    : '',
                attrs: { 'data-title': 'Tồn kho' },
                headerStyle: () => {
                  return { minWidth: '100px', width: '100px' }
                }
              },
              {
                dataField: 'DanhMuc',
                text: 'Danh mục',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row?.DanhMuc,
                attrs: { 'data-title': 'Danh mục' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'NhanHang',
                text: 'Nhãn hàng',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row?.NhanHang,
                attrs: { 'data-title': 'Nhãn hàng' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'hoa_hong_sale',
                text: 'Hoa hồng Sale',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row?.hoa_hong_sale),
                attrs: { 'data-title': 'Hoa hồng Sale' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'hoa_hong_ktv',
                text: 'Hoa hồng KTV',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row?.hoa_hong_ktv),
                attrs: { 'data-title': 'Hoa hồng KTV' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'luong_ca',
                text: 'Lương ca',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row?.luong_ca),
                attrs: { 'data-title': 'Lương ca' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              }
            ]}
            loading={loading}
            keyField="ID"
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

export default PriceList
