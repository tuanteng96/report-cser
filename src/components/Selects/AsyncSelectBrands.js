import React from 'react'
import { AsyncPaginate } from 'react-select-async-paginate'
import PropTypes from 'prop-types'
import moreApi from 'src/api/more.api'

AsyncSelectBanksConfig.propTypes = {
  onChange: PropTypes.func
}

const normalize = str =>
  (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()

function AsyncSelectBanksConfig({ onChange, value, ...props }) {
  const getAllBanks = async (search, loadedOptions, { page }) => {
    const { data } = await moreApi.getNameConfig('MA_QRCODE_NGAN_HANG')
    let result = []
    if (data.data && data.data.length > 0) {
      let rs = data?.data?.[0]?.Value ? JSON.parse(data?.data?.[0]?.Value) : []

      result = rs?.ngan_hang
        ? rs?.ngan_hang.map(x => ({
            ...x,
            label: x.ngan_hang,
            value: x.stk
          }))
        : []
    }
    if (search) {
      if (search) {
        const keyword = normalize(search)

        result = result.filter(
          x =>
            normalize(x.ngan_hang).includes(keyword) ||
            normalize(x.stk).includes(keyword)
        )
      }
    }
    return {
      options: result,
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
      loadOptions={getAllBanks}
      placeholder="Chọn ngân hàng"
      value={value}
      onChange={onChange}
      additional={{
        page: 1
      }}
      noOptionsMessage={({ inputValue }) => 'Không có dữ liệu'}
    />
  )
}

export default AsyncSelectBanksConfig
