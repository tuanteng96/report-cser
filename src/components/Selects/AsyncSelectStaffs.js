import React from 'react'
import { AsyncPaginate } from 'react-select-async-paginate'
import PropTypes from 'prop-types'
import moreApi from 'src/api/more.api'

AsyncSelectStaffs.propTypes = {
  onChange: PropTypes.func
}

function AsyncSelectStaffs({ onChange, value, ...props }) {
  const getAllStaffs = async (search, loadedOptions, { page }) => {
    const newPost = {
      Key: search,
      Pi: 1,
      Ps: 10
    }
    const { data } = await moreApi.getAllStaff(newPost)
    const { PCount, Items } = {
      PCount: data.result?.PCount || 0,
      Items: data.result?.Items || []
    }
    const newData =
      Items && Items.length > 0
        ? Items.map(item => ({
            ...item,
            label: item.Title,
            value: item.Id
          }))
        : []
    return {
      options: newData,
      hasMore: page < PCount,
      additional: {
        page: page + 1
      }
    }
  }

  return (
    <AsyncPaginate
      {...props}
      className="select-control"
      classNamePrefix="select"
      loadOptions={getAllStaffs}
      placeholder="Chọn nhân viên"
      value={value}
      onChange={onChange}
      additional={{
        page: 1
      }}
      noOptionsMessage={({ inputValue }) => 'Không có nhân viên'}
    />
  )
}

export default AsyncSelectStaffs
