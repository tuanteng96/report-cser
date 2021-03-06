import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState
} from 'react'
import reportsApi from 'src/api/reports.api'
import BaseTablesCustom from 'src/components/Tables/BaseTablesCustom'
import { PriceHelper } from 'src/helpers/PriceHelper'
import ModalViewMobile from './ModalViewMobile'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import { useWindowSize } from 'src/hooks/useWindowSize'

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

const ListCustomer = forwardRef(
  ({ filters, onSizePerPageChange, onPageChange }, ref) => {
    const [ListData, setListData] = useState([])
    const [loading, setLoading] = useState(false)
    const [TotalOl, setTotalOl] = useState(0)
    const [PageTotal, setPageTotal] = useState(0)
    const [initialValuesMobile, setInitialValuesMobile] = useState(null)
    const [isModalMobile, setIsModalMobile] = useState(false)
    const { width } = useWindowSize()

    useEffect(() => {
      getListCustomer()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters])

    useImperativeHandle(ref, () => ({
      onRefresh(callback) {
        getListCustomer(false, () => callback && callback())
      },
      onGetDataExport() {
        return new Promise((resolve, reject) => {
          const newFilters = GeneralNewFilter({ ...filters, Ps: 1000, Pi: 1 })
          reportsApi
            .getListCustomer(newFilters)
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
        DistrictsID: filters.DistrictsID ? filters.DistrictsID.value : ''
      }
    }

    const getListCustomer = (isLoading = true, callback) => {
      isLoading && setLoading(true)
      const newFilters = GeneralNewFilter(filters)
      reportsApi
        .getListCustomer(newFilters)
        .then(({ data }) => {
          const { Members, Total, TotalOnline } = {
            Members: data?.result?.Members || [],
            Total: data?.result?.Total || 0,
            TotalOnline: data?.result?.TotalOnline || 0
          }
          setListData(Members)
          setTotalOl(TotalOnline)
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

    return (
      <div className="bg-white rounded mt-25px">
        <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between">
          <div className="fw-500 font-size-lg">Danh s??ch kh??ch h??ng</div>
          {width > 1200 ? (
            <div className="d-flex">
              <div className="fw-500">
                T???ng KH
                <span className="font-size-xl fw-600 text-success pl-5px font-number">
                  {PageTotal}
                </span>
              </div>
              <div className="fw-500 pl-20px">
                KH ?????n t??? Online
                <span className="font-size-xl fw-600 text-success pl-5px font-number">
                  {TotalOl}
                </span>
              </div>
            </div>
          ) : (
            <div className="fw-500 d-flex align-items-center">
              T???ng KH
              <OverlayTrigger
                rootClose
                trigger="click"
                key="bottom"
                placement="bottom"
                overlay={
                  <Popover id={`popover-positioned-top`}>
                    <Popover.Body className="p-0">
                      <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                        <span>T???ng KH</span>
                        <span>{PriceHelper.formatVNDPositive(PageTotal)}</span>
                      </div>
                      <div className="py-10px px-15px fw-600 font-size-md d-flex justify-content-between">
                        <span>KH ?????n t??? Online</span>
                        <span>{PriceHelper.formatVNDPositive(TotalOl)}</span>
                      </div>
                    </Popover.Body>
                  </Popover>
                }
              >
                <div className="d-flex justify-content-between align-items-center">
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {PriceHelper.formatVNDPositive(PageTotal)}
                  </span>
                  <i className="fa-solid fa-circle-exclamation cursor-pointer text-success ml-5px"></i>
                </div>
              </OverlayTrigger>
            </div>
          )}
        </div>
        <div className="p-20px">
          <BaseTablesCustom
            data={ListData}
            textDataNull="Kh??ng c?? d??? li???u."
            optionsMoible={{
              itemShow: 4,
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
                text: 'Ng??y t???o',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  moment(row.CreateDate).format('HH:mm DD/MM/YYYY'),
                attrs: { 'data-title': 'Ng??y t???o' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'FullName',
                text: 'T??n kh??ch h??ng',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => (
                  <div>
                    <span className="font-number text-muted font-size-xs mr-5px">
                      [#{row.Id}]
                    </span>
                    {row.FullName}
                  </div>
                ),
                attrs: { 'data-title': 'T??n' },
                headerStyle: () => {
                  return { minWidth: '250px', width: '250px' }
                }
              },
              {
                dataField: 'MobilePhone',
                text: 'S??? ??i???n tho???i',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  row.MobilePhone || 'Kh??ng c?? s??? ??i???n tho???i',
                attrs: { 'data-title': 'S??? ??i???n tho???i' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'Email',
                text: 'Email',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.Email || 'Kh??ng c?? Email',
                attrs: { 'data-title': 'Email' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'BirthDate',
                text: 'Ng??y sinh',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  row.BirthDate
                    ? moment(row.BirthDate).format('DD/MM/YYYY')
                    : 'Kh??ng c??',
                attrs: { 'data-title': 'Ng??y sinh' },
                headerStyle: () => {
                  return { minWidth: '120px', width: '120px' }
                }
              },
              {
                dataField: 'Gender',
                text: 'Gi???i t??nh',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.Gender,
                attrs: { 'data-title': 'Gi???i t??nh' },
                headerStyle: () => {
                  return { minWidth: '100px', width: '100px' }
                }
              },
              {
                dataField: 'HomeAddress',
                text: '?????a ch???',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.HomeAddress || 'Kh??ng c??',
                attrs: { 'data-title': '?????a ch???' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                }
              },
              {
                dataField: 'DistrictsName',
                text: 'Qu???n Huy???n',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.DistrictsName || 'Kh??ng c??',
                attrs: { 'data-title': 'Qu???n huy???n' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'ProvincesName',
                text: 'T???nh / Th??nh ph???',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.ProvincesName || 'Kh??ng c??',
                attrs: { 'data-title': 'T???nh / TP' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'ByStockName',
                text: 'C?? s???',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.ByStockName || 'Ch??a c??',
                attrs: { 'data-title': 'C?? s???' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'GroupCustomerName',
                text: 'Nh??m kh??ch h??ng',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.GroupCustomerName || 'Ch??a c??',
                attrs: { 'data-title': 'Nh??m kh??ch h??ng' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'Source',
                text: 'Ngu???n',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.Source || 'Ch??a c??',
                attrs: { 'data-title': 'Ngu???n' },
                headerStyle: () => {
                  return { minWidth: '100px', width: '100px' }
                }
              },
              {
                dataField: 'HandCardID',
                text: 'M?? th???',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.HandCardID || 'Ch??a c??',
                attrs: { 'data-title': 'M?? th???' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'ByUserName',
                text: 'Nh??n vi??n ch??m s??c',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.ByUserName || 'Ch??a c??',
                attrs: { 'data-title': 'Nh??n vi??n ch??m s??c' },
                headerStyle: () => {
                  return { minWidth: '250px', width: '250px' }
                }
              },
              {
                dataField: 'vi_dien_tu',
                text: 'V??',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.vi_dien_tu),
                attrs: { 'data-title': 'V??' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'cong_no',
                text: 'C??ng n???',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.cong_no),
                attrs: { 'data-title': 'C??ng n???' },
                headerStyle: () => {
                  return { minWidth: '100px', width: '100px' }
                }
              },
              {
                dataField: 'the_tien',
                text: 'Th??? ti???n',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.the_tien),
                attrs: { 'data-title': 'Th??? ti???n' },
                headerStyle: () => {
                  return { minWidth: '100px', width: '100px' }
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

export default ListCustomer
