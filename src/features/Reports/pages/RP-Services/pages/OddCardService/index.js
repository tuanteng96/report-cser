import React, { useEffect, useState } from 'react'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import FilterList from 'src/components/Filter/FilterList'
import { useSelector } from 'react-redux'
import _ from 'lodash'
import BaseTablesCustom from 'src/components/Tables/BaseTablesCustom'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import reportsApi from 'src/api/reports.api'
// import ModalViewMobile from './ModalViewMobile'
import { ArrayHeplers } from 'src/helpers/ArrayHeplers'
import { PriceHelper } from 'src/helpers/PriceHelper'

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

function OddCardService(props) {
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
    MemberID: '',
    ten_nghiep_vu: ''
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
    getListOllCardSerive()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const GeneralNewFilter = filters => {
    const newObj = {
      ...filters,
      DateStart: filters.DateStart
        ? moment(filters.DateStart).format('DD/MM/yyyy')
        : null,
      DateEnd: filters.DateEnd
        ? moment(filters.DateEnd).format('DD/MM/yyyy')
        : null,
      MemberID: filters.MemberID ? filters.MemberID?.value : '',
      ten_nghiep_vu: filters.ten_nghiep_vu ? filters.ten_nghiep_vu.value : ''
    }
    return newObj
  }
  const getListOllCardSerive = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    const newFilters = GeneralNewFilter(filters)
    reportsApi
      .getListOddService(newFilters)
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
    getListOllCardSerive()
  }

  const onExport = () => {
    setLoadingExport(true)
    const newFilters = GeneralNewFilter(
      ArrayHeplers.getFilterExport({ ...filters }, PageTotal)
    )
    reportsApi
      .getListOddService(newFilters)
      .then(({ data }) => {
        window?.EzsExportExcel &&
          window?.EzsExportExcel({
            Url: '/khach-hang/chinh-sua-the',
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

  const transformDetail = row => {
    if (row.Title === 'Đơn hàng thay đổi khách mua hàng') {
      return (
        <div>
          Đơn hàng
          <code className="mx-6px font-size-md fw-600">#{row.OrderID}</code>
          được chuyển từ khách hàng
          <code className="mx-6px font-size-md fw-600">
            {row.OrderFromAnonymous ? (
              'Khách vãng lai'
            ) : (
              <>
                {row.OrderFromSenderName} - {row.OrderFromSenderPhone}
              </>
            )}
          </code>
          đến khách hàng
          <code className="ml-6px font-size-md fw-600">
            {row.OrderToSenderName || 'Chưa xác định'} -{' '}
            {row.OrderToSenderPhone || 'Chưa xác định'}
          </code>
        </div>
      )
    }
    if (row.Title === 'Tạo buổi bảo hành') {
      return (
        <div>
          Khách hàng
          <code className="font-size-md fw-600 mx-6px">
            {row.MemberName} - {row.MemberPhone}
          </code>
          tạo buổi bảo hành - dịch vụ thẻ
          <code className="font-size-md fw-600 ml-6px">{row.ProdTitle}</code>
        </div>
      )
    }
    if (row.Title === 'Chuyển nhượng thẻ') {
      return (
        <div>
          Chuyển nhựng
          <code className="font-size-md fw-600 mx-6px">
            {row.ProdTitle} - {row.OSUpdate} buổi
          </code>
          từ khách hàng
          <code className="font-size-md fw-600 mx-6px">
            {row.MemberName} - {row.MemberPhone}
          </code>
          tới khách hàng
          <code className="font-size-md fw-600 ml-6px">
            {row.ToMemberName} - {row.ToMemberPhone}
          </code>
        </div>
      )
    }
    if (row.Title === 'Kích hoạt bảo hành') {
      return (
        <div>
          <div>
            khách hàng
            <code className="fw-600 font-size-md mx-6px">
              {row.MemberName} - {row.MemberPhone}
            </code>
            kích hoạt bảo hành - dịch vụ thẻ
            <code className="fw-600 font-size-md ml-6px">{row.ProdTitle}</code>
          </div>
        </div>
      )
    }
    if (row.Title === 'Kết thúc dich vụ') {
      console.log(row)
      return (
        <div>
          Khách hàng
          <code className="fw-600 font-size-md mx-6px">
            {row.MemberName} - {row.MemberPhone}
          </code>
          kết thúc
          <code className="fw-600 font-size-md ml-6px">
            {row.OSUpdate} buổi
          </code>
          của
          <code className="fw-600 font-size-md ml-6px">{row.ProdTitle}</code>,
          Hoàn tiền
          <code className="fw-600 font-size-md mx-6px">
            {PriceHelper.formatVND(row.GiveCash)}
          </code>
          , Hoàn Ví
          <code className="fw-600 font-size-md mx-6px">
            {PriceHelper.formatVND(row.GiveMM)}
          </code>
          , Hoàn thẻ tiền
          <code className="fw-600 font-size-md mx-6px">
            {PriceHelper.formatVND(row.GiveMoneyCard)}
          </code>
          , Thu thêm từ khách
          <code className="fw-600 font-size-md mx-6px">
            {PriceHelper.formatVND(row.TakeCash)}
          </code>
        </div>
      )
    }
    if (row.Title === 'Tặng buổi') {
      return (
        <div>
          Tặng
          <code className="font-size-md fw-600 mx-6px">{row.OSAdd} buổi</code>
          dịch vụ
          <code className="font-size-md fw-600 mx-6px">{row.ProdTitle}</code>
          cho
          <code className="font-size-md fw-600 ml-6px">
            {row.MemberName} - {row.MemberPhone}
          </code>
        </div>
      )
    }
    if (row.Title === 'Thay đổi ngày hết hạn') {
      return (
        <div>
          Khách hàng
          <code className="font-size-md fw-600 mx-6px">
            {row.MemberName} - {row.MemberPhone}
          </code>
          thay đổi ngày hết hạn dịch vụ
          <code className="font-size-md fw-600 mx-6px">{row.ProdTitle}</code>
          từ
          <code className="font-size-md fw-600 mx-6px">
            {moment(row.OSFromEndDate).format('HH:mm DD-MM-YYYY')}
          </code>
          đến
          <code className="font-size-md fw-600 ml-6px">
            {moment(row?.OSToEndDate).format('HH:mm DD-MM-YYYY')}
          </code>
        </div>
      )
    }
    if (row.Title === 'Thêm buổi') {
      return (
        <div>
          Khách hàng
          <code className="font-size-md fw-600 mx-6px">
            {row.MemberName} - {row.MemberPhone}
          </code>
          thêm
          <code className="font-size-md fw-600 mx-6px">
            {row.OSUpdate} buổi
          </code>
          dịch vụ
          <code className="font-size-md fw-600 ml-6px">{row.ProdTitle}</code>
        </div>
      )
    }
    if (row.Title === 'Xóa buổi') {
      return (
        <div>
          Khách hàng
          <code className="font-size-md fw-600 mx-6px">
            {row.MemberName} - {row.MemberPhone}
          </code>
          xóa
          <code className="font-size-md fw-600 mx-6px">
            {row.OSUpdate} buổi
          </code>
          dịch vụ
          <code className="font-size-md fw-600 mx-6px">{row.ProdTitle}</code>
          hoàn ví
          <code className="font-size-md fw-600 ml-6px">
            {PriceHelper.formatVND(row.GiveMM)}
          </code>
        </div>
      )
    }
    if (row.Title === 'Thay đổi cơ sở') {
      return (
        <div>
          Khách hàng
          <code className="font-size-md fw-600 mx-6px">
            {row.MemberName} - {row.MemberPhone}
          </code>
          chuyển dịch vụ
          <code className="font-size-md fw-600 mx-6px">{row.ProdTitle}</code>
          tới cơ sở
          <code className="font-size-md fw-600 ml-6px">{row.ToStockTitle}</code>
        </div>
      )
    }
    if (row.Title === 'Xóa đơn hàng') {
      return (
        <div>
          Xóa đơn hàng
          <code className="font-size-md fw-600 mx-6px">#{row.OrderID}</code>
          của khách hàng
          <code className="font-size-md fw-600 ml-6px">
            {row.MemberName} - {row.MemberPhone}
          </code>
        </div>
      )
    }
    if (row.Title === 'kết thúc dịch vụ') {
      return (
        <div>
          <div>
            Khách hàng
            <code className="font-size-md fw-600 mx-6px">
              {row.MemberName} - {row.MemberPhone}
            </code>
            <code className="font-size-md fw-600 mx-6px">{row.ProdTitle}</code>
            kết thúc
            <code className="font-size-md fw-600 ml-6px">
              {row.OSUpdate} buổi
            </code>
          </div>
          <div>
            Hoàn tiền mặt
            <code className="font-size-md fw-600 mx-6px">
              {PriceHelper.formatVND(row.GiveCash)}
            </code>
          </div>
          <div>
            Hoàn ví
            <code className="font-size-md fw-600 mx-6px">
              {PriceHelper.formatVND(row.GiveMM)}
            </code>
          </div>
          <div>
            Hoàn thẻ tiền
            <code className="font-size-md fw-600 mx-6px">
              {PriceHelper.formatVND(row.GiveMoneyCard)}
            </code>
          </div>
          <div>
            Thu thêm khách
            <code className="font-size-md fw-600 mx-6px">
              {PriceHelper.formatVND(row.TakeCash)}
            </code>
          </div>
        </div>
      )
    }
    return row.Title
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Báo cáo nghiệp vụ
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
          <div className="fw-500 font-size-lg">Danh sách nghiệp vụ</div>
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
                dataField: 'CreateDate',
                text: 'Ngày',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  moment(row.CreateDate).format('HH:mm DD/MM/YYYY'),
                attrs: { 'data-title': 'Ngày' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'UserName',
                text: 'Nhân viên thực hiện',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.UserName || 'Chưa có',
                attrs: { 'data-title': 'Nhân viên thực hiện' },
                headerStyle: () => {
                  return { minWidth: '300px', width: '300px' }
                }
              },
              {
                dataField: 'StockTitle',
                text: 'Cơ sở',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row?.StockTitle,
                attrs: { 'data-title': 'Cơ sở' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'Title',
                text: 'Nghiệp vụ',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.Title,
                attrs: { 'data-title': 'Nghiệp vụ' },
                headerStyle: () => {
                  return { minWidth: '300px', width: '300px' }
                }
              },
              {
                dataField: 'Chi tiết',
                text: 'Chi tiết thực hiện',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => transformDetail(row),
                attrs: { 'data-title': 'Giá hiện tại' },
                headerStyle: () => {
                  return { minWidth: '150px' }
                }
              }
            ]}
            loading={loading}
            keyField="ID"
            className="table-responsive-attr"
            classes="table-bordered"
          />
        </div>
        {/* <ModalViewMobile
          show={isModalMobile}
          onHide={HideModalMobile}
          data={initialValuesMobile}
        /> */}
      </div>
    </div>
  )
}

export default OddCardService
