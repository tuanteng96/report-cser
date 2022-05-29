import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Chart2Column from 'src/features/Reports/components/Chart2Column'

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

const labels = [
  'T1',
  'T2',
  'T3',
  'T4',
  'T5',
  'T6',
  'T7',
  'T8',
  'T9',
  'T10',
  'T11',
  'T12'
]
const objData = {
  labels,
  datasets: [
    {
      label: `Năm ${moment().subtract(1, 'year').format('YYYY')}`,
      data: [],
      backgroundColor: 'rgba(255, 99, 132, 0.5)'
    }
  ]
}

function ChartYear({ data }) {
  const [dataChart, setDataChart] = useState(objData)

  useEffect(() => {
    setDataChart(prevState => ({
      ...prevState,
      datasets: [
        {
          label: `Năm ${moment().subtract(1, 'year').format('YYYY')}`,
          data: data || [],
          backgroundColor: 'rgba(255, 99, 132, 0.5)'
        }
      ]
    }))
  }, [data])

  return <Chart2Column options={optionsObj} data={dataChart} />
}

ChartYear.propTypes = {
  data: PropTypes.array
}

export default ChartYear
