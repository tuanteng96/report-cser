import React from 'react'
import { AsyncPaginate } from 'react-select-async-paginate'
import PropTypes from 'prop-types'
import moreApi from 'src/api/more.api'

AsyncSelectSVOriginal.propTypes = {
  onChange: PropTypes.func
}

function AsyncSelectSVOriginal({ onChange, value, ...props }) {
  const getAllService = async (search, loadedOptions, { page }) => {
    const { data } = await moreApi.getAllServiceOriginal(search)
    const newData =
      data.data && data.data.length > 0
        ? data.data.map(item => ({
            ...item,
            label: item.text,
            value: item.id
          }))
        : []
    return {
      options: newData,
      hasMore: false,
      additional: {
        page: 1
      }
    }
  }

  return (
    <AsyncPaginate
      {...props}
      className="select-control"
      classNamePrefix="select"
      loadOptions={getAllService}
      placeholder="Chọn dịch vụ gốc"
      value={value}
      onChange={onChange}
      additional={{
        page: 1
      }}
      noOptionsMessage={({ inputValue }) => 'Không có dữ liệu'}
    />
  )
}

export default AsyncSelectSVOriginal
