import React, { useEffect, useState } from 'react'
import clsx from 'clsx'
import DatePicker, { registerLocale } from 'react-datepicker'
import Select, { components } from 'react-select'
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
import AsyncSelectProductNVL from '../Selects/AsyncSelectProductNVL'
import AsyncSelectProducts from '../Selects/AsyncSelectProducts'
import AsyncSelectCategories from '../Selects/AsyncSelectCategories'
import AsyncSelectBrands from '../Selects/AsyncSelectBrands'
import AsyncSelectCardMoney from '../Selects/AsyncSelectCardMoney'
import AsyncSelectCategoriesFull from '../Selects/AsyncSelectCategoriesFull'

import vi from 'date-fns/locale/vi' // the locale you want
import AsyncSelectServices from '../Selects/AsyncSelectServices'
import { useLocation } from 'react-router-dom'
import SelectCustomType from '../Selects/SelectCustomType'
import AsyncSelectSVCard from '../Selects/AsyncSelectSVCard'
import { useApp } from 'src/app/App'
import AsyncSelectCategoriesSPNVL from '../Selects/AsyncSelectCategoriesSPNVL'

registerLocale('vi', vi) // register it with the name you want

const {
  VoucherList,
  PaymentList,
  IsMemberList,
  TopTypeList,
  PaymentMethodsList,
  TypeTCList,
  TagsTCList,
  TypeCNList,
  TypeCNHng,
  CategoriesTKList,
  TagWLList,
  TypeTTList,
  StatusTTList,
  StarRatingList,
  BrowserTypeList,
  BrowserStatusList,
  TypeNVList,
  TypeNVList2,
  TypeInventory,
  ServiceStatusBook,
  ServiceTypeBook,
  StatusCheckedBook,
  StatusAtBook,
  TimeToRealList
} = JsonFilter

const CustomOption = ({ children, data, ...props }) => {
  return (
    <components.Option {...props}>
      {data.value
        ? Array(data.value)
            .fill()
            .map((star, index) => (
              <i
                className="fa-solid fa-star pl-6px text-warning"
                key={index}
              ></i>
            ))
        : children}
    </components.Option>
  )
}

