import React from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'

SelectWarranty.propTypes = {
  onChange: PropTypes.func
}

function SelectWarranty({ value, onChange, ...props }) {
  return (
    <Select
      {...props}
      className="select-control"
      classNamePrefix="select"
      options={[
        {
          label: 'Bảo hành',
          value: 'BAO_HANH'
        }
      ]}
      placeholder="Chọn bảo hành"
      value={value}
      onChange={onChange}
    />
  )
}

export default SelectWarranty
