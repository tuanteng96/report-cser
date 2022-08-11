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
import { ArrayHeplers } from 'src/helpers/ArrayHeplers'

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
      setListData([])
      getListCustomer(true)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters])

    useImperativeHandle(ref, () => ({
      onRefresh(callback) {
        setListData([])
        getListCustomer(true, () => callback && callback())
      },
      onGetDataExport() {
        return new Promise((resolve, reject) => {
          const newFilters = GeneralNewFilter(
            ArrayHeplers.getFilterExport({ ...filters }, PageTotal)
          )
          reportsApi
            .getListCustomer(newFilters)
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
          <div className="fw-500 font-size-lg">Danh sách khách hàng</div>
          {width > 1200 ? (
            <div className="d-flex">
              <div className="fw-500">
                Tổng KH
                <span className="font-size-xl fw-600 text-success pl-5px font-number">
                  {PageTotal}
                </span>
              </div>
              <div className="fw-500 pl-20px">
                KH đến từ Online
                <span className="font-size-xl fw-600 text-success pl-5px font-number">
                  {TotalOl}
                </span>
              </div>
            </div>
          ) : (
            <div className="fw-500 d-flex align-items-center">
              Tổng KH
              <OverlayTrigger
                rootClose
                trigger="click"
                key="bottom"
                placement="bottom"
                overlay={
                  <Popover id={`popover-positioned-top`}>
                    <Popover.Body className="p-0">
                      <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                        <span>Tổng KH</span>
                        <span>{PriceHelper.formatVNDPositive(PageTotal)}</span>
                      </div>
                      <div className="py-10px px-15px fw-600 font-size-md d-flex justify-content-between">
                        <span>KH đến từ Online</span>
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
            textDataNull="Không có dữ liệu."
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
                text: 'Ngày tạo',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  moment(row.CreateDate).format('HH:mm DD/MM/YYYY'),
                attrs: { 'data-title': 'Ngày tạo' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'FullName',
                text: 'Tên khách hàng',
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
                attrs: { 'data-title': 'Tên' },
                headerStyle: () => {
                  return { minWidth: '250px', width: '250px' }
                }
              },
              {
                dataField: 'MobilePhone',
                text: 'Số điện thoại',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  row.MobilePhone || 'Không có số điện thoại',
                attrs: { 'data-title': 'Số điện thoại' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'Email',
                text: 'Email',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.Email || 'Không có Email',
                attrs: { 'data-title': 'Email' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'BirthDate',
                text: 'Ngày sinh',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  row.BirthDate
                    ? moment(row.BirthDate).format('DD/MM/YYYY')
                    : 'Không có',
                attrs: { 'data-title': 'Ngày sinh' },
                headerStyle: () => {
                  return { minWidth: '120px', width: '120px' }
                }
              },
              {
                dataField: 'Gender',
                text: 'Giới tính',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.Gender,
                attrs: { 'data-title': 'Giới tính' },
                headerStyle: () => {
                  return { minWidth: '100px', width: '100px' }
                }
              },
              {
                dataField: 'HomeAddress',
                text: 'Địa chỉ',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.HomeAddress || 'Không có',
                attrs: { 'data-title': 'Địa chỉ' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                }
              },
              {
                dataField: 'DistrictsName',
                text: 'Quận Huyện',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.DistrictsName || 'Không có',
                attrs: { 'data-title': 'Quận huyện' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'ProvincesName',
                text: 'Tỉnh / Thành phố',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.ProvincesName || 'Không có',
                attrs: { 'data-title': 'Tỉnh / TP' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'ByStockName',
                text: 'Cơ sở',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.ByStockName || 'Chưa có',
                attrs: { 'data-title': 'Cơ sở' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'GroupCustomerName',
                text: 'Nhóm khách hàng',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.GroupCustomerName || 'Chưa có',
                attrs: { 'data-title': 'Nhóm khách hàng' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'Source',
                text: 'Nguồn',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.Source || 'Chưa có',
                attrs: { 'data-title': 'Nguồn' },
                headerStyle: () => {
                  return { minWidth: '100px', width: '100px' }
                }
              },
              {
                dataField: 'HandCardID',
                text: 'Mã thẻ',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.HandCardID || 'Chưa có',
                attrs: { 'data-title': 'Mã thẻ' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'ByUserName',
                text: 'Nhân viên chăm sóc',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.ByUserName || 'Chưa có',
                attrs: { 'data-title': 'Nhân viên chăm sóc' },
                headerStyle: () => {
                  return { minWidth: '250px', width: '250px' }
                }
              },
              {
                dataField: 'vi_dien_tu',
                text: 'Ví',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.vi_dien_tu),
                attrs: { 'data-title': 'Ví' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'cong_no',
                text: 'Công nợ',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.cong_no),
                attrs: { 'data-title': 'Công nợ' },
                headerStyle: () => {
                  return { minWidth: '100px', width: '100px' }
                }
              },
              {
                dataField: 'the_tien',
                text: 'Thẻ tiền',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => PriceHelper.formatVND(row.the_tien),
                attrs: { 'data-title': 'Thẻ tiền' },
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
