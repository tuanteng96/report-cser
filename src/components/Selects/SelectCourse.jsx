import React, { useEffect, useState } from 'react'
import Select from 'react-select'
import reportsApi from 'src/api/reports.api'

const SelectCourse = ({ value, ...props }) => {
  let [isLoading, setIsLoading] = useState(false)
  let [options, setOptions] = useState([])

  useEffect(() => {
    getTags()
  }, [])

  const getTags = () => {
    setIsLoading(true)
    reportsApi
      .getCourse({
        pi: 1,
        ps: 500,
        filter: {
          Title: ''
        }
      })
      .then(({ data }) => {
        let rs = []
        if (data?.items && data?.items.length > 0) {
          rs = data?.items.map(x => ({
            ...x,
            label: x.Title,
            value: x.ID
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
        placeholder="Chọn lớp học"
        noOptionsMessage={() => 'Không có dữ liệu'}
        {...props}
      />
    </>
  )
}

export { SelectCourse }
