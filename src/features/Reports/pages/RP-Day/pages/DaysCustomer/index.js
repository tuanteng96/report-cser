import React, { Fragment, useEffect, useMemo, useState } from 'react'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import { useSelector } from 'react-redux'
import FilterList from 'src/components/Filter/FilterList'
import _ from 'lodash'
import { uuidv4 } from '@nikitababko/id-generator'
import { PriceHelper } from 'src/helpers/PriceHelper'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'
import ModalViewMobile from './ModalViewMobile'
import { JsonFilter } from 'src/Json/JsonFilter'
import reportsApi from 'src/api/reports.api'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'

import moment from 'moment'
import 'moment/locale/vi'
import { BrowserHelpers } from 'src/helpers/BrowserHelpers'
import { OverlayTrigger, Popover } from 'react-bootstrap'

moment.locale('vi')

const converArray = arr => {
  if (!arr) return []
  const newArray = arr.map((item, index) => ({
    ...item,
    Ids: uuidv4(),
    rowIndex: index,
    children:
      item.children && item.children.length > 0
        ? item.children.map((sub, i) => ({
            ...sub,
            Ids: uuidv4(),
            id: `${index}-detail`
          }))
        : []
  }))
  return newArray
}

const DetailRenderer = ({ filters, ...props }) => {
  const { MajorList, More } = {
    MajorList: [
      ...props.rowData.MajorList.filter(x => x.Order),
      ...props.rowData.MajorList.filter(x => x.PayDebt),
      ...props.rowData.MajorList.filter(x => x.Returns),
      ...props.rowData.MajorList.filter(x => x.Services)
    ],
    More: props.rowData.More
  }
  const showDH_SĐV =
    _.includes(filters.ViewType, 'DON_HANG') ||
    _.includes(filters.ViewType, 'SD_DICH_VU') ||
    _.includes(filters.ViewType, 'THANH_TOAN_NO')
  return (
    <div className="p-15px w-100">
      {showDH_SĐV && (
        <div className="mb-15px">
          <div className="mb-8px text-uppercase fw-600 font-size-md">
            <span className="text-danger">(*)</span> Đơn hàng & Sử dụng dịch vụ
          </div>
          <div className="table-responsive">
            {MajorList && MajorList.length > 0 ? (
              <table className="table table-bordered mb-0">
                <tbody>
                  {MajorList &&
                    MajorList.map((item, index) => (
                      <Fragment key={index}>
                        {item.Order && (
                          <tr>
                            <td className="vertical-align-middle min-w-200px w-200px">
                              <div>Đơn hàng mới</div>
                              <span className="fw-600 pl-5px">
                                #{item.Order.ID}
                              </span>
                            </td>
                            <td className="vertical-align-middle min-w-300px w-300px">
                              <div>Sản phẩm / Dịch vụ</div>
                              <div className="fw-600">
                                {item.Order.Prods.map(
                                  item => `${item.Title} (x${item.Qty})`
                                ).join(', ')}
                              </div>
                            </td>
                            <td className="vertical-align-middle min-w-180px w-180px">
                              <div>Giá bán đơn hàng</div>
                              <div className="fw-600">
                                {PriceHelper.formatVND(
                                  item.Order.GiaBanDonHang
                                )}
                              </div>
                            </td>
                            <td className="vertical-align-middle min-w-180px w-180px">
                              <div>Thanh toán</div>
                              <div className="fw-600 d-flex justify-content-between">
                                {PriceHelper.formatVND(item.Order.ThanhToan)}
                                <OverlayTrigger
                                  rootClose
                                  trigger="click"
                                  key="top"
                                  placement="top"
                                  overlay={
                                    <Popover id={`popover-positioned-top`}>
                                      <Popover.Header
                                        className="py-10px text-uppercase fw-600"
                                        as="h3"
                                      >
                                        Chi tiết thanh toán
                                      </Popover.Header>
                                      <Popover.Body className="p-0">
                                        <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                                          <span>Tiền mặt</span>
                                          <span>
                                            {PriceHelper.formatVNDPositive(
                                              item.Order.ThanhToan_TienMat
                                            )}
                                          </span>
                                        </div>
                                        <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                                          <span>Chuyển khoản</span>
                                          <span>
                                            {PriceHelper.formatVNDPositive(
                                              item.Order.ThanhToan_CK
                                            )}
                                          </span>
                                        </div>
                                        <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                                          <span>Quẹt thẻ</span>
                                          <span>
                                            {PriceHelper.formatVNDPositive(
                                              item.Order.ThanhToan_QT
                                            )}
                                          </span>
                                        </div>
                                      </Popover.Body>
                                    </Popover>
                                  }
                                >
                                  <div className="d-flex justify-content-between align-items-center">
                                    <i className="fa-solid fa-circle-exclamation cursor-pointer text-success ml-5px"></i>
                                  </div>
                                </OverlayTrigger>
                              </div>
                            </td>
                            <td className="vertical-align-middle min-w-180px w-180px">
                              <div>Thanh toán ví</div>
                              <div className="fw-600">
                                {PriceHelper.formatVNDPositive(item.Order.Vi)}
                              </div>
                            </td>
                            <td className="vertical-align-middle min-w-180px w-180px">
                              <div>Thanh toán thẻ tiền</div>
                              <div className="fw-600">
                                {PriceHelper.formatVNDPositive(
                                  item.Order.TheTien
                                )}
                              </div>
                            </td>
                            <td className="vertical-align-middle min-w-180px w-180px">
                              <div>Còn nợ</div>
                              <div className="fw-600">
                                {PriceHelper.formatVND(item.Order.No)}
                              </div>
                            </td>
                            <td className="vertical-align-middle min-w-180px w-180px">
                              <div>Hoa hồng</div>
                              {item?.Order?.HoaHong &&
                              item?.Order?.HoaHong.length > 0
                                ? item?.Order?.HoaHong.map((item, index) => (
                                    <div className="fw-600" key={index}>
                                      {item.FullName}{' '}
                                      {PriceHelper.formatVND(item.Bonus)}
                                    </div>
                                  ))
                                : 'Không'}
                            </td>
                            <td className="vertical-align-middle min-w-180px w-180px">
                              <div>Doanh số</div>
                              {item.Order?.DoanhSo &&
                              item.Order?.DoanhSo.length > 0
                                ? item.Order?.DoanhSo.map((item, index) => (
                                    <div className="fw-600" key={index}>
                                      {item.FullName}{' '}
                                      {PriceHelper.formatVND(item.Bonus)}
                                    </div>
                                  ))
                                : 'Không'}
                            </td>
                          </tr>
                        )}
                        {item.PayDebt && (
                          <tr>
                            <td className="vertical-align-middle min-w-200px w-200px">
                              <div>Thanh toán nợ</div>
                              <span className="fw-600 pl-5px">
                                #{item.PayDebt.ID}
                              </span>
                            </td>
                            <td className="vertical-align-middle min-w-300px w-300px">
                              <div>Sản phẩm / Dịch vụ</div>
                              <div className="fw-600">
                                {item?.PayDebt?.Prods &&
                                item?.PayDebt?.Prods.length > 0
                                  ? item?.PayDebt?.Prods.map(
                                      item => `${item.Title} (x${item.Qty})`
                                    ).join(', ')
                                  : 'Không có'}
                              </div>
                            </td>
                            <td className="vertical-align-middle min-w-180px w-180px"></td>
                            <td className="vertical-align-middle min-w-180px w-180px">
                              <div>Thanh toán</div>
                              <div className="fw-600 d-flex justify-content-between">
                                {PriceHelper.formatVND(item.PayDebt.ThanhToan)}
                                <OverlayTrigger
                                  rootClose
                                  trigger="click"
                                  key="top"
                                  placement="top"
                                  overlay={
                                    <Popover id={`popover-positioned-top`}>
                                      <Popover.Header
                                        className="py-10px text-uppercase fw-600"
                                        as="h3"
                                      >
                                        Chi tiết thanh toán
                                      </Popover.Header>
                                      <Popover.Body className="p-0">
                                        <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                                          <span>Tiền mặt</span>
                                          <span>
                                            {PriceHelper.formatVNDPositive(
                                              item.PayDebt.ThanhToan_TienMat
                                            )}
                                          </span>
                                        </div>
                                        <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                                          <span>Chuyển khoản</span>
                                          <span>
                                            {PriceHelper.formatVNDPositive(
                                              item.PayDebt.ThanhToan_CK
                                            )}
                                          </span>
                                        </div>
                                        <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                                          <span>Quẹt thẻ</span>
                                          <span>
                                            {PriceHelper.formatVNDPositive(
                                              item.PayDebt.ThanhToan_QT
                                            )}
                                          </span>
                                        </div>
                                      </Popover.Body>
                                    </Popover>
                                  }
                                >
                                  <div className="d-flex justify-content-between align-items-center">
                                    <i className="fa-solid fa-circle-exclamation cursor-pointer text-success ml-5px"></i>
                                  </div>
                                </OverlayTrigger>
                              </div>
                            </td>
                            <td className="vertical-align-middle min-w-180px w-180px">
                              <div>Thanh toán ví</div>
                              <div className="fw-600">
                                {PriceHelper.formatVNDPositive(item.PayDebt.Vi)}
                              </div>
                            </td>
                            <td className="vertical-align-middle min-w-180px w-180px">
                              <div>Thanh toán thẻ tiền</div>
                              <div className="fw-600">
                                {PriceHelper.formatVNDPositive(
                                  item.PayDebt.TheTien
                                )}
                              </div>
                            </td>
                            <td className="vertical-align-middle min-w-180px w-180px">
                              <div>Còn nợ</div>
                              <div className="fw-600">
                                {PriceHelper.formatVNDPositive(item.PayDebt.No)}
                              </div>
                            </td>
                            <td className="vertical-align-middle min-w-180px w-180px">
                              <div>Hoa hồng</div>
                              {item?.PayDebt?.HoaHong &&
                              item?.PayDebt?.HoaHong.length > 0
                                ? item?.PayDebt?.HoaHong.map((item, index) => (
                                    <div className="fw-600" key={index}>
                                      {item.FullName}{' '}
                                      {PriceHelper.formatVND(item.Bonus)}
                                    </div>
                                  ))
                                : 'Không'}
                            </td>
                            <td className="vertical-align-middle min-w-180px w-180px">
                              <div>Doanh số</div>
                              {item?.PayDebt?.DoanhSo &&
                              item?.PayDebt?.DoanhSo.length > 0
                                ? item?.PayDebt?.DoanhSo.map((item, index) => (
                                    <div className="fw-600" key={index}>
                                      {item.FullName}{' '}
                                      {PriceHelper.formatVND(item.Bonus)}
                                    </div>
                                  ))
                                : 'Không'}
                            </td>
                          </tr>
                        )}
                        {item.Returns && (
                          <tr>
                            <td className="vertical-align-middle min-w-200px w-200px">
                              <div>Đơn trả hàng</div>
                              <span className="fw-600 pl-5px">
                                #{item.Returns.ID}
                              </span>
                            </td>
                            <td className="vertical-align-middle min-w-300px w-300px">
                              <div>Sản phẩm / Dịch vụ</div>
                              <div className="fw-600">
                                {item?.Returns?.Prods &&
                                item?.Returns?.Prods.length > 0
                                  ? item?.Returns?.Prods.map(
                                      item => `${item.Title} (x${item.Qty})`
                                    ).join(', ')
                                  : 'Không'}
                              </div>
                            </td>
                            <td className="vertical-align-middle min-w-180px w-180px">
                              <div>Giá trị đơn trả</div>
                              <div className="fw-600 text-danger">
                                {PriceHelper.formatVND(
                                  item.Returns.GiaTriDonTra
                                )}
                              </div>
                            </td>
                            <td className="vertical-align-middle min-w-180px w-180px">
                              <div>Hoàn tiền mặt</div>
                              <div className="fw-600">
                                {PriceHelper.formatVND(
                                  item.Returns.HoanTienMat
                                )}
                              </div>
                            </td>
                            <td className="vertical-align-middle min-w-180px w-180px">
                              <div>Hoàn ví</div>
                              <div className="fw-600">
                                {PriceHelper.formatVND(item.Returns.HoanVi)}
                              </div>
                            </td>
                            <td className="vertical-align-middle min-w-180px w-180px">
                              <div>Hoàn thẻ tiền</div>
                              <div className="fw-600">
                                {PriceHelper.formatVND(
                                  item.Returns.HoanTheTien
                                )}
                              </div>
                            </td>
                            <td className="vertical-align-middle min-w-180px w-180px"></td>
                            <td className="vertical-align-middle min-w-180px w-180px">
                              <div>Hoa hồng giảm</div>
                              {item?.Returns?.HoaHongGiam &&
                              item?.Returns?.HoaHongGiam.length > 0
                                ? item?.Returns?.HoaHongGiam.map(
                                    (item, index) => (
                                      <div className="fw-600" key={index}>
                                        {item.FullName}{' '}
                                        {PriceHelper.formatVND(item.Bonus)}
                                      </div>
                                    )
                                  )
                                : 'Không'}
                            </td>
                            <td className="vertical-align-middle min-w-180px w-180px">
                              <div className="fw-600">Doanh số giảm</div>
                              {item?.Returns?.DoanhSoGiam &&
                              item?.Returns?.DoanhSoGiam.length > 0
                                ? item?.Returns?.DoanhSoGiam.map(
                                    (item, index) => (
                                      <div className="fw-600" key={index}>
                                        {item.FullName}{' '}
                                        {PriceHelper.formatVND(item.Bonus)}
                                      </div>
                                    )
                                  )
                                : 'Không'}
                            </td>
                          </tr>
                        )}
                        {item.Services &&
                          item.Services.map((service, idx) => (
                            <tr key={idx}>
                              {service.Type && idx === 0 && (
                                <td
                                  className="vertical-align-middle min-w-200px w-200px fw-600"
                                  rowSpan={item.Services.length}
                                >
                                  {service.Type}
                                </td>
                              )}
                              <td className="vertical-align-middle min-w-300px w-300px">
                                <div>Sản phẩm / Dịch vụ</div>
                                <div className="fw-600">{service.Title}</div>
                              </td>
                              <td className="vertical-align-middle min-w-180px w-180px">
                                <div>Phụ Phí</div>
                                <div className="fw-600">
                                  {service?.PhuPhi && service?.PhuPhi.length > 0
                                    ? service?.PhuPhi.map(o => o.Title).join(
                                        ', '
                                      )
                                    : 'Không'}
                                </div>
                              </td>
                              <td className="vertical-align-middle min-w-180px w-180px"></td>
                              <td className="vertical-align-middle min-w-180px w-180px"></td>
                              <td className="vertical-align-middle min-w-180px w-180px"></td>
                              <td className="vertical-align-middle min-w-180px w-180px"></td>
                              <td className="vertical-align-middle min-w-180px w-180px">
                                <div>Hoa hồng</div>
                                {service.HoaHong && service.HoaHong.length > 0
                                  ? service.HoaHong.map((item, index) => (
                                      <div className="fw-600" key={index}>
                                        {item.FullName}{' '}
                                        {PriceHelper.formatVND(item.Bonus)}
                                      </div>
                                    ))
                                  : 'Không'}
                              </td>
                              <td className="vertical-align-middle min-w-180px w-180px"></td>
                            </tr>
                          ))}
                      </Fragment>
                    ))}
                </tbody>
              </table>
            ) : (
              <div className="pl-15px">Chưa có dữ liệu</div>
            )}
          </div>
        </div>
      )}
      {_.includes(filters.ViewType, 'NGHIEP_VU_KHAC') &&
        More &&
        More.length > 0 && (
          <div className="mb-15px">
            <div className="mb-8px text-uppercase fw-600 font-size-md">
              <span className="text-danger">(*)</span> Nghiệp vụ khác
            </div>
            <div className="table-responsive">
              <table className="table table-bordered mb-0">
                <thead>
                  <tr>
                    <th className="min-w-250px w-250px">Tên nghiệp vụ</th>
                    <th className="min-w-200px w-200px">Giá trị</th>
                    <th className="min-w-200px w-200px">
                      Phát sinh thu / Chi TM
                    </th>
                    <th className="min-w-250px w-250px">Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {More && More.length > 0 ? (
                    More.map((item, index) => (
                      <tr key={index}>
                        <td className="min-w-250px w-250px">
                          {item.Title || 'Chưa xác định'}
                        </td>
                        <td className="min-w-200px w-200px">
                          {PriceHelper.formatVND(item.Value)}
                        </td>
                        <td className="min-w-200px w-200px">
                          {PriceHelper.formatVND(item.PhatSinhThuChi)}
                        </td>
                        <td className="min-w-250px w-250px">{item.Desc}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="text-center" colSpan={4}>
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
  const [ListData, setListData] = useState([])
  const [pageCount, setPageCount] = useState(0)
  const [isFilter, setIsFilter] = useState(false)
  const [PageTotal, setPageTotal] = useState(0)
  const [loadingExport, setLoadingExport] = useState(false)
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    Pi: 1, // Trang hiện tại
    Ps: 15, // Số lượng item
    Date: new Date(),
    ViewType: [
      JsonFilter.ViewTypeList[0].value,
      JsonFilter.ViewTypeList[1].value,
      JsonFilter.ViewTypeList[2].value,
      JsonFilter.ViewTypeList[3].value
    ]
  })
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
    getAllDays()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getAllDays = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    const newFilters = {
      ...filters,
      DateStart: filters.Date ? moment(filters.Date).format('DD/MM/yyyy') : '', // moment(filters.Date).format('DD/MM/yyyy')
      DateEnd: filters.Date ? moment(filters.Date).format('DD/MM/yyyy') : '',
      ViewType: filters.ViewType ? filters.ViewType.join(',') : ''
    }
    delete newFilters.Date
    reportsApi
      .getMemberDay(newFilters)
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const { Items, Total, PCount } = {
            Items: data.result?.Items || [],
            Total: data.result?.Total || 0,
            PCount: data.result?.PCount || 0
          }
          setListData(converArray(Items))
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
      getAllDays()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    getAllDays()
  }

  const onExport = () => {
    PermissionHelpers.ExportExcel({
      FuncStart: () => setLoadingExport(true),
      FuncEnd: () => setLoadingExport(false),
      FuncApi: () =>
        reportsApi.getMemberDay(
          BrowserHelpers.getRequestParamsList(filters, { Total: PageTotal })
        ),
      UrlName: '/bao-cao-ngay/khach-hang'
    })
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
        width: 280,
        sortable: false,
        mobileOptions: {
          visible: true
        },
        className: 'flex-1'
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
        key: 'CheckIn',
        title: 'Giờ CheckIn',
        dataKey: 'CheckIn',
        cellRenderer: ({ rowData }) =>
          rowData.CheckIn
            ? moment(rowData.CheckIn).format('HH:mm DD/MM/YYYY')
            : '',
        width: 200,
        sortable: false
      },
      {
        key: 'CheckOut',
        title: 'Giờ CheckOut',
        dataKey: 'CheckOut',
        cellRenderer: ({ rowData }) =>
          rowData.CheckOut
            ? moment(rowData.CheckOut).format('HH:mm DD/MM/YYYY')
            : '',
        width: 200,
        sortable: false
      },
      {
        key: '#',
        title: '#',
        dataKey: '#',
        cellRenderer: ({ rowData }) => (
          <button className="btn btn-primary btn-xs" type="button">
            <span className="open">Xem chi tiết</span>
            <span className="hide">Ẩn chi tiết</span>
          </button>
        ),
        width: 150,
        sortable: false,
        align: 'center'
      }
    ],
    [filters]
  )

  const rowRenderer = ({ rowData, cells }) => {
    if (rowData.MajorList)
      return (
        <DetailRenderer rowData={rowData} cells={cells} filters={filters} />
      )
    return cells
  }

  const ExpandIcon = props => {
    let { expandable, expanded, onExpand } = props
    let cls = 'table__expandicon'

    if (expandable === false) {
      return null
    }

    if (expanded === true) {
      cls += ' expanded'
    }

    return (
      <div
        className={cls}
        onClick={() => {
          onExpand(!expanded)
        }}
      >
        <i className="fa-solid fa-caret-right"></i>
      </div>
    )
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
            Báo cáo chi tiết
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
          <div className="fw-500 font-size-lg">Danh sách khách hàng</div>
        </div>
        <div className="p-20px">
          <ReactTableV7
            expandColumnKey={columns[7].key}
            rowKey="Ids"
            filters={filters}
            columns={columns}
            data={ListData}
            loading={loading}
            pageCount={pageCount}
            onPagesChange={onPagesChange}
            rowRenderer={rowRenderer}
            estimatedRowHeight={50}
            components={{
              ExpandIcon: ExpandIcon
            }}
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

export default DaysCustomer
