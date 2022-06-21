import React from 'react'
import { AsyncPaginate } from 'react-select-async-paginate'
import PropTypes from 'prop-types'
import moreApi from 'src/api/more.api'
import { isArray } from 'lodash'

AsyncSelectStaffs.propTypes = {
  onChange: PropTypes.func
}

function AsyncSelectStaffs({ onChange, value, ...props }) {
  const getAllStaffs = async (search, loadedOptions, { page }) => {
    const { data } = await moreApi.getAllStaffStock(search)
    const { Items } = {
      Items: data.data || []
    }
    const newData = []

    if (Items && isArray(Items)) {
      for (let key of Items) {
        const { group, groupid, text, id } = key
        const index = newData.findIndex(item => item.groupid === groupid)
        if (index > -1) {
          newData[index].options.push({ label: text, value: id, ...key })
        } else {
          const newItem = {}
          newItem.label = group
          newItem.groupid = groupid
          newItem.options = [{ label: text, value: id, ...key }]
          newData.push(newItem)
        }
      }
    }
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
