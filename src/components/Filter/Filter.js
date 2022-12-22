import React, { useEffect, useState } from 'react'
import clsx from 'clsx'
import DatePicker from 'react-datepicker'
import Select from 'react-select'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Formik, Form, Field } from 'formik'
import { useSelector } from 'react-redux'
import { JsonFilter } from 'src/Json/JsonFilter'
import { useLocation } from 'react-router-dom'

const perfectScrollbarOptions = {
  wheelSpeed: 2,
  wheelPropagation: false
}

function Filter({ show, onHide, filters, onSubmit, loading, onRefresh }) {
  const { Stocks, PermissionReport } = useSelector(({ auth }) => ({
    Stocks: auth.Info?.Stocks
      ? auth.Info.Stocks.filter(item => item.ID !== 778).map(item => ({
          ...item,
          label: item.Title || item.label,
          value: item.ID || item.value
        }))
      : [],
    PermissionReport: auth.Info?.rightsSum?.report
  }))
  const [StocksList, setStocksList] = useState([])
  const { pathname } = useLocation()
  useEffect(() => {
    let newStocks = [...Stocks]
    if (PermissionReport?.hasRight) {
      if (!PermissionReport?.jdata) {
        newStocks = [{ value: '', label: 'Tất cả cơ sở' }, ...Stocks]
      } else {
        let newListItems = []
        let Groups = PermissionReport?.jdata?.groups || []
        for (let group of Groups) {
          if (group.items) {
            for (let item of group.items) {
              newListItems.push(item)
            }
          }
        }
        const index = newListItems.findIndex(o => o.url === pathname)
        if (index > -1) {
          if (newListItems[index].stocks) {
            const StocksPermission = newListItems[index].stocks
              .split(',')
              .map(o => Number(o))
            newStocks = newStocks.filter(o => StocksPermission.includes(o.ID))
          } else {
            newStocks = [{ value: '', label: 'Tất cả cơ sở' }, ...Stocks]
          }
        } else {
          newStocks = []
        }
      }
    }
    setStocksList(newStocks)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, PermissionReport])

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
                    {'DateStart' in values && (
                      <div className="mb-20px form-group">
                        <label>Ngày bắt đầu</label>
                        <DatePicker
                          onChange={date => {
                            setFieldValue('DateStart', date, false)
                          }}
                          selected={values.DateStart}
                          placeholderText="Chọn ngày"
                          className="form-control"
                          dateFormat="dd/MM/yyyy"
                        />
                      </div>
                    )}
                    {'DateEnd' in values && (
                      <div className="mb-20px form-group">
                        <label>Ngày kết thúc</label>
                        <DatePicker
                          onChange={date => {
                            setFieldValue('DateEnd', date, false)
                          }}
                          selected={values.DateEnd}
                          placeholderText="Chọn ngày"
                          className="form-control"
                          dateFormat="dd/MM/yyyy"
                        />
                      </div>
                    )}
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
                    {'ViewType' in values && (
                      <div>
                        {JsonFilter.ViewTypeList.map((item, index) => (
                          <label
                            className="checkbox d-flex mb-10px"
                            key={index}
                          >
                            <Field
                              type="checkbox"
                              name="ViewType"
                              value={item.value}
                            />
                            <span className="checkbox-icon"></span>
                            <span className="fw-500 cursor-pointer">
                              {item.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </PerfectScrollbar>
                </div>
                <div className="filter-box__footer p-20px d-flex justify-content-end">
                  <button
                    type="button"
                    className={clsx(
                      'btn btn-info',
                      loading && 'spinner spinner-white spinner-right'
                    )}
                    disabled={loading}
                    onClick={onRefresh}
                  >
                    <i className="fa-regular fa-arrows-rotate pr-5px"></i>
                    Làm mới
                  </button>
                  <button
                    type="submit"
                    className={clsx(
                      'btn btn-success ms-2',
                      loading && 'spinner spinner-white spinner-right'
                    )}
                    disabled={loading}
                  >
                    <i className="fa-regular fa-magnifying-glass pr-5px"></i>
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

export default Filter
