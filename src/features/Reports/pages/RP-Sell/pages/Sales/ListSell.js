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
      getListServices()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters])

    useImperativeHandle(ref, () => ({
      onRefresh(callback) {
        getListServices(false, () => callback && callback())
      },
      onGetDataExport() {
        return new Promise((resolve, reject) => {
          const newFilters = GeneralNewFilter({ ...filters, Ps: 1000, Pi: 1 })
          reportsApi
            .getListSell(newFilters)
            .then(({ data }) => {
              resolve(data)
            })
            .catch(error => console.log(error))
        })
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
        StaffID: filters.StaffID ? filters.StaffID.value : '',
        GroupCustomerID: filters.GroupCustomerID
          ? filters.GroupCustomerID.value
          : '',
        SourceName: filters.SourceName ? filters.SourceName.value : '',
        ProvincesID: filters.ProvincesID ? filters.ProvincesID.value : '',
        DistrictsID: filters.DistrictsID ? filters.DistrictsID.value : '',
        Status: filters.Status ? filters.Status.value : '',
        Warranty: filters.Warranty ? filters.Warranty.value : ''
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
          <div className="fw-500 font-size-lg">Danh s??ch ????n h??ng</div>
          <div className="d-flex">
            <div className="fw-500 pr-15px d-flex align-items-center">
              <div className="fw-500 pl-15px">
                T???ng ??H{' '}
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
                          <span>Nguy??n gi??</span>
                          <span>{PriceHelper.formatVND(Total.Value)}</span>
                        </div>
                        <div className="py-10px px-15px fw-600 font-size-md border-gray-200 d-flex justify-content-between">
                          <span>Gi???m gi??</span>
                          <span>
                            {PriceHelper.formatVND(Total.ReducedValue)}
                          </span>
                        </div>
                      </Popover.Body>
                    </Popover>
                  }
                >
                  <i className="fa-solid fa-circle-exclamation cursor-pointer text-warning ml-5px font-size-h6 vertical-align-text-top"></i>
                </OverlayTrigger>
              </div>
              <div className="fw-500 pl-15px d-xl-none">
                C???n T.To??n{' '}
                <span className="font-size-xl fw-600 text-success pl-5px font-number">
                  {PriceHelper.formatVND(Total.ToPay)}
                </span>
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
                          <span>C???n thanh to??n</span>
                          <span>{PriceHelper.formatVND(Total.ToPay)}</span>
                        </div>
                        <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                          <span>???? thanh to??n</span>
                          <span>{PriceHelper.formatVND(Total.DaThToan)}</span>
                        </div>
                        <div className="py-10px px-15px fw-400 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                          <span>???? thanh to??n TM</span>
                          <span>
                            {PriceHelper.formatVND(Total.DaThToan_TM)}
                          </span>
                        </div>
                        <div className="py-10px px-15px fw-400 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                          <span>???? thanh to??n CK</span>
                          <span>
                            {PriceHelper.formatVND(Total.DaThToan_CK)}
                          </span>
                        </div>
                        <div className="py-10px px-15px fw-400 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                          <span>???? thanh to??n QT</span>
                          <span>
                            {PriceHelper.formatVND(Total.DaThToan_QT)}
                          </span>
                        </div>
                        <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                          <span>V??</span>
                          <span>
                            {PriceHelper.formatVNDPositive(Total.DaThToan_Vi)}
                          </span>
                        </div>
                        <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                          <span>Th??? ti???n</span>
                          <span>
                            {PriceHelper.formatVNDPositive(
                              Total.DaThToan_ThTien
                            )}
                          </span>
                        </div>
                        <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                          <span>C??n n???</span>
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
                  T???ng ti???n{' '}
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {PriceHelper.formatVND(Total.TotalValue)}
                  </span>
                </div>
                <div className="fw-500 pr-15px">
                  C???n T.To??n{' '}
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {PriceHelper.formatVND(Total.ToPay)}
                  </span>
                </div>
                <div className="fw-500 pr-15px">
                  ???? T.To??n{' '}
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
                            <span>Ti???n m???t</span>
                            <span>
                              {PriceHelper.formatVND(Total.DaThToan_TM)}
                            </span>
                          </div>
                          <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                            <span>Chuy???n kho???n</span>
                            <span>
                              {PriceHelper.formatVND(Total.DaThToan_CK)}
                            </span>
                          </div>
                          <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                            <span>Qu???t th???</span>
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
                  V??{' '}
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {PriceHelper.formatVNDPositive(Total.DaThToan_Vi)}
                  </span>
                </div>
                <div className="fw-500 pr-15px">
                  Th??? ti???n{' '}
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {PriceHelper.formatVNDPositive(Total.DaThToan_ThTien)}
                  </span>
                </div>
                <div className="fw-500">
                  N???{' '}
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
            textDataNull="Kh??ng c?? d??? li???u."
            optionsMoible={{
              itemShow: 2,
              CallModal: row => OpenModalMobile(row),
              columns: [
                {
                  dataField: 'CreateDate',
                  text: 'Ng??y',
                  //headerAlign: "center",
                  //style: { textAlign: "center" },
                  formatter: (cell, row) =>
                    moment(row.CreateDate).format('HH:mm DD/MM/YYYY'),
                  attrs: { 'data-title': 'Ng??y' },
                  headerStyle: () => {
                    return { minWidth: '150px', width: '150px' }
                  }
                },
                {
                  dataField: 'MemberName',
                  text: 'Kh??ch h??ng',
                  //headerAlign: "center",
                  //style: { textAlign: "center" },
                  formatter: (cell, row) => row.MemberName || 'Kh??ng c?? t??n',
                  attrs: { 'data-title': 'Kh??ch h??ng' },
                  headerStyle: () => {
                    return { minWidth: '200px', width: '200px' }
                  }
                },
                {
                  dataField: 'TotalValue',
                  text: 'T???ng ti???n',
                  //headerAlign: "center",
                  //style: { textAlign: "center" },
                  formatter: (cell, row) =>
                    PriceHelper.formatVND(row.TotalValue),
                  attrs: { 'data-title': 'T???ng ti???n' },
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
                text: 'M?? ????n h??ng',
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
                text: 'C?? s???',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.StockName || 'Ch??a c??',
                attrs: { 'data-title': 'C?? s???' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                }
              },
              {
                dataField: 'CreateDate',
                text: 'Ng??y',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  moment(row.CreateDate).format('HH:mm DD/MM/YYYY'),
                attrs: { 'data-title': 'Ng??y' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'MemberName',
                text: 'Kh??ch h??ng',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.MemberName || 'Kh??ng c?? t??n',
                attrs: { 'data-title': 'Kh??ch h??ng' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                }
              },
              {
                dataField: 'MemberPhone',
                text: 'S??? ??i???n tho???i',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.MemberPhone || 'Kh??ng c??',
                attrs: { 'data-title': 'S??? ??i???n tho???i' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                }
              },
              {
                dataField: 'Value',
                text: 'Nguy??n gi??',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.Value),
                attrs: { 'data-title': 'Nguy??n gi??' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'ReducedValue',
                text: 'Gi???m / T??ng gi??',
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
                attrs: { 'data-title': 'Gi???m gi??' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                }
              },
              {
                dataField: 'TotalValue',
                text: 'T???ng ti???n',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.TotalValue),
                attrs: { 'data-title': 'T???ng ti???n' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'VoucherCode',
                text: 'Voucher',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.VoucherCode || 'Ch??a c??',
                attrs: { 'data-title': 'Voucher' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                }
              },
              {
                dataField: 'ToPay',
                text: 'C???n thanh to??n',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.ToPay),
                attrs: { 'data-title': 'C???n thanh to??n' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'DaThToan',
                text: '???? thanh to??n',
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
                          Chi ti???t thanh to??n #{row.Id}
                        </Popover.Header>
                        <Popover.Body className="p-0">
                          <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                            <span>Ti???n m???t</span>
                            <span>
                              {PriceHelper.formatVND(row.DaThToan_TM)}
                            </span>
                          </div>
                          <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                            <span>Chuy???n kho???n</span>
                            <span>
                              {PriceHelper.formatVND(row.DaThToan_CK)}
                            </span>
                          </div>
                          <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                            <span>Qu???t th???</span>
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
                attrs: { 'data-title': 'Thanh to??n' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'DaThToan_Vi',
                text: 'V??',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVNDPositive(row.DaThToan_Vi),
                attrs: { 'data-title': 'V??' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'DaThToan_ThTien',
                text: 'Th??? ti???n',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVNDPositive(row.DaThToan_ThTien),
                attrs: { 'data-title': 'Th??? ti???n' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'ConNo',
                text: 'C??n n???',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVNDPositive(row.ConNo),
                attrs: { 'data-title': 'C??n n???' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'IsNewMember',
                text: 'Lo???i',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => (
                  <span
                    className={`${clsx({
                      'text-success': row.IsNewMember === 1
                    })} fw-500`}
                  >
                    Kh??ch {row.IsNewMember === 0 ? 'C??' : 'M???i'}
                  </span>
                ),
                attrs: { 'data-title': 'Lo???i' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: '#',
                text: '#',
                headerAlign: 'center',
                style: { textAlign: 'center' },
                formatter: (cell, row) => (
                  <OverlayTrigger
                    rootClose
                    trigger="click"
                    placement="top"
                    overlay={
                      <Popover className="popover-md">
                        <Popover.Body className="p-0">
                          {row.lines &&
                            row.lines.map((item, index) => (
                              <div
                                className={clsx('p-12px', {
                                  'border-bottom':
                                    row.lines.length - 1 !== index
                                })}
                                key={index}
                              >
                                <div className="fw-500 mb-2px">
                                  {item.ProdTitle}
                                </div>
                                <div className="d-flex justify-content-between">
                                  <div className="text-muted">
                                    SL{' '}
                                    <span className="fw-500 text-dark">
                                      x {item.QTy}
                                    </span>
                                  </div>
                                  <div className="fw-500">
                                    {PriceHelper.formatVND(item.Topay)}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </Popover.Body>
                      </Popover>
                    }
                  >
                    <button type="button" className="btn btn-xs btn-primary">
                      Xem ????n h??ng
                    </button>
                  </OverlayTrigger>
                ),
                attrs: { 'data-title': '#' },
                headerStyle: () => {
                  return { minWidth: '112px', width: '112px' }
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
