import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Chart2Column from 'src/features/Reports/components/Chart2Column'
import LoadingChart from 'src/components/Loading/LoadingChart'

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

const optionsObj = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
      display: false
    },
    title: {
      display: false,
      text: 'Biểu đồ khách hàng'
    }
  }
}

const labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
const objData = {
  labels,
  datasets: [
    {
      label: `Năm ${moment().subtract(0, 'year').format('YYYY')}`,
      data: [],
      backgroundColor: 'rgba(255, 99, 132, 0.5)'
    }
  ]
}

function ChartWeek({ data, loading }) {
  const [dataChart, setDataChart] = useState(objData)

  useEffect(() => {
    setDataChart(prevState => ({
      ...prevState,
      datasets: [
        {
          label: `Năm ${moment().subtract(0, 'year').format('YYYY')}`,
          data: data || [],
          backgroundColor: 'rgba(255, 99, 132, 0.5)'
        }
      ]
    }))
  }, [data])

  if (loading) {
    return (
      <div className="h-250px">
        <LoadingChart />
      </div>
    )
  }

  return <Chart2Column options={optionsObj} data={dataChart} />
}

ChartWeek.propTypes = {
  data: PropTypes.array
}

export default ChartWeek
