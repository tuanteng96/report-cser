import React, { useEffect, useState } from 'react'
import clsx from 'clsx'
import DatePicker from 'react-datepicker'
import Select from 'react-select'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Formik, Form } from 'formik'
import { useSelector } from 'react-redux'

const perfectScrollbarOptions = {
  wheelSpeed: 2,
  wheelPropagation: false
}

function FilterList({ show, onHide, filters, onSubmit, loading }) {
  const { Stocks } = useSelector(({ auth }) => ({
    Stocks: auth.Info.Stocks
  }))
  const [StocksList, setStocksList] = useState([])

  useEffect(() => {
    const newStocks = [{ value: '', label: 'Tất cả cơ sở' }, ...Stocks]
    setStocksList(() =>
      newStocks
        .filter(item => item.ID !== 778)
        .map(item => ({
          ...item,
          label: item.Title || item.label,
          value: item.ID || item.value
        }))
    )
  }, [Stocks])

  return (
    <div className={clsx('filter-box', show && 'show')}>
      <Formik
        initialValues={filters}
        onSubmit={onSubmit}
        enableReinitialize={true}
      >
        {formikProps => {
          // errors, touched, handleChange, handleBlur
          const { values, setFieldValue } = formikProps

          return (
            <Form>
              <div className="filter-box__content">
                <div className="filter-box__header d-flex justify-content-between align-items-center border-bottom border-gray-200 px-20px py-20px">
                  <div className="font-size-lg fw-500 text-uppercase">
                    Bộ lọc tìm kiếm
                  </div>
                  <div
                    className="w-30px h-30px d-flex justify-content-center align-items-center cursor-pointer"
                    onClick={onHide}
                  >
                    <i className="fa-regular fa-xmark font-size-lg text-muted"></i>
                  </div>
                </div>
                <div className="filter-box__body">
                  <PerfectScrollbar
                    options={perfectScrollbarOptions}
                    className="scroll h-100 p-20px"
                    style={{ position: 'relative' }}
                  >
                    {'Date' in values && (
                      <div className="mb-20px form-group">
                        <label>Ngày</label>
                        <DatePicker
                          onChange={date => {
                            setFieldValue('Date', date, false)
                          }}
                          selected={values.Date}
                          placeholderText="Chọn ngày"
                          className="form-control"
                          dateFormat="dd/MM/yyyy"
                        />
                      </div>
                    )}
                    {'StockID' in values && (
                      <div className="form-group mb-20px">
                        <label>Cơ sở của bạn</label>
                        <Select
                          name="StockID"
                          placeholder="Chọn cơ cở"
                          classNamePrefix="select"
                          options={StocksList}
                          className="select-control"
                          value={StocksList.filter(
                            item =>
                              Number(item.value) === Number(values?.StockID)
                          )}
                          onChange={otp => {
                            setFieldValue('StockID', otp ? otp.value : '')
                          }}
                        />
                      </div>
                    )}
                  </PerfectScrollbar>
                </div>
                <div className="filter-box__footer p-20px">
                  <button
                    type="submit"
                    className={clsx(
                      'btn btn-success w-100',
                      loading && 'spinner spinner-white spinner-right'
                    )}
                    disabled={loading}
                  >
                    Lọc kết quả
                  </button>
                </div>
              </div>
            </Form>
          )
        }}
      </Formik>
      <div className="filter-box__overlay" onClick={onHide}></div>
    </div>
  )
}

export default FilterList
