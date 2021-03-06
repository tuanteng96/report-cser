import React, {
  forwardRef,
  Fragment,
  useEffect,
  useImperativeHandle,
  useState
} from 'react'
import reportsApi from 'src/api/reports.api'
import BaseTablesCustom from 'src/components/Tables/BaseTablesCustom'
import { PriceHelper } from 'src/helpers/PriceHelper'
import ModalViewMobile from './ModalViewMobile'
import { OverlayTrigger, Popover, Tooltip } from 'react-bootstrap'
import { useWindowSize } from 'src/hooks/useWindowSize'

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

const ListServices = forwardRef(
  ({ filters, onSizePerPageChange, onPageChange }, ref) => {
    const [ListData, setListData] = useState([])
    const [loading, setLoading] = useState(false)
    const [PageTotal, setPageTotal] = useState(0)
    const [initialValuesMobile, setInitialValuesMobile] = useState(null)
    const [isModalMobile, setIsModalMobile] = useState(false)
    const [Total, setTotal] = useState({
      Totalbuoicuoi: 0,
      Totalbuoidau: 0,
      Totalisfirst: 0,
      Totalrequest: 0
    })
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
            .getListServices(newFilters)
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
        Warranty: filters.Warranty ? filters.Warranty.value : '',
        StarRating:
          filters.StarRating && filters.StarRating.length > 0
            ? filters.StarRating.map(item => item.value).join(',')
            : ''
      }
    }

    const getListServices = (isLoading = true, callback) => {
      isLoading && setLoading(true)
      const newFilters = GeneralNewFilter(filters)
      reportsApi
        .getListServices(newFilters)
        .then(({ data }) => {
          const {
            Items,
            Total,
            Totalbuoicuoi,
            Totalbuoidau,
            Totalisfirst,
            Totalrequest
          } = {
            Items: data.result?.Items || [],
            Total: data.result?.Total || 0,
            Totalbuoicuoi: data.result?.Totalbuoicuoi || 0,
            Totalbuoidau: data.result?.Totalbuoidau || 0,
            Totalisfirst: data.result?.Totalisfirst || 0,
            Totalrequest: data.result?.Totalrequest || 0
          }
          setListData(Items)
          setTotal({ Totalbuoicuoi, Totalbuoidau, Totalisfirst, Totalrequest })
          setLoading(false)
          setPageTotal(Total)
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

    const removeName = name => {
      if (!name) return ''
      const index = name.lastIndexOf('-')
      if (index > -1) {
        return name.slice(index + 1, name.length)
      }
    }

    const renderStatusColor = row => {
      const colors = []
      const { SessionCost, SessionIndex, isfirst, Warranty, payment } = row
      if (isfirst) {
        colors.push('rgb(144 189 86)')
      }
      if (SessionIndex) {
        const { CurentIndex, TotalIndex } = {
          CurentIndex: Number(SessionIndex.split('/')[0]),
          TotalIndex: Number(SessionIndex.split('/')[1])
        }
        if (Number(payment) < CurentIndex * SessionCost) {
          colors.push('rgb(231, 195, 84)')
        }
        if (CurentIndex === 1 && TotalIndex > 1) {
          colors.push('rgb(146 224 224)')
        }
        if (CurentIndex === TotalIndex && TotalIndex > 1 && Warranty === '') {
          colors.push('rgb(255, 190, 211)')
        }
      }
      return colors.map((item, index) => (
        <div
          className="flex-grow-1"
          style={{ backgroundColor: item }}
          key={index}
        ></div>
      ))
    }

    return (
      <div className="bg-white rounded mt-25px">
        <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between">
          <div className="fw-500 font-size-lg">Danh s??ch d???ch v???</div>
          <div className="d-flex">
            <div className="fw-500 pr-10px">
              T???ng d???ch v???{' '}
              <span className="font-size-xl fw-600 text-success pl-5px font-number">
                {PageTotal}
              </span>
              {width <= 1200 && (
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
                        Chi ti???t d???ch v???
                      </Popover.Header>
                      <Popover.Body className="p-0">
                        <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                          <span>KH bu???i ?????u th???</span>
                          <span>{Total.Totalbuoidau}</span>
                        </div>
                        <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                          <span>KH bu???i cu???i th???</span>
                          <span>{Total.Totalbuoicuoi}</span>
                        </div>
                        <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                          <span>KH bu???i ?????u</span>
                          <span>{Total.Totalisfirst}</span>
                        </div>
                        <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                          <span>KH c???n thanh to??n</span>
                          <span>{Total.Totalrequest}</span>
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
                  KH bu???i ?????u th???{' '}
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {Total.Totalbuoidau}
                  </span>
                </div>
                <div className="fw-500 pr-15px">
                  KH bu???i cu???i th???{' '}
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {Total.Totalbuoicuoi}
                  </span>
                </div>
                <div className="fw-500 pr-15px">
                  KH bu???i ?????u{' '}
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {Total.Totalisfirst}
                  </span>
                </div>
                <div className="fw-500">
                  KH c???n thanh to??n{' '}
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {Total.Totalrequest}
                  </span>
                </div>
              </Fragment>
            )}
          </div>
        </div>
        <div className="p-20px">
          <div className="d-flex mb-15px">
            <div className="d-flex mr-20px">
              <OverlayTrigger
                rootClose
                trigger="click"
                key="top"
                placement="top"
                overlay={<Tooltip id={`tooltip-top`}>Kh??ch bu???i ?????u</Tooltip>}
              >
                <div
                  className="w-40px h-15px"
                  style={{ backgroundColor: 'rgb(144 189 86)' }}
                ></div>
              </OverlayTrigger>
              {width > 992 && (
                <div className="fw-500 pl-8px line-height-xs">
                  Kh??ch bu???i ?????u
                </div>
              )}
            </div>
            <div className="d-flex mr-20px">
              <OverlayTrigger
                rootClose
                trigger="click"
                key="top"
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-top`}>C???n thanh to??n th??m</Tooltip>
                }
              >
                <div
                  className="w-40px h-15px"
                  style={{ backgroundColor: 'rgb(231, 195, 84)' }}
                ></div>
              </OverlayTrigger>
              {width > 992 && (
                <div className="fw-500 pl-8px line-height-xs">
                  C???n thanh to??n th??m
                </div>
              )}
            </div>
            <div className="d-flex mr-20px">
              <OverlayTrigger
                rootClose
                trigger="click"
                key="top"
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-top`}>Kh??ch th??? bu???i ?????u</Tooltip>
                }
              >
                <div
                  className="w-40px h-15px"
                  style={{ backgroundColor: 'rgb(146 224 224)' }}
                ></div>
              </OverlayTrigger>
              {width > 992 && (
                <div className="fw-500 pl-8px line-height-xs">
                  Kh??ch th??? bu???i ?????u
                </div>
              )}
            </div>
            <div className="d-flex">
              <OverlayTrigger
                rootClose
                trigger="click"
                key="top"
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-top`}>Kh??ch th??? bu???i cu???i</Tooltip>
                }
              >
                <div
                  className="w-40px h-15px"
                  style={{ backgroundColor: 'rgb(255, 190, 211)' }}
                ></div>
              </OverlayTrigger>
              {width > 992 && (
                <div className="fw-500 pl-8px line-height-xs">
                  Kh??ch th??? bu???i cu???i
                </div>
              )}
            </div>
          </div>
          <BaseTablesCustom
            data={ListData}
            textDataNull="Kh??ng c?? d??? li???u."
            optionsMoible={{
              itemShow: 5,
              CallModal: row => OpenModalMobile(row)
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
                  <Fragment>
                    <span className="font-number position-relative zindex-10">
                      {filters.Ps * (filters.Pi - 1) + (rowIndex + 1)}
                    </span>
                    <div className="position-absolute top-0 left-0 w-100 h-100 d-flex">
                      {renderStatusColor(row)}
                    </div>
                  </Fragment>
                ),
                headerStyle: () => {
                  return { width: '60px' }
                },
                headerAlign: 'center',
                style: { textAlign: 'center', position: 'relative' },
                attrs: { 'data-title': 'STT' }
              },
              {
                dataField: 'Id',
                text: 'ID',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => <div>#{row.Id}</div>,
                attrs: { 'data-title': 'ID' },
                headerStyle: () => {
                  return { minWidth: '100px', width: '100px' }
                }
              },
              {
                dataField: 'BookDate',
                text: 'Ng??y ?????t l???ch',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  moment(row.BookDate).format('HH:mm DD/MM/YYYY'),
                attrs: { 'data-title': 'Ng??y ?????t l???ch' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
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
                dataField: 'MemberName',
                text: 'Kh??ch h??ng',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.MemberName || 'Ch??a c??',
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
                formatter: (cell, row) => row.MemberPhone || 'Ch??a c??',
                attrs: { 'data-title': 'S??? ??i???n tho???i' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                }
              },
              {
                dataField: 'ProServiceName',
                text: 'D???ch v??? g???c',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  row.ProServiceName || 'Kh??ng c?? d???ch v??? g???c',
                attrs: { 'data-title': 'D???ch v??? g???c' },
                headerStyle: () => {
                  return { minWidth: '220px', width: '220px' }
                }
              },
              {
                dataField: 'Card',
                text: 'Th???',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.Card || 'Kh??ng c?? th???',
                attrs: { 'data-title': 'Th???' },
                headerStyle: () => {
                  return { minWidth: '250px', width: '250px' }
                }
              },
              {
                dataField: 'SessionCost',
                text: 'Gi?? bu???i',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVND(row.SessionCost),
                attrs: { 'data-title': 'Gi?? bu???i' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'SessionCostExceptGift',
                text: 'Gi?? bu???i (T???ng)',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVND(row.SessionCostExceptGift),
                attrs: { 'data-title': 'Gi?? bu???i (T???ng)' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'SessionIndex',
                text: 'Bu???i',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  row.Warranty ? row.SessionWarrantyIndex : row.SessionIndex,
                attrs: { 'data-title': 'Bu???i' },
                headerStyle: () => {
                  return { minWidth: '100px', width: '100px' }
                }
              },
              {
                dataField: 'Warranty',
                text: 'B???o h??nh',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  row.Warranty ? 'B???o h??nh' : 'Kh??ng c??',
                attrs: { 'data-title': 'B???o h??nh' },
                headerStyle: () => {
                  return { minWidth: '120px', width: '120px' }
                }
              },
              {
                dataField: 'AddFeeTitles',
                text: 'Ph??? ph??',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  row.AddFeeTitles && row.AddFeeTitles.length > 0
                    ? row.AddFeeTitles.map((item, index) => (
                        <div key={index}>{removeName(item)} </div>
                      ))
                    : 'Kh??ng c??',
                attrs: { 'data-title': 'Ph??? ph??' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                }
              },
              {
                dataField: 'Nh??n vi??n th???c hi???n',
                text: 'Nh??n vi??n th???c hi???n',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  row.Gender === 0 ? (
                    'Nam'
                  ) : (
                    <>
                      {row.StaffSalaries && row.StaffSalaries.length > 0
                        ? row.StaffSalaries.map(
                            item =>
                              `${item.FullName} (${PriceHelper.formatVND(
                                item.Salary
                              )})`
                          ).join(', ')
                        : 'Ch??a x??c ?????nh'}
                    </>
                  ),
                attrs: { 'data-title': 'Nh??n vi??n th???c hi???n' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                }
              },
              {
                dataField: 'TotalSalary',
                text: 'T???ng l????ng nh??n vi??n',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVND(row.TotalSalary),
                attrs: { 'data-title': 'T???ng l????ng NV' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'Status',
                text: 'Tr???ng th??i',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  row.Status === 'done' ? (
                    <span className="badge bg-success">Ho??n th??nh</span>
                  ) : (
                    <span className="badge bg-warning">??ang th???c hi???n</span>
                  ),
                attrs: { 'data-title': 'Tr???ng th??i' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'Rate',
                text: '????nh gi?? sao',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.Rate || 'Ch??a ????nh gi??',
                attrs: { 'data-title': '????nh gi?? sao' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'RateNote',
                text: 'N???i dung ????nh gi??',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.RateNote || 'Ch??a c??',
                attrs: { 'data-title': 'N???i dung ????nh gi??' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'Desc',
                text: 'M?? t???',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.Desc || 'Ch??a c??',
                attrs: { 'data-title': 'M?? t???' },
                headerStyle: () => {
                  return { minWidth: '220px', width: '220px' }
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

export default ListServices
