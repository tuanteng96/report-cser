import React from 'react'
import PropTypes from 'prop-types'
import { AsyncPaginate } from 'react-select-async-paginate'
import moreApi from 'src/api/more.api'

AsyncSelectGroupsCustomer.propTypes = {
  onChange: PropTypes.func
}

function AsyncSelectGroupsCustomer({ value, onChange, ...props }) {
  const getAllGroups = async (search, loadedOptions, { page }) => {
    const { data } = await moreApi.getAllGroupCustomer({
      Key: search
    })
    const newData =
      data &&
      data.result &&
      data.result.map(item => ({
        ...item,
        label: item.Title,
        value: item.Id
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
      placeholder="Chọn nhóm khách hàng"
      {...props}
      className="select-control"
      classNamePrefix="select"
      loadOptions={getAllGroups}
      additional={{
        page: 1
      }}
      value={value}
      onChange={onChange}
      noOptionsMessage={() => 'Không có dữ liệu'}
    />
  )
}

export default AsyncSelectGroupsCustomer
