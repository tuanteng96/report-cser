import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import DatePicker, { registerLocale } from 'react-datepicker'
import clsx from 'clsx'
import { Formik, Form } from 'formik'
import vi from 'date-fns/locale/vi' // the locale you want
import Select from 'react-select'
import AsyncSelectGroupsCustomer from '../Selects/AsyncSelectGroupsCustomer'
import AsyncSelectSource from '../Selects/AsyncSelectSource'
import { JsonFilter } from 'src/Json/JsonFilter'
import AsyncSelectBrands from '../Selects/AsyncSelectBrands'
import AsyncSelectProducts from '../Selects/AsyncSelectProducts'
import AsyncSelectProduct from '../Selects/AsyncSelectProduct'

registerLocale('vi', vi) // register it with the name you want

FilterToggle.propTypes = {
  show: PropTypes.bool
}

const {
  StatusWalletList,
  TypeCNList,
  TypeServiceMemberList,
  StatusServiceMemberList
} = JsonFilter

const FilterGroups = ({ children, initialShow, Title }) => {
  const [show, setShow] = useState(initialShow)
  return (
    <div>
      <div
        className="font-size-sm fw-600 text-uppercase d-flex align-items-center justify-content-between cursor-pointer pb-8px"
        onClick={() => setShow(!show)}
      >
        {Title}
        <i className="fa-solid fa-chevron-down font-size-xs"></i>
      </div>
      {show && children}
    </div>
  )
}

