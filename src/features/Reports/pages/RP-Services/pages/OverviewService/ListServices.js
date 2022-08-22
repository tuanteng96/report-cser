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
import { ArrayHeplers } from 'src/helpers/ArrayHeplers'

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
            .getListServices(newFilters)
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
        MemberID: filters.MemberID ? filters.MemberID.value : '',
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
          <div className="fw-500 font-size-lg">Danh sách dịch vụ</div>
          <div className="d-flex">
            <div className="fw-500 pr-10px">
              Tổng dịch vụ{' '}
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
                        Chi tiết dịch vụ
                      </Popover.Header>
                      <Popover.Body className="p-0">
                        <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                          <span>KH buổi đầu thẻ</span>
                          <span>{Total.Totalbuoidau}</span>
                        </div>
                        <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                          <span>KH buổi cuối thẻ</span>
                          <span>{Total.Totalbuoicuoi}</span>
                        </div>
                        <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                          <span>KH buổi đầu</span>
                          <span>{Total.Totalisfirst}</span>
                        </div>
                        <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                          <span>KH cần thanh toán</span>
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
                  KH buổi đầu thẻ{' '}
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {Total.Totalbuoidau}
                  </span>
                </div>
                <div className="fw-500 pr-15px">
                  KH buổi cuối thẻ{' '}
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {Total.Totalbuoicuoi}
                  </span>
                </div>
                <div className="fw-500 pr-15px">
                  KH buổi đầu{' '}
                  <span className="font-size-xl fw-600 text-success pl-5px font-number">
                    {Total.Totalisfirst}
                  </span>
                </div>
                <div className="fw-500">
                  KH cần thanh toán{' '}
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
                overlay={<Tooltip id={`tooltip-top`}>Khách buổi đầu</Tooltip>}
              >
                <div
                  className="w-40px h-15px"
                  style={{ backgroundColor: 'rgb(144 189 86)' }}
                ></div>
              </OverlayTrigger>
              {width > 992 && (
                <div className="fw-500 pl-8px line-height-xs">
                  Khách buổi đầu
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
                  <Tooltip id={`tooltip-top`}>Cần thanh toán thêm</Tooltip>
                }
              >
                <div
                  className="w-40px h-15px"
                  style={{ backgroundColor: 'rgb(231, 195, 84)' }}
                ></div>
              </OverlayTrigger>
              {width > 992 && (
                <div className="fw-500 pl-8px line-height-xs">
                  Cần thanh toán thêm
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
                  <Tooltip id={`tooltip-top`}>Khách thẻ buổi đầu</Tooltip>
                }
              >
                <div
                  className="w-40px h-15px"
                  style={{ backgroundColor: 'rgb(146 224 224)' }}
                ></div>
              </OverlayTrigger>
              {width > 992 && (
                <div className="fw-500 pl-8px line-height-xs">
                  Khách thẻ buổi đầu
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
                  <Tooltip id={`tooltip-top`}>Khách thẻ buổi cuối</Tooltip>
                }
              >
                <div
                  className="w-40px h-15px"
                  style={{ backgroundColor: 'rgb(255, 190, 211)' }}
                ></div>
              </OverlayTrigger>
              {width > 992 && (
                <div className="fw-500 pl-8px line-height-xs">
                  Khách thẻ buổi cuối
                </div>
              )}
            </div>
          </div>
          <BaseTablesCustom
            data={ListData}
            textDataNull="Không có dữ liệu."
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
                text: 'Ngày đặt lịch',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  moment(row.BookDate).format('HH:mm DD/MM/YYYY'),
                attrs: { 'data-title': 'Ngày đặt lịch' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
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
                dataField: 'MemberName',
                text: 'Khách hàng',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.MemberName || 'Chưa có',
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
                formatter: (cell, row) => row.MemberPhone || 'Chưa có',
                attrs: { 'data-title': 'Số điện thoại' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                }
              },
              {
                dataField: 'ProServiceName',
                text: 'Dịch vụ gốc',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  row.ProServiceName || 'Không có dịch vụ gốc',
                attrs: { 'data-title': 'Dịch vụ gốc' },
                headerStyle: () => {
                  return { minWidth: '220px', width: '220px' }
                }
              },
              {
                dataField: 'Card',
                text: 'Thẻ',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.Card || 'Không có thẻ',
                attrs: { 'data-title': 'Thẻ' },
                headerStyle: () => {
                  return { minWidth: '250px', width: '250px' }
                }
              },
              {
                dataField: 'SessionCost',
                text: 'Giá buổi',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVND(row.SessionCost),
                attrs: { 'data-title': 'Giá buổi' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'SessionCostExceptGift',
                text: 'Giá buổi (Tặng)',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVND(row.SessionCostExceptGift),
                attrs: { 'data-title': 'Giá buổi (Tặng)' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'SessionIndex',
                text: 'Buổi',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  row.Warranty ? row.SessionWarrantyIndex : row.SessionIndex,
                attrs: { 'data-title': 'Buổi' },
                headerStyle: () => {
                  return { minWidth: '100px', width: '100px' }
                }
              },
              {
                dataField: 'Warranty',
                text: 'Bảo hành',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  row.Warranty ? 'Bảo hành' : 'Không có',
                attrs: { 'data-title': 'Bảo hành' },
                headerStyle: () => {
                  return { minWidth: '120px', width: '120px' }
                }
              },
              {
                dataField: 'AddFeeTitles',
                text: 'Phụ phí',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  row.AddFeeTitles && row.AddFeeTitles.length > 0
                    ? row.AddFeeTitles.map((item, index) => (
                        <div key={index}>{removeName(item)} </div>
                      ))
                    : 'Không có',
                attrs: { 'data-title': 'Phụ phí' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                }
              },
              {
                dataField: 'Nhân viên thực hiện',
                text: 'Nhân viên thực hiện',
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
                        : 'Chưa xác định'}
                    </>
                  ),
                attrs: { 'data-title': 'Nhân viên thực hiện' },
                headerStyle: () => {
                  return { minWidth: '200px', width: '200px' }
                }
              },
              {
                dataField: 'TotalSalary',
                text: 'Tổng lương nhân viên',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  PriceHelper.formatVND(row.TotalSalary),
                attrs: { 'data-title': 'Tổng lương NV' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'Status',
                text: 'Trạng thái',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) =>
                  row.Status === 'done' ? (
                    <span className="badge bg-success">Hoàn thành</span>
                  ) : (
                    <span className="badge bg-warning">Đang thực hiện</span>
                  ),
                attrs: { 'data-title': 'Trạng thái' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'Rate',
                text: 'Đánh giá sao',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.Rate || 'Chưa đánh giá',
                attrs: { 'data-title': 'Đánh giá sao' },
                headerStyle: () => {
                  return { minWidth: '150px', width: '150px' }
                }
              },
              {
                dataField: 'RateNote',
                text: 'Nội dung đánh giá',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.RateNote || 'Chưa có',
                attrs: { 'data-title': 'Nội dung đánh giá' },
                headerStyle: () => {
                  return { minWidth: '180px', width: '180px' }
                }
              },
              {
                dataField: 'Desc',
                text: 'Mô tả',
                //headerAlign: "center",
                //style: { textAlign: "center" },
                formatter: (cell, row) => row.Desc || 'Chưa có',
                attrs: { 'data-title': 'Mô tả' },
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
