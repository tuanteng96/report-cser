import React, { useEffect, useState } from 'react'
import Select from 'react-select'
import moreApi from 'src/api/more.api'

function SelectCustomType({
  type = 'CashCustomType:THU_PHAT,CashCustomType:CHI_THUONG',
  ...props
}) {
  const [CustomTypeList, setCustomTypeList] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getCustomType()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getCustomType = () => {
    setLoading(true)
    moreApi
      .getNameConfig(type)
      .then(({ data }) => {
        if (data && data.data && data.data.length > 0) {
          let newData = []

          data.data.map(x =>
            x.Value.split(',')
              .filter(x => x)
              .map(k => newData.push({ label: k, value: k }))
          )
          setCustomTypeList(newData)
          setLoading(false)
        }
      })
      .catch(error => console.log(error))
  }

  return (
    <Select
      isLoading={loading}
      isDisabled={loading}
      classNamePrefix="select"
      options={CustomTypeList}
      className="select-control"
      menuPlacement="top"
      noOptionsMessage={() => 'Không có dữ liệu'}
      menuPortalTarget={document.body}
      menuPosition="fixed"
      styles={{
        menuPortal: base => ({
          ...base,
          zIndex: 9999
        })
      }}
      {...props}
    />
  )
}

export default SelectCustomType
