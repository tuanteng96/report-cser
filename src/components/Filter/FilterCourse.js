import React, { useEffect, useState } from 'react'
import clsx from 'clsx'
import DatePicker, { registerLocale } from 'react-datepicker'
import Select, { components } from 'react-select'
import { Formik, Form } from 'formik'
import { useSelector } from 'react-redux'

import vi from 'date-fns/locale/vi' // the locale you want
import { useLocation } from 'react-router-dom'
import { useApp } from 'src/app/App'
import { SelectTagsCourse } from '../Selects/SelectTagsCourse'
import { SelectCourse } from '../Selects/SelectCourse'

registerLocale('vi', vi)

function FilterCourse({
  show,
  onHide,
  filters,
  onSubmit,
  loading,
  loadingExport,
  onRefresh,
  onExport,
  isWarehouse = false
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

  const { GGLoading } = useApp()

  useEffect(() => {
    let newStocks = [...Stocks]
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
                  <div className="form-group mb-20px">
                    <label>Cơ sở của bạn</label>
                    <Select
                      name="filterCourse.StockID"
                      placeholder="Chọn cơ cở"
                      classNamePrefix="select"
                      options={StocksList}
                      className="select-control"
                      value={StocksList.filter(
                        item =>
                          Number(item.value) ===
                          Number(values?.filterCourse?.StockID)
                      )}
                      onChange={otp => {
                        setFieldValue(
                          'filterCourse.StockID',
                          otp ? otp.value : ''
                        )
                      }}
                      noOptionsMessage={() => 'Không có cơ sở'}
                    />
                  </div>
                  <div className="form-group mb-20px">
                    <label>Lớp học</label>
                    <SelectCourse
                      className="select-control"
                      closeMenuOnScroll={true}
                      menuPlacement="top"
                      isClearable={true}
                      menuPosition="fixed"
                      name="filterCourse.ID"
                      onChange={otp => {
                        setFieldValue('filterCourse.ID', otp, false)
                      }}
                      value={values.filterCourse.ID}
                    />
                  </div>
                  <div className="form-group mb-20px">
                    <label>Tags</label>
                    <SelectTagsCourse
                      isMulti
                      className="select-control"
                      closeMenuOnScroll={true}
                      menuPlacement="top"
                      isClearable={true}
                      menuPosition="fixed"
                      name="filterCourse.Tags"
                      onChange={otp => {
                        setFieldValue('filterCourse.Tags', otp, false)
                      }}
                      value={values.filterCourse.Tags}
                    />
                  </div>
                  <div className="form-group mb-20px">
                    <label>Loại</label>
                    <Select
                      isClearable
                      name="filterCourse.Type"
                      placeholder="Chọn loại"
                      classNamePrefix="select"
                      options={[
                        {
                          label: 'Bán',
                          value: 'ban'
                        },
                        {
                          label: 'Tặng',
                          value: 'tang'
                        }
                      ]}
                      className="select-control"
                      value={[
                        {
                          label: 'Bán',
                          value: 'ban'
                        },
                        {
                          label: 'Tặng',
                          value: 'tang'
                        }
                      ].filter(
                        item => item.value === values?.filterCourse.Type
                      )}
                      onChange={otp => {
                        setFieldValue('filterCourse.Type', otp ? otp.value : '')
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
                  <div className="form-group mb-20px">
                    <label>Trạng thái</label>
                    <Select
                      isClearable
                      name="filter.Status"
                      placeholder="Chọn trạng thái"
                      classNamePrefix="select"
                      options={[
                        {
                          value: 2,
                          label: 'Chưa tốt nghiệp'
                        },
                        {
                          value: 4,
                          label: 'Chờ tốt nghiệp'
                        },
                        {
                          value: 1,
                          label: 'Đã tốt nghiệp'
                        },
                        {
                          value: 3,
                          label: 'Đang tạm dừng'
                        }
                      ]}
                      className="select-control"
                      value={[
                        {
                          value: 2,
                          label: 'Chưa tốt nghiệp'
                        },
                        {
                          value: 4,
                          label: 'Chờ tốt nghiệp'
                        },
                        {
                          value: 1,
                          label: 'Đã tốt nghiệp'
                        },
                        {
                          value: 3,
                          label: 'Đang tạm dừng'
                        }
                      ].filter(item => item.value === values?.filter.Status)}
                      onChange={otp => {
                        setFieldValue('filter.Status', otp ? otp.value : '')
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
                  <div className="form-group mb-20px">
                    <label>Nợ</label>
                    <Select
                      isClearable
                      name="filter.no"
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
                      ].filter(item => item.value === values?.filter.no)}
                      onChange={otp => {
                        setFieldValue('filter.no', otp ? otp.value : '')
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

                  <div className="mb-20px form-group">
                    <label>Ngày hẹn thu nợ từ</label>
                    <DatePicker
                      onChange={date => {
                        setFieldValue('filter.FromDebt', date, false)
                      }}
                      selected={values.filter.FromDebt}
                      placeholderText="Chọn ngày"
                      className="form-control"
                      dateFormat="dd/MM/yyyy"
                    />
                  </div>

                  <div className="mb-0px form-group">
                    <label>Ngày hẹn thu nợ đến</label>
                    <DatePicker
                      onChange={date => {
                        setFieldValue('filter.ToDebt', date, false)
                      }}
                      selected={values.filter.ToDebt}
                      placeholderText="Chọn ngày"
                      className="form-control"
                      dateFormat="dd/MM/yyyy"
                    />
                  </div>
                </div>
                <div className="filter-box__footer p-20px d-flex justify-content-end">
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

export default FilterCourse
