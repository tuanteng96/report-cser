import React, { useEffect, useState } from 'react'
import Select from 'react-select'
import moreApi from 'src/api/more.api'

const SelectTagsOrder = ({ value, ...props }) => {
  let [isLoading, setIsLoading] = useState(false)
  let [options, setOptions] = useState([])

  useEffect(() => {
    getTags()
  }, [])

  const getTags = () => {
    setIsLoading(true)
    moreApi.getNameConfig('tagorder').then(({ data }) => {
      let rs = []
      if (data?.data && data?.data?.length > 0) {
        const result = data?.data[0].Value
          ? JSON.parse(data?.data[0].Value)
          : []
        rs = result.map(x => ({
          label: x.Title,
          value: x.Title
        }))
      }
      setOptions(rs)
      setIsLoading(false)
    })
  }

  return (
    <>
      <Select
        isLoading={isLoading}
        value={value}
        menuPosition="fixed"
        styles={{
          menuPortal: base => ({
            ...base,
            zIndex: 9999
          })
        }}
        menuPortalTarget={document.body}
        classNamePrefix="select"
        options={options || []}
        placeholder="Chọn tag đơn hàng"
        noOptionsMessage={() => 'Không có dữ liệu'}
        {...props}
      />
    </>
  )
}

export { SelectTagsOrder }
