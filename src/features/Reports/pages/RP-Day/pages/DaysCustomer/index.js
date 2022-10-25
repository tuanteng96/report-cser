import React, { Fragment, useEffect, useMemo, useState } from 'react'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import { useSelector } from 'react-redux'
import Filter from 'src/components/Filter/Filter'
import _ from 'lodash'
import { uuidv4 } from '@nikitababko/id-generator'
import { PriceHelper } from 'src/helpers/PriceHelper'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'
import ModalViewMobile from './ModalViewMobile'
import { JsonFilter } from 'src/Json/JsonFilter'

import moment from 'moment'
import 'moment/locale/vi'

moment.locale('vi')

const jsonData = [
  {
    Ids: uuidv4(),
    rowIndex: 0,
    CreateDate: '2022-10-21T15:50:00',
    FullName: 'Nguyễn Tài Tuấn',
    Phone: '0971021196',
    TongThanhToan: 1580000,
    No: 300000,
    CK: 300000,
    TM: 200000,
    QT: 150000,
    CheckIn: '2022-10-21T15:50:00',
    CheckOut: '2022-10-21T15:50:00',
    children: [
      {
        Ids: uuidv4(),
        id: `0-detail`,
        MajorList: [
          {
            Order: {
              ID: '83254',
              Prods: [
                {
                  Title: 'Kem trị nám',
                  Qty: 5
                },
                {
                  Title: 'Triệt lông',
                  Qty: 3
                }
              ],
              GiaBanDonHang: 1580000,
              ThanhToan: 1280000,
              Vi: 500000,
              TheTien: 300000,
              No: 300000,
              HoaHong: [
                {
                  FullName: 'Linh',
                  Bonus: 50000
                }
              ],
              DoanhSo: [
                {
                  FullName: 'Đức Hướng',
                  Bonus: 25000
                }
              ]
            }
          },
          {
            PayDebt: {
              ID: '83254',
              Prods: [
                {
                  Title: 'Kem trị nám',
                  Qty: 5
                },
                {
                  Title: 'Triệt lông',
                  Qty: 3
                }
              ],
              ThanhToan: 1280000,
              Vi: 500000,
              TheTien: 300000,
              No: 300000,
              HoaHong: [
                {
                  FullName: 'Linh',
                  Bonus: 50000
                }
              ],
              DoanhSo: [
                {
                  FullName: 'Đức Hướng',
                  Bonus: 25000
                }
              ]
            }
          },
          {
            Returns: {
              ID: '83254',
              Prods: [
                {
                  Title: 'Kem trị nám',
                  Qty: 5
                },
                {
                  Title: 'Triệt lông',
                  Qty: 3
                }
              ],
              GiaTriDonTra: 1280000,
              HoanTienMat: 500000,
              HoanVi: 500000,
              HoanTheTien: 300000,
              HoaHongGiam: [
                {
                  FullName: 'Linh',
                  Bonus: 50000
                }
              ],
              DoanhSoGiam: [
                {
                  FullName: 'Đức Hướng',
                  Bonus: 25000
                }
              ]
            }
          },
          {
            Services: [
              {
                Type: 'Thực hiện dịch vụ',
                Title: 'Chăm sóc da mặt',
                PhuPhi: 'Phụ phí làm ngoài giờ',
                HoaHong: [
                  {
                    FullName: 'Linh',
                    Bonus: 50000
                  }
                ]
              },
              {
                Title: 'Giảm béo công nghệ Laser',
                HoaHong: [
                  {
                    FullName: 'Linh',
                    Bonus: 50000
                  }
                ]
              }
            ]
          }
        ],
        More: [
          {
            Title: 'Nạp ví',
            Value: 1000000,
            PhatSinhThuChi: 1000000,
            Desc: 'Đặt cọc dịch vụ tắm trắng công nghệ cao'
          },
          {
            Title: 'Chi ví trả tiền mặt',
            Value: -1000000,
            PhatSinhThuChi: 1000000,
            Desc: 'Hoàn khách không đặt cọc nữa'
          }
        ],
        Booking: [
          {
            CreateDate: '2022-10-21T15:50:00',
            ProdTitle: 'Dịch vụ chăm sóc da',
            Type: 'Đặt lịch tự động',
            Staffs: ['Nguyễn Lan', 'Trịnh Thu']
          },
          {
            CreateDate: '2022-10-21T15:50:00',
            ProdTitle: 'Dịch vụ tẩy lông',
            Type: 'Đặt lịch',
            Staffs: ['Trịnh Thu']
          }
        ]
      }
    ]
  }
]

