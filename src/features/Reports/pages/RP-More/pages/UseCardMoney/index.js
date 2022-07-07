import React, { Fragment, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import FilterList from 'src/components/Filter/FilterList'
import { PermissionHelpers } from 'src/helpers/PermissionHelpers'
import reportsApi from 'src/api/reports.api'
import { PriceHelper } from 'src/helpers/PriceHelper'
import ChildrenTables from 'src/components/Tables/ChildrenTables'

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

const JSONData = {
  Total: 1,
  PCount: 1,
  Items: [
    {
      CreateDate: '2022-07-06T08:48:22.877', // ID khách hàng
      MemberList: [
        {
          Id: 12372, // ID Member
          FullName: 'Nguyễn Tài Tuấn',
          Phone: '0971021196',
          UsageHistory: [
            {
              Title: 'Thẻ tiền 5tr',
              Code: 45652,
              Type: 'THANH_TOAN',
              Value: 70000,
              ProdLists: [
                {
                  Id: 12258,
                  Title: 'Kem trị nám',
                  Qty: 5
                },
                {
                  Id: 12258,
                  Title: 'Tăm trắng',
                  Qty: 1
                }
              ]
            },
            {
              Title: 'Thẻ tiền 5tr',
              Code: 45652,
              Type: 'THANH_TOAN',
              Value: 25000,
              ProdLists: [
                {
                  Id: 12258,
                  Title: 'Maxat Body toàn thân',
                  Qty: 1
                }
              ]
            }
          ]
        },
        {
          Id: 12372, // ID Member
          FullName: 'Lê Bảo Ngọc',
          Phone: '0981883338',
          UsageHistory: [
            {
              Title: 'Thẻ tiền 5tr',
              Code: 45652,
              Type: 'THANH_TOAN',
              Value: 25000,
              ProdLists: [
                {
                  Id: 12258,
                  Title: 'Maxat Body toàn thân',
                  Qty: 1
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

function UseCardMoney(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    DateStart: new Date(), // Ngày bắt đầu
    DateEnd: new Date(), // Ngày kết thúc
    Pi: 1, // Trang hiện tại
    Ps: 10, // Số lượng item
    MemberID: ''
  })
  const [StockName, setStockName] = useState('')
  const [isFilter, setIsFilter] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ListData, setListData] = useState([])
  const [PageTotal, setPageTotal] = useState(0)
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
    getListCustomer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListCustomer = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    const newFilters = {
      ...filters,
      DateStart: filters.DateStart
        ? moment(filters.DateStart).format('DD/MM/yyyy')
        : null,
      DateEnd: filters.DateEnd
        ? moment(filters.DateEnd).format('DD/MM/yyyy')
        : null,
      MemberID: filters.MemberID ? filters.MemberID.value : ''
    }
    reportsApi
      .getListTotalUseCard(newFilters)
      .then(({ data }) => {
        if (data.isRight) {
          PermissionHelpers.ErrorAccess(data.error)
          setLoading(false)
        } else {
          const { Items, Total } = {
            Items: data.result?.Items || JSONData.Items,
            Total: data.result?.Total || JSONData.Total
          }
          setListData(Items)
          setLoading(false)
          setPageTotal(Total)
          isFilter && setIsFilter(false)
          callback && callback()
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

  const onRefresh = () => {}

  const OpenModalMobile = value => {
    setInitialValuesMobile(value)
    setIsModalMobile(true)
  }

  const HideModalMobile = () => {
    setInitialValuesMobile(null)
    setIsModalMobile(false)
  }

  const AmountUse = (item) => {
    var totalArray = 0
    if (!item) return totalArray
    for (let keyItem of item) {
      totalArray += keyItem?.UsageHistory?.length || 0
    }
    return totalArray
  }

  return (
    <div className="py-main">
      <div className="subheader d-flex justify-content-between align-items-center">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Báo cáo sử dụng thẻ tiền
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
      />
      <div className="bg-white rounded">
        <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between">
          <div className="fw-500 font-size-lg">Danh sách sử dụng thẻ tiền</div>
        </div>
        <div className="p-20px">
          <ChildrenTables
            data={ListData}
            columns={[
              {
                text: 'Ngày',
                headerStyle: {
                  minWidth: '160px',
                  width: '160px'
                },
                attrs: { 'data-title': 'Ngày' }
              },
              {
                text: 'Khách hàng',
                headerStyle: {
                  minWidth: '200px',
                  width: '200px'
                }
              },
              {
                text: 'Số điện thoại',
                headerStyle: {
                  minWidth: '180px',
                  width: '180px'
                }
              },
              {
                text: 'Sử dụng / Hoàn',
                headerStyle: {
                  minWidth: '180px',
                  width: '180px'
                }
              },
              {
                text: 'Mã thẻ tiền',
                headerStyle: {
                  minWidth: '150px',
                  width: '150px'
                }
              },
              {
                text: 'Tên thẻ tiền',
                headerStyle: {
                  minWidth: '180px',
                  width: '180px'
                }
              },
              {
                text: 'Số tiền',
                headerStyle: {
                  minWidth: '120px',
                  width: '120px'
                }
              },
              {
                text: 'Sản phẩm / Dịch vụ',
                headerStyle: {
                  minWidth: '220px',
                  width: '220px'
                }
              }
            ]}
            options={{
              totalSize: PageTotal,
              page: filters.Pi,
              sizePerPage: filters.Ps,
              sizePerPageList: [10, 25, 30, 50],
              onPageChange: page => {
                setListData([])
                const Pi = page
                setFilters({ ...filters, Pi: Pi })
              },
              onSizePerPageChange: sizePerPage => {
                setListData([])
                const Ps = sizePerPage
                setFilters({ ...filters, Ps: Ps })
              }
            }}
            optionsMoible={{
              itemShow: 0,
              CallModal: row => OpenModalMobile(row),
              columns: [
                {
                  attrs: { 'data-title': 'Ngày' },
                  formatter: row => moment(row.CreateDate).format('DD-MM-YYYY')
                },
                {
                  attrs: { 'data-title': 'Tổng khách hàng' },
                  formatter: row => row.MemberList.length
                }
              ]
            }}
            loading={loading}
          >
            {ListData &&
              ListData.map((item, itemIndex) => (
                <Fragment key={itemIndex}>
                  {item.MemberList.map((member, memberIndex) => (
                    <Fragment key={memberIndex}>
                      {member.UsageHistory.map((use, useIndex) => (
                        <tr key={use}>
                          {memberIndex === 0 && useIndex === 0 && (
                            <td
                              className="vertical-align-middle"
                              rowSpan={AmountUse(item.MemberList)}
                            >
                              {moment(item.CreateDate).format('DD-MM-YYYY HH:mm')}
                            </td>
                          )}
                          {useIndex === 0 && (
                            <Fragment>
                              <td
                                className="vertical-align-middle"
                                rowSpan={member.UsageHistory.length}
                              >
                                {member.FullName}
                              </td>
                              <td
                                className="vertical-align-middle"
                                rowSpan={member.UsageHistory.length}
                              >
                                {member.Phone}
                              </td>
                            </Fragment>
                          )}
                          <td>{use.Type}</td>
                          <td>{use.Code}</td>
                          <td>{use.Title}</td>
                          <td>{PriceHelper.formatVND(use.Value)}</td>
                          <td>
                            {use.ProdLists &&
                              use.ProdLists.map(item => `${item.Title} (x${item.Qty})`).join(", ")}
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </Fragment>
              ))}
          </ChildrenTables>
        </div>
        {/* <ModalViewMobile
          show={isModalMobile}
          onHide={HideModalMobile}
          data={initialValuesMobile}
        /> */}
      </div>
    </div>
  )
}

export default UseCardMoney
