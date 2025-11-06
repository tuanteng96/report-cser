import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import DatePicker from 'react-datepicker'
import Select from 'react-select'
import { Formik, Form } from 'formik'
import AsyncSelectMembers from '../Selects/AsyncSelectMembers'
import { useApp } from 'src/app/App'
import { ArrayHeplers } from 'src/helpers/ArrayHeplers'

function FilterInformationPos3({
  show,
  onHide,
  loading,
  onRefresh,
  onSubmit,
  filters,
  Criterias,
  loadingExport,
  onExport,
  limitDateType = 'THEO_NGAY',
  noMaximum = false,
  limitEndMonth = false
}) {
  const [StocksList, setStocksList] = useState([])

  const { Stocks, GlobalConfig, AuthID, Auth } = useSelector(({ auth }) => ({
    GlobalConfig: auth?.GlobalConfig,
    AuthID: auth?.Info?.User?.ID,
    Stocks: auth.Info?.Stocks
      ? auth.Info.Stocks.filter(item => item.ID !== 778).map(item => ({
          ...item,
          label: item.Title || item.label,
          value: item.ID || item.value
        }))
      : [],
    Auth: auth
  }))

  const { GGLoading } = useApp()

  useEffect(() => {
    let newStocks = [...Stocks]
    setStocksList(newStocks)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
                <div className="border-gray-200 filter-box__header d-flex justify-content-between align-items-center border-bottom px-20px py-20px">
                  <div className="font-size-lg fw-500 text-uppercase">
                    Bộ lọc danh sách
                  </div>
                  <div
                    className="cursor-pointer w-30px h-30px d-flex justify-content-center align-items-center"
                    onClick={onHide}
                  >
                    <i className="fa-regular fa-xmark font-size-lg text-muted"></i>
                  </div>
                </div>
                <div className="filter-box__body p-20px">
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
                          item => Number(item.value) === Number(values?.StockID)
                        )}
                        onChange={otp => {
                          setFieldValue('StockID', otp ? otp.value : '')
                        }}
                        noOptionsMessage={() => 'Không có cơ sở'}
                      />
                    </div>
                  )}

                  <div className="form-group mb-20px">
                    <label>Khách hàng</label>
                    <AsyncSelectMembers
                      StockID={values.StockID}
                      isClearable={true}
                      menuPosition="fixed"
                      name="MemberID"
                      value={values.MemberID}
                      onChange={otp => {
                        setFieldValue('MemberID', otp, false)
                      }}
                    />
                  </div>

                  <div className="mb-20px form-group">
                    <label>Ngày bắt đầu</label>
                    <DatePicker
                      onChange={date => {
                        setFieldValue('FromDate', date, false)
                      }}
                      selected={values.FromDate}
                      placeholderText="Chọn ngày"
                      className="form-control"
                      dateFormat="dd/MM/yyyy"
                      minDate={ArrayHeplers.getDateLimit({
                        Auth,
                        Action: 'minDate',
                        Type: limitDateType,
                        noMaximum,
                        limitEndMonth
                      })}
                      maxDate={ArrayHeplers.getDateLimit({
                        Auth,
                        Action: 'maxDate',
                        Type: limitDateType,
                        noMaximum,
                        limitEndMonth
                      })}
                    />
                  </div>

                  <div className="mb-20px form-group">
                    <label>Ngày kết thúc</label>
                    <DatePicker
                      onChange={date => {
                        setFieldValue('ToDate', date, false)
                      }}
                      selected={values.ToDate}
                      placeholderText="Chọn ngày"
                      className="form-control"
                      dateFormat="dd/MM/yyyy"
                      minDate={ArrayHeplers.getDateLimit({
                        Auth,
                        Action: 'minDate',
                        Type: 'THEO_NGAY'
                      })}
                      maxDate={ArrayHeplers.getDateLimit({
                        Auth,
                        Action: 'maxDate',
                        Type: 'THEO_NGAY'
                      })}
                    />
                  </div>

                  <div className="form-group mb-20px">
                    <label>Tiêu chí</label>
                    <Select
                      isClearable={false}
                      isLoading={Criterias.isLoading}
                      isDisabled={Criterias.isLoading}
                      name="Criterias"
                      placeholder="Chọn tiêu chí"
                      classNamePrefix="select"
                      options={Criterias?.data?.data || []}
                      className="select-control"
                      value={values.Criterias}
                      onChange={otp => {
                        setFieldValue('Criterias', otp)
                      }}
                      noOptionsMessage={() => 'Không có dữ liệu'}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={{
                        menuPortal: base => ({
                          ...base,
                          zIndex: 9999
                        })
                      }}
                    />
                  </div>
                </div>
                <div className="filter-box__footer p-20px d-flex justify-content-end">
                  {(GlobalConfig?.Admin?.byAdminExcel
                    ? AuthID === 1
                    : !GlobalConfig?.Admin?.byAdminExcel) && (
                    <button
                      type="button"
                      className={clsx(
                        'btn btn-primary me-2 max-w-135px text-truncate',
                        (loadingExport || loading || GGLoading) &&
                          'spinner spinner-white spinner-right'
                      )}
                      disabled={loadingExport || GGLoading}
                      onClick={onExport}
                    >
                      <i className="far fa-file-excel pr-8px"></i>
                      {GGLoading ? 'Đang tải tài nguyên ...' : 'Xuất Excel'}
                    </button>
                  )}
                  <button
                    type="button"
                    className={clsx(
                      'btn btn-info',
                      loading && 'spinner spinner-white spinner-right'
                    )}
                    disabled={loading}
                    onClick={onRefresh}
                  >
                    <i className="fa-regular fa-arrows-rotate"></i>
                  </button>
                  <button
                    type="submit"
                    className={clsx(
                      'btn btn-success ms-2 max-w-135px text-truncate',
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

export default FilterInformationPos3
