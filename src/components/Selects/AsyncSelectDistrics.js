import React from 'react'
import { AsyncPaginate } from 'react-select-async-paginate'
import PropTypes from 'prop-types'
import moreApi from 'src/api/more.api'

AsyncSelectDistrics.propTypes = {
  onChange: PropTypes.func
}

function AsyncSelectDistrics({ onChange, value, ProvincesID, ...props }) {
  const getAllDistricts = async (search, loadedOptions, { page }) => {
    const newPost = {
      Key: search,
      Ps: 10,
      Pi: 1,
      ProvincesID: ProvincesID
    }
    const { data } = await moreApi.getAllDistricts(newPost)
    const { PCount, Items } = data.result
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
      key={ProvincesID}
      className="select-control"
      classNamePrefix="select"
      isClearable={true}
      loadOptions={getAllDistricts}
      placeholder="Chọn quận huyện"
      value={value}
      onChange={onChange}
      additional={{
        page: 1
      }}
      isDisabled={!ProvincesID}
      noOptionsMessage={() => 'Không có dữ liệu'}
    />
  )
}

export default AsyncSelectDistrics
