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
import NumberFormat from 'react-number-format'
import AsyncSelectProducts from '../Selects/AsyncSelectProducts'
import AsyncSelectMembers from '../Selects/AsyncSelectMembers'
import AsyncSelectServices from '../Selects/AsyncSelectServices'
import AsyncSelectCategoriesSV from '../Selects/AsyncSelectCategoriesSV'
import { useLocation } from 'react-router-dom'

registerLocale('vi', vi) // register it with the name you want

FilterToggle.propTypes = {
  show: PropTypes.bool
}

const {
  StatusWalletList,
  TypeCNList,
  TypeServiceMemberList,
  StatusServiceMemberList,
  TypeCNList2,
  FrequencyList
} = JsonFilter

// const FilterGroups = ({ children, initialShow, Title }) => {
//   const [show, setShow] = useState(initialShow)
//   return (
//     <div>
//       <div
//         className="font-size-sm fw-600 text-uppercase d-flex align-items-center justify-content-between cursor-pointer pb-8px"
//         onClick={() => setShow(!show)}
//       >
//         {Title}
//         <i className="fa-solid fa-chevron-down font-size-xs"></i>
//       </div>
//       {show && children}
//     </div>
//   )
// }

function FilterToggle({
  show,
  onHide,
  filters,
  onSubmit,
  loading,
  loadingExport,
  onRefresh,
  onExport
}) {
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
  }, [PermissionReport, pathname])

  return (
    <div className={clsx('filter-box', show && 'show')}>
      <Formik
        initialValues={filters}
        onSubmit={onSubmit}
        enableReinitialize={true}
      >
        {formikProps => {
          // errors, touched, handleChange, handleBlur
          const { values, setFieldValue, handleBlur } = formikProps
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
                  <div className="p-20px">
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
                            item =>
                              Number(item.value) === Number(values?.StockID)
                          )}
                          onChange={otp => {
                            setFieldValue('StockID', otp ? otp.value : '')
                          }}
                        />
                      </div>
                    )}
                    {'BirthDateStart' in values && (
                      <div className="form-group mb-20px">
                        <label>Ngày sinh nhật</label>
                        <div className="d-flex">
                          <div className="flex-1">
                            <DatePicker
                              onChange={date => {
                                setFieldValue('BirthDateStart', date, false)
                              }}
                              selected={values.BirthDateStart}
                              // selectsEnd
                              // startDate={values.DateStart}
                              // endDate={values.DateEnd}
                              className="form-control"
                              dateFormat="dd/MM"
                              placeholderText="Bắt đầu"
                            />
                          </div>
                          <div className="d-flex align-items-center justify-content-center w-35px">
                            <i className="fa-regular text-black-50 fa-arrow-right-long"></i>
                          </div>
                          <div className="flex-1">
                            <DatePicker
                              onChange={date => {
                                setFieldValue('BirthDateEnd', date, false)
                              }}
                              selected={values.BirthDateEnd}
                              // selectsEnd
                              // startDate={values.DateStart}
                              // endDate={values.DateEnd}
                              className="form-control"
                              dateFormat="dd/MM"
                              placeholderText="Bắt đầu"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    {'MemberID' in values && (
                      <div className="form-group mb-20px">
                        <label>Khách hàng</label>
                        <AsyncSelectMembers
                          isClearable={true}
                          menuPosition="fixed"
                          name="MemberID"
                          value={values.MemberID}
                          onChange={otp => {
                            setFieldValue('MemberID', otp, false)
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
                          value={values.GroupCustomerID}
                        />
                      </div>
                    )}
                    {'SourceName' in values && (
                      <div
                        className={`form-group ${clsx({
                          'mb-20px': 'StatusWallet' in values
                        })}`}
                      >
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
                      <div className="form-group">
                        <label>Tình trạng thẻ tiền</label>
                        <Select
                          menuPosition="fixed"
                          isClearable={true}
                          name="StatusMonetCard"
                          placeholder="Chọn tình trạng thẻ tiền"
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
                  </div>
                  {('StockOrderID' in values ||
                    'DateOrderStart' in values ||
                    'TypeOrder' in values ||
                    'BrandOrderID' in values ||
                    'ProductOrderID' in values ||
                    'PriceFromOrder' in values) && (
                    <div className="p-20px border-top">
                      {'StockOrderID' in values && (
                        <div className="form-group mb-20px">
                          <label>Cơ sở mua hàng</label>
                          <Select
                            name="StockOrderID"
                            placeholder="Chọn cơ cở"
                            classNamePrefix="select"
                            options={StocksList}
                            className="select-control"
                            value={StocksList.filter(
                              item =>
                                Number(item.value) ===
                                Number(values?.StockOrderID)
                            )}
                            onChange={otp => {
                              setFieldValue(
                                'StockOrderID',
                                otp ? otp.value : ''
                              )
                            }}
                          />
                        </div>
                      )}
                      {'DateOrderStart' in values && (
                        <div
                          className={`form-group ${clsx({
                            'mb-20px': 'TypeOrder' in values
                          })}`}
                        >
                          <label>Thời gian mua hàng</label>
                          <div className="d-flex">
                            <div className="flex-1">
                              <DatePicker
                                onChange={date => {
                                  setFieldValue('DateOrderStart', date, false)
                                }}
                                selected={values.DateOrderStart}
                                // selectsEnd
                                // startDate={values.DateStart}
                                // endDate={values.DateEnd}
                                className="form-control"
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Bắt đầu"
                              />
                            </div>
                            <div className="d-flex align-items-center justify-content-center w-35px">
                              <i className="fa-regular text-black-50 fa-arrow-right-long"></i>
                            </div>
                            <div className="flex-1">
                              <DatePicker
                                onChange={date => {
                                  setFieldValue('DateOrderEnd', date, false)
                                }}
                                selected={values.DateOrderEnd}
                                // selectsEnd
                                // startDate={values.DateStart}
                                // endDate={values.DateEnd}
                                className="form-control"
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Kết thúc"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      {'TypeOrder' in values && (
                        <div className="form-group mb-20px">
                          <label>Phát sinh mua</label>
                          <Select
                            isMulti
                            menuPosition="fixed"
                            isClearable={true}
                            name="TypeOrder"
                            placeholder="Chọn loại"
                            classNamePrefix="select"
                            options={TypeCNList}
                            className="select-control"
                            value={values?.TypeOrder}
                            onChange={otp => {
                              setFieldValue('TypeOrder', otp)
                            }}
                          />
                        </div>
                      )}
                      {'BrandOrderID' in values && (
                        <div className="form-group mb-20px">
                          <label>Phát sinh mua theo nhãn hàng</label>
                          <AsyncSelectBrands
                            menuPlacement="top"
                            isClearable={true}
                            menuPosition="fixed"
                            name="BrandOrderID"
                            onChange={otp => {
                              setFieldValue('BrandOrderID', otp, false)
                            }}
                            value={values?.BrandOrderID}
                          />
                        </div>
                      )}
                      {'ProductOrderID' in values && (
                        <div className="form-group mb-20px">
                          <label>Phát sinh mua mặt hàng</label>
                          <AsyncSelectProducts
                            closeMenuOnScroll={true}
                            menuPlacement="top"
                            isClearable={true}
                            menuPosition="fixed"
                            name="ProductOrderID"
                            onChange={otp => {
                              setFieldValue('ProductOrderID', otp, false)
                            }}
                            value={values.ProductOrderID}
                          />
                        </div>
                      )}
                      {'PriceFromOrder' in values && (
                        <div className="form-group">
                          <label>Mức chi tiêu</label>
                          <div className="d-flex">
                            <div className="flex-1">
                              <NumberFormat
                                allowNegative={false}
                                name="PriceFromOrder"
                                placeholder="Từ"
                                className={`form-control`}
                                isNumericString={true}
                                thousandSeparator={true}
                                value={values?.PriceFromOrder}
                                onValueChange={val => {
                                  setFieldValue(
                                    'PriceFromOrder',
                                    val.floatValue ? val.floatValue : val.value
                                  )
                                }}
                                onBlur={handleBlur}
                                autoComplete="off"
                              />
                            </div>
                            <div className="d-flex align-items-center justify-content-center w-35px">
                              <i className="fa-regular text-black-50 fa-arrow-right-long"></i>
                            </div>
                            <div className="flex-1">
                              <NumberFormat
                                allowNegative={false}
                                name="PriceToOrder"
                                placeholder="Đến"
                                className={`form-control`}
                                isNumericString={true}
                                thousandSeparator={true}
                                value={values?.PriceToOrder}
                                onValueChange={val => {
                                  setFieldValue(
                                    'PriceToOrder',
                                    val.floatValue ? val.floatValue : val.value
                                  )
                                }}
                                onBlur={handleBlur}
                                autoComplete="off"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {('StatusServices' in values ||
                    'DayFromServices' in values ||
                    'TypeServices' in values ||
                    'ServiceIDs' in values ||
                    'UsedUpDateStart' in values ||
                    'ExpiryDateStart' in values ||
                    'PriceLevelUpFrom' in values ||
                    'LevelUp' in values ||
                    'TypeService' in values ||
                    'CateServiceIDs' in values ||
                    'DayService' in values ||
                    'LastUsedFrom' in values ||
                    'Frequency' in values ||
                    'OSFrom' in values ||
                    'OSTo' in values) && (
                    <div className="p-20px border-top">
                      {'TypeService' in values && (
                        <div className="form-group mb-20px">
                          <label>Loại</label>
                          <Select
                            menuPosition="fixed"
                            isClearable={true}
                            name="TypeService"
                            placeholder="Chọn loại"
                            classNamePrefix="select"
                            options={TypeCNList2}
                            className="select-control"
                            value={values?.TypeService}
                            onChange={otp => {
                              setFieldValue('TypeService', otp)
                            }}
                          />
                        </div>
                      )}
                      {'UsedUpDateStart' in values && (
                        <div className="form-group mb-20px">
                          <label>TG ước tính sử dụng hết </label>
                          <div className="d-flex">
                            <div className="flex-1">
                              <DatePicker
                                onChange={date => {
                                  setFieldValue('UsedUpDateStart', date, false)
                                }}
                                selected={values.UsedUpDateStart}
                                // selectsEnd
                                // startDate={values.DateStart}
                                // endDate={values.DateEnd}
                                className="form-control"
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Bắt đầu"
                              />
                            </div>
                            <div className="d-flex align-items-center justify-content-center w-35px">
                              <i className="fa-regular text-black-50 fa-arrow-right-long"></i>
                            </div>
                            <div className="flex-1">
                              <DatePicker
                                onChange={date => {
                                  setFieldValue('UsedUpDateEnd', date, false)
                                }}
                                selected={values.UsedUpDateEnd}
                                // selectsEnd
                                // startDate={values.DateStart}
                                // endDate={values.DateEnd}
                                className="form-control"
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Kết thúc"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      {'ExpiryDateStart' in values && (
                        <div className="form-group mb-20px">
                          <label>Hạn sử dụng</label>
                          <div className="d-flex">
                            <div className="flex-1">
                              <DatePicker
                                onChange={date => {
                                  setFieldValue('ExpiryDateStart', date, false)
                                }}
                                selected={values.ExpiryDateStart}
                                // selectsEnd
                                // startDate={values.DateStart}
                                // endDate={values.DateEnd}
                                className="form-control"
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Bắt đầu"
                              />
                            </div>
                            <div className="d-flex align-items-center justify-content-center w-35px">
                              <i className="fa-regular text-black-50 fa-arrow-right-long"></i>
                            </div>
                            <div className="flex-1">
                              <DatePicker
                                onChange={date => {
                                  setFieldValue('ExpiryDateEnd', date, false)
                                }}
                                selected={values.ExpiryDateEnd}
                                // selectsEnd
                                // startDate={values.DateStart}
                                // endDate={values.DateEnd}
                                className="form-control"
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Kết thúc"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      {'CateServiceIDs' in values && (
                        <div className="form-group mb-20px">
                          <label>Danh mục dịch vụ</label>
                          <AsyncSelectCategoriesSV
                            isMulti
                            closeMenuOnScroll={true}
                            menuPlacement="top"
                            isClearable={true}
                            menuPosition="fixed"
                            name="CateServiceIDs"
                            onChange={otp => {
                              setFieldValue('CateServiceIDs', otp, false)
                            }}
                            value={values.CateServiceIDs}
                          />
                        </div>
                      )}
                      {'ServiceIDs' in values && (
                        <div className="form-group mb-20px">
                          <label>Dịch vụ</label>
                          <AsyncSelectServices
                            isMulti
                            closeMenuOnScroll={true}
                            menuPlacement="top"
                            isClearable={true}
                            menuPosition="fixed"
                            name="ServiceIDs"
                            onChange={otp => {
                              setFieldValue('ServiceIDs', otp, false)
                            }}
                            value={values.ServiceIDs}
                          />
                        </div>
                      )}
                      {('OSFrom' in values || 'OSTo' in values) && (
                        <div className="mb-20px form-group">
                          <label>Thời gian bắt đầu / Kết thúc</label>
                          <div className="d-flex">
                            <div className="mr-5px">
                              <DatePicker
                                onChange={date => {
                                  setFieldValue('OSFrom', date, false)
                                }}
                                selected={values.OSFrom}
                                // selectsStart
                                // startDate={values.DateStart}
                                // endDate={values.DateEnd}
                                placeholderText="Ngày bắt đầu"
                                className="form-control"
                                dateFormat="dd/MM/yyyy"
                              />
                            </div>
                            <div className="ml-5px">
                              <DatePicker
                                onChange={date => {
                                  setFieldValue('OSTo', date, false)
                                }}
                                selected={values.OSTo}
                                // selectsEnd
                                // startDate={values.DateStart}
                                // endDate={values.DateEnd}
                                placeholderText="Ngày kết thúc"
                                className="form-control"
                                dateFormat="dd/MM/yyyy"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {'StatusServices' in values && (
                        <div className="form-group mb-20px">
                          <label>Trạng thái</label>
                          <Select
                            isMulti
                            menuPosition="fixed"
                            isClearable={true}
                            name="StatusServices"
                            placeholder="Chọn trạng thái"
                            classNamePrefix="select"
                            options={StatusServiceMemberList}
                            className="select-control"
                            value={values?.StatusServices}
                            onChange={otp => {
                              setFieldValue('StatusServices', otp)
                            }}
                          />
                        </div>
                      )}
                      {'DayService' in values && (
                        <div className="form-group mb-20px">
                          <label>Số ngày không đến làm DV</label>
                          <NumberFormat
                            allowNegative={false}
                            name="DayService"
                            placeholder="Nhập số ngày"
                            className={`form-control`}
                            isNumericString={true}
                            //thousandSeparator={true}
                            value={values?.DayService}
                            onValueChange={val => {
                              setFieldValue(
                                'DayService',
                                val.floatValue ? val.floatValue : val.value
                              )
                            }}
                            onBlur={handleBlur}
                            autoComplete="off"
                          />
                        </div>
                      )}

                      {'LastUsedFrom' in values && (
                        <div className="form-group mb-20px">
                          <label>Ngày dùng cuối</label>
                          <div className="d-flex">
                            <div className="flex-1">
                              <DatePicker
                                onChange={date => {
                                  setFieldValue('LastUsedFrom', date, false)
                                }}
                                selected={values.LastUsedFrom}
                                // selectsEnd
                                // startDate={values.DateStart}
                                // endDate={values.DateEnd}
                                className="form-control"
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Bắt đầu"
                              />
                            </div>
                            <div className="d-flex align-items-center justify-content-center w-35px">
                              <i className="fa-regular text-black-50 fa-arrow-right-long"></i>
                            </div>
                            <div className="flex-1">
                              <DatePicker
                                onChange={date => {
                                  setFieldValue('LastUsedTo', date, false)
                                }}
                                selected={values.LastUsedTo}
                                // selectsEnd
                                // startDate={values.DateStart}
                                // endDate={values.DateEnd}
                                className="form-control"
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Kết thúc"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      {'Frequency' in values && (
                        <div className="form-group mb-20px">
                          <label>Tần suất sử dụng</label>
                          <Select
                            menuPosition="fixed"
                            isClearable={true}
                            name="Frequency"
                            placeholder="Chọn loại"
                            classNamePrefix="select"
                            options={FrequencyList}
                            className="select-control"
                            value={values?.Frequency}
                            onChange={otp => {
                              setFieldValue('Frequency', otp)
                              setFieldValue('FrequencyDay', '')
                            }}
                          />
                          {values?.Frequency?.value === 'KHAC' && (
                            <NumberFormat
                              allowNegative={false}
                              name="FrequencyDay"
                              placeholder="Nhập số ngày"
                              className={`form-control mt-8px`}
                              isNumericString={true}
                              //thousandSeparator={true}
                              value={values?.FrequencyDay}
                              onValueChange={val => {
                                setFieldValue(
                                  'FrequencyDay',
                                  val.floatValue ? val.floatValue : val.value
                                )
                              }}
                              onBlur={handleBlur}
                              autoComplete="off"
                            />
                          )}
                        </div>
                      )}
                      {'FrequencyDateStart' in values && (
                        <div className="form-group mb-20px">
                          <label>Thời gian</label>
                          <div className="d-flex">
                            <div className="flex-1">
                              <DatePicker
                                onChange={date => {
                                  setFieldValue(
                                    'FrequencyDateStart',
                                    date,
                                    false
                                  )
                                }}
                                selected={values.FrequencyDateStart}
                                // selectsEnd
                                // startDate={values.DateStart}
                                // endDate={values.DateEnd}
                                className="form-control"
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Bắt đầu"
                              />
                            </div>
                            <div className="d-flex align-items-center justify-content-center w-35px">
                              <i className="fa-regular text-black-50 fa-arrow-right-long"></i>
                            </div>
                            <div className="flex-1">
                              <DatePicker
                                onChange={date => {
                                  setFieldValue('FrequencyDateEnd', date, false)
                                }}
                                selected={values.FrequencyDateEnd}
                                // selectsEnd
                                // startDate={values.DateStart}
                                // endDate={values.DateEnd}
                                className="form-control"
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Kết thúc"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      {'DayFromServices' in values && (
                        <div className="form-group mb-20px">
                          <label>Số buổi dịch vụ còn</label>
                          <div className="d-flex">
                            <div className="flex-1">
                              <NumberFormat
                                allowNegative={false}
                                name="DayFromServices"
                                placeholder="Từ"
                                className={`form-control`}
                                isNumericString={true}
                                //thousandSeparator={true}
                                value={values?.DayFromServices}
                                onValueChange={val => {
                                  setFieldValue(
                                    'DayFromServices',
                                    val.floatValue ? val.floatValue : val.value
                                  )
                                }}
                                onBlur={handleBlur}
                                autoComplete="off"
                              />
                            </div>
                            <div className="d-flex align-items-center justify-content-center w-35px">
                              <i className="fa-regular text-black-50 fa-arrow-right-long"></i>
                            </div>
                            <div className="flex-1">
                              <NumberFormat
                                allowNegative={false}
                                name="DayToServices"
                                placeholder="Đến"
                                className={`form-control`}
                                isNumericString={true}
                                //thousandSeparator={true}
                                value={values?.DayToServices}
                                onValueChange={val => {
                                  setFieldValue(
                                    'DayToServices',
                                    val.floatValue ? val.floatValue : val.value
                                  )
                                }}
                                onBlur={handleBlur}
                                autoComplete="off"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      {'PriceLevelUpFrom' in values && (
                        <div className="form-group mb-20px">
                          <label>Giá trị lên cấp tiếp theo</label>
                          <div className="d-flex">
                            <div className="flex-1">
                              <NumberFormat
                                allowNegative={false}
                                name="PriceLevelUpFrom"
                                placeholder="Từ"
                                className={`form-control`}
                                isNumericString={true}
                                thousandSeparator={true}
                                value={values?.PriceLevelUpFrom}
                                onValueChange={val => {
                                  setFieldValue(
                                    'PriceLevelUpFrom',
                                    val.floatValue ? val.floatValue : val.value
                                  )
                                }}
                                onBlur={handleBlur}
                                autoComplete="off"
                              />
                            </div>
                            <div className="d-flex align-items-center justify-content-center w-35px">
                              <i className="fa-regular text-black-50 fa-arrow-right-long"></i>
                            </div>
                            <div className="flex-1">
                              <NumberFormat
                                allowNegative={false}
                                name="PriceLevelUpTo"
                                placeholder="Đến"
                                className={`form-control`}
                                isNumericString={true}
                                thousandSeparator={true}
                                value={values?.PriceLevelUpTo}
                                onValueChange={val => {
                                  setFieldValue(
                                    'PriceLevelUpTo',
                                    val.floatValue ? val.floatValue : val.value
                                  )
                                }}
                                onBlur={handleBlur}
                                autoComplete="off"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      {'TypeServices' in values && (
                        <div className="form-group">
                          <label>Loại</label>
                          <Select
                            isMulti
                            menuPosition="fixed"
                            isClearable={true}
                            name="TypeServices"
                            placeholder="Chọn loại"
                            classNamePrefix="select"
                            options={TypeServiceMemberList}
                            className="select-control"
                            value={values?.TypeServices}
                            onChange={otp => {
                              setFieldValue('TypeServices', otp)
                            }}
                          />
                        </div>
                      )}
                      {'LevelUp' in values && (
                        <div className="form-group">
                          <label>Cấp dự kiến lên</label>
                          <AsyncSelectGroupsCustomer
                            menuPlacement="top"
                            placeholder="Chọn cấp"
                            isClearable={true}
                            menuPosition="fixed"
                            name="LevelUp"
                            onChange={otp =>
                              setFieldValue('LevelUp', otp, false)
                            }
                            value={values.LevelUp}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="filter-box__footer p-20px d-flex justify-content-end">
                  <button
                    type="button"
                    className={clsx(
                      'btn btn-primary me-2 max-w-135px text-truncate',
                      (loadingExport || loading) &&
                        'spinner spinner-white spinner-right'
                    )}
                    disabled={loadingExport}
                    onClick={onExport}
                  >
                    <i className="far fa-file-excel pr-8px"></i>
                    <span>Xuất Excel</span>
                  </button>
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
                    <span>Lọc kết quả</span>
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
