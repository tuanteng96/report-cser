import React from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'

SelectStatusService.propTypes = {
  onChange: PropTypes.func
}

function SelectStatusService({ value, onChange, ...props }) {
  return (
    <Select
      {...props}
      className="select-control"
      classNamePrefix="select"
      options={[
        {
          label: 'Đang thực hiện',
          value: 'doing'
        },
        {
          label: 'Hoàn thành',
          value: 'done'
        }
      ]}
      placeholder="Chọn trạng thái"
      value={value}
      onChange={onChange}
    />
  )
}

export default SelectStatusService