function FilterListAdvanced({
  show,
  onHide,
  filters,
  onSubmit,
  loading,
  loadingExport,
  ten_nghiep_vu2,
  onRefresh,
  onExport,
  isWarehouse = false,
  regimes
}) {
  const {
    Stocks,
    KPT_Max_Type,
    PermissionReport,
    GlobalConfig,
    AuthID,
    rightTree
  } = useSelector(({ auth }) => ({
    Stocks: auth.Info?.Stocks
      ? auth.Info.Stocks.filter(item => item.ID !== 778).map(item => ({
          ...item,
          label: item.Title || item.label,
          value: item.ID || item.value
        }))
      : [],
    PermissionReport: auth.Info?.rightsSum?.report,
    rightTree: auth?.Info?.rightTree,
    KPT_Max_Type: auth?.GlobalConfig?.Admin?.KPT_Max_Type || 0,
    GlobalConfig: auth?.GlobalConfig,
    AuthID: auth?.Info?.User?.ID
  }))
  const [StocksList, setStocksList] = useState([])
  const [KpiTypeList, setKpiTypeList] = useState([])
  const { pathname } = useLocation()

  const { GGLoading } = useApp()

  useEffect(() => {
    const newKpiTypeList = []
    for (let i = 1; i <= KPT_Max_Type; i++) {
      newKpiTypeList.push({
        value: i,
        label: `Loại ${i}`
      })
    }
    setKpiTypeList(newKpiTypeList)
  }, [KPT_Max_Type])

  useEffect(() => {
    let newStocks = []
    if (window.isApp) {
      if (rightTree?.groups) {
        for (let p of rightTree?.groups) {
          if (p.group === 'Báo cáo') {
            if (p?.rights) {
              for (let r of p?.rights) {
                if (r?.name === 'report') {
                  if (r?.IsAllStock) {
                    if (isWarehouse) {
                      newStocks = [
                        { value: '', label: 'Tất cả cơ sở' },
                        { value: 778, label: 'Kho tổng' },
                        ...Stocks
                      ]
                    } else {
                      newStocks = [
                        { value: '', label: 'Tất cả cơ sở' },
                        ...Stocks
                      ]
                    }
                  } else {
                    if (r?.reports?.groups) {
                      for (let g of r?.reports?.groups) {
                        if (g.items) {
                          for (let i of g.items) {
                            if (
                              i.jdata.url &&
                              (i.jdata.url === pathname ||
                                i.jdata.paths.includes(pathname))
                            ) {
                              if (i.stocks) {
                                newStocks = [...Stocks]
                                const StocksPermission = i.stocks
                                  .split(',')
                                  .map(o => Number(o))
                                newStocks = newStocks.filter(o =>
                                  StocksPermission.includes(o.ID)
                                )
                                if (
                                  Stocks &&
                                  Stocks.length > 0 &&
                                  StocksPermission.length === Stocks.length
                                ) {
                                  newStocks = [
                                    { value: '', label: 'Tất cả cơ sở' },
                                    ...Stocks
                                  ]
                                }
                              } else {
                                if (isWarehouse) {
                                  newStocks = [
                                    { value: '', label: 'Tất cả cơ sở' },
                                    { value: 778, label: 'Kho tổng' },
                                    ...Stocks
                                  ]
                                } else {
                                  newStocks = [
                                    { value: '', label: 'Tất cả cơ sở' },
                                    ...Stocks
                                  ]
                                }
                              }
                              //return
                            }
                          }
                        }
                      }
                    }
                  }
                }
                //return
              }
            }
          }
        }
      }
    } else {
      newStocks = [...Stocks]
      if (PermissionReport?.hasRight) {
        if (!PermissionReport?.jdata) {
          if (isWarehouse) {
            newStocks = [
              { value: '', label: 'Tất cả cơ sở' },
              { value: 778, label: 'Kho tổng' },
              ...Stocks
            ]
          } else {
            newStocks = [{ value: '', label: 'Tất cả cơ sở' }, ...Stocks]
          }
        } else {
          let newListItems = []
          let Groups = PermissionReport?.jdata?.groups
            ? PermissionReport?.jdata?.groups
            : []
          for (let group of Groups) {
            if (group.items) {
              for (let item of group.items) {
                newListItems.push(item)
              }
            }
          }
          const index = newListItems.findIndex(
            o => o.url === pathname || o.paths.includes(pathname)
          )
          if (index > -1) {
            if (newListItems[index].stocks) {
              const StocksPermission = newListItems[index].stocks
                .split(',')
                .map(o => Number(o))
              newStocks = newStocks.filter(o => StocksPermission.includes(o.ID))
            } else {
              if (isWarehouse) {
                newStocks = [
                  { value: '', label: 'Tất cả cơ sở' },
                  { value: 778, label: 'Kho tổng' },
                  ...Stocks
                ]
              } else {
                newStocks = [{ value: '', label: 'Tất cả cơ sở' }, ...Stocks]
              }
            }
          } else {
            newStocks = []
          }
        }
      }
    }
    setStocksList(newStocks)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PermissionReport, pathname, isWarehouse])

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
                  {'ShowsX' in values && (
                    <div className="form-group mb-20px">
                      <label>Chế độ</label>
                      <Select
                        name="ShowsX"
                        placeholder="Chọn chế độ"
                        classNamePrefix="select"
                        options={regimes}
                        className="select-control"
                        value={regimes.filter(
                          item => Number(item.value) === Number(values?.ShowsX)
                        )}
                        onChange={otp => {
                          setFieldValue('ShowsX', otp ? otp.value : '')
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
                  {'Mon' in values && (
                    <div className="mb-20px form-group">
                      <label>Chọn tháng</label>
                      <DatePicker
                        locale="vi"
                        onChange={date => {
                          setFieldValue('Mon', date, false)
                        }}
                        selected={values.Mon}
                        placeholderText="Chọn tháng"
                        className="form-control"
                        dateFormat="MM/yyyy"
                        showMonthYearPicker
                        showFullMonthYearPicker
                        showTwoColumnMonthYearPicker
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
                        noOptionsMessage={() => 'Không có cơ sở'}
                      />
                    </div>
                  )}
                  {'DebtFrom' in values && (
                    <div className="mb-20px form-group">
                      <label>Dự kiến thu nợ từ</label>
                      <DatePicker
                        onChange={date => {
                          setFieldValue('DebtFrom', date, false)
                        }}
                        selected={values.DebtFrom}
                        placeholderText="Chọn ngày"
                        className="form-control"
                        dateFormat="dd/MM/yyyy"
                      />
                    </div>
                  )}
                  {'DebtTo' in values && (
                    <div className="mb-20px form-group">
                      <label>Dự kiến thu nợ đến</label>
                      <DatePicker
                        onChange={date => {
                          setFieldValue('DebtTo', date, false)
                        }}
                        selected={values.DebtTo}
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
                  <div className="form-group mb-20px">
                    <label>Nợ</label>
                    <Select
                      isClearable
                      name="no"
                      placeholder="Chọn trạng thái"
                      classNamePrefix="select"
                      options={[
                        {
                          value: 'con',
                          label: 'Còn nợ'
                        },
                        {
                          value: 'khong',
                          label: 'Hết nợ'
                        }
                      ]}
                      className="select-control"
                      value={[
                        {
                          value: 'con',
                          label: 'Còn nợ'
                        },
                        {
                          value: 'khong',
                          label: 'Hết nợ'
                        }
                      ].filter(item => item.value === values?.no)}
                      onChange={otp => {
                        setFieldValue('no', otp ? otp.value : '')
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
                  {'AllServiceID' in values && (
                    <div className="form-group mb-20px">
                      <label>Dịch vụ</label>
                      <AsyncSelectServices
                        closeMenuOnScroll={true}
                        menuPlacement="top"
                        isClearable={true}
                        menuPosition="fixed"
                        name="AllServiceID"
                        onChange={otp => {
                          setFieldValue('AllServiceID', otp, false)
                        }}
                        value={values.AllServiceID}
                      />
                    </div>
                  )}
                  {'TenDichvu' in values && (
                    <div className="form-group mb-20px">
                      <label>Dịch vụ</label>
                      <AsyncSelectSVCard
                        isMulti
                        closeMenuOnScroll={true}
                        menuPlacement="top"
                        isClearable={true}
                        menuPosition="fixed"
                        name="TenDichvu"
                        onChange={otp => {
                          setFieldValue('TenDichvu', otp, false)
                        }}
                        value={values.TenDichvu}
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
                  {'Loai' in values && (
                    <div className="form-group mb-20px">
                      <label>Loại</label>
                      <Select
                        menuPosition="fixed"
                        isClearable={true}
                        name="Loai"
                        placeholder="Chọn loại"
                        classNamePrefix="select"
                        options={TypeInventory}
                        className="select-control"
                        value={values.Loai}
                        onChange={otp => {
                          setFieldValue('Loai', otp)
                        }}
                      />
                    </div>
                  )}
                  {'apptype' in values && (
                    <div className="form-group mb-20px">
                      <label>Thiết bị</label>
                      <Select
                        menuPosition="fixed"
                        isClearable={true}
                        name="apptype"
                        placeholder="Chọn thiết bị"
                        classNamePrefix="select"
                        options={BrowserTypeList}
                        className="select-control"
                        value={values.apptype}
                        onChange={otp => {
                          setFieldValue('apptype', otp)
                        }}
                      />
                    </div>
                  )}
                  {'onoff' in values && (
                    <div className="form-group mb-20px">
                      <label>Trạng thái</label>
                      <Select
                        menuPosition="fixed"
                        isClearable={true}
                        name="onoff"
                        placeholder="Chọn trạng thái"
                        classNamePrefix="select"
                        options={BrowserStatusList}
                        className="select-control"
                        value={values.onoff}
                        onChange={otp => {
                          setFieldValue('onoff', otp)
                        }}
                      />
                    </div>
                  )}
                  {'Key' in values && (
                    <div className="form-group mb-20px">
                      <label>Nhập tên mặt hàng</label>
                      <input
                        type="text"
                        name="Key"
                        value={values.Key}
                        className="form-control"
                        placeholder="Nhập tên ..."
                        onChange={handleChange}
                        onBlur={handleBlur}
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
                        value={values.MemberID}
                        onChange={otp => {
                          setFieldValue('MemberID', otp, false)
                        }}
                      />
                    </div>
                  )}
                  {values.ShowsX !== '2' && (
                    <>
                      {'ShipCode' in values && (
                        <div className="form-group mb-20px">
                          <label>Nhập Ship Code</label>
                          <input
                            type="text"
                            name="ShipCode"
                            value={values.ShipCode}
                            className="form-control"
                            placeholder="Nhập Ship Code ..."
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </div>
                      )}
                      {'TypeCNHng' in values && (
                        <div className="form-group mb-20px">
                          <label>Loại</label>
                          <Select
                            isMulti
                            menuPosition="fixed"
                            isClearable={true}
                            name="TypeCNHng"
                            placeholder="Chọn loại"
                            classNamePrefix="select"
                            options={TypeCNHng}
                            className="select-control"
                            value={values.TypeCNHng}
                            onChange={otp => {
                              setFieldValue('TypeCNHng', otp)
                            }}
                          />
                        </div>
                      )}
                      {'CategoriesTK' in values && (
                        <div className="form-group mb-20px">
                          <label>Loại</label>
                          <Select
                            menuPosition="fixed"
                            isClearable={true}
                            name="CategoriesTK"
                            placeholder="Chọn loại"
                            classNamePrefix="select"
                            options={CategoriesTKList}
                            className="select-control"
                            value={values.CategoriesTK}
                            onChange={otp => {
                              setFieldValue('CategoriesTK', otp)
                            }}
                          />
                        </div>
                      )}
                      {'ProdIDs' in values && (
                        <div className="form-group mb-20px">
                          <label>Sản phẩm, Nguyên vật liệu</label>
                          <AsyncSelectProductNVL
                            isMulti
                            isClearable={true}
                            menuPosition="fixed"
                            name="ProdIDs"
                            value={values.ProdIDs}
                            onChange={otp => {
                              setFieldValue('ProdIDs', otp, false)
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
                              item =>
                                Number(item.value) === Number(values?.TopType)
                            )}
                            onChange={otp => {
                              setFieldValue('TopType', otp ? otp.value : '')
                            }}
                          />
                        </div>
                      )}
                      {'CustomType' in values && (
                        <div className="form-group mb-20px">
                          <label>Phân loại Thu Chi</label>
                          <SelectCustomType
                            isMulti
                            isClearable={true}
                            name="CustomType"
                            placeholder="Chọn loại Thu Chi"
                            value={values.CustomType}
                            onChange={otp => {
                              setFieldValue('CustomType', otp)
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
                      {'ten_nghiep_vu' in values && (
                        <div className="form-group mb-20px">
                          <label>Loại</label>
                          <Select
                            menuPosition="fixed"
                            isClearable={true}
                            name="ten_nghiep_vu"
                            placeholder="Chọn loại"
                            classNamePrefix="select"
                            options={ten_nghiep_vu2 ? TypeNVList2 : TypeNVList}
                            className="select-control"
                            value={values.ten_nghiep_vu}
                            onChange={otp => {
                              setFieldValue('ten_nghiep_vu', otp)
                            }}
                          />
                        </div>
                      )}
                      {'TypeTT' in values && (
                        <div className="form-group mb-20px">
                          <label>Loại</label>
                          <Select
                            isMulti
                            menuPosition="fixed"
                            isClearable={true}
                            name="TypeTT"
                            placeholder="Chọn loại"
                            classNamePrefix="select"
                            options={TypeTTList}
                            className="select-control"
                            value={values.TypeTT}
                            onChange={otp => {
                              setFieldValue('TypeTT', otp)
                            }}
                          />
                        </div>
                      )}
                      {'MoneyCardID' in values && (
                        <div className="form-group mb-20px">
                          <label>Tên thẻ tiền</label>
                          <AsyncSelectCardMoney
                            isClearable={true}
                            menuPosition="fixed"
                            name="MoneyCardID"
                            onChange={otp => {
                              setFieldValue('MoneyCardID', otp, false)
                            }}
                            value={values.MoneyCardID}
                          />
                        </div>
                      )}
                      {'StatusTT' in values && (
                        <div className="form-group mb-20px">
                          <label>Loại</label>
                          <Select
                            isMulti
                            menuPosition="fixed"
                            isClearable={true}
                            name="StatusTT"
                            placeholder="Chọn loại"
                            classNamePrefix="select"
                            options={StatusTTList}
                            className="select-control"
                            value={values.StatusTT}
                            onChange={otp => {
                              setFieldValue('StatusTT', otp)
                            }}
                          />
                        </div>
                      )}
                      {'TagWL' in values && (
                        <div className="form-group mb-20px">
                          <label>Loại</label>
                          <Select
                            isMulti
                            menuPosition="fixed"
                            isClearable={true}
                            name="TagWL"
                            placeholder="Chọn loại"
                            classNamePrefix="select"
                            options={TagWLList}
                            className="select-control"
                            value={values.TagWL}
                            onChange={otp => {
                              setFieldValue('TagWL', otp)
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
                            value={values.StaffID}
                            StocksList={StocksList}
                          />
                        </div>
                      )}
                      {'UserID' in values && (
                        <div className="form-group mb-20px">
                          <label>Nhân viên đặt lịch</label>
                          <AsyncSelectStaffs
                            addOptions={[
                              { label: 'Đặt lịch Online', value: 0 }
                            ]}
                            isMulti
                            isClearable={true}
                            menuPosition="fixed"
                            name="UserID"
                            onChange={otp => {
                              setFieldValue('UserID', otp, false)
                            }}
                            value={values.UserID}
                            StocksList={StocksList}
                          />
                        </div>
                      )}
                      {'UserServiceIDs' in values && (
                        <div className="form-group mb-20px">
                          <label>Nhân viên thực hiện</label>
                          <AsyncSelectStaffs
                            isMulti
                            isClearable={true}
                            menuPosition="fixed"
                            name="UserServiceIDs"
                            onChange={otp => {
                              setFieldValue('UserServiceIDs', otp, false)
                            }}
                            value={values.UserServiceIDs}
                            StocksList={StocksList}
                          />
                        </div>
                      )}
                      {'StatusBooking' in values && (
                        <div className="form-group mb-20px">
                          <label>Trạng thái đặt lịch</label>
                          <Select
                            isMulti
                            menuPosition="fixed"
                            isClearable={true}
                            name="StatusBooking"
                            placeholder="Chọn trạng thái"
                            classNamePrefix="select"
                            options={ServiceStatusBook}
                            className="select-control"
                            value={values.StatusBooking}
                            onChange={otp => {
                              setFieldValue('StatusBooking', otp)
                            }}
                          />
                        </div>
                      )}
                      {'StatusMember' in values && (
                        <div className="form-group mb-20px">
                          <label>Loại khách hàng</label>
                          <Select
                            menuPosition="fixed"
                            isClearable={true}
                            name="StatusMember"
                            placeholder="Chọn loại"
                            classNamePrefix="select"
                            options={ServiceTypeBook}
                            className="select-control"
                            value={values.StatusMember}
                            onChange={otp => {
                              setFieldValue('StatusMember', otp)
                            }}
                          />
                        </div>
                      )}
                      {'StatusBook' in values && (
                        <div className="form-group mb-20px">
                          <label>Loại nhân viên</label>
                          <Select
                            menuPosition="fixed"
                            isClearable={true}
                            name="StatusBook"
                            placeholder="Chọn loại"
                            classNamePrefix="select"
                            options={StatusCheckedBook}
                            className="select-control"
                            value={values.StatusBook}
                            onChange={otp => {
                              setFieldValue('StatusBook', otp)
                            }}
                          />
                        </div>
                      )}
                      {'StatusAtHome' in values && (
                        <div className="form-group mb-20px">
                          <label>Loại thực hiện</label>
                          <Select
                            menuPosition="fixed"
                            isClearable={true}
                            name="StatusAtHome"
                            placeholder="Chọn loại"
                            classNamePrefix="select"
                            options={StatusAtBook}
                            className="select-control"
                            value={values.StatusAtHome}
                            onChange={otp => {
                              setFieldValue('StatusAtHome', otp)
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
                            value={values.ServiceCardID}
                          />
                        </div>
                      )}
                      {'MaDonHang' in values && (
                        <div className="form-group mb-20px">
                          <label>Mã đơn hàng</label>
                          <input
                            type="text"
                            name="MaDonHang"
                            value={values.MaDonHang}
                            className="form-control"
                            placeholder="Nhập mã đơn hàng"
                            onChange={handleChange}
                            onBlur={handleBlur}
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
                      {'QtyNumber' in values && (
                        <div className="form-group mb-20px">
                          <label>Số lượng</label>
                          <input
                            type="text"
                            name="QtyNumber"
                            value={values.QtyNumber}
                            className="form-control"
                            placeholder="Nhập số lượng"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            autoComplete="off"
                          />
                        </div>
                      )}
                      {'ProductId' in values && (
                        <div className="form-group mb-20px">
                          <label>Sản phẩm, DV, NVL, ...</label>
                          <AsyncSelectProducts
                            isClearable={true}
                            menuPosition="fixed"
                            name="ProductId"
                            onChange={otp => {
                              setFieldValue('ProductId', otp, false)
                            }}
                            value={values.ProductId}
                          />
                        </div>
                      )}
                      {'ProductIds' in values && (
                        <div className="form-group mb-20px">
                          <label>Sản phẩm, DV, NVL, ...</label>
                          <AsyncSelectProducts
                            isMulti
                            isClearable={true}
                            menuPosition="fixed"
                            name="ProductIds"
                            onChange={otp => {
                              setFieldValue('ProductIds', otp, false)
                            }}
                            value={values.ProductIds}
                          />
                        </div>
                      )}
                      {'CategoriesId' in values && (
                        <div className="form-group mb-20px">
                          <label>Danh mục</label>
                          {isWarehouse ? (
                            <AsyncSelectCategoriesSPNVL
                              menuPlacement="top"
                              isClearable={true}
                              menuPosition="fixed"
                              name="CategoriesId"
                              onChange={otp => {
                                setFieldValue('CategoriesId', otp, false)
                              }}
                              value={values.CategoriesId}
                            />
                          ) : (
                            <AsyncSelectCategories
                              menuPlacement="top"
                              isClearable={true}
                              menuPosition="fixed"
                              name="CategoriesId"
                              onChange={otp => {
                                setFieldValue('CategoriesId', otp, false)
                              }}
                              value={values.CategoriesId}
                            />
                          )}
                        </div>
                      )}
                      {'CategoriesIds' in values && (
                        <div className="form-group mb-20px">
                          <label>Danh mục</label>
                          <AsyncSelectCategoriesFull
                            isMulti
                            menuPlacement="top"
                            isClearable={true}
                            menuPosition="fixed"
                            name="CategoriesIds"
                            onChange={otp => {
                              setFieldValue('CategoriesIds', otp, false)
                            }}
                            value={values.CategoriesIds}
                          />
                        </div>
                      )}
                      {'BrandId' in values && (
                        <div className="form-group mb-20px">
                          <label>Nhãn hàng</label>
                          <AsyncSelectBrands
                            menuPlacement="top"
                            isClearable={true}
                            menuPosition="fixed"
                            name="BrandId"
                            onChange={otp => {
                              setFieldValue('BrandId', otp, false)
                            }}
                            value={values.BrandId}
                          />
                        </div>
                      )}
                      {'BrandIds' in values && (
                        <div className="form-group mb-20px">
                          <label>Nhãn hàng</label>
                          <AsyncSelectBrands
                            isMulti
                            menuPlacement="top"
                            isClearable={true}
                            menuPosition="fixed"
                            name="BrandIds"
                            onChange={otp => {
                              setFieldValue('BrandIds', otp, false)
                            }}
                            value={values.BrandIds}
                          />
                        </div>
                      )}
                      {'TimeToReal' in values && (
                        <div className="form-group mb-20px">
                          <label>Thực thu tính đến</label>
                          <Select
                            menuPosition="fixed"
                            isClearable={true}
                            name="TimeToReal"
                            placeholder="Chọn thời gian"
                            classNamePrefix="select"
                            options={TimeToRealList}
                            className="select-control"
                            value={values.TimeToReal}
                            onChange={otp => {
                              setFieldValue('TimeToReal', otp)
                            }}
                          />
                        </div>
                      )}
                      {'IsQtyEmpty' in values && (
                        <div>
                          <label className="checkbox d-flex">
                            <input
                              type="checkbox"
                              name="IsQtyEmpty"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values.IsQtyEmpty}
                              checked={values.IsQtyEmpty}
                            />
                            <span className="checkbox-icon"></span>
                            <span className="cursor-pointer fw-500">
                              Lọc sản phẩm còn
                            </span>
                          </label>
                        </div>
                      )}
                      {'gia_nhap_tb_khoang_tg' in values && (
                        <div className="mt-10px">
                          <label className="checkbox d-flex">
                            <input
                              type="checkbox"
                              name="gia_nhap_tb_khoang_tg"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values.gia_nhap_tb_khoang_tg}
                              checked={values.gia_nhap_tb_khoang_tg}
                            />
                            <span className="checkbox-icon"></span>
                            <span className="cursor-pointer fw-500">
                              Giá nhập TB trong khoảng thời gian
                            </span>
                          </label>
                        </div>
                      )}
                      {'KpiType' in values && (
                        <div className="form-group mb-20px">
                          <label>Loại KPI</label>
                          <Select
                            menuPosition="fixed"
                            isClearable={true}
                            name="KpiType"
                            placeholder="Chọn loại"
                            classNamePrefix="select"
                            options={KpiTypeList}
                            className="select-control"
                            value={values.KpiType}
                            onChange={otp => {
                              setFieldValue('KpiType', otp)
                            }}
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
                            value={values.Status}
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
                            value={values.Warranty}
                          />
                        </div>
                      )}
                      {'StarRating' in values && (
                        <div className="form-group mb-20px">
                          <label>Đánh giá</label>
                          <Select
                            isMulti
                            placeholder="Chọn đánh giá"
                            classNamePrefix="select"
                            options={StarRatingList}
                            className="select-control"
                            isClearable={true}
                            menuPosition="fixed"
                            name="StarRating"
                            onChange={otp => {
                              setFieldValue('StarRating', otp, false)
                            }}
                            value={values.StarRating}
                            components={{ Option: CustomOption }}
                          />
                        </div>
                      )}
                      {'IsMemberSet' in values && (
                        <div className="form-group mb-20px">
                          <label>Khách hàng chọn nhân viên</label>
                          <Select
                            menuPosition="fixed"
                            isClearable={true}
                            name="IsMemberSet"
                            placeholder="Chọn loại"
                            classNamePrefix="select"
                            options={[
                              {
                                label: 'Khách hàng chọn nhân viên',
                                value: 1
                              },
                              {
                                label: 'Khách hàng không nhân viên',
                                value: 0
                              }
                            ]}
                            className="select-control"
                            value={values.IsMemberSet}
                            onChange={otp => {
                              setFieldValue('IsMemberSet', otp)
                            }}
                          />
                        </div>
                      )}
                      {'Dich_vu_chuyen_doi_khong_hop_le' in values && (
                        <div>
                          <label className="checkbox d-flex">
                            <input
                              type="checkbox"
                              name="Dich_vu_chuyen_doi_khong_hop_le"
                              onChange={event => {
                                setFieldValue(
                                  'Dich_vu_chuyen_doi_khong_hop_le',
                                  event.target.checked ? 1 : 0
                                )
                              }}
                              value={values.Dich_vu_chuyen_doi_khong_hop_le}
                              checked={
                                Number(
                                  values.Dich_vu_chuyen_doi_khong_hop_le
                                ) === 1
                              }
                            />
                            <span className="checkbox-icon"></span>
                            <span className="cursor-pointer fw-500">
                              Dịch vụ chuyển đổi không hợp lệ
                            </span>
                          </label>
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
                            menuPortalTarget={document.body}
                            styles={{
                              menuPortal: base => ({
                                ...base,
                                zIndex: 9999
                              })
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
                            menuPortalTarget={document.body}
                            styles={{
                              menuPortal: base => ({
                                ...base,
                                zIndex: 9999
                              })
                            }}
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
                            menuPortalTarget={document.body}
                            styles={{
                              menuPortal: base => ({
                                ...base,
                                zIndex: 9999
                              })
                            }}
                          />
                        </div>
                      )}
                      {'Shows' in values && (
                        <div className="form-group mb-20px">
                          <label>Chế độ</label>
                          <Select
                            name="Shows"
                            placeholder="Chọn chế độ"
                            classNamePrefix="select"
                            options={[
                              {
                                label: 'Đơn giản',
                                value: '0'
                              },
                              {
                                label: 'Đầy đủ',
                                value: '1'
                              }
                            ]}
                            className="select-control"
                            value={[
                              {
                                label: 'Đơn giản',
                                value: '0'
                              },
                              {
                                label: 'Đầy đủ',
                                value: '1'
                              }
                            ].filter(
                              item =>
                                Number(item.value) === Number(values?.Shows)
                            )}
                            onChange={otp => {
                              setFieldValue('Shows', otp ? otp.value : '')
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
                      )}
                    </>
                  )}
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
                      'btn btn-success ms-2 ms-2 max-w-135px text-truncate',
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

export default FilterListAdvanced
