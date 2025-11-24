import React, { useEffect, useState } from 'react'
import Select from 'react-select'
import moreApi from 'src/api/more.api'

const SelectJobs = ({ value, ...props }) => {
  let [isLoading, setIsLoading] = useState(false)
  let [options, setOptions] = useState([])

  useEffect(() => {
    getJobs()
  }, [])

  const getJobs = () => {
    setIsLoading(true)
    moreApi.getNameConfig('Membernghenghiep').then(({ data }) => {
      let rs = []
      if (data?.data && data?.data?.length > 0) {
        const result = data?.data[0].Value ? data?.data[0].Value.split(',') : []
        rs = result.map(x => ({
          label: x,
          value: x
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
        placeholder="Chọn nghề nghiệp"
        noOptionsMessage={() => 'Không có dữ liệu'}
        {...props}
      />
    </>
  )
}

export { SelectJobs }
