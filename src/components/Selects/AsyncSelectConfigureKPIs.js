import React from 'react'
import { AsyncPaginate } from 'react-select-async-paginate'
import PropTypes from 'prop-types'
import moreApi from 'src/api/more.api'

AsyncSelectConfigureKPIs.propTypes = {
  onChange: PropTypes.func
}

function AsyncSelectConfigureKPIs({ onChange, value, StockID = '', ...props }) {
  const getOptions = async (search, loadedOptions, { page }) => {
    const { data } = await moreApi.getKPIConfigure({
      pi: page,
      ps: 20,
      filter: {
        ID: '',
        Title: search ? `~${search}` : ''
      }
    })

    const newData =
      data.items && data.items.length > 0
        ? data.items.map(item => ({
            ...item,
            label: item.Title,
            value: item.ID,
            DataJSON: item?.DataJSON ? JSON.parse(item.DataJSON) : null
          }))
        : []

    return {
      options: newData || [],
      hasMore: page < data?.pcount,
      additional: {
        page: page + 1
      }
    }
  }

  return (
    <AsyncPaginate
      {...props}
      classNamePrefix="select"
      loadOptions={getOptions}
      value={value}
      onChange={onChange}
      additional={{
        page: 1
      }}
      noOptionsMessage={({ inputValue }) => 'Không có cấu hình'}
    />
  )
}

export default AsyncSelectConfigureKPIs
