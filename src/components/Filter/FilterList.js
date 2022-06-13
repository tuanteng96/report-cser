import React, { useEffect, useState } from 'react'
import clsx from 'clsx'
import DatePicker from 'react-datepicker'
import Select from 'react-select'
import { Formik, Form } from 'formik'
import { useSelector } from 'react-redux'
import AsyncSelectProvinces from '../Selects/AsyncSelectProvinces'
import AsyncSelectDistrics from '../Selects/AsyncSelectDistrics'
import AsyncSelectGroupsCustomer from '../Selects/AsyncSelectGroupsCustomer'
import AsyncSelectSource from '../Selects/AsyncSelectSource'
import AsyncSelectStaffs from '../Selects/AsyncSelectStaffs'
import SelectWarranty from '../Selects/SelectWarranty'
import SelectStatusService from '../Selects/SelectStatusService'
import { JsonFilter } from 'src/Json/JsonFilter'
import AsyncSelect from 'react-select/async'
import AsyncSelectMembers from '../Selects/AsyncSelectMembers'
import AsyncSelectSVPP from '../Selects/AsyncSelectSVPP'

const {
  VoucherList,
  PaymentList,
  IsMemberList,
  TopTypeList,
  PaymentMethodsList,
  TypeTCList,
  TagsTCList,
  TypeCNList
} = JsonFilter

