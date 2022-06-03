import React from 'react'
import PropTypes from 'prop-types'

LoadingTable.propTypes = {
  text: PropTypes.string,
  className: PropTypes.string,
  width: PropTypes.string
}
LoadingTable.defaultProps = {
  text: 'Đang tải ...',
  className: '',
  width: `100%`
}

function LoadingTable({ text, className, width }) {
  return (
    <div className="d-flex justify-content-center" style={{ width: width }}>
      <div className={`page-loaders--table table-message ${className}`}>
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="shadow"></div>
        <div className="shadow"></div>
        <div className="shadow"></div>
        <span className="font-weight-bolder">{text}</span>
      </div>
    </div>
  )
}

export default LoadingTable
