import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import AsyncSelect from 'react-select/async'
import moreApi from 'src/api/more.api'

AsyncSelectGroupsCustomer.propTypes = {
  onChange: PropTypes.func
}

function AsyncSelectGroupsCustomer({ value, onChange, ...props }) {
  const typingTimeoutRef = useRef(null)
  const getAllGroups = (inputValue, callback) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      moreApi
        .getAllGroupCustomer({
          _key: inputValue
        })
        .then(({ data }) => {
          const newData =
            data &&
            data.result &&
            data.result.map(item => ({
              ...item,
              label: item.Title,
              value: item.Id
            }))
          callback(newData)
        })
        .catch(err => console.log(err))
    }, 500)
  }

  return (
    <AsyncSelect
      {...props}
      className="select-control"
      classNamePrefix="select"
      cacheOptions
      loadOptions={(inputValue, callback) => getAllGroups(inputValue, callback)}
      defaultOptions
      placeholder="Chọn nhóm khách hàng"
      value={value}
      onChange={onChange}
    />
  )
}

export default AsyncSelectGroupsCustomer
