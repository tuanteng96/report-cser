import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Nav, Tab } from 'react-bootstrap'
import ChartPie from 'src/features/Reports/components/ChartPie'
import { useWindowSize } from 'src/hooks/useWindowSize'
import ElementEmpty from 'src/components/Empty/ElementEmpty'
import { ColorsHelpers } from 'src/helpers/ColorsHelpers'
import LoadingChart from 'src/components/Loading/LoadingChart'

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

ChartCircle.propTypes = {
  loading: PropTypes.bool,
  data: PropTypes.array
}

function ChartCircle({ loading, data }) {
  const [KeyTabs, setKeyTabs] = useState('DS')
  const [SLDataChart, setSLDataChart] = useState(objData)
  const [DSDataChart, setDSDataChart] = useState(objData)
  const [optionsChart, setOptionsChart] = useState(optionsObj)
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
    if (data && data.length > 0) {
      setDSDataChart(prevState => ({
        ...prevState,
        labels: data.map(sets => `${sets.ProdTitle}`),
        datasets: prevState.datasets.map(sets => ({
          ...sets,
          data: data.map(item => item.SumToPay),
          backgroundColor: ColorsHelpers.getColorSize(data.length),
          borderColor: ColorsHelpers.getBorderSize(data.length)
        }))
      }))
      setSLDataChart(prevState => ({
        ...prevState,
        labels: data.map(sets => `${sets.ProdTitle}`),
        datasets: prevState.datasets.map(sets => ({
          ...sets,
          data: data.map(item => item.SumQty),
          backgroundColor: ColorsHelpers.getColorSize(data.length),
          borderColor: ColorsHelpers.getBorderSize(data.length)
        }))
      }))
    } else {
      setSLDataChart(objData)
      setDSDataChart(objData)
    }
  }, [data])

  return (
    <Tab.Container defaultActiveKey={KeyTabs}>
      <div className="h-100 position-relative">
        <div className="d-flex justify-content-between align-items-center flex-column flex-sm-row w-100 position-absolute top-0 right-0">
          <div className="fw-500 font-size-lg">Sản phẩm, dịch vụ bán ra</div>
          <Nav
            as="ul"
            className="nav nav-pills nav-pills-sm mt-8px mt-sm-0"
            onSelect={_key => setKeyTabs(_key)}
          >
            <Nav.Item className="nav-item" as="li">
              <Nav.Link eventKey="DS">Doanh số</Nav.Link>
            </Nav.Item>
            <Nav.Item as="li">
              <Nav.Link eventKey="SL">Số lượng</Nav.Link>
            </Nav.Item>
          </Nav>
        </div>
        <Tab.Content className="tab-content h-100 pt-90px pt-sm-50px">
          <Tab.Pane eventKey="DS" className="p-0 h-100">
            {loading && <LoadingChart />}
            {!loading && (
              <>
                {DSDataChart.labels.length > 0 ? (
                  <ChartPie
                    data={DSDataChart}
                    options={optionsChart}
                    height={`100%`}
                  />
                ) : (
                  <ElementEmpty />
                )}
              </>
            )}
          </Tab.Pane>
          <Tab.Pane eventKey="SL" className="p-0 h-100">
            {loading && <LoadingChart />}
            {!loading && (
              <>
                {SLDataChart.labels.length > 0 ? (
                  <ChartPie
                    data={SLDataChart}
                    options={optionsChart}
                    height={`100%`}
                  />
                ) : (
                  <ElementEmpty />
                )}
              </>
            )}
          </Tab.Pane>
        </Tab.Content>
      </div>
    </Tab.Container>
  )
}

export default ChartCircle
