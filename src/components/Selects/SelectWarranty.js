import React from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'

SelectWarranty.propTypes = {
  onChange: PropTypes.func
}

function SelectWarranty({ value, onChange }) {
  return (
    <Select
      className="select-control"
      classNamePrefix="select"
      options={[
        {
          label: 'Bảo hành',
          value: 'BAO_HANH'
        },
        {
          label: 'Buổi thường',
          value: 'BUOI_THUONG'
        }
      ]}
      placeholder="Chọn bảo hành"
      value={value}
      onChange={onChange}
    />
  )
}

export default SelectWarranty
