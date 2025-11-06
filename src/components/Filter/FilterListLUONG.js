import React, { useEffect, useState } from 'react'
import clsx from 'clsx'
import DatePicker, { registerLocale } from 'react-datepicker'
import Select from 'react-select'
import { Formik, Form } from 'formik'
import { useSelector } from 'react-redux'
import AsyncSelectStaffs from '../Selects/AsyncSelectStaffs'
import AsyncSelectMembers from '../Selects/AsyncSelectMembers'
import AsyncSelectSVPP from '../Selects/AsyncSelectSVPP'

import vi from 'date-fns/locale/vi' // the locale you want
import { useLocation } from 'react-router-dom'
import { useApp } from 'src/app/App'
import { ArrayHeplers } from 'src/helpers/ArrayHeplers'

registerLocale('vi', vi) // register it with the name you want

function FilterListLUONG({
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
  isAllStock = true,
  optionsAdd = []
}) {
  const { Stocks, PermissionReport, GlobalConfig, AuthID, rightTree, Auth } =
    useSelector(({ auth }) => ({
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
      AuthID: auth?.Info?.User?.ID,
      Auth: auth
    }))
  const [StocksList, setStocksList] = useState([])
  const { pathname } = useLocation()

  const { GGLoading } = useApp()

  useEffect(() => {
    let newStocks = [...Stocks]

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
                      if (isAllStock) {
                        newStocks = [
                          { value: '', label: 'Tất cả cơ sở' },
                          ...Stocks
                        ]
                      }
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
            if (isAllStock) {
              newStocks = [{ value: '', label: 'Tất cả cơ sở' }, ...Stocks]
            }
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
              if (
                Stocks &&
                Stocks.length > 0 &&
                StocksPermission.length === Stocks.length
              ) {
                newStocks = [{ value: '', label: 'Tất cả cơ sở' }, ...Stocks]
              }
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
                  {'ShowsX' in values && (
                    <div className="form-group mb-20px">
                      <label>Chế độ</label>
                      <Select
                        name="ShowsX"
                        placeholder="Chọn chế độ"
                        classNamePrefix="select"
                        options={[
                          {
                            label: 'Cơ bản',
                            value: '1'
                          },
                          {
                            label: 'TIP',
                            value: '2'
                          }
                        ]}
                        className="select-control"
                        value={[
                          {
                            label: 'Cơ bản',
                            value: '1'
                          },
                          {
                            label: 'TIP',
                            value: '2'
                          }
                        ].filter(
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
                        dateFormat={
                          filters.DateEndTime
                            ? 'HH:mm dd/MM/yyyy'
                            : 'dd/MM/yyyy'
                        }
                        showTimeSelect={filters.DateEndTime} // Bật chọn thời gian
                        timeFormat="HH:mm" // Định dạng giờ (24h)
                        timeIntervals={1} // Bước nhảy thời gian (phút)
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

                  {values.ShowsX !== '2' && (
                    <>
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
                    </>
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

                  {values.ShowsX !== '2' && (
                    <>
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

export default FilterListLUONG