function FilterToggle({ show, onHide, filters, onSubmit, loading, onRefresh }) {
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
          const { values, setFieldValue, handleChange, handleBlur } =
            formikProps
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
                <div className="filter-box__body p-20px">
                  {'DateStart' in values && (
                    <div className="mb-20px form-group">
                      <label>Ngày bắt đầu</label>
                      <DatePicker
                        onChange={date => {
                          setFieldValue('DateStart', date, false)
                        }}
                        selected={values.DateStart}
                        // selectsStart
                        // startDate={values.DateStart}
                        // endDate={values.DateEnd}
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
                        // selectsEnd
                        // startDate={values.DateStart}
                        // endDate={values.DateEnd}
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
                          item => Number(item.value) === Number(values?.StockID)
                        )}
                        onChange={otp => {
                          setFieldValue('StockID', otp ? otp.value : '')
                        }}
                      />
                    </div>
                  )}
                  {'BirthDateStart' in values && (
                    <div className="mb-20px form-group">
                      <label>Ngày sinh nhật</label>
                      <DatePicker
                        placeholderText="Chọn ngày"
                        className="form-control"
                        selectsRange={true}
                        startDate={values.BirthDateStart}
                        endDate={values.BirthDateEnd}
                        onChange={date => {
                          const [Start, End] = date
                          setFieldValue('BirthDateStart', Start, false)
                          setFieldValue('BirthDateEnd', End, false)
                        }}
                        dateFormat="dd/MM/yyyy"
                      />
                    </div>
                  )}
                  <FilterGroups Title={'Thông tin'} initialShow={false}>
                    {'GroupCustomerID' in values && (
                      <div className="form-group mb-20px">
                        <label>Nhóm khách hàng</label>
                        <AsyncSelectGroupsCustomer
                          isClearable={true}
                          menuPosition="fixed"
                          name="GroupCustomerID"
                          onChange={otp =>
                            setFieldValue('GroupCustomerID', otp, false)
                          }
                          value={values.GroupCustomerID}
                        />
                      </div>
                    )}
                    {'SourceName' in values && (
                      <div className="form-group mb-20px">
                        <label>Nguồn khách hàng</label>
                        <AsyncSelectSource
                          isClearable={true}
                          menuPosition="fixed"
                          name="SourceName"
                          onChange={otp => {
                            setFieldValue('SourceName', otp, false)
                          }}
                          value={values.SourceName}
                        />
                      </div>
                    )}
                    {'StatusWallet' in values && (
                      <div className="form-group mb-20px">
                        <label>Tình trạng ví</label>
                        <Select
                          menuPosition="fixed"
                          isClearable={true}
                          name="StatusWallet"
                          placeholder="Chọn tình trạng ví"
                          classNamePrefix="select"
                          options={StatusWalletList}
                          className="select-control"
                          value={values.StatusWallet}
                          onChange={otp => {
                            setFieldValue('StatusWallet', otp)
                          }}
                        />
                      </div>
                    )}
                    {'StatusMonetCard' in values && (
                      <div className="form-group mb-20px">
                        <label>Tình trạng thẻ tiền</label>
                        <Select
                          menuPosition="fixed"
                          isClearable={true}
                          name="StatusMonetCard"
                          placeholder="Chọn tình trạng ví"
                          classNamePrefix="select"
                          options={StatusWalletList}
                          className="select-control"
                          value={values.StatusMonetCard}
                          onChange={otp => {
                            setFieldValue('StatusMonetCard', otp)
                          }}
                        />
                      </div>
                    )}
                  </FilterGroups>
                  <FilterGroups Title={'Đơn hàng'} initialShow={false}>
                    <div className="form-group mb-20px">
                      <label>Cơ sở mua hàng</label>
                      <Select
                        name="Orders.StockOrderID"
                        placeholder="Chọn cơ cở"
                        classNamePrefix="select"
                        options={StocksList}
                        className="select-control"
                        value={StocksList.filter(
                          item =>
                            Number(item.value) ===
                            Number(values?.Orders?.StockOrderID)
                        )}
                        onChange={otp => {
                          setFieldValue(
                            'Orders.StockOrderID',
                            otp ? otp.value : ''
                          )
                        }}
                      />
                    </div>
                    <div className="mb-20px form-group">
                      <label>Thời gian mua hàng</label>
                      <DatePicker
                        placeholderText="Chọn ngày"
                        className="form-control"
                        selectsRange={true}
                        startDate={values?.Orders?.DateOrderStart}
                        endDate={values?.Orders?.DateOrderEnd}
                        onChange={date => {
                          const [Start, End] = date
                          setFieldValue('Orders.DateOrderStart', Start, false)
                          setFieldValue('Orders.DateOrderEnd', End, false)
                        }}
                        dateFormat="dd/MM/yyyy"
                      />
                    </div>
                    <div className="form-group mb-20px">
                      <label>Phát sinh mua</label>
                      <Select
                        isMulti
                        menuPosition="fixed"
                        isClearable={true}
                        name="Orders.TypeOrder"
                        placeholder="Chọn loại"
                        classNamePrefix="select"
                        options={TypeCNList}
                        className="select-control"
                        value={values?.Orders?.TypeOrder}
                        onChange={otp => {
                          setFieldValue('Orders.TypeOrder', otp)
                        }}
                      />
                    </div>
                    <div className="form-group mb-20px">
                      <label>Phát sinh mua theo nhãn hàng</label>
                      <AsyncSelectBrands
                        menuPlacement="top"
                        isClearable={true}
                        menuPosition="fixed"
                        name="Orders.BrandOrderID"
                        onChange={otp => {
                          setFieldValue('Orders.BrandOrderID', otp, false)
                        }}
                        value={values?.Orders?.BrandOrderID}
                      />
                    </div>
                    <div className="form-group mb-20px">
                      <label>Phát sinh mua sản phẩm</label>
                      <AsyncSelectProduct
                        isClearable={true}
                        menuPosition="fixed"
                        name="Orders.ProductOrderID"
                        onChange={otp => {
                          setFieldValue('Orders.ProductOrderID', otp, false)
                        }}
                        value={values.Orders.ProductOrderID}
                      />
                    </div>
                  </FilterGroups>
                  <FilterGroups Title={'Dịch vụ'} initialShow={false}>
                    <div className="form-group mb-20px">
                      <label>Trạng thái</label>
                      <Select
                        menuPosition="fixed"
                        isClearable={true}
                        name="Services.Status"
                        placeholder="Chọn trạng thái"
                        classNamePrefix="select"
                        options={StatusServiceMemberList}
                        className="select-control"
                        value={values?.Services?.Status}
                        onChange={otp => {
                          setFieldValue('Services.Status', otp)
                        }}
                      />
                    </div>
                    <div className="form-group mb-20px">
                      <label>Loại</label>
                      <Select
                        menuPosition="fixed"
                        isClearable={true}
                        name="Services.Type"
                        placeholder="Chọn loại"
                        classNamePrefix="select"
                        options={TypeServiceMemberList}
                        className="select-control"
                        value={values?.Services?.Type}
                        onChange={otp => {
                          setFieldValue('Services.Type', otp)
                        }}
                      />
                    </div>
                  </FilterGroups>
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

export default FilterToggle
