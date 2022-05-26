import React from 'react'
import PropTypes from 'prop-types'

LoadingTable.propTypes = {
  text: PropTypes.string,
  className: PropTypes.string
}
LoadingTable.defaultProps = {
  text: 'Đang tải ...',
  className: ''
}

function LoadingTable(props) {
  const { text, className } = props
  return (
    <div className={`page-loaders--table table-message ${className}`}>
      <div className="circle"></div>
      <div className="circle"></div>
      <div className="circle"></div>
      <div className="shadow"></div>
      <div className="shadow"></div>
      <div className="shadow"></div>
      <span className="font-weight-bolder">{text}</span>
    </div>
  )
}

export default LoadingTable
