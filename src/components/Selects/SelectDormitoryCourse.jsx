import React, { useEffect, useState } from 'react'
import Select from 'react-select'
import moreApi from 'src/api/more.api'

const SelectDormitoryCourse = ({ value, ...props }) => {
  let [isLoading, setIsLoading] = useState(false)
  let [options, setOptions] = useState([])

  useEffect(() => {
    getDormitory()
  }, [])

  const getDormitory = () => {
    setIsLoading(true)
    moreApi.getNameConfig("daotaoktx").then(({ data }) => {
      
      let rs = []
      if (data?.data && data?.data?.length > 0) {
        const result = JSON.parse(data?.data[0].Value)
        if (result && result.length > 0) {
          rs = result
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

export { SelectDormitoryCourse }
