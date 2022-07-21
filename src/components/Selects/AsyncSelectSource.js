import React from 'react'
import PropTypes from 'prop-types'
import { AsyncPaginate } from 'react-select-async-paginate'
import moreApi from 'src/api/more.api'

AsyncSelectSource.propTypes = {
  onChange: PropTypes.func
}

function AsyncSelectSource({ value, onChange, ...props }) {
  const getAllSource = async (search, loadedOptions, { page }) => {
    const { data } = await moreApi.getAllSource({
      Key: search
    })
    const newData =
      data &&
      data.result &&
      data.result.map(item => ({
        ...item,
        label: item.name,
        value: item.name
      }))
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
      loadOptions={getAllSource}
      placeholder="Chọn nguồn khách hàng"
      value={value}
      onChange={onChange}
      additional={{
        page: 1
      }}
      noOptionsMessage={() => 'Không có dữ liệu'}
    />
  )
}

export default AsyncSelectSource
