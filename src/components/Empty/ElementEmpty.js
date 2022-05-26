import React from 'react'
import ImageEmpty from '../../_assets/images/verification-img.png'

function ElementEmpty(props) {
  return (
    <div className="h-100 d-flex align-items-center justify-content-center flex-column">
      <img className="max-h-100 max-w-100" src={ImageEmpty} alt="" />
    </div>
  )
}

export default ElementEmpty
