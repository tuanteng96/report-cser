import React from 'react'
import { AsyncPaginate } from 'react-select-async-paginate'
import PropTypes from 'prop-types'
import moreApi from 'src/api/more.api'
import { isArray } from 'lodash'
import { useSelector } from 'react-redux'

AsyncSelectStaffs.propTypes = {
  onChange: PropTypes.func,
  StocksList: PropTypes.array
}

AsyncSelectStaffs.defaultProps = {
  StocksList: null
}

function AsyncSelectStaffs({
  onChange,
  value,
  StocksList,
  addOptions = [],
  ...props
}) {
  const { Stocks } = useSelector(({ auth }) => ({
    Stocks: auth.Info?.Stocks
      ? auth.Info.Stocks.filter(item => item.ID !== 778).map(item => ({
          ...item,
          label: item.Title || item.label,
          value: item.ID || item.value
        }))
      : []
  }))

  const getAllStaffs = async (search, loadedOptions, { page }) => {
    const { data } = await moreApi.getAllStaffStock(search)
    let newStocks = [
      ...Stocks,
      {
        Title: 'Hệ thống',
        ID: 0
      }
    ]
    const { Items } = {
      Items: data.data
        ? data.data.map(x => {
            let obj = { ...x }
            let index = newStocks.findIndex(o => o.ID === x.source.StockID)
            if (index > -1) {
              obj.group = newStocks[index].Title
              obj.groupid = newStocks[index].ID
            }
            return obj
          })
        : []
    }

    let newData = []

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

    if (StocksList && StocksList.findIndex(o => !o.value) === -1) {
      newData = newData.filter(x =>
        StocksList.map(x => x.ID).includes(x.groupid)
      )
      // const stockIds = new Set(StocksList.map(x => x.ID))

      // newData = newData
      //   .map(item => {
      //     const obj = { ...item }

      //     // Nếu groupid không thuộc StocksList → lọc options
      //     if (!stockIds.has(item.groupid)) {
      //       obj.options2 = (item.options || []).filter(k =>
      //         stockIds.has(k?.source?.StockID)
      //       )
      //     }

      //     return obj
      //   })
      //   .filter(obj => {
      //     // Giữ lại item có groupid hợp lệ
      //     if (stockIds.has(obj.groupid)) return true

      //     // Hoặc options2 > 0
      //     return obj.options2 && obj.options2.length > 0
      //   })
      //   .map(obj => {
      //     // Nếu có options2 → thay options
      //     if (obj.options2 && obj.options2.length > 0) {
      //       return { ...obj, options: obj.options2 }
      //     }
      //     return obj
      //   })

      // const map = new Map()
      // newData.forEach(item => {
      //   map.set(item.groupid, { ...item, options: [...item.options] })
      // })

      // // Xử lý chuyển option
      // newData.forEach(item => {
      //   item.options.forEach(opt => {
      //     const targetId = opt.source.StockID

      //     // Nếu option không thuộc groupid hiện tại → cần chuyển
      //     if (targetId !== item.groupid) {
      //       const currentGroup = map.get(item.groupid)
      //       const targetGroup = map.get(targetId)

      //       // Xóa option khỏi group cũ
      //       currentGroup.options = currentGroup.options.filter(
      //         o => o.id !== opt.id
      //       )

      //       // Và group đích tồn tại
      //       if (targetGroup) {
      //         // **Chỉ thêm nếu chưa có**
      //         const exists = targetGroup.options.some(o => o.id === opt.id)
      //         if (!exists) {
      //           targetGroup.options.push(opt)
      //         }
      //       }
      //     }
      //   })
      // })

      // // Kết quả cuối
      // newData = Array.from(map.values())
    }

    return {
      options: [...addOptions, ...newData],
      hasMore: false,
      additional: {
        page: 1
      }
    }
  }

  return (
    <AsyncPaginate
      {...props}
      key={StocksList}
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
