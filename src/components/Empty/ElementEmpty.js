import React from 'react'
import ImageEmpty from '../../_assets/images/verification-img.png'
import PropTypes from 'prop-types'

ElementEmpty.propTypes = {
  width: PropTypes.string
}
ElementEmpty.defaultProps = {
  width: `100%`
}

function ElementEmpty({ width }) {
  return (
    <div
      className="h-100 d-flex align-items-center justify-content-center flex-column"
      style={{ width: width }}
    >
      <img
        className="max-h-100 max-w-300px w-100"
        src={ImageEmpty}
        alt="Không có dữ liệu"
      />
    </div>
  )
}

export default ElementEmpty
