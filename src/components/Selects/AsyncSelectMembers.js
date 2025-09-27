import React from 'react'
import { AsyncPaginate } from 'react-select-async-paginate'
import PropTypes from 'prop-types'
import moreApi from 'src/api/more.api'

AsyncSelectMembers.propTypes = {
  onChange: PropTypes.func
}

function AsyncSelectMembers({ onChange, value, StockID = '', ...props }) {
  const getAllMembers = async (search, loadedOptions, { page }) => {
    const { data } = await moreApi.getAllMember(search, StockID)
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
      loadOptions={getAllMembers}
      placeholder="Chọn khách hàng"
      value={value}
      onChange={onChange}
      additional={{
        page: 1
      }}
      noOptionsMessage={({ inputValue }) => 'Không có khách hàng'}
    />
  )
}

export default AsyncSelectMembers
