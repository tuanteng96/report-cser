import React, { useEffect, useMemo, useState } from 'react'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import FilterList from 'src/components/Filter/FilterList'
import { useSelector } from 'react-redux'
import _ from 'lodash'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import reportsApi from 'src/api/reports.api'
import ModalViewMobile from './ModalViewMobile'
import Text from 'react-texty'
import { PriceHelper } from 'src/helpers/PriceHelper'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'

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
    Ps: 15, // Số lượng item
    MemberID: '',
    ten_nghiep_vu: ''
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
    getListOllCardSerive()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListOllCardSerive = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    reportsApi
      .getListOddService(BrowserHelpers.getRequestParamsList(filters))
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
          setPageCount(PCount)
          setLoading(false)
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
    getListOllCardSerive()
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
        key: 'CreateDate',
        title: 'Ngày thực hiện',
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
        key: 'UserName',
        title: 'Nhân viên thực hiện',
        dataKey: 'UserName',
        width: 300,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'StockTitle',
        title: 'Cơ sở',
        dataKey: 'StockTitle',
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Title',
        title: 'Nghiệp vụ',
        dataKey: 'Title',
        width: 300,
        sortable: false
      },
      {
        key: 'OsDetail',
        title: 'Chi tiết thực hiện',
        dataKey: 'OsDetail',
        cellRenderer: ({ rowData }) => (
          <Text tooltipMaxWidth={300}>{transformDetail(rowData)}</Text>
        ),
        width: 300,
        className: 'flex-fill',
        sortable: false
      }
    ],
    [filters]
  )

  const onExport = () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getListOddService(
          BrowserHelpers.getRequestParamsList(filters, {
            Total: PageTotal
          })
        ),
      UrlName: '/khach-hang/chinh-sua-the'
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

  const transformDetail = row => {
    if (!row) return
    if (
      row.Title === 'Đơn hàng thay đổi khách mua hàng' ||
      row.Title === 'Đơn hàng thay đổi khách hàng'
    ) {
      return (
        <>
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
        </>
      )
    }
    if (row.Title === 'Tạo buổi bảo hành') {
      return (
        <>
          Khách hàng
          <code className="font-size-md fw-600 mx-6px">
            {row.MemberName} - {row.MemberPhone}
          </code>
          tạo buổi bảo hành - dịch vụ thẻ
          <code className="font-size-md fw-600 ml-6px">{row.ProdTitle}</code>
        </>
      )
    }
    if (row.Title === 'Chuyển nhượng thẻ') {
      return (
        <>
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
        </>
      )
    }
    if (row.Title === 'Kích hoạt bảo hành') {
      return (
        <>
          khách hàng
          <code className="fw-600 font-size-md mx-6px">
            {row.MemberName} - {row.MemberPhone}
          </code>
          kích hoạt bảo hành - dịch vụ thẻ
          <code className="fw-600 font-size-md ml-6px">{row.ProdTitle}</code>
        </>
      )
    }
    if (row.Title === 'Kết thúc dịch vụ' || row.Title === 'Kết thúc dich vụ') {
      return (
        <>
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
        </>
      )
    }
    if (row.Title === 'Tặng buổi') {
      return (
        <>
          Tặng
          <code className="font-size-md fw-600 mx-6px">{row.OSAdd} buổi</code>
          dịch vụ
          <code className="font-size-md fw-600 mx-6px">{row.ProdTitle}</code>
          cho
          <code className="font-size-md fw-600 ml-6px">
            {row.MemberName} - {row.MemberPhone}
          </code>
        </>
      )
    }
    if (row.Title === 'Thay đổi ngày hết hạn') {
      return (
        <>
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
        </>
      )
    }
    if (row.Title === 'Thêm buổi') {
      return (
        <>
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
        </>
      )
    }
    if (row.Title === 'Xóa buổi') {
      return (
        <>
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
        </>
      )
    }
    if (row.Title === 'Thay đổi cơ sở') {
      return (
        <>
          Khách hàng
          <code className="font-size-md fw-600 mx-6px">
            {row.MemberName} - {row.MemberPhone}
          </code>
          chuyển dịch vụ
          <code className="font-size-md fw-600 mx-6px">{row.ProdTitle}</code>
          tới cơ sở
          <code className="font-size-md fw-600 ml-6px">{row.ToStockTitle}</code>
        </>
      )
    }
    if (row.Title === 'Xóa đơn hàng') {
      return (
        <>
          Xóa đơn hàng
          <code className="font-size-md fw-600 mx-6px">#{row.OrderID}</code>
          của khách hàng
          <code className="font-size-md fw-600 ml-6px">
            {row.MemberName} - {row.MemberPhone}
          </code>
        </>
      )
    }
    if (row.Title === 'kết thúc dịch vụ') {
      return (
        <>
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
        </>
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
          transformDetail={transformDetail}
        />
      </div>
    </div>
  )
}

export default OddCardService
