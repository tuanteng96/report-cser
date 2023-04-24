import React, { useEffect, useState } from 'react'
import Select from 'react-select'
import moreApi from 'src/api/more.api'

function SelectCustomType(props) {
  const [CustomTypeList, setCustomTypeList] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getCustomType()
  }, [])

  const getCustomType = () => {
    setLoading(true)
    moreApi
      .getNameConfig('CashCustomType:THU_PHAT,CashCustomType:CHI_THUONG')
      .then(({ data }) => {
        if (data && data.data && data.data.length > 0) {
          let newData = []

          data.data.map(x =>
            x.Value.split(',').map(k => newData.push({ label: k, value: k }))
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
      {...props}
    />
  )
}

export default SelectCustomType
