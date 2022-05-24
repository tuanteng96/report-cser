import React, { useEffect, useState } from 'react'
import clsx from 'clsx'
import DatePicker from 'react-datepicker'
import Select from 'react-select'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Formik, Form } from 'formik'
import { useSelector } from 'react-redux'
import AsyncSelectProvinces from '../Selects/AsyncSelectProvinces'
import AsyncSelectDistrics from '../Selects/AsyncSelectDistrics'
import AsyncSelectGroupsCustomer from '../Selects/AsyncSelectGroupsCustomer'
import AsyncSelectSource from '../Selects/AsyncSelectSource'
import AsyncSelectStaffs from '../Selects/AsyncSelectStaffs'
import SelectWarranty from '../Selects/SelectWarranty'
import SelectStatusService from '../Selects/SelectStatusService'

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
                    Bộ lọc danh sách
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
                    {'StaffID' in values && (
                      <div className="form-group mb-20px">
                        <label>Nhân viên</label>
                        <AsyncSelectStaffs
                          menuPosition="fixed"
                          name="StaffID"
                          onChange={otp => {
                            setFieldValue('StaffID', otp, false)
                          }}
                        />
                      </div>
                    )}
                    {'Status' in values && (
                      <div className="form-group mb-20px">
                        <label>Trạng thái</label>
                        <SelectStatusService
                          menuPosition="fixed"
                          name="Status"
                          onChange={otp => {
                            setFieldValue('Status', otp, false)
                          }}
                        />
                      </div>
                    )}
                    {'Warranty' in values && (
                      <div className="form-group mb-20px">
                        <label>Bảo hành</label>
                        <SelectWarranty
                          menuPosition="fixed"
                          name="Warranty"
                          onChange={otp => {
                            setFieldValue('Warranty', otp, false)
                          }}
                        />
                      </div>
                    )}
                    {'GroupCustomerID' in values && (
                      <div className="form-group mb-20px">
                        <label>Nhóm khách hàng</label>
                        <AsyncSelectGroupsCustomer
                          menuPosition="fixed"
                          name="GroupCustomerID"
                          onChange={otp =>
                            setFieldValue('GroupCustomerID', otp, false)
                          }
                        />
                      </div>
                    )}
                    {'SourceName' in values && (
                      <div className="form-group mb-20px">
                        <label>Nguồn khách hàng</label>
                        <AsyncSelectSource
                          menuPosition="fixed"
                          name="SourceName"
                          onChange={otp => {
                            setFieldValue('SourceName', otp, false)
                          }}
                        />
                      </div>
                    )}
                    {'ProvincesID' in values && (
                      <div className="form-group mb-20px">
                        <label>Tỉnh / Thành Phố</label>
                        <AsyncSelectProvinces
                          menuPosition="fixed"
                          name="ProvincesID"
                          value={values.ProvincesID}
                          onChange={otp =>
                            setFieldValue('ProvincesID', otp, false)
                          }
                        />
                      </div>
                    )}
                    {'DistrictsID' in values && (
                      <div className="form-group mb-20px">
                        <label>Quận / Huyện</label>
                        <AsyncSelectDistrics
                          key={values.ProvincesID?.value}
                          ProvincesID={values.ProvincesID?.value}
                          menuPosition="fixed"
                          name="DistrictsID"
                          value={values.DistrictsID}
                          onChange={otp =>
                            setFieldValue('DistrictsID', otp, false)
                          }
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
