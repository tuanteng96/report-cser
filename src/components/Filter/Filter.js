import React, { useEffect, useState } from 'react'
import clsx from 'clsx'
import DatePicker from 'react-datepicker'
import Select from 'react-select'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Formik, Form, Field } from 'formik'
import { useSelector } from 'react-redux'
import { JsonFilter } from 'src/Json/JsonFilter'
import { useLocation } from 'react-router-dom'
import { getPermissionPath } from 'src/helpers/PermissionPathAlias'

const perfectScrollbarOptions = {
  wheelSpeed: 2,
  wheelPropagation: false
}

/* Menu chọn cơ sở hiện ra ngoài khung cuộn (PerfectScrollbar chặn lăn chuột của menu).
   z-index cao hơn khung bộ lọc (1010). */
const selectPortalProps = {
  menuPortalTarget: typeof document !== 'undefined' ? document.body : null,
  menuPosition: 'fixed',
  styles: { menuPortal: base => ({ ...base, zIndex: 1100 }) }
}

function Filter({
  show,
  onHide,
  filters,
  onSubmit,
  loading,
  onRefresh,
  onStocksListChange // báo danh sách cơ sở được xem (đã lọc theo quyền) cho trang
}) {
  const { Stocks, PermissionReport, rightTree } = useSelector(({ auth }) => ({
    // bỏ cơ sở quản lý (778) và cơ sở trùng ID — trùng ID làm chọn 1 hiện 2
    Stocks: auth.Info?.Stocks
      ? auth.Info.Stocks.filter(
          (item, i, arr) =>
            item.ID !== 778 && arr.findIndex(o => o.ID === item.ID) === i
        ).map(item => ({
          ...item,
          label: item.Title || item.label,
          value: item.ID || item.value
        }))
      : [],
    PermissionReport: auth.Info?.rightsSum?.report,
    rightTree: auth?.Info?.rightTree
  }))
  const [StocksList, setStocksList] = useState([])
  const { pathname: locationPathname } = useLocation()
  const pathname = getPermissionPath(locationPathname)

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
                    newStocks = [
                      { value: '', label: 'Tất cả cơ sở' },
                      ...Stocks
                    ]
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
                                newStocks = [
                                  { value: '', label: 'Tất cả cơ sở' },
                                  ...Stocks
                                ]
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
              newStocks = [{ value: '', label: 'Tất cả cơ sở' }, ...Stocks]
            }
          } else {
            newStocks = []
          }
        }
      }
    }

    setStocksList(newStocks)
    onStocksListChange && onStocksListChange(newStocks)
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
                <div className="border-gray-200 filter-box__header d-flex justify-content-between align-items-center border-bottom px-20px py-20px">
                  <div className="font-size-lg fw-500 text-uppercase">
                    Bộ lọc tìm kiếm
                  </div>
                  <div
                    className="cursor-pointer w-30px h-30px d-flex justify-content-center align-items-center"
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
                          {...selectPortalProps}
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
                    {/* Chọn nhiều cơ sở (Tổng quan cơ sở); để trống = mọi cơ sở được xem */}
                    {'StockIDs' in values && (
                      <div className="form-group mb-20px">
                        <label>Cơ sở</label>
                        <Select
                          {...selectPortalProps}
                          isMulti
                          isClearable
                          closeMenuOnSelect={false}
                          name="StockIDs"
                          placeholder="Chọn cơ sở"
                          classNamePrefix="select"
                          className="select-control"
                          options={StocksList.filter(o => o.value !== '')}
                          value={StocksList.filter(
                            o =>
                              o.value !== '' &&
                              (values.StockIDs || []).includes(Number(o.value))
                          )}
                          onChange={opts =>
                            setFieldValue(
                              'StockIDs',
                              opts ? opts.map(o => Number(o.value)) : []
                            )
                          }
                          noOptionsMessage={() => 'Không có cơ sở'}
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
                            <span className="cursor-pointer fw-500">
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
                    aria-label="Làm mới"
                    title="Làm mới"
                  >
                    {/* chỉ biểu tượng, đồng nhất với FilterList ở các màn khác */}
                    <i
                      className="fa-regular fa-arrows-rotate"
                      aria-hidden="true"
                    ></i>
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
