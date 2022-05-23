import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import AsyncSelect from 'react-select/async'
import moreApi from 'src/api/more.api'

AsyncSelectSource.propTypes = {
  onChange: PropTypes.func
}

function AsyncSelectSource({ value, onChange }) {
  const typingTimeoutRef = useRef(null)
  const getAllSource = (inputValue, callback) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      moreApi
        .getAllSource({
          _key: inputValue
        })
        .then(({ data }) => {
          const newData =
            data &&
            data.result &&
            data.result.map(item => ({
              ...item,
              label: item.name,
              value: item.name
            }))
          callback(newData)
        })
        .catch(err => console.log(err))
    }, 500)
  }

  return (
    <AsyncSelect
      menuPosition="fixed"
      className="select-control"
      classNamePrefix="select"
      cacheOptions
      loadOptions={(inputValue, callback) => getAllSource(inputValue, callback)}
      defaultOptions
      placeholder="Chọn nguồn khách hàng"
      value={value}
      onChange={onChange}
    />
  )
}

export default AsyncSelectSource
