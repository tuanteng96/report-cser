import React, { useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import Filter from 'src/components/Filter/Filter'
import IconMenuMobile from 'src/features/Reports/components/IconMenuMobile'
import _ from 'lodash'
import LoadingChart from 'src/components/Loading/LoadingChart'
import ChartPie from 'src/features/Reports/components/ChartPie'
import ElementEmpty from 'src/components/Empty/ElementEmpty'
import { useWindowSize } from 'src/hooks/useWindowSize'
import { ColorsHelpers } from 'src/helpers/ColorsHelpers'
import { Nav, OverlayTrigger, Popover, Tab } from 'react-bootstrap'
import ListSell from './ListSell'
import ChartYear from './ChartYear'
import ChartWeek from './ChartWeek'

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

const optionsObj = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right'
    },
    title: {
      display: false,
      text: 'Biểu đồ dịch vụ'
    }
  }
}

const objData = {
  labels: [],
  datasets: [
    {
      label: '# of Votes',
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1
    }
  ]
}

function Sales(props) {
  const { CrStockID, Stocks } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    Stocks: auth?.Info?.Stocks || []
  }))
  const [filters, setFilters] = useState({
    StockID: CrStockID || '', // ID Stock
    Date: new Date() // Ngày,
  })
  const [StockName, setStockName] = useState('')
  const [loading, setLoading] = useState(false)
  const [isFilter, setIsFilter] = useState(false)
  const [dataChart, setDataChart] = useState(objData)
  const [optionsChart, setOptionsChart] = useState(optionsObj)
  const [heightElm, setHeightElm] = useState(0)
  const [KeyTabs, setKeyTabs] = useState('Week')
  const elementRef = useRef(null)
  const { width } = useWindowSize()

  useEffect(() => {
    if (width > 767) {
      setOptionsChart(prevState => ({
        ...prevState,
        plugins: {
          ...prevState.plugins,
          legend: {
            position: 'right'
          }
        }
      }))
    } else {
      setOptionsChart(prevState => ({
        ...prevState,
        plugins: {
          ...prevState.plugins,
          legend: {
            position: 'bottom'
          }
        }
      }))
    }
  }, [width])

  useEffect(() => {
    if (width > 767) {
      setHeightElm(elementRef?.current?.clientHeight || 0)
    } else {
      setHeightElm(350)
    }
  }, [elementRef, width])

  useEffect(() => {
    const index = Stocks.findIndex(
      item => Number(item.ID) === Number(CrStockID)
    )
    if (index > -1) {
      setStockName(Stocks[index].Title)
    } else {
      setStockName('Tất cả cơ sở')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  useEffect(() => {
    getOverviewSell()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getOverviewSell = (isLoading = true, callback) => {
    isLoading && setLoading(true)
    const newFilters = {
      ...filters,
      Date: moment(filters.Date).format('DD/MM/yyyy')
    }
    //
    const data = null
    setDataChart(prevState => ({
      ...prevState,
      labels: data?.result?.Items?.map(sets => `${sets.ProServiceName})`) || [
        'Chăm sóc da',
        'Thuốc trị mụn'
      ],
      datasets: prevState.datasets.map(sets => ({
        ...sets,
        data: data?.result?.Items?.map(item => item.CasesNum) || [10, 20],
        backgroundColor: data?.result?.Items
          ? ColorsHelpers.getColorSize(data.result.Items.length)
          : ColorsHelpers.getColorSize(2),
        borderColor: data?.result?.Items
          ? ColorsHelpers.getBorderSize(data.result.Items.length)
          : ColorsHelpers.getBorderSize(2)
      }))
    }))
    //setOverviewData(data.result)
    setLoading(false)
    isFilter && setIsFilter(false)
    callback && callback()
  }

  const onFilter = values => {
    if (_.isEqual(values, filters)) {
      getOverviewSell()
    } else {
      setFilters(values)
    }
  }

  const onRefresh = () => {
    getOverviewSell()
  }

  const onOpenFilter = () => {
    setIsFilter(true)
  }

  const onHideFilter = () => {
    setIsFilter(false)
  }

  return (
    <div className="py-main">
      <div className="mb-20px d-flex justify-content-between align-items-end">
        <div className="flex-1">
          <span className="text-uppercase text-uppercase font-size-xl fw-600">
            Doanh số
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
          <Filter
            show={isFilter}
            filters={filters}
            onHide={onHideFilter}
            onSubmit={onFilter}
            onRefresh={onRefresh}
            loading={loading}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-md-12 col-lg-5" ref={elementRef}>
          <div className="bg-white rounded report-sell-overview">
            <div
              className="rounded text-white p-30px elm-top"
              style={{ backgroundColor: '#f54e60' }}
            >
              <div className="mb-15px d-flex justify-content-between align-items-end">
                <span className="text-uppercase fw-600 font-size-xl">
                  Bán hàng trong ngày
                </span>
                <span className="date">CN, 29 Thg 05 2022</span>
              </div>
              <div className="font-number text-center py-3 py-md-5 fw-600 total">
                +50,000,000
              </div>
            </div>
            <div className="p-25px" style={{ marginTop: '-60px' }}>
              <div className="row">
                <div className="col-md-6">
                  <div
                    className="rounded mb-20px p-4"
                    style={{ backgroundColor: '#E1F0FF', color: '#3699FF' }}
                  >
                    <i className="fa-solid fa-money-bill-wave font-size-30"></i>
                    <div className="font-number fw-600 mt-10px d-flex align-items-center">
                      <span className="total-2">18,000,000</span>
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
                                <span>10,000,000</span>
                              </div>
                              <div className="py-10px px-15px fw-600 font-size-md border-bottom border-gray-200 d-flex justify-content-between">
                                <span>Chuyển khoản</span>
                                <span>10,000,000</span>
                              </div>
                              <div className="py-10px px-15px fw-500 font-size-md d-flex justify-content-between">
                                <span>Quẹt thẻ</span>
                                <span>10,000,000</span>
                              </div>
                            </Popover.Body>
                          </Popover>
                        }
                      >
                        <i className="fa-solid fa-circle-exclamation font-size-xl pl-5px cursor-pointer"></i>
                      </OverlayTrigger>
                    </div>
                    <div className="">Thanh toán</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div
                    className="rounded mb-20px p-4"
                    style={{ backgroundColor: '#FFF4DE', color: '#FFA800' }}
                  >
                    <i className="fa-solid fa-wallet font-size-30"></i>
                    <div className="font-number total-2 fw-600 mt-10px">
                      1,000,000
                    </div>
                    <div className="">Thanh toán từ ví</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div
                    className="rounded p-4 mb-4 mb-md-0"
                    style={{ backgroundColor: '#C9F7F5', color: '#1BC5BD' }}
                  >
                    <i className="fa-solid fa-id-card font-size-30"></i>
                    <div className="font-number total-2 fw-600 mt-10px">
                      12,000,000
                    </div>
                    <div className="">Từ thẻ tiền</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div
                    className="rounded p-4"
                    style={{ backgroundColor: '#FFE2E5', color: '#F64E60' }}
                  >
                    <i className="fa-solid fa-credit-card-blank font-size-30"></i>
                    <div className="font-number total-2 fw-600 mt-10px">
                      2,000,000
                    </div>
                    <div className="">Nợ phát sinh</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-12 col-lg-7">
          <div className="row">
            <div className="col-md-12">
              <div
                className="bg-white rounded p-4 p-lg-5 w-100 mt-4 mt-lg-0"
                style={{ height: heightElm > 0 ? `${heightElm}px` : 'auto' }}
              >
                {loading && <LoadingChart />}
                {!loading && (
                  <>
                    {dataChart.labels.length > 0 ? (
                      <ChartPie
                        data={dataChart}
                        options={optionsChart}
                        height={heightElm > 0 ? `${heightElm}px` : 'auto'}
                      />
                    ) : (
                      <ElementEmpty />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded mt-25px p-20px">
        <div className="mb-25px">
          <div className="row">
            <div className="col-md-12">
              <Tab.Container defaultActiveKey={KeyTabs}>
                <div className="d-flex justify-content-between align-items-center mb-20px">
                  <div className="fw-500 font-size-lg">
                    Biểu đồ doanh số bán hàng
                  </div>
                  <Nav
                    as="ul"
                    className="nav nav-pills nav-pills-sm"
                    onSelect={_key => setKeyTabs(_key)}
                  >
                    <Nav.Item className="nav-item" as="li">
                      <Nav.Link eventKey="Week">Theo Tuần</Nav.Link>
                    </Nav.Item>
                    <Nav.Item as="li">
                      <Nav.Link eventKey="Year">Theo Năm</Nav.Link>
                    </Nav.Item>
                  </Nav>
                </div>
                <Tab.Content className="tab-content">
                  <Tab.Pane eventKey="Week" className="p-0">
                    <ChartWeek data={[100, 80, 200, 150, 250, 65, 124]} />
                  </Tab.Pane>
                  <Tab.Pane eventKey="Year" className="p-0">
                    <ChartYear
                      data={[
                        100, 80, 200, 150, 250, 65, 100, 43, 99, 300, 250, 124
                      ]}
                    />
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </div>
          </div>
        </div>
      </div>
      <ListSell />
    </div>
  )
}

export default Sales
