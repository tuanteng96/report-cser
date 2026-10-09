import React from 'react'
import PropTypes from 'prop-types'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const finiteTicks = {
  id: 'finiteTicks',
  afterBuildTicks: (_chart, { scale }) => {
    // Chart.js 3 can generate NaN ticks before formatting a linear axis.
    if (scale.type === 'linear') {
      scale.ticks = scale.ticks.filter(tick => Number.isFinite(tick.value))
    }
  }
}

Chart2Column.propTypes = {
  data: PropTypes.object,
  options: PropTypes.object
}

function Chart2Column({ options, data }) {
  return <Bar options={options} data={data} plugins={[finiteTicks]} />
}

export default Chart2Column
