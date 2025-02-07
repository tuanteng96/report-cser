import React, { Fragment, useEffect, useMemo, useState } from 'react'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import { useSelector } from 'react-redux'
import FilterList from 'src/components/Filter/FilterList'
import _, { clone } from 'lodash'
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

const converItems = arr => {
  if (!arr) return []
  const newArray = arr.map(rowData => {
    let newChildren = [...rowData?.children]
    let arrPayDebt = []
    let newPayDebt = []
    for (let rturn of newChildren) {
      for (let a of rturn.MajorList) {
        if (a.PayDebt) arrPayDebt.push(a.PayDebt)
      }
    }

    for (let a of arrPayDebt) {
      let index = newPayDebt.findIndex(x => x.ID === a.ID)
      if (index > -1) {
        let { DoanhSo, HoaHong, Prods } = newPayDebt[index]
        newPayDebt[index].ThanhToan += a.ThanhToan
        newPayDebt[index].ThanhToan_CK += a.ThanhToan_CK
        newPayDebt[index].ThanhToan_QT += a.ThanhToan_QT
        newPayDebt[index].ThanhToan_TienMat += a.ThanhToan_TienMat
        newPayDebt[index].TheTien += a.TheTien
        newPayDebt[index].Vi += a.Vi

        let newProds = [...Prods]
        for (let prod of a.Prods) {
          let indexProd = newProds.findIndex(c => c.Title === prod.Title)
          if (indexProd > -1) {
            newProds[indexProd].Qty += prod.Qty
          } else {
            newProds.push({ ...prod })
          }
        }

        let newDoanhSo = [...DoanhSo || []].map(x => ({ ...x }))

        for (let user of (a?.DoanhSo || [])) {
          let indexMember = newDoanhSo.findIndex(
            c => c.FullName === user.FullName
          )
          if (indexMember > -1) {
            newDoanhSo[indexMember].Bonus += user.Bonus
          } else {
            newDoanhSo.push({ ...user })
          }
        }

        let newHoaHong = [...HoaHong || []].map(x => ({ ...x }))
        for (let user of (a?.HoaHong || [])) {
          let indexMember = newHoaHong.findIndex(
            c => c.FullName === user.FullName
          )
          if (indexMember > -1) {
            newHoaHong[indexMember].Bonus += user.Bonus
          } else {
            newHoaHong.push({ ...user })
          }
        }

        newPayDebt[index].Prods = newProds
        newPayDebt[index].DoanhSo = newDoanhSo
        newPayDebt[index].HoaHong = newHoaHong
      } else {
        newPayDebt.push({ ...a })
      }
    }

    return {
      ...rowData,
      PayDebtWrap: newPayDebt
    }
  })
  return newArray
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
          setListData(converItems(Items))
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
        cellRenderer: ({ rowIndex }) =>
          filters.Ps * (filters.Pi - 1) + (rowIndex + 1),
        className: '!items-start',
        width: 60,
        sortable: false,
        align: 'center',
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'FullName',
        title: 'Tên khách hàng',
        cellRenderer: ({ rowData }) => (
          <div>
            <div className="fw-600">{rowData?.FullName}</div>
            <div>{rowData?.Phone}</div>
          </div>
        ),
        className: '!items-start',
        dataKey: 'FullName',
        width: 280,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'IN_OUT',
        title: 'IN - OUT',
        dataKey: 'IN_OUT',
        width: 200,
        cellRenderer: ({ rowData }) => (
          <div>
            <div className="fw-600">
              <span
                style={{
                  display: 'inline-block',
                  width: '40px'
                }}
              >
                IN:
              </span>
              {rowData?.CheckIn
                ? moment(rowData?.CheckIn).format('HH:mm')
                : '--:--'}
            </div>
            <div className="fw-600">
              <span
                style={{
                  display: 'inline-block',
                  width: '40px'
                }}
              >
                OUT:
              </span>
              {rowData?.CheckOut
                ? moment(rowData?.CheckOut).format('HH:mm')
                : '--:--'}
            </div>
          </div>
        ),
        className: '!items-start',
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
        className: '!items-start',
        width: 200,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'DHM_TTN_TH',
        title: 'Đơn hàng mới/Thanh toán nợ/Trả hàng',
        dataKey: 'DHM_TTN_TH',
        cellRenderer: ({ rowData }) => {
          return (
            <div className="w-full">
              {rowData.children &&
                rowData.children.map((item, index) => (
                  <Fragment key={index}>
                    {item.MajorList &&
                      item.MajorList.map((major, i) => (
                        <Fragment key={i}>
                          {major.Order && (
                            <div className="grid grid-cols-3 mb-3 gap-7 last:mb-0">
                              <div>
                                <div className="flex mb-1 fw-600">
                                  <div>#{major.Order?.ID}</div>
                                  <div className="pl-2 text-danger">
                                    {PriceHelper.formatVND(
                                      major.Order?.GiaBanDonHang
                                    )}
                                  </div>
                                </div>
                                <div>
                                  {major.Order?.Prods?.map((x, k) => (
                                    <div key={k}>
                                      {x.Title} (x{x.Qty})
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-baseline fw-600">
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
                                        <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                          <span>Tiền mặt</span>
                                          <span>
                                            {PriceHelper.formatVNDPositive(
                                              major.Order.ThanhToan_TienMat
                                            )}
                                          </span>
                                        </div>
                                        <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                          <span>Chuyển khoản</span>
                                          <span>
                                            {PriceHelper.formatVNDPositive(
                                              major.Order.ThanhToan_CK
                                            )}
                                          </span>
                                        </div>
                                        <div className="border-gray-200 py-10px px-15px fw-500 font-size-md d-flex justify-content-between border-bottom">
                                          <span>Quẹt thẻ</span>
                                          <span>
                                            {PriceHelper.formatVNDPositive(
                                              major.Order.ThanhToan_QT
                                            )}
                                          </span>
                                        </div>
                                        <div className="border-gray-200 py-10px px-15px fw-500 font-size-md d-flex justify-content-between border-bottom">
                                          <span>Ví</span>
                                          <span>
                                            {PriceHelper.formatVNDPositive(
                                              major.Order.Vi
                                            )}
                                          </span>
                                        </div>
                                        <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                                          <span>Thẻ tiền</span>
                                          <span>
                                            {PriceHelper.formatVNDPositive(
                                              major.Order.TheTien
                                            )}
                                          </span>
                                        </div>
                                      </Popover.Body>
                                    </Popover>
                                  }
                                >
                                  <div className="d-flex justify-content-between align-items-center">
                                    <i className="cursor-pointer fa-solid fa-circle-exclamation text-success mr-5px"></i>
                                  </div>
                                </OverlayTrigger>
                                <span className="text-success fw-600">
                                  TT:
                                  <span className="pl-1">
                                    {PriceHelper.formatVNDPositive(
                                      major.Order.ThanhToan +
                                        Math.abs(major.Order?.Vi || 0) +
                                        Math.abs(major.Order?.TheTien || 0)
                                    )}
                                  </span>
                                </span>
                              </div>
                              <div>
                                {major?.Order?.HoaHong &&
                                  major?.Order?.HoaHong.length > 0 && (
                                    <div>
                                      <div className="underline">
                                        Hoa hồng :
                                      </div>
                                      <div>
                                        {major?.Order?.HoaHong &&
                                        major?.Order?.HoaHong.length > 0
                                          ? major?.Order?.HoaHong.map(
                                              (o, k) => (
                                                <div key={k}>
                                                  {o.FullName}
                                                  <span className="pl-1">
                                                    [{' '}
                                                    {PriceHelper.formatVND(
                                                      o.Bonus
                                                    )}
                                                    đ ]
                                                  </span>
                                                </div>
                                              )
                                            )
                                          : 'Không'}
                                      </div>
                                    </div>
                                  )}
                                {major?.Order?.DoanhSo &&
                                  major?.Order?.DoanhSo.length > 0 && (
                                    <div>
                                      <div className="underline">Tư vấn :</div>
                                      <div>
                                        {major?.Order?.DoanhSo &&
                                        major?.Order?.DoanhSo.length > 0
                                          ? major?.Order?.DoanhSo.map(
                                              (o, k) => (
                                                <div key={k}>
                                                  {o.FullName}
                                                  <span className="pl-1">
                                                    [{' '}
                                                    {PriceHelper.formatVND(
                                                      o.Bonus
                                                    )}
                                                    đ ]
                                                  </span>
                                                </div>
                                              )
                                            )
                                          : 'Không'}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                          )}
                          {/* {major.PayDebt && (
                            <div className="grid grid-cols-3 mb-3 gap-7 last:mb-0">
                              <div>
                                <div className="flex mb-1 fw-600">
                                  <div>#{major.PayDebt?.ID}</div>
                                  <div className="pl-2 text-danger">
                                    [ Thanh toán nợ ]
                                  </div>
                                </div>
                                <div>
                                  {major.PayDebt?.Prods?.map((x, k) => (
                                    <div key={k}>
                                      {x.Title} (x{x.Qty})
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-baseline fw-600">
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
                                        <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                          <span>Tiền mặt</span>
                                          <span>
                                            {PriceHelper.formatVNDPositive(
                                              major.PayDebt.ThanhToan_TienMat
                                            )}
                                          </span>
                                        </div>
                                        <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                          <span>Chuyển khoản</span>
                                          <span>
                                            {PriceHelper.formatVNDPositive(
                                              major.PayDebt.ThanhToan_CK
                                            )}
                                          </span>
                                        </div>
                                        <div className="border-gray-200 py-10px px-15px fw-500 font-size-md d-flex justify-content-between border-bottom">
                                          <span>Quẹt thẻ</span>
                                          <span>
                                            {PriceHelper.formatVNDPositive(
                                              major.PayDebt.ThanhToan_QT
                                            )}
                                          </span>
                                        </div>
                                        <div className="border-gray-200 py-10px px-15px fw-500 font-size-md d-flex justify-content-between border-bottom">
                                          <span>Thanh toán ví</span>
                                          <span>
                                            {PriceHelper.formatVNDPositive(
                                              major.PayDebt.Vi
                                            )}
                                          </span>
                                        </div>
                                        <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                                          <span>Quẹt thẻ</span>
                                          <span>
                                            {PriceHelper.formatVNDPositive(
                                              major.PayDebt.TheTien
                                            )}
                                          </span>
                                        </div>
                                      </Popover.Body>
                                    </Popover>
                                  }
                                >
                                  <div className="d-flex justify-content-between align-items-center">
                                    <i className="cursor-pointer fa-solid fa-circle-exclamation text-success mr-5px"></i>
                                  </div>
                                </OverlayTrigger>
                                <span className="text-success fw-600">
                                  TT:
                                  <span className="pl-1">
                                    {PriceHelper.formatVNDPositive(
                                      major.PayDebt.ThanhToan
                                    )}
                                  </span>
                                </span>
                              </div>
                              <div>
                                <div>
                                  <div className="underline">Hoa hồng :</div>
                                  <div>
                                    {major?.PayDebt?.HoaHong &&
                                    major?.PayDebt?.HoaHong.length > 0
                                      ? major?.PayDebt?.HoaHong.map((o, k) => (
                                          <div key={k}>
                                            {o.FullName}
                                            <span className="pl-1">
                                              [ {PriceHelper.formatVND(o.Bonus)}
                                              đ ]
                                            </span>
                                          </div>
                                        ))
                                      : 'Không'}
                                  </div>
                                </div>
                                <div>
                                  <div className="underline">Tư vấn :</div>
                                  <div>
                                    {major?.PayDebt?.DoanhSo &&
                                    major?.PayDebt?.DoanhSo.length > 0
                                      ? major?.PayDebt?.DoanhSo.map((o, k) => (
                                          <div key={k}>
                                            {o.FullName}
                                            <span className="pl-1">
                                              [ {PriceHelper.formatVND(o.Bonus)}
                                              đ ]
                                            </span>
                                          </div>
                                        ))
                                      : 'Không'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )} */}
                          {major.Returns && (
                            <div className="grid grid-cols-3 mb-3 gap-7 last:mb-0">
                              <div>
                                <div className="flex mb-1 fw-600">
                                  <div>#{major.Returns?.ID}</div>
                                  <div className="pl-2 text-danger">
                                    [ Trả hàng ]
                                  </div>
                                </div>
                                <div>
                                  {major.Returns?.Prods?.map((x, k) => (
                                    <div key={k}>
                                      {x.Title} (x{x.Qty})
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-baseline fw-600">
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
                                        Chi tiết hoàn tiền
                                      </Popover.Header>
                                      <Popover.Body className="p-0">
                                        <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                          <span>Hoàn tiền mặt</span>
                                          <span>
                                            {PriceHelper.formatVNDPositive(
                                              major.Returns.HoanTienMat
                                            )}
                                          </span>
                                        </div>
                                        <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                          <span>Hoàn ví</span>
                                          <span>
                                            {PriceHelper.formatVNDPositive(
                                              major.Returns.HoanVi
                                            )}
                                          </span>
                                        </div>
                                        <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                                          <span>Hoàn thẻ tiền</span>
                                          <span>
                                            {PriceHelper.formatVNDPositive(
                                              major.Returns.HoanTheTien
                                            )}
                                          </span>
                                        </div>
                                      </Popover.Body>
                                    </Popover>
                                  }
                                >
                                  <div className="d-flex justify-content-between align-items-center">
                                    <i className="cursor-pointer fa-solid fa-circle-exclamation text-success mr-5px"></i>
                                  </div>
                                </OverlayTrigger>
                                <span className="text-success fw-600">
                                  Hoàn:
                                  <span className="pl-1">
                                    {PriceHelper.formatVNDPositive(
                                      major.Returns.HoanTienMat +
                                        major.Returns.HoanVi +
                                        major.Returns.HoanTheTien
                                    )}
                                  </span>
                                </span>
                              </div>
                              {((major?.Returns?.HoaHongGiam &&
                                major?.Returns?.HoaHongGiam.length > 0) ||
                                (major?.Returns?.DoanhSoGiam &&
                                  major?.Returns?.DoanhSoGiam.length > 0)) && (
                                <div>
                                  <div className="mb-1 fw-600">
                                    Khấu trừ HS & DS
                                  </div>
                                  {major?.Returns?.HoaHongGiam &&
                                    major?.Returns?.HoaHongGiam.length > 0 && (
                                      <div>
                                        <div className="underline">
                                          Hoa hồng giảm :
                                        </div>
                                        <div>
                                          {major?.Returns?.HoaHongGiam &&
                                          major?.Returns?.HoaHongGiam.length > 0
                                            ? major?.Returns?.HoaHongGiam.map(
                                                (o, k) => (
                                                  <div key={k}>
                                                    {o.FullName}
                                                    <span className="pl-1">
                                                      [{' '}
                                                      {PriceHelper.formatVND(
                                                        o.Bonus
                                                      )}
                                                      đ ]
                                                    </span>
                                                  </div>
                                                )
                                              )
                                            : 'Không'}
                                        </div>
                                      </div>
                                    )}
                                  {major?.Returns?.DoanhSoGiam &&
                                    major?.Returns?.DoanhSoGiam.length > 0 && (
                                      <div>
                                        <div className="underline">
                                          Tư vấn :
                                        </div>
                                        <div>
                                          {major?.Returns?.DoanhSoGiam &&
                                          major?.Returns?.DoanhSoGiam.length > 0
                                            ? major?.Returns?.DoanhSoGiam.map(
                                                (o, k) => (
                                                  <div key={k}>
                                                    {o.FullName}
                                                    <span className="pl-1">
                                                      [{' '}
                                                      {PriceHelper.formatVND(
                                                        o.Bonus
                                                      )}
                                                      đ ]
                                                    </span>
                                                  </div>
                                                )
                                              )
                                            : 'Không'}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              )}
                            </div>
                          )}
                        </Fragment>
                      ))}
                  </Fragment>
                ))}

              {rowData?.PayDebtWrap &&
                rowData?.PayDebtWrap.length > 0 &&
                rowData?.PayDebtWrap.map((item, index) => (
                  <div
                    className="grid grid-cols-3 mb-3 gap-7 last:mb-0"
                    key={index}
                  >
                    <div>
                      <div className="flex mb-1 fw-600">
                        <div>#{item?.ID}</div>
                        <div className="pl-2 text-danger">
                          [ Thanh toán nợ ]
                        </div>
                      </div>
                      <div>
                        {item?.Prods?.map((x, k) => (
                          <div key={k}>
                            {x.Title} (x{x.Qty})
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-baseline fw-600">
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
                              <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                <span>Tiền mặt</span>
                                <span>
                                  {PriceHelper.formatVNDPositive(
                                    item?.ThanhToan_TienMat
                                  )}
                                </span>
                              </div>
                              <div className="border-gray-200 py-10px px-15px fw-600 font-size-md border-bottom d-flex justify-content-between">
                                <span>Chuyển khoản</span>
                                <span>
                                  {PriceHelper.formatVNDPositive(
                                    item?.ThanhToan_CK
                                  )}
                                </span>
                              </div>
                              <div className="border-gray-200 py-10px px-15px fw-500 font-size-md d-flex justify-content-between border-bottom">
                                <span>Quẹt thẻ</span>
                                <span>
                                  {PriceHelper.formatVNDPositive(
                                    item?.ThanhToan_QT
                                  )}
                                </span>
                              </div>
                              <div className="border-gray-200 py-10px px-15px fw-500 font-size-md d-flex justify-content-between border-bottom">
                                <span>Thanh toán ví</span>
                                <span>
                                  {PriceHelper.formatVNDPositive(item?.Vi)}
                                </span>
                              </div>
                              <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                                <span>Quẹt thẻ</span>
                                <span>
                                  {PriceHelper.formatVNDPositive(item?.TheTien)}
                                </span>
                              </div>
                            </Popover.Body>
                          </Popover>
                        }
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <i className="cursor-pointer fa-solid fa-circle-exclamation text-success mr-5px"></i>
                        </div>
                      </OverlayTrigger>
                      <span className="text-success fw-600">
                        TT:
                        <span className="pl-1">
                          {PriceHelper.formatVNDPositive(item?.ThanhToan)}
                        </span>
                      </span>
                    </div>
                    <div>
                      {item?.HoaHong && item?.HoaHong.length > 0 && (
                        <div>
                          <div className="underline">Hoa hồng :</div>
                          <div>
                            {item?.HoaHong && item?.HoaHong.length > 0
                              ? item?.HoaHong.map((o, k) => (
                                  <div key={k}>
                                    {o.FullName}
                                    <span className="pl-1">
                                      [ {PriceHelper.formatVND(o.Bonus)}đ ]
                                    </span>
                                  </div>
                                ))
                              : 'Không'}
                          </div>
                        </div>
                      )}
                      {item?.DoanhSo && item?.DoanhSo.length > 0 && (
                        <div>
                          <div className="underline">Tư vấn :</div>
                          <div>
                            {item?.DoanhSo && item?.DoanhSo.length > 0
                              ? item?.DoanhSo.map((o, k) => (
                                  <div key={k}>
                                    {o.FullName}
                                    <span className="pl-1">
                                      [ {PriceHelper.formatVND(o.Bonus)}đ ]
                                    </span>
                                  </div>
                                ))
                              : 'Không'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )
        },
        className: '!items-start',
        width: 750,
        sortable: false
      },
      {
        key: 'DVTH',
        title: 'Dịch vụ thực hiện',
        dataKey: 'DVTH',
        cellRenderer: ({ rowData }) => (
          <div>
            {rowData.children &&
              rowData.children.map((item, index) => (
                <Fragment key={index}>
                  {item.MajorList &&
                    item.MajorList.filter(
                      x => x.Services && x.Services.length > 0
                    ).map((major, i) => (
                      <Fragment key={i}>
                        {major.Services &&
                          major.Services.map((sv, k) => (
                            <div className="mb-3 last:!mb-0" key={k}>
                              <div className="fw-600">{sv.Title}</div>
                              {sv.PhuPhi && sv.PhuPhi.length > 0 && (
                                <div>
                                  Phụ phí :
                                  <span className="pl-1">
                                    {sv.PhuPhi &&
                                      sv.PhuPhi.map(o => o.Title).join(', ')}
                                    {(!sv.PhuPhi || sv.PhuPhi.length === 0) &&
                                      'Không'}
                                  </span>
                                </div>
                              )}
                              {sv.HoaHong && sv.HoaHong.length > 0 && (
                                <div>
                                  <div className="underline">Nhân viên : </div>
                                  <div>
                                    {sv.HoaHong &&
                                      sv.HoaHong.length > 0 &&
                                      sv.HoaHong.map((o, io) => (
                                        <div key={io}>
                                          <span>{o.FullName}</span>
                                          <span className="pl-1">
                                            [ {PriceHelper.formatVND(o.Bonus)}đ
                                            ]
                                          </span>
                                        </div>
                                      ))}
                                    {(!sv.HoaHong || sv.HoaHong.length === 0) &&
                                      'Không có nhân viên.'}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                      </Fragment>
                    ))}
                </Fragment>
              ))}
          </div>
        ),
        className: '!items-start',
        width: 300,
        sortable: false
      },
      {
        key: 'NVK',
        title: 'Nghiệp vụ khác',
        dataKey: 'NVK',
        cellRenderer: ({ rowData }) => (
          <div>
            {rowData.children &&
              rowData.children
                .filter(x => x.More && x.More.length > 0)
                .map((item, index) => (
                  <Fragment key={index}>
                    {item.More &&
                      item.More.map((more, i) => (
                        <div className="mb-3 last:!mb-0" key={i}>
                          <div className="fw-600">{more.Title}</div>
                          <div>{more.Desc}</div>
                          <div>
                            Giá trị :
                            <span className="pl-5px text-danger fw-500">
                              {PriceHelper.formatVND(more.Value)}
                            </span>
                          </div>
                        </div>
                      ))}
                  </Fragment>
                ))}
          </div>
        ),
        className: '!items-start',
        width: 400,
        sortable: false
      }
    ],
    [filters]
  )

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
          <span className="text-uppercase font-size-xl fw-600">
            Báo cáo chi tiết
          </span>
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
        <div className="border-gray-200 px-20px py-15px border-bottom d-flex align-items-center justify-content-between">
          <div className="fw-500 font-size-lg">Danh sách khách hàng</div>
        </div>
        <div className="p-20px">
          <ReactTableV7
            rowKey="MemberID"
            filters={filters}
            columns={columns}
            data={ListData}
            loading={loading}
            pageCount={pageCount}
            onPagesChange={onPagesChange}
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
