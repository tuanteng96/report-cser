import React from 'react'
import { render } from '@testing-library/react'
import { Chart, BasicPlatform, BarController } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import Chart2Column from './Chart2Column'

jest.mock('react-chartjs-2', () => ({ Bar: jest.fn(() => null) }))
Chart.register(BarController)

const createChart = (values, plugins = []) => {
  const canvas = { width: 600, height: 300, style: {} }
  const context = new Proxy(
    {
      canvas,
      measureText: text => ({ width: String(text).length * 6 }),
      getLineDash: () => []
    },
    { get: (target, key) => (key in target ? target[key] : () => {}) }
  )
  canvas.getContext = () => context
  return new Chart(canvas, {
    type: 'bar',
    platform: BasicPlatform,
    data: {
      labels: ['A', 'B'],
      datasets: [{ data: values }]
    },
    options: { responsive: false, animation: false },
    plugins
  })
}

test('invalid generated ticks reproduce the Chart.js NumberFormat exception', () => {
  try {
    expect(() => createChart([-1e308, 1e308])).toThrow(RangeError)
  } finally {
    Object.values(Chart.instances).forEach(chart => chart.destroy())
  }
})

test('shared bar charts discard invalid ticks and still render normally after updating data', () => {
  render(<Chart2Column data={{ labels: [], datasets: [] }} options={{}} />)
  const { plugins } = Bar.mock.calls[Bar.mock.calls.length - 1][0]
  const chart = createChart([-1e308, 1e308], plugins)
  try {
    expect(
      chart.scales.y.ticks.every(tick => Number.isFinite(tick.value))
    ).toBe(true)
    chart.data.datasets[0].data = [-1250.5, 2500.25]
    expect(() => chart.update()).not.toThrow()
    expect(chart.scales.y.ticks.length).toBeGreaterThan(0)
    expect(chart.data.datasets[0].data).toEqual([-1250.5, 2500.25])
    expect(
      chart.scales.y.ticks.every(tick => Number.isFinite(tick.value))
    ).toBe(true)
    expect(() => chart.resize(0, 0)).not.toThrow()
    expect(() => chart.resize(600, 300)).not.toThrow()
  } finally {
    chart.destroy()
  }
})