function FilterList({ show, onHide, filters, onSubmit, loading, onRefresh }) {
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

  const filterTypeTC = (inputValue, optionFilter) => {
    if (optionFilter !== '') {
      return TagsTCList.filter(
        i =>
          i.type === optionFilter &&
          i.label.toLowerCase().includes(inputValue.toLowerCase())
      )
    }
    return TagsTCList.filter(i =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    )
  }

  const handleInputChange = newValue => {
    const inputValue = newValue.replace(/\W/g, '')
    return inputValue
  }

  const loadOptionsTypeTC = (inputValue, callback, optionFilter) => {
    setTimeout(() => {
      callback(filterTypeTC(inputValue, optionFilter))
    }, 500)
  }

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
                          item => Number(item.value) === Number(values?.StockID)
                        )}
                        onChange={otp => {
                          setFieldValue('StockID', otp ? otp.value : '')
                        }}
                      />
                    </div>
                  )}
                  {'TypeCN' in values && (
                    <div className="form-group mb-20px">
                      <label>Loại</label>
                      <Select
                        isMulti
                        menuPosition="fixed"
                        isClearable={true}
                        name="TypeCN"
                        placeholder="Chọn loại"
                        classNamePrefix="select"
                        options={TypeCNList}
                        className="select-control"
                        value={values.TypeCN}
                        onChange={otp => {
                          setFieldValue('TypeCN', otp)
                        }}
                      />
                    </div>
                  )}
                  {'PaymentMethods' in values && (
                    <div className="form-group mb-20px">
                      <label>Phương thức thanh toán</label>
                      <Select
                        isMulti
                        menuPosition="fixed"
                        isClearable={true}
                        name="PaymentMethods"
                        placeholder="Phương thức thanh toán"
                        classNamePrefix="select"
                        options={PaymentMethodsList}
                        className="select-control"
                        value={values.PaymentMethods}
                        onChange={otp => {
                          setFieldValue('PaymentMethods', otp)
                        }}
                      />
                    </div>
                  )}
                  {'TypeTC' in values && (
                    <div className="form-group mb-20px">
                      <label>Loại</label>
                      <Select
                        isClearable={true}
                        name="TypeTC"
                        placeholder="Chọn loại"
                        classNamePrefix="select"
                        options={TypeTCList}
                        className="select-control"
                        value={TypeTCList.filter(
                          item => Number(item.value) === values?.TypeTC
                        )}
                        onChange={otp => {
                          setFieldValue('TypeTC', otp ? otp.value : '')
                          setFieldValue('TagsTC', null)
                        }}
                      />
                    </div>
                  )}
                  {'TagsTC' in values && (
                    <div className="form-group mb-20px">
                      <label>Tags</label>
                      <AsyncSelect
                        key={values?.TypeTC}
                        cacheOptions
                        defaultOptions
                        isMulti
                        className="select-control"
                        menuPosition="fixed"
                        isClearable={true}
                        name="TagsTC"
                        placeholder="Chọn Tags"
                        classNamePrefix="select"
                        loadOptions={(inputValue, callback) =>
                          loadOptionsTypeTC(
                            inputValue,
                            callback,
                            values?.TypeTC
                          )
                        }
                        value={values.TagsTC}
                        onChange={otp => {
                          setFieldValue('TagsTC', otp)
                        }}
                        onInputChange={handleInputChange}
                      />
                    </div>
                  )}
                  {'TopType' in values && (
                    <div className="form-group mb-20px">
                      <label>Loại</label>
                      <Select
                        isClearable={true}
                        name="TopType"
                        placeholder="Chọn loại"
                        classNamePrefix="select"
                        options={TopTypeList}
                        className="select-control"
                        value={TopTypeList.filter(
                          item => Number(item.value) === Number(values?.TopType)
                        )}
                        onChange={otp => {
                          setFieldValue('TopType', otp ? otp.value : '')
                        }}
                      />
                    </div>
                  )}
                  {'Voucher' in values && (
                    <div className="form-group mb-20px">
                      <label>Voucher</label>
                      <Select
                        menuPosition="fixed"
                        isClearable={true}
                        name="Voucher"
                        placeholder="Loại Voucher"
                        classNamePrefix="select"
                        options={VoucherList}
                        className="select-control"
                        value={VoucherList.filter(
                          item => Number(item.value) === values?.Voucher
                        )}
                        onChange={otp => {
                          setFieldValue('Voucher', otp ? otp.value : '')
                        }}
                      />
                    </div>
                  )}
                  {'Payment' in values && (
                    <div className="form-group mb-20px">
                      <label>Thanh toán</label>
                      <Select
                        menuPosition="fixed"
                        isClearable={true}
                        name="Payment"
                        placeholder="Loại thanh toán"
                        classNamePrefix="select"
                        options={PaymentList}
                        className="select-control"
                        value={PaymentList.filter(
                          item => Number(item.value) === values?.Payment
                        )}
                        onChange={otp => {
                          setFieldValue('Payment', otp ? otp.value : '')
                        }}
                      />
                    </div>
                  )}
                  {'IsMember' in values && (
                    <div className="form-group mb-20px">
                      <label>Loại khách hàng</label>
                      <Select
                        menuPosition="fixed"
                        isClearable={true}
                        name="IsMember"
                        placeholder="Loại khách hàng"
                        classNamePrefix="select"
                        options={IsMemberList}
                        className="select-control"
                        value={IsMemberList.filter(
                          item => Number(item.value) === values?.IsMember
                        )}
                        onChange={otp => {
                          setFieldValue('IsMember', otp ? otp.value : '')
                        }}
                      />
                    </div>
                  )}
                  {'MemberID' in values && (
                    <div className="form-group mb-20px">
                      <label>Khách hàng</label>
                      <AsyncSelectMembers
                        isClearable={true}
                        menuPosition="fixed"
                        name="MemberID"
                        onChange={otp => {
                          setFieldValue('MemberID', otp, false)
                        }}
                      />
                    </div>
                  )}
                  {'StaffID' in values && (
                    <div className="form-group mb-20px">
                      <label>Nhân viên</label>
                      <AsyncSelectStaffs
                        isClearable={true}
                        menuPosition="fixed"
                        name="StaffID"
                        onChange={otp => {
                          setFieldValue('StaffID', otp, false)
                        }}
                      />
                    </div>
                  )}
                  {'ServiceCardID' in values && (
                    <div className="form-group mb-20px">
                      <label>Thẻ dịch vụ & Phụ phí</label>
                      <AsyncSelectSVPP
                        isClearable={true}
                        menuPosition="fixed"
                        name="ServiceCardID"
                        onChange={otp => {
                          setFieldValue('ServiceCardID', otp, false)
                        }}
                      />
                    </div>
                  )}
                  {'OrderID' in values && (
                    <div className="form-group mb-20px">
                      <label>ID đơn hàng</label>
                      <input
                        type="text"
                        name="OrderID"
                        value={values.OrderID}
                        className="form-control"
                        placeholder="Nhập ID đơn hàng"
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </div>
                  )}
                  {'Status' in values && (
                    <div className="form-group mb-20px">
                      <label>Trạng thái</label>
                      <SelectStatusService
                        isClearable={true}
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
                        isClearable={true}
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
                        isClearable={true}
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
                        isClearable={true}
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
                        isClearable={true}
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
                        isClearable={true}
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

export default FilterList
