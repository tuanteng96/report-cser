import React from 'react'
import ReactApexChart from 'react-apexcharts'

function ChartWidget2({ colors, height, data }) {
  const { labelColor, strokeColor, borderColor, color } = colors
  return (
    <ReactApexChart
      options={{
        chart: {
          fontFamily: 'inherit',
          type: 'area',
          height: height,
          toolbar: {
            show: false
          },
          zoom: {
            enabled: false
          },
          sparkline: {
            enabled: true
          },
          dropShadow: {
            enabled: true,
            enabledOnSeries: undefined,
            top: 5,
            left: 0,
            blur: 3,
            color: strokeColor,
            opacity: 0.5
          }
        },
        plotOptions: {},
        legend: {
          show: false
        },
        dataLabels: {
          enabled: false
        },
        fill: {
          type: 'solid',
          opacity: 0
        },
        stroke: {
          curve: 'smooth',
          show: true,
          width: 3,
          colors: [strokeColor]
        },
        xaxis: {
          categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
          axisBorder: {
            show: false
          },
          axisTicks: {
            show: false
          },
          labels: {
            show: false,
            style: {
              colors: labelColor,
              fontSize: '12px'
            }
          },
          crosshairs: {
            show: false,
            position: 'front',
            stroke: {
              color: borderColor,
              width: 1,
              dashArray: 3
            }
          }
        },
        yaxis: {
          min: 0,
          max: 80,
          labels: {
            show: false,
            style: {
              colors: labelColor,
              fontSize: '12px'
            }
          }
        },
        states: {
          normal: {
            filter: {
              type: 'none',
              value: 0
            }
          },
          hover: {
            filter: {
              type: 'none',
              value: 0
            }
          },
          active: {
            allowMultipleDataPointsSelection: false,
            filter: {
              type: 'none',
              value: 0
            }
          }
        },
        tooltip: {
          enabled: false,
          style: {
            fontSize: '12px'
          },
          y: {
            formatter: function (val) {
              return '$' + val + ' thousands'
            }
          },
          marker: {
            show: false
          }
        },
        colors: ['transparent'],
        markers: {
          colors: [color],
          strokeColors: [strokeColor],
          strokeWidth: 3
        }
      }}
      series={[
        {
          name: 'Net Profit',
          data: data
        }
      ]}
      type="area"
      height={height}
    />
  )
}

export default ChartWidget2