const DetailRenderer = ({ filters, ...props }) => {
  const { MajorList, More, Booking } = props.rowData
  const showDH_SĐV =
    _.includes(filters.ViewType, 'DON_HANG') ||
    _.includes(filters.ViewType, 'SD_DICH_VU')
  return (
    <div className="p-15px w-100">
      {showDH_SĐV && (
        <div className="mb-15px">
          <div className="mb-8px text-uppercase fw-600 font-size-md">
            <span className="text-danger">(*)</span> Đơn hàng & Sử dụng dịch vụ
          </div>
          <div className="table-responsive">
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
                              {PriceHelper.formatVND(item.Order.GiaBanDonHang)}
                            </div>
                          </td>
                          <td className="vertical-align-middle min-w-180px w-180px">
                            <div>Thanh toán</div>
                            <div className="fw-600">
                              {PriceHelper.formatVND(item.Order.ThanhToan)}
                            </div>
                          </td>
                          <td className="vertical-align-middle min-w-180px w-180px">
                            <div>Thanh toán ví</div>
                            <div className="fw-600">
                              {PriceHelper.formatVND(item.Order.Vi)}
                            </div>
                          </td>
                          <td className="vertical-align-middle min-w-180px w-180px">
                            <div>Thanh toán thẻ tiền</div>
                            <div className="fw-600">
                              {PriceHelper.formatVND(item.Order.TheTien)}
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
                            {item.Order.HoaHong.map((item, index) => (
                              <div className="fw-600" key={index}>
                                {item.FullName}{' '}
                                {PriceHelper.formatVND(item.Bonus)}
                              </div>
                            ))}
                          </td>
                          <td className="vertical-align-middle min-w-180px w-180px">
                            <div>Doanh số</div>
                            {item.Order.DoanhSo.map((item, index) => (
                              <div className="fw-600" key={index}>
                                {item.FullName}{' '}
                                {PriceHelper.formatVND(item.Bonus)}
                              </div>
                            ))}
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
                              {item.PayDebt.Prods.map(
                                item => `${item.Title} (x${item.Qty})`
                              ).join(', ')}
                            </div>
                          </td>
                          <td className="vertical-align-middle min-w-180px w-180px"></td>
                          <td className="vertical-align-middle min-w-180px w-180px">
                            <div>Thanh toán</div>
                            <div className="fw-600">
                              {PriceHelper.formatVND(item.PayDebt.ThanhToan)}
                            </div>
                          </td>
                          <td className="vertical-align-middle min-w-180px w-180px">
                            <div>Thanh toán ví</div>
                            <div className="fw-600">
                              {PriceHelper.formatVND(item.PayDebt.Vi)}
                            </div>
                          </td>
                          <td className="vertical-align-middle min-w-180px w-180px">
                            <div>Thanh toán thẻ tiền</div>
                            <div className="fw-600">
                              {PriceHelper.formatVND(item.PayDebt.TheTien)}
                            </div>
                          </td>
                          <td className="vertical-align-middle min-w-180px w-180px">
                            <div>Còn nợ</div>
                            <div className="fw-600">
                              {PriceHelper.formatVND(item.PayDebt.No)}
                            </div>
                          </td>
                          <td className="vertical-align-middle min-w-180px w-180px">
                            <div>Hoa hồng</div>
                            {item.PayDebt.HoaHong.map((item, index) => (
                              <div className="fw-600" key={index}>
                                {item.FullName}{' '}
                                {PriceHelper.formatVND(item.Bonus)}
                              </div>
                            ))}
                          </td>
                          <td className="vertical-align-middle min-w-180px w-180px">
                            <div>Doanh số</div>
                            {item.PayDebt.DoanhSo.map((item, index) => (
                              <div className="fw-600" key={index}>
                                {item.FullName}{' '}
                                {PriceHelper.formatVND(item.Bonus)}
                              </div>
                            ))}
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
                              {item.Returns.Prods.map(
                                item => `${item.Title} (x${item.Qty})`
                              ).join(', ')}
                            </div>
                          </td>
                          <td className="vertical-align-middle min-w-180px w-180px">
                            <div>Giá trị đơn trả</div>
                            <div className="fw-600 text-danger">
                              {PriceHelper.formatVND(item.Returns.GiaTriDonTra)}
                            </div>
                          </td>
                          <td className="vertical-align-middle min-w-180px w-180px">
                            <div>Hoàn tiền mặt</div>
                            <div className="fw-600">
                              {PriceHelper.formatVND(item.Returns.HoanTienMat)}
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
                              {PriceHelper.formatVND(item.Returns.HoanTheTien)}
                            </div>
                          </td>
                          <td className="vertical-align-middle min-w-180px w-180px"></td>
                          <td className="vertical-align-middle min-w-180px w-180px">
                            <div>Hoa hồng giảm</div>
                            {item.Returns.HoaHongGiam.map((item, index) => (
                              <div className="fw-600" key={index}>
                                {item.FullName}{' '}
                                {PriceHelper.formatVND(item.Bonus)}
                              </div>
                            ))}
                          </td>
                          <td className="vertical-align-middle min-w-180px w-180px">
                            <div className="fw-600">Doanh số giảm</div>
                            {item.Returns.DoanhSoGiam.map((item, index) => (
                              <div className="fw-600" key={index}>
                                {item.FullName}{' '}
                                {PriceHelper.formatVND(item.Bonus)}
                              </div>
                            ))}
                          </td>
                        </tr>
                      )}
                      {item.Services &&
                        item.Services.map((service, idx) => (
                          <tr key={idx}>
                            {service.Type && (
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
                              <div className="fw-600">{service.PhuPhi}</div>
                            </td>
                            <td className="vertical-align-middle min-w-180px w-180px"></td>
                            <td className="vertical-align-middle min-w-180px w-180px"></td>
                            <td className="vertical-align-middle min-w-180px w-180px"></td>
                            <td className="vertical-align-middle min-w-180px w-180px"></td>
                            <td className="vertical-align-middle min-w-180px w-180px">
                              <div>Hoa hồng</div>
                              {service.HoaHong.map((item, index) => (
                                <div className="fw-600" key={index}>
                                  {item.FullName}{' '}
                                  {PriceHelper.formatVND(item.Bonus)}
                                </div>
                              ))}
                            </td>
                            <td className="vertical-align-middle min-w-180px w-180px"></td>
                          </tr>
                        ))}
                    </Fragment>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {_.includes(filters.ViewType, 'NGHIEP_VU_KHAC') && (
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
                {More &&
                  More.map((item, index) => (
                    <tr key={index}>
                      <td className="min-w-250px w-250px">{item.Title}</td>
                      <td className="min-w-200px w-200px">
                        {PriceHelper.formatVND(item.Value)}
                      </td>
                      <td className="min-w-200px w-200px">
                        {PriceHelper.formatVND(item.PhatSinhThuChi)}
                      </td>
                      <td className="min-w-250px w-250px">{item.Desc}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {_.includes(filters.ViewType, 'DAT_LICH') && (
        <div className="mb-0px">
          <div className="mb-8px text-uppercase fw-600 font-size-md">
            <span className="text-danger">(*)</span> Đặt lịch
          </div>
          <div className="table-responsive">
            <table className="table table-bordered mb-0">
              <thead>
                <tr>
                  <th className="min-w-250px w-250px">Ngày</th>
                  <th className="min-w-200px w-200px">Tên dịch vụ</th>
                  <th className="min-w-200px w-200px">Loại</th>
                  <th className="min-w-250px w-250px">Nhân viên</th>
                </tr>
              </thead>
              <tbody>
                {Booking &&
                  Booking.map((item, index) => (
                    <tr key={index}>
                      <td className="min-w-250px w-250px">
                        {moment(item.CreateDate).format('HH:mm DD/MM/YYYY')}
                      </td>
                      <td className="min-w-200px w-200px">{item.ProdTitle}</td>
                      <td className="min-w-200px w-200px">{item.Type}</td>
                      <td className="min-w-250px w-250px">
                        {item.Staffs && item.Staffs.join(', ')}
                      </td>
                    </tr>
                  ))}
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
  const [ListData, setListData] = useState(jsonData)
  const [pageCount, setPageCount] = useState(0)
  const [isFilter, setIsFilter] = useState(false)
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    Pi: 1, // Trang hiện tại
    Ps: 15, // Số lượng item
    Date: new Date(), // ID Khách hàng
    ViewType: [
      JsonFilter.ViewTypeList[0].value,
      JsonFilter.ViewTypeList[1].value
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

  const onOpenFilter = () => {
    setIsFilter(true)
  }

  const onHideFilter = () => {
    setIsFilter(false)
  }

  const onFilter = values => {
    if (_.isEqual(values, filters)) {
      //getAllDays()
    } else {
      setFilters({ ...values, Pi: 1 })
    }
  }

  const onRefresh = () => {
    //getAllDays()
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
        width: 200,
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
          moment(rowData.CreateDate).format('HH:mm DD/MM/YYYY'),
        width: 200,
        sortable: false
      },
      {
        key: 'CheckOut',
        title: 'Giờ CheckOut',
        dataKey: 'CheckOut',
        cellRenderer: ({ rowData }) =>
          moment(rowData.CreateDate).format('HH:mm DD/MM/YYYY'),
        width: 200,
        sortable: false
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
      <Filter
        show={isFilter}
        filters={filters}
        onHide={onHideFilter}
        onSubmit={onFilter}
        onRefresh={onRefresh}
        loading={loading}
      />
      <div className="bg-white rounded">
        <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between">
          <div className="fw-500 font-size-lg">Danh sách khách hàng</div>
        </div>
        <div className="p-20px">
          <ReactTableV7
            expandColumnKey={columns[2].key}
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
