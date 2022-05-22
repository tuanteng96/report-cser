import React from 'react'
import ReactApexChart from 'react-apexcharts'

function ChartWidget({ colors, height, data }) {
  const { labelColor, strokeColor, baseColor, lightColor } = colors
  return (
    <ReactApexChart
      options={{
        chart: {
          fontFamily: 'inherit',
          type: 'area',
          toolbar: {
            show: false
          },
          zoom: {
            enabled: false
          },
          sparkline: {
            enabled: true
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
          opacity: 1
        },
        stroke: {
          curve: 'smooth',
          show: true,
          width: 3,
          colors: [baseColor]
        },
        xaxis: {
          categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
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
              color: strokeColor,
              width: 1,
              dashArray: 3
            }
          },
          tooltip: {
            enabled: false
          }
        },
        yaxis: {
          min: 0,
          max: 60,
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
          }
        },
        colors: [lightColor],
        markers: {
          colors: [lightColor],
          strokeColors: [baseColor],
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

export default ChartWidget
