import React, { useEffect, useState } from 'react'
import Select from 'react-select'
import moreApi from 'src/api/more.api'

const SelectTagsCourse = ({ value, ...props }) => {
  let [isLoading, setIsLoading] = useState(false)
  let [options, setOptions] = useState([])

  useEffect(() => {
    getTags()
  }, [])

  const getTags = () => {
    setIsLoading(true)
    moreApi.getNameConfig("daotaotag").then(({ data }) => {
      
      let rs = []
      if (data?.data && data?.data?.length > 0) {
        const result = JSON.parse(data?.data[0].Value)

        if (result && result.length > 0) {
          rs = result.map(x => ({
            ...x,
            groupid: x.label,
            options: x?.children
              ? x?.children.map(o => ({ ...o, value: o.label }))
              : []
          }))
        }
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
        placeholder="Chọn tags"
        noOptionsMessage={() => 'Không có dữ liệu'}
        {...props}
      />
    </>
  )
}

export { SelectTagsCourse }
