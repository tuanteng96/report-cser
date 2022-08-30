import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  Fragment
} from 'react'
import reportsApi from 'src/api/reports.api'
import BaseTablesCustom from 'src/components/Tables/BaseTablesCustom'
import { PriceHelper } from 'src/helpers/PriceHelper'
import ModalViewMobile from './ModalViewMobile'
import clsx from 'clsx'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import { useWindowSize } from 'src/hooks/useWindowSize'
import { ArrayHeplers } from 'src/helpers/ArrayHeplers'

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

const ListSell = forwardRef(
  ({ filters, onSizePerPageChange, onPageChange }, ref) => {
    const [ListData, setListData] = useState([])
    const [isFilter, setIsFilter] = useState(false)
    const [loading, setLoading] = useState(false)
    const [PageTotal, setPageTotal] = useState(0)
    const [Total, setTotal] = useState({
      ConNo: 0,
      DaThToan: 0,
      DaThToan_CK: 0,
      DaThToan_QT: 0,
      DaThToan_TM: 0,
      DaThToan_ThTien: 0,
      DaThToan_Vi: 0,
      ReducedValue: 0,
      ToPay: 0,
      TotalValue: 0,
      Value: 0
    })
    const [initialValuesMobile, setInitialValuesMobile] = useState(null)
    const [isModalMobile, setIsModalMobile] = useState(false)
    const { width } = useWindowSize()

    useEffect(() => {
      setListData([])
      getListServices()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters])

    useImperativeHandle(ref, () => ({
      onRefresh(callback) {
        setListData([])
        getListServices(true, () => callback && callback())
      },
      onGetDataExport() {
        return new Promise((resolve, reject) => {
          const newFilters = GeneralNewFilter(
            ArrayHeplers.getFilterExport({ ...filters }, PageTotal)
          )
          reportsApi
            .getListSell(newFilters)
            .then(({ data }) => {
              resolve(data)
            })
            .catch(error => console.log(error))
        })
      },
      getLoading() {
        return loading
      }
    }))

    const GeneralNewFilter = filters => {
      return {
        ...filters,
        DateStart: filters.DateStart
          ? moment(filters.DateStart).format('DD/MM/yyyy')
          : null,
        DateEnd: filters.DateEnd
          ? moment(filters.DateEnd).format('DD/MM/yyyy')
          : null,
        MemberID: filters.MemberID ? filters.MemberID.value : ''
      }
    }

    const getListServices = (isLoading = true, callback) => {
      isLoading && setLoading(true)
      const newFilters = GeneralNewFilter(filters)
      reportsApi
        .getListSell(newFilters)
        .then(({ data }) => {
          const {
            Items,
            Total,
            ConNo,
            DaThToan,
            DaThToan_CK,
            DaThToan_QT,
            DaThToan_TM,
            DaThToan_ThTien,
            DaThToan_Vi,
            ReducedValue,
            ToPay,
            TotalValue,
            Value
          } = {
            Items: data.result?.Items || [],
            Total: data.result?.Total || 0,
            ConNo: data.result?.ConNo || 0,
            DaThToan: data.result?.DaThToan || 0,
            DaThToan_CK: data.result?.DaThToan_CK || 0,
            DaThToan_QT: data.result?.DaThToan_QT || 0,
            DaThToan_TM: data.result?.DaThToan_TM || 0,
            DaThToan_ThTien: data.result?.DaThToan_ThTien || 0,
            DaThToan_Vi: data.result?.DaThToan_Vi || 0,
            ReducedValue: data.result?.ReducedValue || 0,
            ToPay: data.result?.ToPay || 0,
            TotalValue: data.result?.TotalValue || 0,
            Value: data.result?.Value || 0
          }
          setListData(Items)
          setTotal({
            ConNo,
            DaThToan,
            DaThToan_CK,
            DaThToan_QT,
            DaThToan_TM,
            DaThToan_ThTien,
            DaThToan_Vi,
            ReducedValue,
            ToPay,
            TotalValue,
            Value
          })
          setLoading(false)
          setPageTotal(Total)
          isFilter && setIsFilter(false)
          callback && callback()
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
      <div className="bg-white rounded mt-25px">
        <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between">
          <div className="fw-500 font-size-lg">Danh sách đơn hàng</div>
          <div className="d-flex">
            <div className="fw-500 pr-sm-15px d-flex align-items-center">
              <div className="fw-500 pl-15px">
                Tổng ĐH{' '}
                <span className="font-size-xl fw-600 text-success pl-5px font-number">
                  {PageTotal}
                </span>
                <OverlayTrigger
                  rootClose
                  trigger="click"
                  key="top"
                  placement="top"
                  overlay={
                    <Popover id={`popover-positioned-top`}>
                      <Popover.Body className="p-0">
                        <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                          <span>Nguyên giá</span>
                          <span>{PriceHelper.formatVND(Total.Value)}</span>
                        </div>
                        <div className="py-10px px-15px fw-600 font-size-md border-gray-200 d-flex justify-content-between">
                          <span>Giảm giá</span>
                          <span>
                            {PriceHelper.formatVND(Total.ReducedValue)}
                          </span>
                        </div>
                      </Popover.Body>
                    </Popover>
                  }
                >
                  <i className="fa-solid fa-circle-exclamation cursor-pointer text-warning ml-5px font-size-h6 vertical-align-text-top d-none d-sm-inline-block"></i>
                </OverlayTrigger>
              </div>
              {width <= 1200 && (
                <OverlayTrigger
                  rootClose
                  trigger="click"
                  key="top"
                  placement="top"
                  overlay={
                    <Popover id={`popover-positioned-top`}>
                      <Popover.Body className="p-0">
                        <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between d-md-none">
                          <span>Cần thanh toán</span>
                          <span>{PriceHelper.formatVND(Total.ToPay)}</span>
                        </div>
                        <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                          <span>Đã thanh toán</span>
                          <span>{PriceHelper.formatVND(Total.DaThToan)}</span>
                        </div>
                        <div className="py-10px px-15px fw-400 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                          <span>Đã thanh toán TM</span>
                          <span>
                            {PriceHelper.formatVND(Total.DaThToan_TM)}
                          </span>
                        </div>
                        <div className="py-10px px-15px fw-400 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                          <span>Đã thanh toán CK</span>
                          <span>
                            {PriceHelper.formatVND(Total.DaThToan_CK)}
                          </span>
                        </div>
                        <div className="py-10px px-15px fw-400 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                          <span>Đã thanh toán QT</span>
                          <span>
                            {PriceHelper.formatVND(Total.DaThToan_QT)}
                          </span>
                        </div>
                        <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                          <span>Ví</span>
                          <span>
                            {PriceHelper.formatVNDPositive(Total.DaThToan_Vi)}
                          </span>
                        </div>
                        <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                          <span>Thẻ tiền</span>
                          <span>
                            {PriceHelper.formatVNDPositive(
                              Total.DaThToan_ThTien
                            )}
                          </span>
                        </div>
                        <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                          <span>Còn nợ</span>
                          <span>
                            {PriceHelper.formatVNDPositive(Total.ConNo)}
                          </span>
                        </div>
                      </Popover.Body>
                    </Popover>
                  }
                >
                  <i className="fa-solid fa-circle-exclamation cursor-pointer text-warning ml-5px font-size-h5"></i>
                </OverlayTrigger>
              )}
            </div>
            {width >= 1200 && (
              <Fragment>
                <div className="fw-500 pr-15px">
                  Tổng tiền{' '}
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {PriceHelper.formatVND(Total.TotalValue)}
                  </span>
                </div>
                <div className="fw-500 pr-15px">
                  Cần T.Toán{' '}
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {PriceHelper.formatVND(Total.ToPay)}
                  </span>
                </div>
                <div className="fw-500 pr-15px">
                  Đã T.Toán{' '}
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {PriceHelper.formatVND(Total.DaThToan)}
                  </span>
                  <OverlayTrigger
                    rootClose
                    trigger="click"
                    key="top"
                    placement="top"
                    overlay={
                      <Popover id={`popover-positioned-top`}>
                        <Popover.Body className="p-0">
                          <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                            <span>Tiền mặt</span>
                            <span>
                              {PriceHelper.formatVND(Total.DaThToan_TM)}
                            </span>
                          </div>
                          <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                            <span>Chuyển khoản</span>
                            <span>
                              {PriceHelper.formatVND(Total.DaThToan_CK)}
                            </span>
                          </div>
                          <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                            <span>Quẹt thẻ</span>
                            <span>
                              {PriceHelper.formatVND(Total.DaThToan_QT)}
                            </span>
                          </div>
                        </Popover.Body>
                      </Popover>
                    }
                  >
                    <i className="fa-solid fa-circle-exclamation cursor-pointer text-warning ml-5px font-size-h6 vertical-align-text-top"></i>
                  </OverlayTrigger>
                </div>
                <div className="fw-500 pr-15px">
                  Ví{' '}
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {PriceHelper.formatVNDPositive(Total.DaThToan_Vi)}
                  </span>
                </div>
                <div className="fw-500 pr-15px">
                  Thẻ tiền{' '}
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {PriceHelper.formatVNDPositive(Total.DaThToan_ThTien)}
                  </span>
                </div>
                <div className="fw-500">
                  Nợ{' '}
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {PriceHelper.formatVNDPositive(Total.ConNo)}
                  </span>
                </div>
              </Fragment>
            )}
          </div>
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
                  dataField: 'CreateDate',
                  text: 'Ngày',
                  //headerAlign: "center",
                  //style: { textAlign: "center" },
                  formatter: (cell, row) =>
                    moment(row.CreateDate).format('HH:mm DD/MM/YYYY'),
                  attrs: { 'data-title': 'Ngày' },
                  headerStyle: () => {
                    return { minWidth: '150px', width: '150px' }
                  }
                },
                {
                  dataField: 'MemberName',
                  text: 'Khách hàng',
                  //headerAlign: "center",
                  //style: { textAlign: "center" },
                  formatter: (cell, row) => row.MemberName || 'Không có tên',
                  attrs: { 'data-title': 'Khách hàng' },
                  headerStyle: () => {
                    return { minWidth: '200px', width: '200px' }
                  }
                },
                {
                  dataField: 'TotalValue',
                  text: 'Tổng tiền',
                  //headerAlign: "center",
                  //style: { textAlign: "center" },
                  formatter: (cell, row) =>
                    PriceHelper.formatVND(row.TotalValue),
                  attrs: { 'data-title': 'Tổng tiền' },
                  headerStyle: () => {
                    return { minWidth: '180px', width: '180px' }
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
                onSizePerPageChange(Ps)
              },
              onPageChange: page => {
                setListData([])
                const Pi = page
                onPageChange(Pi)
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
                dataField: 'Id',
                text: 'Mã đơn hàng',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => <div>#{row.Id}</div>,
                attrs: { 'data-title': 'ID' },
                headerStyle: () => {
                  return { minWidth: '120px', width: '120px' }
                }
              },
              {
                dataField: 'StockName',
                text: 'Cơ sở',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.StockName || 'Chưa có',
                attrs: { 'data-title': 'Cơ sở' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                }
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
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'MemberName',
                text: 'Khách hàng',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.MemberName || 'Không có tên',
                attrs: { 'data-title': 'Khách hàng' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                }
              },
              {
                dataField: 'MemberPhone',
                text: 'Số điện thoại',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.MemberPhone || 'Không có',
                attrs: { 'data-title': 'Số điện thoại' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                }
              },
              {
                dataField: 'Value',
                text: 'Nguyên giá',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.Value),
                attrs: { 'data-title': 'Nguyên giá' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'ReducedValue',
                text: 'Giảm / Tăng giá',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => (
                  <span
                    className={`${clsx({
                      'text-danger fw-500': row.ReducedValue < 0
                    })}`}
                  >
                    {PriceHelper.formatValueVoucher(row.ReducedValue)}
                  </span>
                ),
                attrs: { 'data-title': 'Giảm giá' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                }
              },
              {
                dataField: 'TotalValue',
                text: 'Tổng tiền',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.TotalValue),
                attrs: { 'data-title': 'Tổng tiền' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'VoucherCode',
                text: 'Voucher',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.VoucherCode || 'Chưa có',
                attrs: { 'data-title': 'Voucher' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                }
              },
              {
                dataField: 'ToPay',
                text: 'Cần thanh toán',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.ToPay),
                attrs: { 'data-title': 'Cần thanh toán' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'DaThToan',
                text: 'Đã thanh toán',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => (
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
                          Chi tiết thanh toán #{row.Id}
                        </Popover.Header>
                        <Popover.Body className="p-0">
                          <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                            <span>Tiền mặt</span>
                            <span>
                              {PriceHelper.formatVND(row.DaThToan_TM)}
                            </span>
                          </div>
                          <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                            <span>Chuyển khoản</span>
                            <span>
                              {PriceHelper.formatVND(row.DaThToan_CK)}
                            </span>
                          </div>
                          <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                            <span>Quẹt thẻ</span>
                            <span>
                              {PriceHelper.formatVND(row.DaThToan_QT)}
                            </span>
                          </div>
                        </Popover.Body>
                      </Popover>
                    }
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      {PriceHelper.formatVND(row.DaThToan)}
                      <i className="fa-solid fa-circle-exclamation cursor-pointer text-warning"></i>
                    </div>
                  </OverlayTrigger>
                ),
                attrs: { 'data-title': 'Thanh toán' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'DaThToan_Vi',
                text: 'Ví',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVNDPositive(row.DaThToan_Vi),
                attrs: { 'data-title': 'Ví' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'DaThToan_ThTien',
                text: 'Thẻ tiền',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVNDPositive(row.DaThToan_ThTien),
                attrs: { 'data-title': 'Thẻ tiền' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'ConNo',
                text: 'Còn nợ',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVNDPositive(row.ConNo),
                attrs: { 'data-title': 'Còn nợ' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'IsNewMember',
                text: 'Loại',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => (
                  <span
                    className={`${clsx({
                      'text-success': row.IsNewMember === 1
                    })} fw-500`}
                  >
                    Khách {row.IsNewMember === 0 ? 'Cũ' : 'Mới'}
                  </span>
                ),
                attrs: { 'data-title': 'Loại' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'Prod',
                text: 'Chi tiết',
                headerAlign: 'center',
                //style: { textAlign: 'center' },
                formatter: (cell, row) =>
                  `${row.Prod ? `${row.Prod} ` : ''}${row.Svr ? ',' : ''}${
                    row.Svr || ''
                  }`,
                attrs: { 'data-title': 'Chi tiết' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                }
              }
            ]}
            loading={loading}
            keyField="Id"
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
    )
  }
)

export default ListSell
